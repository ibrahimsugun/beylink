// BTAG (affiliate/banner takip etiketi) yardimcilari — hem redirect motoru hem
// public track ucu ayni temizleme kurallarini kullansin diye tek yerde.

// Rasgele bir string'i guvenli BTAG'e cevir: kontrol karakterleri + bosluklari at,
// 64 karakterle sinirla. (Harici/kesif BTAG'leri serbest birakiriz; yalnizca
// depolamayi/URL'yi bozacak baytlari eleriz.)
export function sanitizeBtag(input) {
  if (input == null) return '';
  let out = '';
  for (const ch of String(input)) {
    const code = ch.charCodeAt(0);
    if (code > 0x20 && code !== 0x7f) out += ch;
    if (out.length >= 64) break;
  }
  return out;
}

// Ham URL'den BTAG yakala (req.query DEGIL — Express tekrarli paramlari bozar).
// Bozuk yuzde-kodlamasi throw etmesin diye guvenli decode.
export function captureBtagFromUrl(originalUrl) {
  const m = String(originalUrl || '').match(/[?&]btag=([^&#]+)/i);
  if (!m) return '';
  let v = m[1];
  try {
    v = decodeURIComponent(v);
  } catch {
    /* bozuk kodlama -> ham degeri kullan */
  }
  return sanitizeBtag(v);
}
