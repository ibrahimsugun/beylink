# BeyLink Kurumsal Website — İlerleme Takibi

> Bu dosya, `temporary-roadmap.md`'de tanımlanan 9 fazın gerçekleşme durumunu takip eder.
> Her faz/görev bitince ilgili kutu işaretlenir + kısa bir tarih/not düşülür.

**Domain:** `beylink.org` (lokalde `http://localhost:5180`)
**Mimari kararı:** marketing/site kısmı `src/site/*` altında izole; dashboard ve public profil dokunulmadı → Faz 9 (subdomain'e taşınırken) için hazır. Public taban URL'ler env'den beslenir: frontend `VITE_PUBLIC_BASE_URL` (canonical/OG), backend `SITEMAP_BASE_URL` (sitemap/robots/feed — canlı URL sabit).

**Kod düzeyinde açık kalan tek somut iş:** Faz 7 Newsletter form → backend endpoint. Diğer 2 açık madde ölçüm işi (Lighthouse), prod deploy sonrasına.

---

## Genel Mimari (Faz 9 hazırlığı)

- [x] `src/site/SiteLayout.jsx` = SiteHeader + `<Outlet />` + SiteFooter — marketing rotaları izole
- [x] `src/site/sections/*` — her section ayrı component (kod tekrarı yok)
- [x] `src/site/data/*` — paylaşılan veri kaynakları (FAQ vb.)
- [x] `src/lib/seo.js` — `useSeo({title, description, path, image, jsonLd, ...})` hook + JSON-LD helper'ları (`orgSchema`, `websiteSchema`, `softwareApplicationSchema`, `breadcrumbSchema`, `faqSchema`, `articleSchema`, `productSchema`)
- [x] `src/components/ui/Section.jsx` — id zorunlu wrapper, aria-labelledby otomatik
- [x] `.env` `VITE_PUBLIC_BASE_URL` — canonical/OG absolute URL için (subdomain'e taşınırken tek satır değişir)
- [x] Dashboard/panel rotaları **dokunulmadı** (subdomain-ready izolasyon)

---

## FAZ 1 — Kurumsal Ana Sayfa

- [x] **1.1** Ana sayfa (`src/site/pages/Home.jsx`) — 10 semantic section, tek H1
- [x] **1.2** Sticky responsive header + mobil drawer (`SiteHeader.jsx`) — 7 menü öğesi + Giriş + Ücretsiz Başla
- [x] **1.3** Hero (mevcut korunuyor) — CTA odaklı, iki buton, telefon çerçeveli demo profil
- [x] **1.4** İstatistik bölümü (`StatsSection`) — 4 tanıtım rakamı
- [x] **1.5** Neden BeyLink (`WhyBeylinkSection`) — 6 kart, her biri ayrı `FeatureCard` component
- [x] **1.6** Nasıl Çalışır (`HowItWorksSection`) — 4 adım (Kayıt Ol → Profilini Oluştur → Linklerini Ekle → Paylaş)
- [x] **1.7** Detaylı Özellikler (`FeaturesSection`) — 8 kart
- [x] **1.8** Şablonlar vitrini (`TemplatesSection`) — mevcut kataloktan 6 örnek + `/sablonlar` link
- [x] **1.9** Paketler (`PricingSection`) — 4 kart (Free/Basic/Pro/Pro Plus), Pro popüler vurgu, Pro Plus koyu flagship
- [x] **1.10** Referanslar (`TestimonialsSection`) — 3 kart, 5 yıldız
- [x] **1.11** SSS (`FaqSection`) — ana sayfada ilk 8 soru + FAQPage JSON-LD; tam liste `/sss` sayfasında (22 soru)
- [x] **1.12** Son CTA (`FinalCtaSection`) — brand-gradient hero, Ücretsiz Başla + Paketleri İncele

---

## FAZ 2 — Blog Sistemi

- [x] Blog altyapısı (`src/site/blog/*` — liste + detay + veri)
- [x] Kategori/tag/reading time/breadcrumb/related posts/TOC + share buttons (Twitter/WhatsApp/LinkedIn/Copy)
- [x] Article/BlogPosting + BreadcrumbList + FAQPage JSON-LD (her makalede)
- [x] **13 SEO makale** (hedef 10 idi; +3 bonus): Link in Bio Nedir? · Instagram Bio · TikTok Link · YouTube Creator · Kişisel Marka · Influencer Link · QR Rehberi · Dijital Kartvizit · Kısa Link · Landing Page · Müşteri Yorumları · Analitik Metrikleri · Alt Hesap Yönetimi
- [x] 6 kategori: Temeller · Sosyal Medya · Yaratıcılar · Markalaşma · Araçlar · Optimizasyon
- [x] Auto-generated TOC (post-body h2'lerinden), sticky sol sütun
- [x] `PostBody.jsx` — tutarlı H2/H3/P/UL/OL/A/Quote/Callout/InlineCta bileşenleri (kod tekrarı sıfır)
- [x] Backend `seoRoutes.js` — sitemap.xml + feed.xml artık 13 blog makalesini içeriyor

---

## FAZ 3 — SEO Mimarisi (Faz 1/2/6 içine gömülü)

- [x] Meta: title/description/keywords/canonical/robots/OG/Twitter — `useSeo` hook (her sayfa çağırır)
- [x] Structured Data (JSON-LD): Organization, WebSite, SoftwareApplication, FAQPage — helper'lar hazır (Article, Breadcrumb, Product ileride)
- [x] Semantic HTML: `<header>/<main>/<nav>/<section>/<article>/<footer>` — SiteLayout + Section component
- [x] Section kuralı: her içerik `<section id="...">` içinde (kod düzeyinde zorunlu)
- [x] Heading kuralı: tek H1 (Hero), mantıklı H2 (her section), H3 (kartlar) — DOM ile doğrulandı
- [x] A11y: skip-link, aria-label/labelledby, focus states, keyboard navigation, alt text
- [x] Blog sayfalarında Article/BlogPosting JSON-LD — `BlogPost.jsx`'te her makalede BlogPosting + BreadcrumbList + FAQPage (faq varsa)

---

## FAZ 4 — Teknik SEO

- [x] `/robots.txt` — backend `seoRoutes.js` üretir; genel `*` + GPTBot kuralları, izin/yasak rotalar, sitemap referansı
- [x] `/sitemap.xml` — dinamik: **12 statik marketing rotası (blog dahil) + 13 blog makalesi + tüm yayınlı public profil** (`profileModel.listPublishedForSitemap`, sub askı filtresi). Tümü **`SITEMAP_BASE_URL=https://beylink.org`** (dev URL sızmaz — canonical/duplicate karışmaz)
- [x] Canonical URL — `useSeo` otomatik (tüm marketing sayfalarında ✓)
- [x] Open Graph — `useSeo` otomatik (tüm marketing sayfalarında ✓)
- [x] Twitter Card — `useSeo` otomatik (tüm marketing sayfalarında ✓)
- [x] Breadcrumb — statik sayfalar (PageHero + Breadcrumb component + BreadcrumbList JSON-LD)
- [x] Blog kategori filtresi (`/blog` — Tümü + 6 kategori). Pagination henüz eklenmedi (13 makale için gerekmez).
- [x] `/feed.xml` RSS 2.0 — Atom self-link + tr-TR lang + **13 blog `<item>`** (title/link/guid/pubDate)
- [x] Feed discovery `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` — index.html
- [x] `/site.webmanifest` — PWA meta (name, short_name, theme_color, icons any/maskable, categories)
- [x] Favicon set + apple-touch-icon + **mask-icon** (Safari pinned tab) + **msapplication-TileColor**
- [x] `<meta name="theme-color">` light+dark çifti + `color-scheme`

**Nginx & Vite proxy:** `/robots.txt`, `/sitemap.xml`, `/feed.xml` prod nginx + dev Vite proxy'sinden backend'e yönlendirildi.

---

## FAZ 5 — Google PageSpeed & Core Web Vitals

- [x] Font `display=swap` — `index.html` Google Fonts URL'de mevcut; `preconnect` (googleapis + gstatic) + `dns-prefetch` (fallback) + **`preload as="style"`** (CSS erken keşfedilir, JS'i beklemez) + `media="print" onload="this.media='all'"` (render-blocking'i azaltır) + `<noscript>` fallback. Bonus: `/logo-mark.svg` preload (header'da anında görünür).
- [x] Image lazy + CLS koruması:
  - `ProfileView` avatar: `fetchpriority="high" loading="eager" decoding="async"` + explicit `width={80} height={80}` (above-the-fold LCP adayı)
  - `GalleryBlock`: `loading="lazy" decoding="async"` (below-the-fold, aspect-square CLS'i sıfırlıyor)
  - Marketing sayfalarında zaten gerçek `<img>` yok (hep Lucide ikon + CSS gradient) → LCP mükemmel, CLS ~0
- [x] **React.lazy code-splitting** — TÜM sayfa komponentleri (marketing + auth + dashboard + public profil) lazy chunk. Ana bundle 939→269 kB (gzip 261→84 kB, **%68 azalma**).
- [ ] LCP/CLS/INP/FCP/TTFB ölçümü — kullanıcının prod deploy sonrası Chrome DevTools Lighthouse ile alması gerekli. Local için: `npm run build && npx serve dist` + Lighthouse tab. *(2026-07-11 denetimi: prod deploy hâlâ yapılmadı → BİLİNÇLİ açık, unutulma değil.)*

**Bundle raporu (production build):**
| Chunk | Boyut | Gzip | Amaç |
|---|---|---|---|
| ana `index-*.js` | 269 kB | 84 kB | React + Router + AuthContext + Home + SiteLayout |
| `AnalyticsPage` | 420 kB | 114 kB | recharts (yalnız dashboard) |
| `LinksPage` | 62 kB | 20 kB | dashboard |
| `DesignPage` | 45 kB | 12 kB | dashboard |
| `AdminDashboard` | 33 kB | 9 kB | admin-only |
| `BlogPost` | 5 kB | 2 kB | tek makale |
| `BlogIndex` | 2 kB | 1 kB | blog liste |
| Statik sayfalar (Faq/Pricing/…) | 2-6 kB | 1-3 kB | her biri ayrı chunk |

---

## FAZ 6 — Kullanıcı Yolculuğu (statik sayfalar)

- [x] `/ozellikler` — Kategorize özellik listesi (4 grup, 16 kart, FinalCTA)
- [x] `/fiyatlandirma` — PricingSection reuse + 12 satırlık karşılaştırma tablosu + FaqSection reuse + Product/Offer JSON-LD (her plan)
- [x] `/sablonlar` — Tam katalog: 8 free tema + 10 profesyonel tema + 10 komple şablon
- [x] `/yardim` — Yardım Merkezi (canlı arama + 6 konu kartı + SSS'ye bağlantı)
- [x] `/sss` — Tam SSS (22 soru + FAQPage JSON-LD tam liste)
- [x] `/hakkimizda` — Şirket hikayesi + 4 değer + timeline + Organization JSON-LD
- [x] `/iletisim` — İletişim kartları + form + ContactPage JSON-LD (ContactPoint)

- [x] `/kullanim-sartlari` — 11 bölümlü Kullanım Şartları + İçindekiler
- [x] `/cerez-politikasi` — 6 bölümlü Çerez Politikası + kullanılan/kullanılmayan çerez listesi

**Ortak altyapı** (kod tekrarı sıfır):
- `PageHero.jsx` — statik sayfaların ortak üst banner'ı (h1 + breadcrumb + description)
- `Breadcrumb.jsx` — görsel + BreadcrumbList JSON-LD
- `LegalPage.jsx` — yasal sayfa kabuğu (İçindekiler otomatik + section akışı + son güncelleme)

---

## FAZ 7 — Footer

- [x] 4 kolonlu profesyonel footer (Ürün/Şirket/Destek/Yasal)
- [x] Newsletter aboneliği (form)
- [x] Sosyal medya ikonları
- [x] Copyright + yasal linkler
- [ ] Newsletter backend entegrasyonu (Resend/mailer) — form UI hazır (`e.preventDefault()` ile şu an dummy), endpoint eklenince aktifleşir. *(2026-07-11 denetimi: doğrulandı — `SiteFooter.jsx:56` hâlâ dummy, backend'de newsletter endpoint'i YOK → hâlâ açık iş; Resend mailer altyapısı hazır olduğundan endpoint eklemek küçük iş.)*

---

## FAZ 8 — Internal Linking

- [x] Ana sayfa → Şablonlar / SSS / Fiyatlandırma / Kayıt (Hero + section CTA'ları + FinalCTA)
- [x] Footer üzerinden 4 kolonlu iç yönlendirme
- [x] Blog içerikleri arası related posts + kategori/tag — `relatedPosts()` (kategori ×10 + ortak tag ×3 skoruyla) + kategori filtresi (`/blog?cat=…`)
- [x] Statik sayfalar arası içerik-temelli çapraz linkler — makalelerde `<A>` iç bağlantılar (Fiyatlandırma/Register/Şablonlar/diğer makalelere), Yardım → SSS/İletişim, Şablonlar → Fiyatlandırma, Fiyatlandırma → SSS reuse

---

## FAZ 9 — Subdomain-Ready Mimari

- [x] Marketing site `src/site/*` altında izole (dashboard/panel dokunulmadı)
- [x] `.env` `VITE_PUBLIC_BASE_URL` — canonical/OG URL'leri buradan türer
- [x] Auth rotaları (`/login`, `/register`, …) `SiteLayout` dışı → subdomain'e alınacak grup net
- [x] Public profil `/:username` ana domainde kalıyor
- [x] `.env.example`'a `VITE_PUBLIC_BASE_URL` + `VITE_SITE_NAME` + `VITE_PORT` + `VITE_API_TARGET` eklendi (yeni `frontend/.env.example`)
- [x] **Backend `SITEMAP_BASE_URL`** — sitemap/robots/feed dev URL'lerinden ayrıştırıldı; `.env.example` + `docker-compose.yml`'e eklendi

---

## Definition of Done (Son Kontrol Listesi)

### Frontend
- [x] Kurumsal ana sayfa tamamlandı (10 section)
- [x] Responsive header ve footer tamamlandı
- [x] Tüm CTA'lar çalışıyor (Register, Login, Fiyatlandırma, SSS'e yönlendirmeler)
- [x] Kullanıcı satın alma akışı marketing sitesinden başlayıp panele bağlanır (Fiyatlandırma → Register → PlansPage)

### Blog
- [x] Blog altyapısı kuruldu (`src/site/blog/*`)
- [x] 13 SEO makale eklendi (hedef 10 idi)
- [x] Breadcrumb, TOC, Related Posts + share buttons aktif

### SEO
- [x] Her sayfada benzersiz meta etiketleri (`useSeo` hook zorunlu kılıyor)
- [x] JSON-LD yapılandırılmış veri: Organization + WebSite + SoftwareApplication + FAQPage + Article/BlogPosting + BreadcrumbList + Product/Offer + ContactPage
- [x] Semantic HTML eksiksiz
- [x] Tüm içerikler anlamlı `<section id="">` yapısında (Section component zorunlu tutuyor)
- [x] Dahili bağlantı stratejisi uygulandı (header, footer, section CTA'ları)
- [x] Canonical URL'ler tanımlı

### Teknik SEO
- [x] robots.txt
- [x] sitemap.xml (dinamik, 32+ URL, SITEMAP_BASE_URL ile beylink.org)
- [x] RSS Feed (13 blog item)
- [x] Web Manifest (PWA meta)
- [x] Open Graph + Twitter Card

### Performans
- [ ] Google PageSpeed yüksek puan — prod deploy sonrası Lighthouse ile ölçülecek. *(2026-07-11 denetimi: prod deploy hâlâ yapılmadı → BİLİNÇLİ açık.)*
- [x] Core Web Vitals optimize (font swap zaten aktif, img `<img>` yerine CSS/Lucide/svg → CLS ≈ 0; ProfileView avatar için fetchpriority=high + explicit width/height)
- [x] Font/JS yükleme optimize (font swap + preconnect + tüm sayfalar lazy chunk)

### Mimari
- [x] Route yapısı `app.beylink.org` ayrımına hazır
- [x] Component mimarisi korunuyor (site/sections, site/pages, site/data, ui/Section)
- [x] SEO-bakım-ölçeklenebilirlik açısından temiz yapı
