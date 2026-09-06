# BeyLink — Production Handoff

> Komşu proje **NoLnk** ile aynı workspace/VPS'te, **tek paylaşımlı Caddy** arkasında yaşar.
> İkiz doküman: `../nolnk/PRODUCTION-HANDOFF.md` · Ortak resim: `../WORKSPACE-OVERVIEW.md` ·
> Çakışma kaydı: `../CONFLICTS.md` · Derin referans: repo kökü `claude.md` (envanter +
> değişmezler, tek gerçek kaynak) + `.claude/skills/` (5 derin anlatım) + `_*-progress.md`.
> Bu sürüm 2026-07-13 denetiminde koddan doğrulanarak yeniden yazıldı. **Kullanıcı ile dil: Türkçe.**

## 1. Proje Kimliği

- **Ad:** BeyLink.
- **Amaç (tek cümle):** Linktree/Heylink tarzı, tek sunucuda çalışan **link-in-bio** platformu —
  `beylink.org/kullaniciadi` public profil, blok tabanlı linkler, alt hesap (owner/sub) modeli,
  tıklama/görüntülenme analitiği, 4 plan, USDT (TRC-20) kredi cüzdanı, Pro Plus'ta özel alan adı.
- **Prod domain:** **`beylink.org`** (+ `www` → apex 301). Müşteri CNAME hedefi: **`cname.beylink.org`**.
- **Repo:** git YOK (bilinçli) — zip yedek düzeni (`beylink-backups/` + `~/Desktop/beylink-backups/`).
- **Sorumlu:** workspace sahibi (tek geliştirici).

## 2. Teknoloji Yığını

| Katman | Teknoloji (sürümler `backend/package.json` + `frontend/package.json`) |
|---|---|
| Backend | Node 20 (imaj `node:20-alpine`; lokal dev Node 24 ile de çalışıyor) + Express ^4.19.2, **ESM** |
| DB | SQLite — `better-sqlite3` ^11.3.0 (WAL, FK ON) |
| Kimlik | `jsonwebtoken` ^9 (Bearer; cookie YOK) + `bcryptjs` + token_version geçersizleştirme + saf-Node TOTP |
| Yükleme | `multer` ^1.4.5 (avatar/kapak → `/uploads`) · QR: `qrcode` ^1.5 |
| Analitik | kaynakta dedup/anti-fraud; `geoip-lite` ^2 (offline); ham IP saklanmaz |
| E-posta | Resend (HTTP API, raw fetch) → `MAIL_ENABLED` ile SMTP iskeleti → demo (öncelik sırası `src/config/env.js`) |
| Ödeme | USDT TRC-20 self-custody — TronGrid REST (raw fetch), private key YOK |
| Frontend | React 18 + Vite 5 **SPA** + Tailwind 3 + Lucide + Recharts + dnd-kit; bot-UA'ya **sunucu prerender** (`/api/prerender`, nginx yönlendirir) |
| i18n | 9 dil tam (tr en ru es de fr pt it ja), 1630 kanonik anahtar, `npm run i18n:check` guard'ları |
| Prod | Multi-stage Dockerfile ×2 + Nginx (web konteyneri içinde) + compose + **paylaşımlı Caddy** (`../caddy/`) |

**Felsefe:** sıfır gereksiz bağımlılık — TronGrid/Resend/TOTP/sanitize/rate-limit saf Node/fetch.

## 3. Klasör Yapısı

