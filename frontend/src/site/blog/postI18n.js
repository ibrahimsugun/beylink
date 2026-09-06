// Blog makalesi i18n yardımcıları — bir POSTS elemanının dile bağlı alanlarını (title/description/
// tags/faq/readingMinutes) aktif dile göre çözer. Veri iki biçimde olabilir:
//   • `{ tr: ..., en: ... }` iki-dilli obje (çevrilmiş makaleler)
//   • düz string/sayı/dizi (henüz çevrilmemiş makaleler)
// Her iki durumu da fallback ile karşılar → çeviri batch'leri kademeli ilerlerken site bozulmaz.
// Nesneyi ASLA mutasyona uğratmaz; categories.js'teki `categoryLabel(cat, t)` deseniyle tutarlı,
// saf okuyucu fonksiyonlar.

// İç yardımcı: alan `{tr,en}` objesiyse dile göre seç (fallback tr→en), aksi halde olduğu gibi döndür
// (string/sayı/dizi/null hepsi doğrudan geçer).
function resolveField(field, lang) {
  if (field == null) return field;
  if (typeof field !== 'object' || Array.isArray(field)) return field;
  return field[lang] ?? field.tr ?? field.en ?? '';
}

export function postTitle(post, lang) {
  return resolveField(post?.title, lang) ?? '';
}

export function postDescription(post, lang) {
  return resolveField(post?.description, lang) ?? '';
}

export function postTags(post, lang) {
  return resolveField(post?.tags, lang) ?? [];
}

export function postFaq(post, lang) {
  return resolveField(post?.faq, lang) ?? [];
}

export function postReadingMinutes(post, lang) {
  return resolveField(post?.readingMinutes, lang);
}
