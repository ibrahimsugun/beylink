import crypto from 'node:crypto';
import { config } from '../config/env.js';

// Birinci-taraf ziyaretçi kimliği — tekil sayım + anti-fraud dedup için.
const VISITOR_RE = /^[A-Za-z0-9-]{8,64}$/;

// İstemciden gelen ham visitor'ı doğrular (biçim dışıysa null).
export function sanitizeVisitor(v) {
  return typeof v === 'string' && VISITOR_RE.test(v) ? v : null;
}

// İstemci visitor'ı yoksa (localStorage kapalı/bot) IP-hash yedeği üretir.
// Ham IP SAKLANMAZ — yalnız tuzlu sha256'nın ilk 16 hane'i ('ip-<hash>'). Böylece
// localStorage temizleyerek de bir kişi aynı gün istatistiği şişiremez (IP aynı → dedup).
export function resolveVisitor(req, clientVisitor) {
  const v = sanitizeVisitor(clientVisitor);
  if (v) return v;
  const ip = (req.ip || '').toString();
  const h = crypto.createHash('sha256').update(`${config.jwtSecret}|${ip}`).digest('hex').slice(0, 16);
  return `ip-${h}`; // 19 karakter → VISITOR_RE'ye uyar
}

// /api/go (sunucu tıklama loglaması) için visitor'ı first-party cookie'den okur.
// URL/Referer üzerinden sızmaz (cookie SameSite=Lax ile aynı-site navigasyonda gelir).
export function visitorFromCookie(req) {
  const raw = req.headers.cookie || '';
  const m = raw.match(/(?:^|;\s*)beylink_vid=([^;]+)/);
  if (!m) return null;
  try {
    return sanitizeVisitor(decodeURIComponent(m[1]));
  } catch {
    return sanitizeVisitor(m[1]);
  }
}
