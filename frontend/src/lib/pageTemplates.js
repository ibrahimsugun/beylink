// Hazır SAYFA şablonları — renk/stil değil, ÖNCEDEN DOLDURULMUŞ tam sayfa taslakları.
// Kullanıcı bir şablon seçer → editörde placeholder içeriği kendi bilgileriyle doldurur → kaydeder.
// theme_settings YALNIZ serbest (ücretsiz) tema anahtarları kullanır (herkese açık, gating çakışmaz).
//
// Blok tipleri: 'link' (buton, url zorunlu), 'social' (ikon+url), 'divider' (bölüm başlığı, url yok),
//               'contact' (vCard; config: firstName/lastName/role/company/phone/email/website/hours).
// Her blok: { type, title, url?, icon_name?, config? }. Sosyal ikon isimleri: lib/icons.js ICON_MAP.

export const PAGE_TEMPLATES = [
  // 1 — Kurumsal Kartvizit
  {
    key: 'biz_card', name: 'Kurumsal Kartvizit', category: 'İş & Kurumsal', emoji: '💼',
    description: 'Dijital kartvizit: iletişim kartı, web ve kurumsal bağlantılar.',
    theme_settings: { template: 'midnight', buttonStyle: 'rounded', title_align: 'center', header_type: 'avatar' },
    profile: { display_name: 'Ad Soyad', bio: 'Satış Direktörü · Örnek A.Ş.' },
    blocks: [
      { type: 'contact', title: 'Kartvizitim', config: { firstName: 'Ad', lastName: 'Soyad', role: 'Satış Direktörü', company: 'Örnek A.Ş.', phone: '+90 555 000 00 00', email: 'ad.soyad@ornek.com', website: 'ornek.com' } },
      { type: 'link', title: 'Kurumsal Web Sitesi', url: 'https://ornek.com', icon_name: 'globe' },
      { type: 'link', title: 'Randevu / Toplantı Ayarla', url: 'https://calendly.com/ornek', icon_name: 'book-open' },
      { type: 'link', title: 'Ürün Kataloğu (PDF)', url: 'https://ornek.com/katalog.pdf', icon_name: 'book-open' },
      { type: 'social', title: 'LinkedIn', url: 'https://linkedin.com/in/adsoyad', icon_name: 'linkedin' },
      { type: 'social', title: 'E-posta', url: 'mailto:ad.soyad@ornek.com', icon_name: 'mail' },
    ],
  },
  // 2 — İçerik Üreticisi (link hub)
  {
    key: 'creator_hub', name: 'İçerik Üreticisi', category: 'İçerik / Influencer', emoji: '⭐',
    description: 'Tüm platformların + özel içerik ve iş birliği bağlantıların tek yerde.',
    theme_settings: { template: 'sunset', buttonStyle: 'pill', title_align: 'center', header_type: 'avatar' },
    profile: { display_name: '@kullaniciadi', bio: 'İçerik üreticisi ✨ İş birlikleri için aşağıdan ulaşın' },
    blocks: [
      { type: 'link', title: '🔒 Özel İçerik / Abonelik', url: 'https://ornek.com/abonelik', icon_name: 'star' },
      { type: 'link', title: '🎁 Takipçiye özel indirim', url: 'https://ornek.com/kupon', icon_name: 'shop' },
      { type: 'link', title: '🤝 İş birliği & sponsorluk', url: 'mailto:isbirligi@ornek.com', icon_name: 'mail' },
      { type: 'divider', title: 'Sosyal Hesaplarım' },
      { type: 'social', title: 'Instagram', url: 'https://instagram.com/kullaniciadi', icon_name: 'instagram' },
      { type: 'social', title: 'TikTok', url: 'https://tiktok.com/@kullaniciadi', icon_name: 'tiktok' },
      { type: 'social', title: 'YouTube', url: 'https://youtube.com/@kanal', icon_name: 'youtube' },
      { type: 'social', title: 'X', url: 'https://x.com/kullaniciadi', icon_name: 'x' },
    ],
  },
  // 3 — Gezgin & Yol Haritası
  {
    key: 'traveler', name: 'Gezgin & Yol Haritası', category: 'Seyahat', emoji: '🧭',
    description: 'Kendini tanıt, rotanı paylaş, blog ve vloglarını bağla.',
    theme_settings: { template: 'forest', buttonStyle: 'soft', title_align: 'center', header_type: 'both' },
    profile: { display_name: 'Gezgin Adı', bio: '30 ülke, 3 kıta 🌍 Sıradaki durak: Kapadokya' },
    blocks: [
      { type: 'link', title: '📍 Güncel rotam (harita)', url: 'https://maps.google.com', icon_name: 'globe' },
      { type: 'divider', title: 'İçeriklerim' },
      { type: 'link', title: 'Seyahat blogum', url: 'https://ornek.com/blog', icon_name: 'book-open' },
      { type: 'link', title: 'YouTube vlog kanalı', url: 'https://youtube.com/@gezgin', icon_name: 'youtube' },
      { type: 'link', title: 'Instagram fotoğraf günlüğü', url: 'https://instagram.com/gezgin', icon_name: 'instagram' },
      { type: 'divider', title: 'Destek ol' },
      { type: 'link', title: '☕ Bana bir kahve ısmarla', url: 'https://buymeacoffee.com/gezgin', icon_name: 'link' },
    ],
  },
  // 4 — Restoran Online Menü
  {
    key: 'restaurant_menu', name: 'Restoran Menüsü', category: 'Yeme-İçme', emoji: '🍽️',
    description: 'Online menü: kategoriler, rezervasyon, yol tarifi ve sipariş.',
    theme_settings: { template: 'brand', buttonStyle: 'rounded', title_align: 'center', header_type: 'cover' },
    profile: { display_name: 'Restoran Adı', bio: 'Taze · Yerel · Ev yapımı 🍷 Her gün 12:00 – 23:00' },
    blocks: [
      { type: 'link', title: '📅 Rezervasyon Yap', url: 'https://ornek.com/rezervasyon', icon_name: 'book-open' },
      { type: 'link', title: '🛵 Online Sipariş / Paket', url: 'https://ornek.com/siparis', icon_name: 'shop' },
      { type: 'divider', title: 'Başlangıçlar' },
      { type: 'link', title: 'Mevsim Salatası — 120₺', url: 'https://ornek.com/menu', icon_name: 'link' },
      { type: 'link', title: 'Humus & Ekmek — 90₺', url: 'https://ornek.com/menu', icon_name: 'link' },
      { type: 'divider', title: 'Ana Yemekler' },
      { type: 'link', title: 'Izgara Köfte — 220₺', url: 'https://ornek.com/menu', icon_name: 'link' },
      { type: 'link', title: 'Günün Balığı — 320₺', url: 'https://ornek.com/menu', icon_name: 'link' },
      { type: 'divider', title: 'Bize Ulaşın' },
      { type: 'link', title: '📍 Yol Tarifi', url: 'https://maps.google.com', icon_name: 'globe' },
      { type: 'social', title: 'WhatsApp', url: 'https://wa.me/905550000000', icon_name: 'whatsapp' },
      { type: 'social', title: 'Instagram', url: 'https://instagram.com/restoran', icon_name: 'instagram' },
    ],
  },
  // 5 — Müzisyen / DJ
  {
    key: 'musician', name: 'Müzisyen / DJ', category: 'Müzik', emoji: '🎧',
    description: 'Dinleme platformları, yeni single, konser biletleri.',
    theme_settings: { template: 'midnight', buttonStyle: 'pill', title_align: 'center', header_type: 'avatar' },
    profile: { display_name: 'Sanatçı Adı', bio: 'Yeni single "Gece" şimdi tüm platformlarda 🎵' },
    blocks: [
      { type: 'link', title: '▶️ Spotify’da Dinle', url: 'https://open.spotify.com', icon_name: 'music' },
      { type: 'link', title: '🍎 Apple Music', url: 'https://music.apple.com', icon_name: 'music' },
      { type: 'link', title: '🎬 YouTube (klip)', url: 'https://youtube.com/@sanatci', icon_name: 'youtube' },
      { type: 'link', title: '🎫 Konser Biletleri', url: 'https://ornek.com/biletler', icon_name: 'link' },
      { type: 'divider', title: 'Takip Et' },
      { type: 'social', title: 'Instagram', url: 'https://instagram.com/sanatci', icon_name: 'instagram' },
      { type: 'social', title: 'SoundCloud', url: 'https://soundcloud.com/sanatci', icon_name: 'music' },
      { type: 'social', title: 'TikTok', url: 'https://tiktok.com/@sanatci', icon_name: 'tiktok' },
    ],
  },
  // 6 — Fitness Koçu
  {
    key: 'fitness_coach', name: 'Fitness Koçu', category: 'Spor & Sağlık', emoji: '💪',
    description: 'Online koçluk, ücretsiz program, randevu ve dönüşüm içerikleri.',
    theme_settings: { template: 'mono', buttonStyle: 'sharp', title_align: 'center', header_type: 'avatar' },
    profile: { display_name: 'Koç Adı', bio: 'Kişisel antrenör & beslenme koçu 🏋️ 500+ mutlu danışan' },
    blocks: [
      { type: 'link', title: '🔥 Online Koçluk Paketleri', url: 'https://ornek.com/paketler', icon_name: 'star' },
      { type: 'link', title: '🎁 Ücretsiz 7 Günlük Program (PDF)', url: 'https://ornek.com/ucretsiz', icon_name: 'book-open' },
      { type: 'link', title: '🥗 Beslenme Danışmanlığı', url: 'https://ornek.com/beslenme', icon_name: 'link' },
      { type: 'link', title: '📅 Ücretsiz Ön Görüşme', url: 'https://calendly.com/koc', icon_name: 'book-open' },
      { type: 'divider', title: 'Dönüşümler & İçerikler' },
      { type: 'social', title: 'Instagram', url: 'https://instagram.com/koc', icon_name: 'instagram' },
      { type: 'social', title: 'YouTube', url: 'https://youtube.com/@koc', icon_name: 'youtube' },
    ],
  },
  // 7 — Fotoğrafçı Portfolyo
  {
    key: 'photographer', name: 'Fotoğrafçı', category: 'Fotoğraf & Kreatif', emoji: '📷',
    description: 'Portfolyo, fiyat listesi, rezervasyon ve sosyal galeri.',
    theme_settings: { template: 'minimal', buttonStyle: 'soft', title_align: 'left', header_type: 'both' },
    profile: { display_name: 'Fotoğrafçı Adı', bio: 'Düğün & portre fotoğrafçısı 📸 İstanbul' },
    blocks: [
      { type: 'link', title: 'Portfolyo (galeri)', url: 'https://ornek.com/portfolyo', icon_name: 'camera' },
      { type: 'link', title: 'Fiyat Listesi & Paketler', url: 'https://ornek.com/fiyatlar', icon_name: 'book-open' },
      { type: 'link', title: '📅 Çekim Rezervasyonu', url: 'https://ornek.com/rezervasyon', icon_name: 'book-open' },
      { type: 'divider', title: 'Çalışmalarım' },
      { type: 'social', title: 'Instagram', url: 'https://instagram.com/fotografci', icon_name: 'instagram' },
      { type: 'social', title: 'Behance', url: 'https://behance.net/fotografci', icon_name: 'camera' },
      { type: 'social', title: 'İletişim', url: 'mailto:info@ornek.com', icon_name: 'mail' },
    ],
  },
  // 8 — Online Mağaza / E-ticaret
  {
    key: 'shop', name: 'Online Mağaza', category: 'E-ticaret', emoji: '🛍️',
    description: 'Mağaza, kampanyalar, kargo takip ve WhatsApp sipariş.',
    theme_settings: { template: 'blush', buttonStyle: 'rounded', title_align: 'center', header_type: 'avatar' },
    profile: { display_name: 'Marka Adı', bio: 'El yapımı ürünler 🎀 Ücretsiz kargo & aynı gün gönderim' },
    blocks: [
      { type: 'link', title: '🛒 Mağazaya Git', url: 'https://ornek.com', icon_name: 'shop' },
      { type: 'link', title: '🔥 Kampanyalar & İndirimler', url: 'https://ornek.com/kampanya', icon_name: 'star' },
      { type: 'link', title: '📦 Kargo Takip', url: 'https://ornek.com/takip', icon_name: 'link' },
      { type: 'link', title: '⭐ Müşteri Yorumları', url: 'https://ornek.com/yorumlar', icon_name: 'star' },
      { type: 'divider', title: 'Sipariş & İletişim' },
      { type: 'social', title: 'WhatsApp Sipariş', url: 'https://wa.me/905550000000', icon_name: 'whatsapp' },
      { type: 'social', title: 'Instagram', url: 'https://instagram.com/marka', icon_name: 'instagram' },
    ],
  },
  // 9 — Düğün / Etkinlik
  {
    key: 'wedding', name: 'Düğün & Etkinlik', category: 'Etkinlik', emoji: '💍',
    description: 'Etkinlik detayları, konum, RSVP ve hediye listesi.',
    theme_settings: { template: 'blush', buttonStyle: 'soft', title_align: 'center', header_type: 'cover' },
    profile: { display_name: 'Ayşe & Mehmet', bio: '14 Haziran 2026 · Sizleri aramızda görmek isteriz 💛' },
    blocks: [
      { type: 'link', title: '💌 Katılım Bildirimi (RSVP)', url: 'https://ornek.com/rsvp', icon_name: 'book-open' },
      { type: 'link', title: '📍 Konum & Yol Tarifi', url: 'https://maps.google.com', icon_name: 'globe' },
      { type: 'link', title: '🎁 Hediye Listesi', url: 'https://ornek.com/hediye', icon_name: 'shop' },
      { type: 'link', title: '📸 Fotoğraf Albümü', url: 'https://ornek.com/album', icon_name: 'camera' },
      { type: 'divider', title: 'Program' },
      { type: 'link', title: 'Tören 16:00 · Yemek 19:00', url: 'https://ornek.com/program', icon_name: 'link' },
    ],
  },
  // 10 — Freelancer / Yazılımcı Portfolyo
  {
    key: 'freelancer', name: 'Freelancer Portfolyo', category: 'Yazılım & Freelance', emoji: '👨‍💻',
    description: 'Projeler, CV, iş teklifi ve profesyonel sosyal bağlantılar.',
    theme_settings: { template: 'wave', buttonStyle: 'rounded', title_align: 'left', header_type: 'avatar' },
    profile: { display_name: 'Ad Soyad', bio: 'Full-stack geliştirici 👨‍💻 React · Node · yeni projelere açığım' },
    blocks: [
      { type: 'link', title: '🚀 Projelerim (GitHub)', url: 'https://github.com/kullanici', icon_name: 'github' },
      { type: 'link', title: '📄 CV / Özgeçmiş', url: 'https://ornek.com/cv.pdf', icon_name: 'book-open' },
      { type: 'link', title: '💼 Benimle Çalış (teklif al)', url: 'mailto:merhaba@ornek.com', icon_name: 'mail' },
      { type: 'link', title: '✍️ Blog / Yazılar', url: 'https://ornek.com/blog', icon_name: 'book-open' },
      { type: 'divider', title: 'Bağlantılar' },
      { type: 'social', title: 'LinkedIn', url: 'https://linkedin.com/in/kullanici', icon_name: 'linkedin' },
      { type: 'social', title: 'GitHub', url: 'https://github.com/kullanici', icon_name: 'github' },
      { type: 'social', title: 'X', url: 'https://x.com/kullanici', icon_name: 'x' },
    ],
  },
];

