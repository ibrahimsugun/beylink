import { linkModel } from '../models/linkModel.js';
import { profileModel } from '../models/profileModel.js';
import { analyticsModel } from '../models/analyticsModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notFound, tooManyRequests } from '../utils/ApiError.js';
import { parseDevice, parseBrowser, parseOs } from '../utils/ua.js';
import { captureBtagFromUrl } from '../utils/btag.js';
import { resolveVisitor, visitorFromCookie } from '../utils/visitor.js';
import { resolveCountry } from '../utils/geoip.js';
import { toHttpTarget } from '../utils/url.js';
import { isBlocked, recordFailure } from '../utils/rateLimit.js';

const GO_LIMIT = { max: 30, windowMs: 60_000, blockMs: 5 * 60_000 };

export const goRedirect = asyncHandler(async (req, res) => {
  const rlKey = `go:${req.ip}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla istek — lütfen biraz bekleyin');
  recordFailure(rlKey, GO_LIMIT);
  const linkId = Number(req.params.linkId);
  if (!Number.isInteger(linkId) || linkId <= 0) throw notFound('Bağlantı bulunamadı');

  const btag = captureBtagFromUrl(req.originalUrl);

  const link = linkModel.findById(linkId);
  if (!link || !link.is_active) throw notFound('Bağlantı bulunamadı');
  if (!['link', 'social'].includes(link.type) || !link.url) throw notFound('Bağlantı bulunamadı');

  const profile = profileModel.findById(link.profile_id);
  if (!profile || !profile.is_published) throw notFound('Bağlantı bulunamadı');

  // Güvenli hedef — yalnızca http/https (javascript:/data: vb. reddedilir)
  const safeUrl = toHttpTarget(link.url);
  if (!safeUrl) throw notFound('Bağlantı bulunamadı');

  // hop-1: linke gomulu BTAG var ama istekte yok -> kendine yonlendir (LOG YOK).
  // Diger query paramlari korunur; her turlu btag parami temizlenir; BTAG eklenir.
  if (link.btag && !btag) {
    const qi = req.originalUrl.indexOf('?');
    const usp = new URLSearchParams(qi >= 0 ? req.originalUrl.slice(qi + 1) : '');
    for (const k of [...usp.keys()]) if (/^btag$/i.test(k)) usp.delete(k);
    usp.append('BTAG', link.btag);
    return res.redirect(302, `/api/go/${linkId}?${usp.toString()}`);
  }

  // hedef URL — BTAG varsa dis adrese de eklenir (affiliate/banner tarafi gorsun)
  let target = safeUrl;
  if (btag) target += (target.includes('?') ? '&' : '?') + 'BTAG=' + encodeURIComponent(btag);

  // Async loglama — redirect'i asla bloklama; hata redirect'i bozmasin
  const ua = req.headers['user-agent'] || '';
  const referrer = req.get('referer') || '';
  const profileId = profile.id;
  // visitor'ı first-party cookie'den çöz (yoksa IP-hash) — setImmediate'ten ÖNCE oku (req taze).
  // Böylece tıklama satırı visitor taşır → BTAG tekil-ziyaretçi doğru + (kişi/link/gün) dedup çalışır.
  const visitor = resolveVisitor(req, visitorFromCookie(req));
  const country = resolveCountry(req.ip); // yerel IP→ülke (ham IP saklanmaz); veri yoksa null
  setImmediate(() => {
    try {
      analyticsModel.recordDedup({
        profileId,
        linkId,
        eventType: 'click',
        device: parseDevice(ua),
        country,
        referrer,
        userAgent: ua,
        browser: parseBrowser(ua),
        os: parseOs(ua),
        btag: btag || null,
        visitor,
      });
    } catch (e) {
      console.error('go-log', e.message);
    }
  });

  res.redirect(302, target);
});
