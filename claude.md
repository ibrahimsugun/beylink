# claude.md — BeyLink (Link-in-Bio Platformu)

> Projenin tek referans kaynağı. Mimari, şema, kararlar ve yol haritası buradan takip edilir.
> Derin anlatımlar koda + `.claude/skills/`'e taşınmıştır; burası **envanter + değişmezler** tutar.
>Kullanıcının karar vermesi gereken bir durum yoksa YALNIZCA şu formatta yanıt verin: Bitti. [tek cümle özet] Değiştirildi: [DosyaAdı] - Satırlar [X-Y]
## 1. Proje Özeti

**BeyLink**, Linktree/Heylink'ten ilhamla tek sunucuda çalışan bir "link-in-bio" platformudur.

**Akış:** kullanıcı e-posta+şifre ile kayıt olur → `beylink.com/kullaniciadi` public profili oluşturur → sosyal linkler + blok butonlar ekler → her tıklama/görüntülenme analitik olarak kaydedilir → Analytics panelinden izler.

**Alt hesap (sub):** owner alt hesaplar açar (kullanıcı adı+şifre atar), profillerini yönetir. Sub yalnız kullanıcı adı+şifre ile girer, sadece kendi profilini görür. Yetki: `owner` → kendi + alt hesaplar; `sub` → yalnız kendisi.

## 2. Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Backend | Node.js + **Express**, **better-sqlite3** (WAL, FK on) |
| Auth | **bcryptjs** + **JWT** (Bearer) + saf-Node **TOTP** 2FA |
| Frontend | **React (Vite)** + **Tailwind** + **Lucide** |
| Yükleme | **multer** (avatar/kapak → `/uploads`) · QR: `qrcode` |
| Ödeme | **USDT TRC-20** self-custody (TronGrid REST, raw fetch — ekstra npm yok) |
| E-posta | **Resend** (HTTP API, raw fetch — ekstra npm yok) |
| GeoIP | **geoip-lite** (bundled MaxMind, offline) |
| Prod | Multi-stage **Dockerfile** + **Nginx** + **docker-compose** |

Felsefe: **sıfır gereksiz bağımlılık** — TronGrid, Resend, TOTP, HTML sanitize hep saf Node/fetch ile yazıldı.

## 3. Veritabanı Şeması

`foreign_keys = ON`, WAL. Zaman alanları `TEXT` (`datetime('now')`, UTC). Migrasyon idempotent (`ensureColumn`).

