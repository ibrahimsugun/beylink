import QRCode from 'qrcode';
import { profileModel } from '../models/profileModel.js';
import { linkModel } from '../models/linkModel.js';
import { analyticsModel } from '../models/analyticsModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notFound, badRequest, tooManyRequests } from '../utils/ApiError.js';
import { parseDevice, parseBrowser, parseOs } from '../utils/ua.js';
import { sanitizeBtag } from '../utils/btag.js';
import { resolveVisitor } from '../utils/visitor.js';
import { resolveCountry } from '../utils/geoip.js';
import { config } from '../config/env.js';
import { userModel } from '../models/userModel.js';
import { applyExpiryIfNeeded, planCaps } from '../utils/plan.js';
import { isBlocked, recordFailure } from '../utils/rateLimit.js';

const TRACK_LIMIT = { max: 90, windowMs: 60_000, blockMs: 5 * 60_000 };

// Public sayfada gösterilecek profil alanları (hassas alan yok).
// theme_settings.hide_branding yalnız profil sahibinin GÜNCEL planı bunu izin veriyorsa
// public'e "true" olarak sızabilir — plan bittiyse (Free/Basic'e düşmüşse) BeyLink markası
// otomatik geri gelir. Bu, ayrı bir cron / batch işine gerek bırakmadan lazy enforcement sağlar.
function publicProfile(profile) {
  const ts = profile.theme_settings || {};
  let hide = ts.hide_branding === true;
  if (hide) {
    const owner = applyExpiryIfNeeded(userModel.findById(profile.user_id));
    if (!planCaps(owner).hideBranding) hide = false;
  }
  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    bio: profile.bio,
    bio_html: profile.bio_html,
    avatar_url: profile.avatar_url,
    cover_url: profile.cover_url,
    theme_settings: { ...ts, hide_branding: hide },
    meta_title: profile.meta_title,
    meta_description: profile.meta_description,
    seo_settings: profile.seo_settings,
  };
}

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = profileModel.findByUsername(req.params.username);
  if (!profile || !profile.is_published) throw notFound('Profil bulunamadı');

  // Host özel bir domainse (A4): yalnız o domainin SAHİBİNE ait profiller görünür — başka
  // BeyLink kullanıcısının slug'ı özel domain altında 404 (yatay sızma/gizlilik ihlali önlenir).
  if (req.customDomain && profile.user_id !== req.customDomain.user_id) throw notFound('Profil bulunamadı');

  // NOT: Görüntülenme burada KAYDEDİLMEZ (bu GET idempotent olmalı — StrictMode/prefetch
  // çift-fetch'i çift-sayıma yol açardı). Görüntülenme istemciden tek bir `track` beacon'ıyla
  // gelir (event_type='view' + visitor) — çift-sayım yok, tekil sayım doğru.
  const links = linkModel.listByProfile(profile.id, { activeOnly: true });
  res.json({ profile: publicProfile(profile), links });
});

// GET /api/public/ (kök, username YOK) — yalnız özel domain host'unda anlamlı: domainin
// kök '/' yolu sahibinin `target_profile_id` ile eşleşen profilini sunar (A4). Ana BeyLink
// domaininde bu route'a asla gelinmez (SPA kökü marketing sayfasıdır, public API çağırmaz).
export const getPublicRootProfile = asyncHandler(async (req, res) => {
  if (!req.customDomain?.target_profile_id) throw notFound('Profil bulunamadı');
  const profile = profileModel.findById(req.customDomain.target_profile_id);
  if (!profile || !profile.is_published) throw notFound('Profil bulunamadı');

  const links = linkModel.listByProfile(profile.id, { activeOnly: true });
  res.json({ profile: publicProfile(profile), links });
});

export const track = asyncHandler(async (req, res) => {
  const rlKey = `track:${req.ip}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla istek — lütfen biraz bekleyin');
  recordFailure(rlKey, TRACK_LIMIT);

  const { profile_id, link_id, event_type = 'click' } = req.body;
  if (!profile_id) throw badRequest('profile_id gerekli');
  if (!['click', 'view'].includes(event_type)) throw badRequest('Geçersiz event_type');

  // Profil gerçekten var ve yayında mı? (FK 500'ü ve sahte veriyi önle)
  const profile = profileModel.findById(Number(profile_id));
  if (!profile || !profile.is_published) throw notFound('Profil bulunamadı');

  // link_id verildiyse gerçekten bu profile ait olmalı; değilse yok say
  let linkId = null;
  if (link_id) {
    const link = linkModel.findById(Number(link_id));
    if (link && link.profile_id === profile.id) linkId = link.id;
  }

  const ua = req.headers['user-agent'] || '';
  // Anti-fraud: visitor DAİMA çözülür (istemci id'si ya da IP-hash) → aynı gün tekrar TEK sayılır (dedup).
  const { deduped } = analyticsModel.recordDedup({
    profileId: profile.id,
    linkId,
    eventType: event_type,
    device: parseDevice(ua),
    country: resolveCountry(req.ip), // yerel IP→ülke; veri yoksa null (Bilinmiyor)
    referrer: req.get('referer') || '',
    userAgent: ua,
    browser: parseBrowser(ua),
    os: parseOs(ua),
    btag: sanitizeBtag(req.body.btag) || null,
    visitor: resolveVisitor(req, req.body.visitor),
  });
  res.json({ ok: true, counted: !deduped });
});

export const getQr = asyncHandler(async (req, res) => {
  const profile = profileModel.findByUsername(req.params.username);
  if (!profile || !profile.is_published) throw notFound('Profil bulunamadı');
  if (req.customDomain && profile.user_id !== req.customDomain.user_id) throw notFound('Profil bulunamadı');
  // Özel domain altında kendi hostuna göre QR üret (kullanıcı markasını taşımalı, beylink.org değil).
  const base = req.customDomain ? `${req.protocol}://${req.customDomain.domain}` : config.publicBaseUrl;
  const url = `${base}/${profile.username}`;
  const dataUrl = await QRCode.toDataURL(url, {
    width: 512,
    margin: 1,
    color: { dark: '#1B2340', light: '#FFFFFF' },
  });
  res.json({ url, dataUrl });
});
