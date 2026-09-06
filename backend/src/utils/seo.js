import { toHttpTarget } from './url.js';

const OG_MODES = ['cover', 'avatar', 'custom'];
const ROBOTS = ['index', 'noindex'];

/**
 * SeoPage'den gelen ham seo_settings'i güvenli/normalize haline getirir:
 *  - fbPixelId yalnız rakam (5-20), robots enum, ogImageMode enum
 *  - URL'ler http/https'e zorlanır (javascript:/data: reddedilir)
 *  - uzunluk sınırları
 * Depolamadan ÖNCE controller'da çağrılır → çöp/zararlı değer DB'ye girmez.
 */
export function sanitizeSeoSettings(input) {
  const s = input && typeof input === 'object' ? input : {};
  const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
  const out = {
    ogImageMode: OG_MODES.includes(s.ogImageMode) ? s.ogImageMode : 'cover',
    ogImageUrl: '',
    keywords: clip(s.keywords, 200),
    canonical: '',
    robots: ROBOTS.includes(s.robots) ? s.robots : 'index',
    twitterHandle: clip(s.twitterHandle, 40).replace(/^@+/, ''),
    fbPixelId: '',
  };
  if (s.ogImageUrl) out.ogImageUrl = toHttpTarget(clip(s.ogImageUrl, 500)) || '';
  if (s.canonical) out.canonical = toHttpTarget(clip(s.canonical, 500)) || '';
  if (s.fbPixelId != null) {
    const id = String(s.fbPixelId).replace(/\D/g, ''); // yalnız rakam bırak (frontend ile tutarlı)
    if (/^\d{5,20}$/.test(id)) out.fbPixelId = id;
  }
  return out;
}

/**
 * Paylaşım görselini (og:image) çözer: özel URL / avatar / kapak.
 * Varsayılan 'cover' → kapak yoksa avatar'a düşer. Göreli dönebilir (mutlaklaştırma çağırana ait).
 */
export function resolveOgImage(profile, seo = {}) {
  const mode = seo.ogImageMode || 'cover';
  if (mode === 'custom' && seo.ogImageUrl) return seo.ogImageUrl;
  if (mode === 'avatar') return profile.avatar_url || profile.cover_url || null;
  return profile.cover_url || profile.avatar_url || null;
}
