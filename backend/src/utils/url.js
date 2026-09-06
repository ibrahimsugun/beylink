// link/social hedefleri icin guvenli URL normalizasyonu.
// Yalnizca http/https'e izin verilir; javascript:/data:/vbscript:/file: gibi
// semalar reddedilir (stored-XSS + res.redirect ile sema enjeksiyonunu onler).
// Semasiz girdi https:// ile tamamlanir. Uygun degilse null doner.
export function toHttpTarget(url) {
  const u = String(url == null ? '' : url).trim();
  if (!u) return null;
  const scheme = u.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    return s === 'http' || s === 'https' ? u : null;
  }
  return `https://${u}`;
}

// Sadece dogrulama: link/social URL'si http/https'e cevrilebiliyor mu?
export function isHttpUrl(url) {
  return toHttpTarget(url) !== null;
}

// link/social BLOK hedefi icin guvenli normalizasyon: http/https + iletisim semalari (mailto/tel).
// mailto:/tel: script CALISTIRMAZ → guvenli; javascript:/data:/vbscript:/file: reddedilir.
// Semasiz girdi https:// ile tamamlanir. (redirectController /api/go YALNIZ http/https kullanir;
// mailto/tel ProfileView'da dogrudan href olarak render edilir, /api/go'ya girmez.)
export function toSafeLinkTarget(url) {
  const u = String(url == null ? '' : url).trim();
  if (!u) return null;
  const scheme = u.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    if (s === 'http' || s === 'https') return u;
    if (s === 'mailto' || s === 'tel') return u; // guvenli iletisim semalari
    return null; // diger tum semalar reddedilir (XSS onlemi)
  }
  return `https://${u}`;
}