```
beylink/
├── claude.md                  ← envanter + değişmezler (TEK GERÇEK KAYNAK — önce oku)
├── PRODUCTION-HANDOFF.md      ← bu dosya
├── README.md · start.sh       ← yerel hızlı başlangıç (⚠ içlerindeki eski port yorumları için §13)
├── package.json               ← kök orkestratör (concurrently): dev/install:all/setup/migrate/seed/build
├── docker-compose.yml         ← prod: api + web; İKİSİ de `edge` üyesi; host portu yalnız 127.0.0.1:8501
├── Caddyfile                  ← ESKİ import şablonu — artık ../caddy/Caddyfile geçerli (⚠ içindeki
│                                 interval/burst sözdizimi Caddy ≥2.7'de geçersiz; referans amaçlı)
├── .env.example               ← prod compose env şablonu
├── *-plan.md · _*-progress.md ← plan/karar arşivi · beylink-backups/ ← zip arşivleri
├── .claude/skills/            ← 5 derin anlatım (usdt-trc20-payments, link-redirect-tracking, …)
├── backend/
│   ├── Dockerfile · .env / .env.example (dev PORT=4501)
│   ├── data/beylink.sqlite    ← yerel canlı DB — GERÇEK HESAPLAR (§7 uyarısı!)
│   ├── uploads/               ← avatar/kapak hedefi (şu an boş; volume: beylink-uploads)
│   └── src/ (index.js [boot+migrate] · app.js [trust proxy=2, rotalar] · config/env.js [TÜM env TEK YERDE]
│             · db/ [connection·migrate·seed] · middleware/ [resolveHost·error] · models · controllers
│             · routes · services · utils [slug RESERVED · rateLimit] · tests/ [20 kategori + registry])
└── frontend/
    ├── Dockerfile (VITE build-arg'lı — §9) · nginx.conf (SPA + /api,/uploads,SEO + bot→prerender)
    ├── .env / .env.example (VITE_PORT=5501 · VITE_API_TARGET · VITE_PUBLIC_BASE_URL · VITE_SITE_NAME)
    └── src/ (api/client.js · context · components/* · pages · site/* · i18n · locales ×9)
```

## 4. Kurulum (sıfırdan lokal)

```bash
# Tek komut (ilk çalıştırmada migrate+seed dahil; eski süreçleri de temizler):
bash start.sh                        # backend 4501 + frontend 5501

# Ya da kök orkestratörle:
npm run setup                        # install:all + migrate + seed
npm run dev                          # concurrently: api(4501) + web(5501)
```

- Docker lokal test: `docker network create edge && docker compose up --build -d` →
  `http://127.0.0.1:8501` (loopback; dışa kapalı).

## 5. Ortam Değişkenleri (kök `.env.example` şablon; tümü `src/config/env.js`'te okunur; DEĞER YAZMA)

