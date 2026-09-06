// Hazır temalar — public profil arka planı + buton stili.
// theme_settings_json.template bu key'lerden birini tutar.

export const THEMES = [
  {
    key: 'wave',
    name: 'Okyanus',
    pageStyle: { background: 'linear-gradient(160deg, #0f3d6e 0%, #1b74c4 60%, #2aa9e0 100%)' },
    text: '#ffffff',
    button: { background: 'rgba(255,255,255,0.14)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)' },
  },
  {
    key: 'brand',
    name: 'BeyLink',
    pageStyle: { background: 'linear-gradient(150deg, #12C4B0 0%, #6D3BEA 100%)' },
    text: '#ffffff',
    button: { background: 'rgba(255,255,255,0.16)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.28)' },
  },
  {
    key: 'minimal',
    name: 'Minimal',
    pageStyle: { background: '#F6F8FB' },
    text: '#1B2340',
    button: { background: '#ffffff', color: '#1B2340', border: '1px solid #E5E9F2' },
  },
  {
    key: 'midnight',
    name: 'Gece',
    pageStyle: { background: 'linear-gradient(180deg, #12131c 0%, #23263a 100%)' },
    text: '#ffffff',
    button: { background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.16)' },
  },
  {
    key: 'sunset',
    name: 'Gün Batımı',
    pageStyle: { background: 'linear-gradient(160deg, #ff7e5f 0%, #feb47b 100%)' },
    text: '#3a1d12',
    button: { background: 'rgba(255,255,255,0.35)', color: '#3a1d12', border: '1px solid rgba(255,255,255,0.5)' },
  },
  {
    key: 'forest',
    name: 'Orman',
    pageStyle: { background: 'linear-gradient(160deg, #134e5e 0%, #71b280 100%)' },
    text: '#ffffff',
    button: { background: 'rgba(255,255,255,0.16)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.28)' },
  },
  {
    key: 'blush',
    name: 'Pudra',
    pageStyle: { background: 'linear-gradient(160deg, #ffd9e8 0%, #f6c6ea 100%)' },
    text: '#5a1030',
    button: { background: 'rgba(255,255,255,0.55)', color: '#5a1030', border: '1px solid rgba(255,255,255,0.7)' },
  },
  {
    key: 'mono',
    name: 'Karbon',
    pageStyle: { background: '#111111' },
    text: '#ffffff',
    button: { background: '#ffffff', color: '#111111', border: '1px solid #ffffff' },
  },
];

// ---- Hazır Temalar (iş-koluna özel presetler) — yalnız Pro ------------------
// theme_settings_json.template bu key'lerden birini tutabilir. Backend güvenlik allowlist'i
// (config/themes.js FREE_TEMPLATE_KEYS) SADECE yukarıdaki 8 serbest key'i içerir → aşağıdaki
// her preset otomatik olarak Pro-gated'dir. 10 tema / 5 profesyonel / 10 farklı iş kolu.
export const PRESET_THEMES = [
  // — Profesyonel (5) —
  {
    key: 'corporate', name: 'Kurumsal Lacivert', sector: 'Kurumsal & Ofis', professional: true,
    pageStyle: { background: 'linear-gradient(160deg, #1b2340 0%, #2b3a67 100%)' },
    text: '#ffffff',
    button: { background: 'rgba(255,255,255,0.10)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.24)' },
  },
  {
    key: 'legal', name: 'Hukuk & Danışmanlık', sector: 'Hukuk', professional: true,
    pageStyle: { background: 'linear-gradient(165deg, #14161d 0%, #24262f 100%)' },
    text: '#f4efe4',
    button: { background: 'rgba(201,163,78,0.16)', color: '#e8d4a0', border: '1px solid rgba(201,163,78,0.5)' },
  },
  {
    key: 'finance', name: 'Finans & Yatırım', sector: 'Finans', professional: true,
    pageStyle: { background: 'linear-gradient(160deg, #06281f 0%, #0f5c43 100%)' },
    text: '#eafff6',
    button: { background: 'rgba(255,255,255,0.10)', color: '#eafff6', border: '1px solid rgba(120,230,190,0.38)' },
  },
  {
    key: 'medical', name: 'Sağlık & Klinik', sector: 'Sağlık', professional: true,
    pageStyle: { background: 'linear-gradient(160deg, #eef7fb 0%, #dceef2 100%)' },
    text: '#0d3b45',
    button: { background: '#ffffff', color: '#0d3b45', border: '1px solid #bfe0e6' },
  },
  {
    key: 'realestate', name: 'Emlak & Mimari', sector: 'Emlak', professional: true,
    pageStyle: { background: 'linear-gradient(160deg, #2c2a28 0%, #4a423b 100%)' },
    text: '#f6efe7',
    button: { background: 'rgba(207,143,90,0.16)', color: '#f0d9c4', border: '1px solid rgba(207,143,90,0.5)' },
  },
  // — Yaşam tarzı / kreatif (5) —
  {
    key: 'restaurant', name: 'Restoran & Kafe', sector: 'Yeme-İçme', professional: false,
    pageStyle: { background: 'linear-gradient(160deg, #3d0f18 0%, #7a2233 100%)' },
    text: '#ffeede',
    button: { background: 'rgba(255,255,255,0.12)', color: '#ffeede', border: '1px solid rgba(255,220,190,0.42)' },
  },
  {
    key: 'beauty', name: 'Güzellik & Bakım', sector: 'Güzellik', professional: false,
    pageStyle: { background: 'linear-gradient(160deg, #f6d9dc 0%, #dfa4ac 100%)' },
    text: '#4a1e2b',
    button: { background: 'rgba(255,255,255,0.55)', color: '#4a1e2b', border: '1px solid rgba(255,255,255,0.75)' },
  },
  {
    key: 'fitness', name: 'Fitness & Spor', sector: 'Spor', professional: false,
    pageStyle: { background: 'linear-gradient(160deg, #101318 0%, #1c2330 100%)' },
    text: '#eaffea',
    button: { background: 'rgba(198,255,0,0.14)', color: '#d7ff5c', border: '1px solid rgba(198,255,0,0.45)' },
  },
  {
    key: 'creative', name: 'Fotoğraf & Kreatif', sector: 'Kreatif', professional: false,
    pageStyle: { background: 'linear-gradient(160deg, #5b21b6 0%, #c026d3 100%)' },
    text: '#ffffff',
    button: { background: 'rgba(255,255,255,0.16)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.34)' },
  },
  {
    key: 'nightlife', name: 'Müzik & Gece', sector: 'Gece Hayatı', professional: false,
    pageStyle: { background: 'linear-gradient(180deg, #0a021f 0%, #2d0b6e 100%)' },
    text: '#eafcff',
    button: { background: 'rgba(45,226,230,0.12)', color: '#9becff', border: '1px solid rgba(45,226,230,0.42)' },
  },
];