// Editörde düzenlenebilir alanı olan blok tipleri (divider yalnız başlık; contact ek alanlar).
export function templateBlockFields(block) {
  if (block.type === 'divider') return ['title'];
  if (block.type === 'contact') return ['title'];
  return ['title', 'url']; // link + social
}

// --- i18n yardımcıları (Config Anahtar Üretim Kuralı: pagetpl.<key>.…) ---
// Veri alanlarını (theme_settings, blocks[].type/url/icon_name) MUTASYONA UĞRATMAZ; yalnız
// render/seed anında görünen metni t()'den geçirir. Uygulanınca AKTİF DİLDE seed edilir.
export function pageTplName(tpl, t) { return t(`pagetpl.${tpl.key}.name`); }
export function pageTplCategory(tpl, t) { return t(`pagetpl.${tpl.key}.category`); }
export function pageTplDescription(tpl, t) { return t(`pagetpl.${tpl.key}.description`); }
export function pageTplDisplayName(tpl, t) { return t(`pagetpl.${tpl.key}.profile.displayName`); }
export function pageTplBio(tpl, t) { return t(`pagetpl.${tpl.key}.profile.bio`); }
export function pageTplBlockTitle(tpl, i, t) { return t(`pagetpl.${tpl.key}.blocks.${i}.title`); }