| İsim | Zorunlu | Ne işe yarar | Örnek format |
|---|---|---|---|
| `JWT_SECRET` | **Prod'da EVET** (zayıf/<32 kar → boot HATA) | oturum imzası — NoLnk'inkinden **FARKLI** | 96 hex karakter |
| `JWT_EXPIRES_IN` | hayır (vars. 7d) | token ömrü | `7d` |
| `NODE_ENV` | compose set eder | production kipi | `production` |
| `PORT` | hayır | dev 4501; compose 4000 set eder | `4501` |
| `DB_PATH` / `UPLOADS_DIR` | compose set eder | SQLite yolu / upload dizini | `/app/data/beylink.sqlite` / `/app/uploads` |
| `CLIENT_ORIGIN` | prod'da önerilir | CORS origin | `https://beylink.org` |
| `PUBLIC_BASE_URL` / `APP_URL` | prod'da evet | QR + e-posta linkleri tabanı | `https://beylink.org` |
| `SITEMAP_BASE_URL` | hayır (vars. beylink.org) | sitemap/robots/feed sabit canlı URL | `https://beylink.org` |
| `APP_HOSTNAMES` | hayır (vars. doğru) | resolveHost: listede OLMAYAN Host → müşteri özel domaini olarak aranır | `beylink.org,www.beylink.org,localhost,127.0.0.1` |
| `BRANDED_DOMAIN_SERVER_IP` | apex için | müşteri apex A-kaydı hedefi (boşsa A doğrulaması atlanır) | VPS statik IP |
| `BRANDED_DOMAIN_CNAME_TARGET` | hayır (vars. `cname.beylink.org`) | müşteri CNAME hedefi | `cname.beylink.org` |
| `ADMIN_EMAILS` | önerilir | admin allowlist (CI karşılaştırma) | `admin@ornek.com` |
| `RESEND_API_KEY` | e-posta için | Resend (domain doğrulanana dek yalnız `onboarding@resend.dev` → hesap e-postasına) | `re_…` |
| `MAIL_FROM` / `MAIL_REPLY_TO` | hayır | gönderen/yanıt adresi | `BeyLink <no-reply@beylink.org>` |
| `MAIL_ENABLED` + `SMTP_HOST/PORT/USER/PASS` | hayır | SMTP dalı (iskelet) | — |
| `TRC20_WALLET_ADDRESS` | **gerçek ödeme için EVET** (boşsa poller kapalı + fatura 503 → prod'da HİÇBİR plan satın alınamaz) | self-custody alıcı adres | `T…` |
| `TRC20_USDT_CONTRACT` / `TRONGRID_API_KEY` / `TRC20_MIN_CONFIRMATIONS` | öneri: doldur | kontrat whitelist / kota / reorg (~19) | — |
| `PAYMENT_TTL_MINUTES` / `PAYMENT_POLL_INTERVAL_SECONDS` / `PAYMENT_MIN_USD` / `PAYMENT_MAX_USD` | hayır | fatura ömrü / poll / sınırlar | `15`/`30`/`1`/`10000` |
| `DEMO_PAYMENTS` | prod'da `false` (vars. zaten false) | demo anında-kredi yolu | `false` |
| **Frontend (build-time):** `VITE_PORT` / `VITE_API_TARGET` / `VITE_PUBLIC_BASE_URL` / `VITE_SITE_NAME` | prod build'de compose `build.args` geçirir (§9) | dev portu / dev proxy hedefi / canonical-OG tabanı / site adı | `5501` / `http://localhost:4501` / `https://beylink.org` / `BeyLink` |

## 6. Portlar ve Servisler

| Bağlam | Backend (api) | Frontend (web) | Not |
|---|---|---|---|
| Native dev | **4501** | **5501** (Vite, strictPort) | NoLnk **4900/5973** ile bilinçli ayrık *(eski dokümanlardaki "NoLnk=4000/5173" bilgisi GÜNCEL DEĞİL)* |
| Docker (konteyner-içi) | **4000** | **80** (nginx) | compose `PORT: 4000` explicit |
| Docker (host) | — | **127.0.0.1:8501** | yalnız lokal test; dışa KAPALI (Caddy baypası + sahte XFF önlenir) |
| Prod dışa açık | — | — | tek giriş paylaşımlı Caddy 80/443 (`../caddy/`) |

Ağlar: compose `default` (iç) + **`edge`** (external, paylaşımlı) — api ve web İKİSİ de üye
(api: tls-check `ask` + `/__edge/health` için; web: site bloğu + catch-all fallback için).

## 7. Veritabanı

- **Motor:** SQLite (better-sqlite3, WAL, FK ON). **Dosya:** dev `backend/data/beylink.sqlite`;
  prod `beylink-data` volume → `/app/data/beylink.sqlite`.
- **⚠ GERÇEK VERİ DOKUNULMAZ:** yerel DB'de gerçek hesaplar var — **DEMO** (demo@beylink.com,
  pro) ve **MASSSKAA** (admin, proplus). Her operasyonda bakiye/plan/haklar birebir korunmalı.
  **Kopya durumu (2026-07-13 kapatıldı):** Desktop kopyasından koşan eski dev süreci durduruldu;
  DB'ler md5 ile birebir doğrulandı, `integrity_check=ok`, hesaplar yerinde — **canlı DB artık
  bu workspace'teki** (`backend/data/beylink.sqlite`). Desktop kopyaları arşivdir.
- **Tablolar:** users, profiles (slug kayıttan sonra KİLİTLİ), links, analytics, btags, payments
  (txid UNIQUE), balance_txns, subaccount_packs, design_templates, auth_tokens, activity_logs,
  test_runs, custom_domains (kolon detayı `claude.md` §3).
- **Migration:** boot'ta otomatik `migrate()` (`src/index.js`) + elle `npm run migrate`;
  **Seed:** `npm run seed` (opsiyonel). Testler `bltest_z_` prefix'li izole veri kullanır ve temizler.
  **⚠ Docker CMD migrate'i index.js'ten ÖNCE koşar** (`node src/db/migrate.js && node src/index.js`):
  bazı servisler (ör. `services/activityLog.js`) tabloya import ANINDA `db.prepare` yapar; ESM
  statik importları index.js gövdesindeki `migrate()`'den önce değerlendiğinden TAZE (boş) volume'da
  çökerdi. *(2026-07-13 gerçek Docker soğuk-başlatmasında bulundu+düzeltildi: `no such table:
  activity_logs` crash-loop; native dev'de DB zaten migrate'li olduğu için görünmüyordu.)*
- **Yedekleme:** dosya snapshot (volume) + `uploads/` aynı kararla taşınır (`beylink-uploads`).

## 8. Dış Bağımlılıklar (+ anahtar rotasyonu)