// ---- Buton şekli (radius) — theme_settings_json.buttonStyle -----------------
// Buton DOLGU/kenar/gölgesi temanın `button` nesnesinden gelir; buttonStyle yalnız KÖŞE
// yarıçapını belirler (kullanıcı serbestçe seçebilir; template'ler de set eder). Ücretsiz.
export const BUTTON_SHAPES = {
  rounded: '12px',
  pill: '9999px',
  sharp: '3px',
  soft: '20px',
};
export const BUTTON_SHAPE_KEYS = Object.keys(BUTTON_SHAPES);

// Bir temanın buton stilini + seçilen şekli birleştirip render'a hazır inline style döndürür.
export function resolveButton(theme, buttonStyle) {
  const radius = BUTTON_SHAPES[buttonStyle] || BUTTON_SHAPES.rounded;
  return { ...theme.button, borderRadius: radius };
}

// ---- Şablonlar (Templates) — KOMPLE hazır tasarım, yalnız Pro ---------------
// Bir template = renk teması (pageStyle+text) + zengin BUTON stili (dolgu/kenar/gölge) +
// buton şekli (buttonStyle) + hizalama + header tipini BİRLİKTE belirler → tek tıkla tam görünüm.
// key'ler serbest allowlist DIŞINDA olduğundan backend'de otomatik Pro-gated (config/themes.js).
// 10 template / 5 profesyonel / 10 kullanım alanı. Her template `settings` bundle'ını uygular.
export const TEMPLATES = [
  // — Profesyonel (5) —
  {
    key: 'tpl_executive', name: 'Yönetici', category: 'İş & Kurumsal', professional: true,
    pageStyle: { background: 'linear-gradient(165deg, #141a2e 0%, #223056 100%)' },
    text: '#eef2ff',
    button: { background: 'transparent', color: '#eef2ff', border: '1.5px solid rgba(255,255,255,0.55)' },
    buttonStyle: 'sharp', title_align: 'left', header_type: 'avatar',
  },
  {
    key: 'tpl_lawfirm', name: 'Hukuk Bürosu', category: 'Hukuk & Danışmanlık', professional: true,
    pageStyle: { background: 'linear-gradient(165deg, #14161d 0%, #262933 100%)' },
    text: '#f4efe4',
    button: { background: 'rgba(201,163,78,0.12)', color: '#ecd8a6', border: '1px solid rgba(201,163,78,0.6)' },
    buttonStyle: 'rounded', title_align: 'center', header_type: 'avatar',
  },
  {
    key: 'tpl_finance', name: 'Finans Kurumu', category: 'Finans & Yatırım', professional: true,
    pageStyle: { background: 'linear-gradient(160deg, #06281f 0%, #0f5c43 100%)' },
    text: '#eafff6',
    button: { background: '#ffffff', color: '#0b3d2e', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.22)' },
    buttonStyle: 'soft', title_align: 'center', header_type: 'both',
  },
  {
    key: 'tpl_clinic', name: 'Klinik & Sağlık', category: 'Sağlık', professional: true,
    pageStyle: { background: 'linear-gradient(160deg, #f2fafc 0%, #dcecf1 100%)' },
    text: '#0d3b45',
    button: { background: '#12a3b4', color: '#ffffff', border: 'none' },
    buttonStyle: 'pill', title_align: 'center', header_type: 'avatar',
  },
  {
    key: 'tpl_realestate', name: 'Emlak Ofisi', category: 'Emlak', professional: true,
    pageStyle: { background: 'linear-gradient(160deg, #2b2926 0%, #47403a 100%)' },
    text: '#f6efe7',
    button: { background: '#cf8f5a', color: '#241d16', border: 'none', boxShadow: '0 4px 0 rgba(0,0,0,0.28)' },
    buttonStyle: 'rounded', title_align: 'left', header_type: 'cover',
  },
  // — Yaşam tarzı / kreatif (5) —
  {
    key: 'tpl_creator', name: 'İçerik Üreticisi', category: 'İçerik / Influencer', professional: false,
    pageStyle: { background: '#fbfbfd' },
    text: '#141414',
    button: { background: 'transparent', color: '#141414', border: '1.5px solid rgba(0,0,0,0.85)' },
    buttonStyle: 'sharp', title_align: 'center', header_type: 'avatar',
  },
  {
    key: 'tpl_fitness', name: 'Fitness Studyo', category: 'Spor & Fitness', professional: false,
    pageStyle: { background: 'linear-gradient(160deg, #0e1016 0%, #1a1f2e 100%)' },
    text: '#f0f4ff',
    button: { background: '#6d3bea', color: '#ffffff', border: 'none' },
    buttonStyle: 'pill', title_align: 'center', header_type: 'both',
  },
  {
    key: 'tpl_musician', name: 'Müzisyen', category: 'Müzik', professional: false,
    pageStyle: { background: 'linear-gradient(180deg, #2a1a4a 0%, #7b2ff7 100%)' },
    text: '#ffffff',
    button: { background: '#ffffff', color: '#2a1a4a', border: 'none' },
    buttonStyle: 'pill', title_align: 'center', header_type: 'avatar',
  },
  {
    key: 'tpl_restaurant', name: 'Restoran & Kafe', category: 'Yeme-İçme', professional: false,
    pageStyle: { background: 'linear-gradient(160deg, #3d0f18 0%, #7a2233 100%)' },
    text: '#ffeede',
    button: { background: 'rgba(255,255,255,0.14)', color: '#ffeede', border: '1px solid rgba(255,220,190,0.45)' },
    buttonStyle: 'soft', title_align: 'center', header_type: 'cover',
  },
  {
    key: 'tpl_agency', name: 'Kreatif Ajans', category: 'Ajans & Kreatif', professional: false,
    pageStyle: { background: 'linear-gradient(160deg, #12172e 0%, #2b1b57 100%)' },
    text: '#ffffff',
    button: { background: 'linear-gradient(90deg, #ff512f 0%, #dd2476 100%)', color: '#ffffff', border: 'none' },
    buttonStyle: 'rounded', title_align: 'center', header_type: 'avatar',
  },
];

