// Blog kategorileri ve tag'ler tek gerçek kaynak — POSTS'takiler bunlardan seçilir.
export const CATEGORIES = [
  { key: 'temeller', label: 'Temeller', desc: 'Link-in-bio kavramı ve başlangıç kılavuzları.' },
  { key: 'sosyal-medya', label: 'Sosyal Medya', desc: 'Instagram, TikTok, YouTube için özel rehberler.' },
  { key: 'yaraticilar', label: 'Yaratıcılar', desc: 'İçerik üreticileri ve influencer\'lar için ipuçları.' },
  { key: 'markalasma', label: 'Markalaşma', desc: 'Kişisel marka ve dijital kimlik oluşturma.' },
  { key: 'araclar', label: 'Araçlar', desc: 'QR, kartvizit, kısa link — dijital araç rehberleri.' },
  { key: 'optimizasyon', label: 'Optimizasyon', desc: 'Dönüşüm, SEO ve landing page teknikleri.' },
];

export const categoryOf = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];

// i18n: kategori adı ve pazarlama tonlu `desc` tagline `key`'den türetilir (mekanik, veri mutasyona uğramaz).
export const categoryLabel = (cat, t) => t(`blog.category.${cat.key}.label`);
export const categoryDesc = (cat, t) => t(`blog.category.${cat.key}.desc`);