| Servis | Kullanım | Rotasyon / not |
|---|---|---|
| **TronGrid** | ödeme doğrulama (REST, read-only) | panelden yeni key → `.env` → restart |
| **Resend** | e-posta | hesap: `tik***@gmail.com`; `beylink.org`'u doğrula (SPF/DKIM/DMARC) → `MAIL_FROM` güncelle. Demo token prod'da ASLA yanıtta sızmaz (`exposeDemoToken` guard) |
| **Cloudflare** | ana domain önünde | IP listesi `../caddy/Caddyfile` `trusted_proxies`'te; CF listeyi değiştirirse orası güncellenir |
| **geoip-lite** | offline IP→konum | npm paketiyle gelir; ayrı `.mmdb` yok; güncelleme = paket güncelleme |
| **DeepL** | yalnız geliştirme-zamanı çeviri | runtime bağımlılığı YOK |

## 9. Build ve Deploy

- **Prod build:** compose halleder (api: `npm ci --omit=dev` + native derleme; web: `vite build` → nginx).
- **✅ VITE build-arg düzeltmesi UYGULANDI (2026-07-13):** `frontend/Dockerfile` `ARG/ENV
  VITE_PUBLIC_BASE_URL + VITE_SITE_NAME` + compose `web.build.args` (`PUBLIC_BASE_URL` .env
  değerinden beslenir, vars. `https://beylink.org`). Kanıt: env ile lokal build →
  `https://beylink.org` çıktıya gömüldü, `localhost:5501` çıktıda yok.
- **Deploy (paylaşımlı düzen, sıralı):**
  1. VPS'te bir kez: `docker network create edge`
  2. `.env` doldur (§5)
  3. Bu klasörden: `docker compose up --build -d`
  4. Paylaşımlı Caddy: `../caddy/` içinden `docker compose up -d`
  5. Duman testi: `https://beylink.org` + `/demo` profili + `curl -A Googlebot` prerender +
     admin panelden `POST /api/admin/tests/run-all` → 206/206
- **Rollback:** registry yok → son zip'e dön + `up --build -d`; DB/uploads volume'ları ayrı düşün.

## 10. Caddy / Reverse Proxy (paylaşımlı — tam dosya: `../caddy/Caddyfile`)

- **Bu projenin adlı bloğu:** `beylink.org, www.beylink.org` → `beylink-web:80` (www→apex 301,
  zstd+gzip, güvenlik başlıkları, ayrı `beylink-access.log`).
- **On-demand TLS:** Caddy-içi **ask zinciri**: önce NoLnk sorulur, 403 ise BeyLink
  `GET /api/domains/tls-check?domain=` (yalnız aktif + sahibinin brandedDomain cap'i → 200,
  aksi 403 — fail-closed + tlsLimiter). Sıra sonucu DEĞİŞTİRMEZ (iki allowlist'in OR'u).
  ⚠ Eski `interval/burst` sözdizimi Caddy ≥2.7'de kaldırıldı — yeni dosyada yok.
- **Özel-domain trafiği (catch-all):** istek önce NoLnk backend'ine gider; NoLnk'e ait değilse
  **421** ile buraya (`beylink-web:80`) düşer. `resolveHost` `www.` önekini uygulama katmanında
  kanonikleştirir; cross-owner slug → 404 değişmezi aynen geçerli.
- **Sağlık:** edge'de `handle /__edge/health` → doğrudan `beylink-api:4000/health`. Yol bilerek
  `/health` DEĞİL: `health` rezerve kullanıcı adı değildir (`src/utils/slug.js` RESERVED) —
  `/health` edge'de yakalansaydı o adı alan kullanıcının profili gölgelenirdi.
- **IP zinciri:** Caddy `header_up X-Forwarded-For {client_ip}` + CF `trusted_proxies` →
  `trust proxy = 2` (`src/app.js`) her yolda (CF'li ana domain / CF'siz müşteri domaini) doğru
  istemci IP'si verir. Zincire katman eklenirse (örn. ekstra proxy) bu sayı yeniden değerlendirilmeli.

## 11. Sağlık Kontrolü ve İzleme

- **Health:** `GET /health` (api kökü) → `{status:'ok',service:'beylink-api'}`. Nginx `/health`
  location'ı YOK → dışarıdan: **`https://beylink.org/__edge/health`** (Caddy doğrudan api'ye sorar);
  konteyner-içi: `http://beylink-api:4000/health`.
- **Loglar:** dosya logu yok — `docker logs beylink-api|beylink-web` + Caddy `beylink-access.log`
  + DB `activity_logs` (admin panel).
- **Testler:** 206 test / 20 kategori — **yalnız in-process güvenilir** (admin panel → "Testler"
  veya `POST /api/admin/tests/run-all`). Harici process'ten HTTP ile koşulursa ~7 test YANLIŞ
  kırmızı verir (rate-limit sayaç artefaktı — regresyon değildir).