// Serbest + preset + template tüm görünümler tek indexte — render (getTheme) hepsini çözer.
const ALL_THEMES = [...THEMES, ...PRESET_THEMES, ...TEMPLATES];
export const PRESET_THEME_KEYS = new Set(PRESET_THEMES.map((t) => t.key));
export const TEMPLATE_KEYS = new Set(TEMPLATES.map((t) => t.key));

// Bir template'in uygulayacağı theme_settings bundle'ı (tek tıkla tam görünüm).
export function templateSettings(t) {
  return { template: t.key, buttonStyle: t.buttonStyle, title_align: t.title_align, header_type: t.header_type };
}

export const getTheme = (key) => ALL_THEMES.find((t) => t.key === key) || THEMES[0];

// ---- i18n yardımcıları (Config Anahtar Üretim Kuralı) ------------------------
// Veri alanları (name/sector/category) MUTASYONA UĞRAMAZ — yalnız görünen metin
// bu fonksiyonlardan geçer. Anahtarlar theme/template'in zaten stabil `key` alanından
// türetilir: `theme.<key>.name|sector`, `template.<key>.name|category`.
export const themeName = (theme, t) => t(`theme.${theme.key}.name`);
export const themeSector = (theme, t) => t(`theme.${theme.key}.sector`);
export const templateName = (template, t) => t(`template.${template.key}.name`);
export const templateCat = (template, t) => t(`template.${template.key}.category`);
