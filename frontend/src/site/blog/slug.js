// Türkçe karakter destekli slugify (H2 → id çevirisi için) + basit reading time hesabı.

const TR_MAP = { ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u' };

export function slugify(str) {
  return String(str || '')
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => TR_MAP[c] || c)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')     // alfanumerik + boşluk + tire dışını at
    .trim()
    .replace(/\s+/g, '-')          // boşlukları tireye çevir
    .replace(/-+/g, '-')           // ardışık tireleri tekle
    .slice(0, 96);
}

// Kelime/dakika ~200 (Türkçe okuma hızı ortalaması). Minimum 2 dk.
export function estimateReadingMinutes(wordCount) {
  return Math.max(2, Math.round(wordCount / 200));
}
