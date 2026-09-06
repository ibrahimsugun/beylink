import crypto from 'node:crypto';
import { badRequest } from './ApiError.js';

// Tasarım şablonu = profilin theme_settings anlık görüntüsü. İçe aktarılan kod GÜVENİLMEZ →
// yalnız bilinen anahtarlar + enum doğrulaması kabul edilir (rastgele obje enjeksiyonu engellenir).

const BUTTON_STYLES = new Set(['rounded', 'pill', 'sharp', 'soft']);
const HEADER_TYPES = new Set(['avatar', 'cover', 'both']);
const TITLE_ALIGNS = new Set(['left', 'center', 'right']);
const LAYOUTS = new Set(['single', 'double']);
const HEADER_ICONS = new Set(['qr', 'share']);
const TEMPLATE_RE = /^[a-z0-9_-]{1,40}$/;   // getTheme bilinmeyen key'de zaten 'wave'e düşer (graceful)
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const BACKGROUND_RE = /^[a-z]{1,20}$/i;      // 'gradient' | 'solid' vb. (yalnız harf)

function safeStr(v, re) {
  return typeof v === 'string' && re.test(v) ? v : null;
}

// theme_settings'i bilinen anahtarlara indirger + doğrular. Bilinmeyen/bozuk alanlar DÜŞER.
export function sanitizeThemeSettings(raw) {
  const t = raw && typeof raw === 'object' ? raw : {};
  const out = {};

  const template = safeStr(t.template, TEMPLATE_RE);
  if (template) out.template = template;

  const background = safeStr(t.background, BACKGROUND_RE);
  if (background) out.background = background;

  if (t.colors && typeof t.colors === 'object') {
    const c = {};
    const primary = safeStr(t.colors.primary, HEX_RE);
    const accent = safeStr(t.colors.accent, HEX_RE);
    if (primary) c.primary = primary;
    if (accent) c.accent = accent;
    if (Object.keys(c).length) out.colors = c;
  }

  if (BUTTON_STYLES.has(t.buttonStyle)) out.buttonStyle = t.buttonStyle;
  if (HEADER_TYPES.has(t.header_type)) out.header_type = t.header_type;
  if (TITLE_ALIGNS.has(t.title_align)) out.title_align = t.title_align;
  if (LAYOUTS.has(t.layout)) out.layout = t.layout;

  if (Array.isArray(t.header_icons)) {
    const icons = t.header_icons.filter((i) => HEADER_ICONS.has(i));
    out.header_icons = [...new Set(icons)];
  }

  return out;
}

// --- Taşınabilir export kodu: BLT1.<base64url(json)>.<crc8> ---
const CODE_RE = /^BLT1\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/;
const MAX_CODE_LEN = 4000;

function crc8(json) {
  return crypto.createHash('sha256').update(json).digest('hex').slice(0, 8);
}

export function encodeTemplateCode(themeSettings) {
  const json = JSON.stringify(sanitizeThemeSettings(themeSettings));
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  return `BLT1.${b64}.${crc8(json)}`;
}

// Kodu çöz + bütünlük doğrula + sanitize. Bozuk/geçersiz kodda badRequest.
export function decodeTemplateCode(code) {
  const raw = String(code == null ? '' : code).trim();
  if (!raw || raw.length > MAX_CODE_LEN) throw badRequest('Geçersiz şablon kodu', 'code');
  const m = raw.match(CODE_RE);
  if (!m) throw badRequest('Şablon kodu tanınmadı. Doğru kodu yapıştırdığından emin ol.', 'code');

  let json;
  try {
    json = Buffer.from(m[1], 'base64url').toString('utf8');
  } catch {
    throw badRequest('Şablon kodu çözülemedi', 'code');
  }
  if (crc8(json) !== m[2]) throw badRequest('Şablon kodu bozuk veya değiştirilmiş', 'code');

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw badRequest('Şablon kodu geçersiz', 'code');
  }
  return sanitizeThemeSettings(parsed); // güvenilmez içerik → yalnız bilinen anahtarlar
}
