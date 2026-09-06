import geoip from 'geoip-lite';

// IP → ülke (ISO-3166 alpha-2). `geoip-lite` npm paketi — TAMAMEN YEREL/offline (bundled MaxMind
// GeoLite2 datası, IPv4 + IPv6), harici API yok, IP dışarı sızmaz. Çözemezse (özel/rezerve IP,
// geçersiz, kapsam dışı) null → "Bilinmiyor". Ham IP SAKLANMAZ — yalnız ülke kodu analitiğe yazılır.
// Veri güncelleme (opsiyonel): `node_modules/geoip-lite` `npm run updatedb` (MaxMind lisans anahtarı ile).
export function resolveCountry(ip) {
  if (typeof ip !== 'string' || !ip) return null;
  let s = ip.trim();
  // IPv4-mapped IPv6 (::ffff:1.2.3.4) → saf IPv4 (geoip-lite IPv4 datasıyla eşleşsin)
  const m = s.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (m) s = m[1];
  try {
    return geoip.lookup(s)?.country || null;
  } catch {
    return null;
  }
}
