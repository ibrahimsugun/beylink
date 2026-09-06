// Ana sayfa + /sss sayfası ortak SSS kaynağı. FAQPage JSON-LD schema.org burdan üretilir.
// 22 soru — Görev 1.11. i18n: metin tr/en.json'da `faq.<index>.question|answer` altında;
// burada yalnız anahtar referansları tutulur (Task 3.3). Tüketiciler t(qKey)/t(aKey) ile çözer.
export const FAQS = Array.from({ length: 22 }, (_, i) => ({
  qKey: `faq.${i}.question`,
  aKey: `faq.${i}.answer`,
}));

// JSON-LD (faqSchema) ve Yardım arama'sı için düz {q, a} metnine çözer.
export const resolveFaqs = (t, list = FAQS) =>
  list.map((f) => ({ q: t(f.qKey), a: t(f.aKey) }));
