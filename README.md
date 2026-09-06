# BeyLink

Kendi sunucunda çalışan bir **link in bio** platformu: tek bir public profil sayfasında bağlantılarını, içerik bloklarını ve markanı toplarsın. Canlı sürüm: [beylink.org](https://beylink.org)

## Ne yapar

- **Public profil sayfaları** (`/kullaniciadi`) ve içerik blokları
- **Tasarım şablonları**, marka renkleri ve görsel yükleme
- **Tıklama analitiği**: ülke, cihaz, zaman serisi
- **QR kod** üretimi
- **Abonelik, kredi ve bakiye hareketleri**, USDT TRC20 ile self custody ödeme
- **Alt hesaplar** ve alt hesap paketleri
- **Branded domain**: kullanıcılar kendi alan adlarını bağlayabilir
- **SEO ve bot prerender**: arama motorları ve sosyal medya botları için sunucu tarafında render
- **İki aşamalı doğrulama sıfırlama**, çerez bildirimi, hız sınırlama gibi güvenlik çalışmaları

## Teknoloji yığını

| Katman | Kullanılan |
|---|---|
| Backend | Node.js (ESM), Express, better-sqlite3 |
| Kimlik | JWT, bcryptjs |
| Dosya yükleme | multer, ayrı kalıcı volume |
| Analitik | geoip-lite (yerel IP çözümleme) |
| QR | qrcode |
| Frontend | React, Vite, Tailwind CSS, Lucide |
| Dağıtım | Çok aşamalı Dockerfile, nginx, docker compose |

## Klasör yapısı

```
beylink/
├── backend/
│   └── src/
│       ├── index.js           sunucu girişi
│       ├── app.js             Express uygulaması
│       ├── config/            ortam değişkeni çözümleme
│       ├── db/                migrate.js, seed.js, şema
│       ├── routes/            auth, profile, link, analytics, billing, domain,
│       │                      admin, btag, go, prerender, seo, subAccount, template
│       ├── controllers/       rota mantığı
│       ├── models/            veri erişimi
│       ├── middleware/        kimlik, yetki, host çözümleme, hız sınırı
│       ├── services/          iş mantığı (mail, ödeme, domain doğrulama)
│       └── tests/
├── frontend/                  React SPA
├── brand-assets/              logo kaynak dosyaları (psd, ai, png)
├── Caddyfile                  tek proje kurulumu için
├── docker-compose.yml
├── claude.md                  mimari notları
├── PRODUCTION-HANDOFF.md      canlıya alma rehberi
└── plan / progress dosyaları  özellik bazlı geliştirme tarihçesi
```

Depodaki `plan-*.md` ve `progress-*.md` dosyaları geliştirme tarihçesidir: 2FA sıfırlama, çerez bildirimi, branded domain ve hız sınırlama çalışmalarının planları ile ilerleme kayıtlarını içerir.

## Geliştirme ortamı

**Backend (port 4501):**

```bash
cd backend
npm install
cp .env.example .env
npm run migrate     # tabloları oluşturur
npm run seed        # örnek veri
npm run dev
```

**Frontend (port 5501):**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Tarayıcı: `http://localhost:5501` · Örnek public profil: `http://localhost:5501/demo`

Portlar bilinçli olarak **4501 ve 5501** seçildi, aynı makinedeki komşu projelerle çakışmasın diye.

### Seed hesapları

`npm run seed` çalıştırıldığında oluşan örnek hesaplar:

| Tip | Giriş | Şifre |
|---|---|---|
| Sahip | demo@beylink.com | Passw0rd! |
| Alt hesap | demo-sub | Passw0rd! |

Bunlar yalnız yerel geliştirme içindir, canlıya taşınmamalıdır.

## Docker ile canlı

```bash
cp .env.example .env         # JWT_SECRET ve diğerlerini doldurun
docker compose up -d --build
docker compose exec api npm run seed    # opsiyonel, örnek veri
```

Servisler:

- **web**: nginx içinde SPA, `/api` ve `/uploads` isteklerini `api:4000`'e proxy'ler, bot isteklerini prerender'a yönlendirir
- **api**: Express, yalnız iç ağda
- Veri iki kalıcı volume'de: `beylink-data` (SQLite) ve `beylink-uploads` (kullanıcı görselleri)

## Ortam değişkenleri

Tam liste `\.env.example` ve `backend/.env.example` içinde. Öne çıkanlar:

| Değişken | Açıklama |
|---|---|
| `JWT_SECRET` | Zorunlu, mutlaka değiştirin |
| `ADMIN_EMAILS` | Admin paneline yetkili e-postalar, virgülle ayrık |
| `APP_HOSTNAMES` | BeyLink'in kendi hostları. Bu listede olmayan her host kullanıcı domaini sayılır |
| `PUBLIC_BASE_URL` `APP_URL` | Profil, QR ve mail bağlantılarının tabanı |
| `SITEMAP_BASE_URL` | Sitemap ve robots için sabit canlı URL |
| `RESEND_API_KEY` | Doluysa gerçek mail Resend API ile gider |
| `MAIL_FROM` | Doğrulanmış domainden olmalı |
| `TRC20_WALLET_ADDRESS` | Alıcı cüzdan. Boşsa gerçek ödeme kapalı kalır |
| `BRANDED_DOMAIN_CNAME_TARGET` `BRANDED_DOMAIN_SERVER_IP` | Branded domain doğrulaması |
| `DEMO_PAYMENTS` | Üretimde mutlaka `false` |

Mail sağlayıcı önceliği: `RESEND_API_KEY` doluysa Resend, değilse `MAIL_ENABLED=true` ile SMTP, o da yoksa demo mod. Demo modda gerçek mail gitmez ve token yalnız `NODE_ENV` production değilken API yanıtında döner.

## Paylaşımlı edge mimarisi

Canlı kurulumda BeyLink, komşu bir projeyle **tek bir Caddy** arkasında 80 ve 443 portlarını paylaşır:

- `beylink.org` adlı blok doğrudan web servisine gider
- Sağlık ucu olarak `/health` bilinçli olarak **kullanılmadı**, çünkü "health" bir kullanıcı adı olarak alınabilir ve public profili gölgelerdi. Bunun yerine `/__edge/health` kullanılır ve doğrudan api'ye gider
- Müşteri branded domainleri `:443` catch all bloğuna düşer, sertifika on demand TLS ile alınır ancak bir izin zinciri onaylamadan verilmez
- Catch all trafiği önce komşu projeye sorulur, o **421** dönerse istek BeyLink'e aktarılır

Proje içindeki `Caddyfile` yalnız tek proje kurulumu içindir.

## Depoda bulunmayanlar

- `.env` dosyaları (JWT secret, API anahtarları)
- `backend/data/*.sqlite` ve WAL dosyaları (gerçek kullanıcı verisi)
- `backend/uploads/` içeriği (kullanıcı görselleri)
- `node_modules/`, `dist/`
- Yerel yedek klasörü

`.env.example` dosyalarındaki anahtar alanları boş veya yer tutucudur. `ADMIN_EMAILS` varsayılanı `admin@example.com` olarak bırakıldı, kurulumda kendi adresinizi vermeniz gerekir.

## Ayrıntılı dokümantasyon

- `claude.md`: mimari, modül sınırları, yol haritası
- `PRODUCTION-HANDOFF.md`: canlıya alma, yedekleme ve işletim rehberi
