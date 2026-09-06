// HTML kaçış + mutlak URL — SSR/OG prerender ve güvenli sunucu-taraflı enjeksiyon için.

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Metni ve attribute değerlerini HTML'e güvenli gömmek için kaçışlar (XSS'i keser).
export function escapeHtml(input) {
  if (input == null) return '';
  return String(input).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

/**
 * Göreli yolu (ör. /uploads/x.png) istek host'una göre mutlak URL'ye çevirir.
 * Zaten http(s) ise dokunmaz. Çözemezse null. (og:image mutlak URL ister.)
 */
export function absoluteUrl(req, pathOrUrl) {
  const v = (pathOrUrl == null ? '' : String(pathOrUrl)).trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const host = req.get('host');
  if (!host) return null;
  const proto = req.protocol || 'http';
  return `${proto}://${host}${v.startsWith('/') ? '' : '/'}${v}`;
}