- **Alarm eşiği:** `/__edge/health` ≠ 200 · public profil 200 dönmüyor · bot prerender boş ·
  ödeme poller'ı hata döngüsünde (docker logs) · disk doluluk.

## 12. Komşu Proje ile Paylaşılan Kaynaklar

- **Komşu:** NoLnk (`../nolnk`, URL kısaltıcı; domain `nolnk.net`). Uygulama düzeyinde SIFIR
  paylaşım: ayrı DB/volume, Redis yok (ikisinde de), cookie yok, localStorage anahtarları farklı
  (`beylink_token` ↔ `tb_token`), JWT secret'lar FARKLI (denetimde hash ile doğrulandı).
- **Ortak olan yalnız edge:** tek Caddy (`../caddy/`), `edge` ağı, tek sertifika deposu
  (`caddy-data`), ask zinciri, catch-all + 421 aktarımı.
- **Çakışmamak için kurallar:**
  1. Dev portları: BeyLink **4501/5501** · NoLnk **4900/5973/4973** — değiştirme.
  2. Lokal Docker test: BeyLink **127.0.0.1:8501** · NoLnk **127.0.0.1:8502**.
  3. Yeni public host → Caddy'de **adlı blok** (greedy catch-all kuralı).
  4. `JWT_SECRET`'lar asla ortaklaşmaz.
  5. Konteyner adları sabit (`beylink-*`) → aynı projeyi iki kopyadan birden `up` etme;
     canlı çalışma kopyası bu workspace (`../WORKSPACE-OVERVIEW.md`).
  6. `edge` üzerindeki konteynerler birbirine erişebilir — güven sınırını uygulama katmanı
     korur (fail-closed tls-check, cross-owner 404).

## 13. Bilinen Sorunlar / Teknik Borç (2026-07-13 denetimi)

1. `uploads/` şu an boş (eski doküman gerçek dosya ima ediyordu) — taşıma kararı yine de geçerli.
2. Newsletter formu dummy (`SiteFooter.jsx` `preventDefault`); backend ucu yok — bilinçli.
3. Frontend'de 2 chunk >500kB (vite uyarısı, kozmetik); ek code-splitting yol haritasında.
4. SMTP dalı iskelet (Resend çalıştıkça gerekmez). Test runner CI/cron'a bağlı değil.
5. Lighthouse/PageSpeed ölçümü deploy SONRASI kullanıcı tarafından yapılacak.
6. `geoip-lite@2.0.3` npm'de `engines: node>=24` ister; imaj node 20 → build'de **EBADENGINE
   UYARISI** (hata değil, çalışır). Node 22/24 imajına geçilirse uyarı kaybolur — düşük öncelik.

*(2026-07-13 ikinci turda kapatıldı: 🔴 VITE build-arg tuzağı (§9), eski port/isim yorumları
[env.js · start.sh · README.md · claude.md → NoLnk 4900/5973], 0-bayt `beylink.db` artığı silindi.)*

## 14. Yapılacaklar (öncelik sıralı)

1. **Resend'de `beylink.org` doğrula** → `MAIL_FROM` güncelle.
2. **Veri + uploads taşıma kararı:** gerçek DEMO/MASSSKAA hesapları prod'a taşınacaksa
   **CANLI kopyanın** DB'si `beylink-data` volume'una kopyalanır (migrate idempotent);
   taşınmayacaksa sıfır DB + `npm run seed`.
3. TRC-20 env'lerini doldur (boşsa prod'da hiçbir plan satın alınamaz).
4. Test runner'ı CI/cron'a bağla; ek code-splitting; Lighthouse ölçümü.
5. Yol haritası (deploy sonrası, `claude.md` §6): yeni bloklar (Menü/Kripto/Konumlar) ·
   rich-text AI açıklama · kartvizitler · mesajlar · mağaza · Stripe/iyzico alternatifi.
   *(Not: "demo ödeme yolunu kaldırma" maddesi İPTAL — kullanıcı kararı 2026-07-13: admin/demo
   ödeme kalıyor. BeyLink'te `DEMO_PAYMENTS` env'i prod'da yine de `false`; admin demo akışı
   isteniyorsa açık bırakılır.)*

---
*2026-07-13 — ortak workspace denetimi (Faz 1-5) sonrası koddan doğrulanarak yeniden yazıldı.
Önceki sürüm: `PRODUCTION-HANDOFF.md.bak.20260713`.*