- **`users`** — `id` · `email` UNIQUE NULL (CI) · `username` UNIQUE NULL (sub login) · `password_hash` · `role` `'owner'|'sub'` · `plan` `'free'|'basic'|'pro'|'proplus'` · `parent_user_id` · `credits_micro` (USDT×1e6) · `plan_expires_at` · `deferred_plan`/`deferred_expires_at` (yükseltmede saklanan alt plan) · `extra_subaccount_packs` (eski +5 sayacı, geriye-uyum) · `is_active` · `is_suspended` (premium bitince sub askı — `is_active`'ten ayrı) · `can_edit_profile` · `is_admin` · `totp_secret`/`totp_enabled` (secret ASLA `PUBLIC_COLS`'ta değil) · `email_verified` · `token_version` (şifre değişince artar → eski JWT geçersiz) · timestamps
- **`profiles`** — `id` · `user_id` · `username` UNIQUE (public slug, **kayıttan sonra kilitli**) · `display_name` · `bio` · `bio_html` (Pro rich text, sanitize) · `avatar_url` · `cover_url` · `theme_settings_json` · `meta_title`/`meta_description` · `seo_settings_json` (og/keywords/canonical/robots/twitter/FB Pixel) · `is_published` · timestamps
- **`links`** (blok) — `id` · `profile_id` · `type` `'link'|'social'|'divider'|'contact'|'gallery'` · `title` · `url` · `icon_name` · `config_json` · `sort_order` · `is_active` · `btag` (linke gömülü, two-hop) · timestamps
- **`analytics`** — `id` · `profile_id` · `link_id` NULL · `event_type` `'click'|'view'` · `click_time` · `device`/`browser`/`os` (UA'dan) · `country` (geoip) · `referrer` · `user_agent` · `btag` (atıf kaynağı) · `visitor` (birinci-taraf tekil kimlik)
- **`btags`** — `id` · `profile_id` (CASCADE) · `value` · `label` · `is_active` · `UNIQUE(profile_id, value)`
- **`payments`** — `id` · `user_id` · `order_ref` UNIQUE (`BL-YYYYMMDD-XXXXXX`) · `intent_kind` `'topup'|'plan'|'subpack'` · `intent_target` · `address` · `expected_amount_micro` (benzersiz-tutar tuzlu) · `received_amount_micro` · `txid` UNIQUE (idempotency) · `status` `'pending'|'paid'|'expired'` · `intent_applied` · `expires_at` · `paid_at`
- **`balance_txns`** (ledger) — `id` · `user_id` · `amount_micro` (imzalı) · `reason` · `ref` · `balance_after_micro` · `created_at`
- **`subaccount_packs`** — `id` · `user_id` · `pack_key` · `rights` · `price_micro` · `quantity` (tekrar alımda artar) · `UNIQUE(user_id, pack_key)`
- **`design_templates`** ("Şablonlarım") — `id` · `user_id` · `name` · `theme_json` · `created_at`
- **`auth_tokens`** — `id` · `user_id` (CASCADE) · `kind` `'password_reset'|'email_verify'` · `token_hash` (ham token DB'de YOK — sha256) · `code_hash` (6 haneli kod, peppered sha256) · `expires_at` · `used_at` (tek kullanımlık)
- **`activity_logs`** — `id` · `user_id` SET NULL (NULL=sistem) · `action` · `detail` (JSON) · `ip` · `created_at`
- **`test_runs`** — in-house test runner geçmişi (id, test_id, status, ok, summary, details_json, timestamps)

## 4. Özellik Envanteri (Tamamlanan)

**Kimlik & Güvenlik**
- Kayıt/giriş (owner: e-posta veya profil-slug; sub: username), JWT + `token_version` oturum geçersizleştirme, yetki middleware (`requireAuth/Owner/Admin`, `guardSuspended`, `requireVerifiedEmail`, `requirePlanCap`).
- **TOTP 2FA** (saf Node, `utils/totp.js`): setup/enable/disable + login challenge akışı (challenge token ≠ oturum tokenı).
- Şifre sıfırlama + e-posta doğrulama (hibrit: 15 dk link **ve** 6 haneli kod, tek satır, tek kullanımlık, hash'li).
- **Brute-force/rate-limit** (`utils/rateLimit.js`, IP veya user-başı): login, 2FA verify/enable/disable, change-password, forgot-password, verify-email-code, register (enumeration). Başarıda sayaç sıfırlanır.
- **JWT_SECRET fail-fast:** üretimde zayıf/varsayılan/<32 kar. secret ile açılış reddedilir (`config/env.js`).

**Profil, Blok & Tasarım**
- profiles CRUD, blok tabanlı links (link/social/divider/**contact** vCard/**gallery**), avatar+kapak, 3-panel dashboard + canlı önizleme.
- Tasarım: header tipi, hizalama, 1/2 sütun, buton şekli (ücretsiz), **8 serbest tema** + **preset temalar/şablonlar** (Basic+), **Şablonlarım** (kaydet/uygula/export-import kodu `BLT1.…`, alt hesaba tekil/toplu — toplu Pro Plus).
- **Hazır Sayfalar** (10 içerik şablonu, önceden dolu — herkese açık), **Rich Text bio** (Pro), URL güvenliği (`toSafeLinkTarget`: http/https/mailto/tel; javascript/data reddi).

**Public Sayfa & SEO**
- Semantik/erişilebilir public render (`main/header/nav/section/footer`, aria), gelişmiş SEO + **FB Pixel** (Basic+).
- Crawler için **sunucu SSR/OG** (`/api/prerender/:username`, nginx bot-UA yönlendirme) + **JSON-LD** (ProfilePage→Person, sameAs). Head istemcide imperatif `useHeadMeta` (react-helmet-async kaldırıldı). QR.

**Analitik**
- Kaynakta **dedup/anti-fraud** (`recordDedup`): view `(profil,visitor,gün)`, click `(profil,visitor,link,btag,gün)` → aynı gün tekrar şişirmez, farklı gün ayrı.
- `visitor` DAİMA çözülür (istemci id'si ya da IP-hash yedeği; ham IP saklanmaz). Tekil ziyaretçi = `COUNT(DISTINCT visitor)`.
- Kırılımlar (cihaz/tarayıcı/OS/ülke/referrer, Basic+), zaman aralıkları + saatlik granülerlik, **CSV** (Pro), **GeoIP** ülke (`geoip-lite`, offline). BTAG istatistiği tekil-ziyaretçi bazlı.

**Plan, Cüzdan & Ödeme**
- 4 plan (`config/plans.js`, tek gerçek kaynak): free/basic($5)/pro($10)/**proplus($40)**, gerçek feature-gating (`assertPlanCap`). Aylık (`plan_expires_at`, lazy düşürme).
- **Upgrade-only stacking:** düşürme yasak; yükseltmede alt plan `deferred` saklanır, üst plan bitince otomatik devam. Uzatma +30 gün.
- **Cüzdan/ledger:** `credits_micro` + `balance_txns`, tüm mutasyonlar `walletModel.apply` (atomik + negatif guard).
- **USDT TRC-20 self-custody** (`services/payments.js`): TronGrid REST, kontrat whitelist, benzersiz-tutar tuzu ile eşleşme, `txid` UNIQUE + `markPaid` CAS idempotency, poller **boşta gate'li** (aktif fatura yoksa TronGrid'e gitmez → API kotası korunur). Demo mod admin-only.
- **Alt hesap paketleri** (hesaba kalıcı, plana bağlı, tavana kadar tekrar alınabilir): free 0 · basic 1 · pro 10 · proplus 40.

**Alt Hesap & Yaşam Döngüsü**
- Owner alt hesap oluşturur/yönetir (aktif-pasif, düzenleme izni, şifre). Sub = Basic plan, SEO salt-okunur.
- **Premium yaşam döngüsü:** premium bitince alt hesaplar `is_suspended=1` (silinmez; giriş var, mutasyon yok); premium yenilenince owner onayıyla toplu reaktivasyon.

**Admin & Denetim**
- Admin dashboard (`is_admin` + `ADMIN_EMAILS` allowlist, CI e-posta): stats, kullanıcı arama, plan düzenle, **kredi düzenle** (atomik ledger), aktivite/kredi log sekmeleri.
- **Log sözleşmesi:** `activityLog.js` `CREDIT_ACTIONS` ⟂ `ACTIVITY_ACTIONS` (kesişim boş — test guard).
- **In-house test paneli** (`services/testRunner.js`, seri kuyruk): **206 test / 20 kategori**, admin panelden veya `POST /admin/tests/run-all` ile. NOT: tam paket server ile AYNI process'te koşulmalı (harici runner'da `__beylinkTestRunning` bayrağı + rate-limit sayaçları yanlış-kırmızı üretir). **i18n kategorisi** (`tests/i18n.tests.js`, 5 test): frontend locale paritesi/placeholder/em-dash+Türkiye guard/çoğul-CLDR/görünür-dil-kümesi denetimi — `frontend/scripts/i18n-check.mjs`'in bağımsız arka-uç ikizi; frontend kaynağı yoksa (prod api konteyneri) not düşüp geçer.

**Özel Alan Adı (branded domain — Pro Plus)**
- `custom_domains` CRUD (A6: hesap başına 1) + panel DNS talimatları + `dns.resolve` doğrulama (`services/domainVerify.js`) + Caddy on-demand TLS `ask` kapısı (`tls-check`, fail-closed 200/403) + Host-farkında yönlendirme (`middleware/resolveHost.js`; cross-owner 404).
- **Tip-farkında (apex/subdomain):** `kind` sütunu, panelde toggle (etiket-sayısı sezgili); apex → A(@)+CNAME(www)+TXT, subdomain → CNAME(FQDN)+TXT (A yok); www daima apex-kanonik. Cloudflare/proxy "gri bulut" uyarısı DNS kartında, 9 dilde ("Özel Alan Adı" kategorisi: 30 test).

**E-posta (Resend)**
- `services/mailer.js` — Resend HTTP API (fetch), fallback SMTP/demo. `sendMailSafe` akışı asla bozmaz.
- **6 şablon** (`utils/emailTemplates.js`, esnek `shell` + inline stil, spam-dirençli): doğrulama · şifre sıfırlama · hoş geldin · ödeme tamamlandı · ödeme tamamlanamadı · satın alım tamamlandı.
- Test paketi çalışırken mailer server-side bayrakla demo'ya düşer (gerçek gönderim yok).

## 5. Önemli Kararlar & Değişmezler (korunmalı)

**Güvenlik**
- `totp_secret` ASLA `PUBLIC_COLS`'ta değil (yalnız `*WithHash`). JWT'ye `role`/`is_admin` gömülmez (her istekte taze).
- `token_version`: şifre değişince eski JWT'ler geçersiz. JWT_SECRET prod'da güçlü zorunlu (fail-fast).
- `requireAdmin` iki kaynak (DB + allowlist), e-posta **case-insensitive** (kayıt normalize → uppercase taklidi engellenir).
- HTML: `sanitizeHtml.js` allowlist **re-serializer** (attribute geçirmez). Upload: **SVG yasak** + `nosniff`+CSP. Link: `toSafeLinkTarget`.
- Rate-limit anahtarları başarıda sıfırlanır; register yalnız çakışma (enumeration) yolunda sayar.

**Para (asla çift-kredi / para-kaybı olmamalı)**
- `walletModel.apply` tek transaction + negatif guard. `markPaid` CAS + `txid` UNIQUE → idempotency.
- Benzersiz-tutar tuzu → gelen transfer tek faturaya eşleşir. Ödeme öncesi upgrade/cap kontrolü (USDT'de "öde ama uygulanamaz" yok).
- `applyIntent` KALICI hata (403/400) → `intent_applied=1` ile retry durur (para-hapsi + sonsuz retry yok).

**Analitik**
- Public GET **idempotent** (görüntülenme kaydetmez; istemci tek `POST /track` beacon). `visitor` daima çözülür.

**Gating**
- Tek kaynak `config/plans.js` + `assertPlanCap`. Tema kapısı `themeGate.js` (serbest allowlist DIŞI + değişiyorsa cap; **fail-closed**).

**E-posta**
- Resend'de **kendi domain doğrulanmadan** gerçek gönderim yok (Gmail ile gönderilmez). `exposeDemoToken` prod'da token sızdırmaz.

**Dokunulmazlar**
- `username` public slug kayıttan sonra değiştirilemez. Gerçek veri (MASSSKAA/DEMO) test ve migrasyonlarda korunur.

## 6. Gelecek İşler (Yol Haritası)

**Öncelik — E-posta canlıya alma**
- Kendi domain al + Resend'de doğrula (SPF/DKIM/DMARC) → `.env` `MAIL_FROM`'u domain'e çevir (kod değişmez).

**Özellik**
- Yeni bloklar: Menü / Kripto / Konumlar. · Rich text'e AI açıklama üretimi.
- Kartvizitler · Mesajlar · Mağaza. (Özel domain TAMAMLANDI → §4.)

**Ödeme/Altyapı**
- Gerçek ödeme sağlayıcı alternatifi (Stripe/iyzico) — opsiyonel.
- Demo ödeme yolunu üretimde tamamen kaldır (şu an admin-only). · SMTP dalını doldur (Resend dışı alternatif).
- Frontend bundle **code-splitting**. · In-house test runner'ı CI/cron'a bağla.

## 7. Klasör Yapısı

```
beylink/
├── claude.md · README.md · docker-compose.yml · .env.example · .claude/skills/
├── backend/   → Express + better-sqlite3 (src: db, config, middleware, routes, controllers, models, services, utils, tests)
└── frontend/  → Vite + React + Tailwind (src: api, context, components, pages, lib, styles)
```

## 8. Docker & Nginx (Prod)

- **api**: node:20-alpine multi-stage, better-sqlite3 native build; volume: data + uploads; host'a kapalı (yalnız web üzerinden).
- **web**: vite build → nginx serve, SPA fallback; bot-UA → `/api/prerender`, insanlar → SPA.
- **nginx**: `/api/` → `api:4000`; `app.set('trust proxy', 1)` → gerçek istemci IP (rate-limit + geoip için).

## 9. Marka Kimliği

- **Palet:** Teal `#12C4B0` → Menekşe `#6D3BEA` gradient + Navy `#1B2340`; surface `#F6F8FB`.
- **Tipografi:** Sora (başlık) · Plus Jakarta Sans (gövde) · JetBrains Mono (sayısal). `tailwind.config.js` → `theme.extend`.

## 10. Arayüz

- Onboarding basit (kayıt → dashboard). Dashboard 3 panel (Sidebar + Editor + canlı LivePreview telefon çerçevesi).
- Sidebar bölümleri plan/rol'e göre kilitli (cap gating). Admin yalnız `is_admin`'e görünür.

## 11. Çalıştırma

```bash
# Backend  (dev varsayılan .env: PORT=4501 — sibling proje/kopya çakışmasını önlemek için)
cd backend && npm install && npm run migrate && npm run seed && npm run dev
# Frontend (Vite dev: :5501)
cd frontend && npm install && npm run dev
```

> Portlar (`4501` backend / `5501` frontend / `127.0.0.1:8501` docker `web`) workspace'teki komşu
> projeyle (NoLnk: 4900/5973; eski beylink kopyaları: 4001/5180) çakışmayı önlemek için vanilla
> varsayılanlardan (`4000`/`5173`/`8080`) kaydırıldı. Bkz. `README.md`.

Testler: admin panel → **Testler** sekmesi, ya da `POST /api/admin/tests/run-all` (admin token). Derin anlatımlar: `.claude/skills/` (usdt-trc20-payments, link-redirect-tracking, credit-wallet-billing, analytics-panel, onchain-transfer-tracking).
