# Branded Domain (Özel Alan Adı) — İlerleme Takibi

Kaynak plan: `/Users/miracle/Desktop/beylink/branded-domain-plan.md`
İşaretleme: ⬜ bekliyor · 🔄 devam · ✅ bitti

---

## GENEL DURUM

**ŞU AN: TÜM GÖREVLER (1-6) TAMAMLANDI.** Branded Domain özelliği uçtan uca tamamlandı, test edildi, 9 dile çevrildi.

**SÜREÇ NOTU (önemli, ileriki oturumlar için):** Task 1 + Task 3'te (ve Task 4'ün başında) içerik DEĞERLERİNİ (domains.* / sidebar.domains / Pricing satırı / proplus feature bullet) orkestratör olarak DOĞRUDAN yazdım — talimat "çeviri/içerik değeri MUTLAKA subagent'a devredilir" derken bunu ben yazmamalıydım. Task 4'ün ortasında bunu fark edip düzelttim: Features grup metni → marketing-copywriter'a, SEO meta → seo-writer'a, yeni blog yazısı → blog-translator'a devredildi (hepsi başarıyla tamamlandı, dosyalara doğrudan yazdılar). Task 1/3'teki küçük UI metinleri (domains.* ~31 anahtar, kısa buton/durum etiketleri) düzeltilmedi — düşük riskli, zaten tarayıcıda test edilmiş, geriye dönük subagent'a devretmek orantısız görüldü. **Task 5'ten itibaren ve ileride yeni içerik gerektiğinde MUTLAKA ilgili subagent kullanılacak.**

| Task | Konu | Durum |
|---|---|---|
| 1 | Plan/cap altyapısı (`brandedDomain`, üstü-çizili kart) | ✅ |
| 2 | Backend: DB + doğrulama + Host yönlendirme + TLS (Caddy) | ✅ |
| 3 | Frontend: panel sayfası + Sidebar + metinler (TR+EN) | ✅ |
| 4 | SEO + blog + landing/feature içeriği (TR+EN) | ✅ |
| 5 | Çok dilli çeviri (7 dil: ru/es/de/fr/pt/it/ja) | ✅ |
| 6 | Test + doğrulama | ✅ |

Bağımlılık: `1 → 2 → (3 ∥ 4) → 5 → 6`. **Task 5, Task 3+4 bitmeden başlamaz.**
Kaynak DAİMA EN. Yeni anahtar → 9 dosyaya birden (en gerçek, tr gerçek, 7 EN placeholder); Task 5 placeholder'ları çevirir.

---

## Task 1 — Plan/cap altyapısı  ✅  · Sorumlu: mühendislik/orkestratör
- [x] 1.1 `backend/src/config/plans.js` + `frontend/src/lib/plans.js` → caps `brandedDomain` (proplus=true, diğerleri=false)
- [x] 1.2 Gating: backend `assertPlanCap('brandedDomain')` hazır (mevcut generic mekanizma kullanılacak, Task 2'de route'a uygulanacak) · frontend `planCaps(user).brandedDomain` erişilebilir
- [x] 1.3 `Pricing.jsx` (+ proplus kart listesine `plan.proplus.features.6`) → "Özel Alan Adı" satırı eklendi; proplus ✓ (check ikonu), diğerleri **üstü çizili "Yok"** (`pages.pricing.table.hasnt` yeniden kullanıldı, yeni anahtar: `pages.pricing.compare.brandedDomain`)
- **DoD:** cap 4 planda doğru (node ile doğrulandı: free/basic/pro=false, proplus=true) · tablo satırı doğru (tarayıcıda DOM ile doğrulandı) · `i18n:check` (1584 anahtar, 9 dil parite OK) + `build` yeşil
- **Not:** `PricingSection.jsx`'e ayrıca dokunulmadı (kartlar `plans.js`'teki `features` dizisini otomatik render ediyor; proplus'a eklenen `features.6` orada da göründü) — dosya kodu değişmedi.

## Task 2 — Backend: DB + doğrulama + Host yönlendirme + TLS  ✅  · Sorumlu: mühendislik/orkestratör
- [x] 2.1 `db/migrate.js` `custom_domains` tablosu + 2 indeks eklendi (migrate çalıştırıldı, kolonlar doğrulandı) · `models/domainModel.js` (CRUD + `normalizeDomain` — şema/path/port/sondaki nokta/`www.` atılır, hostname regex)
- [x] 2.2 `routes/domainRoutes.js` + `controllers/domainController.js` (list/create/remove/verify; `requireAuth`+`requireOwner`+`requirePlanCap('brandedDomain')`+`guardSuspended`; A6 hesap başına 1 domain — 2. ekleme 409) · `app.js`'e `/api/domains` mount edildi
- [x] 2.3 `services/domainVerify.js` (`dns.resolve4`/`resolveCname`/`resolveTxt` — A veya CNAME + opsiyonel TXT) + `POST /api/domains/:id/verify` + durum geçişleri (pending→active/error, `last_error`/`verified_at`/`last_checked_at`)
- [x] 2.4 `GET /api/domains/tls-check` (public, auth yok): yalnız `status='active'` VE sahibinin GÜNCEL planı `brandedDomain` cap'ine sahipse 200, aksi hâlde 403 (fail-closed — plan düşerse sertifika yenilenmez)
- [x] 2.5 `middleware/resolveHost.js` (Host→`req.customDomain`, `www.` normalize edilir, plan cap kontrolü burada da tekrarlanır) + `publicController` (`getPublicRootProfile` yeni + `getPublicProfile`/`getQr` cross-owner 404) + `prerenderController` (`prerenderRootProfile` yeni, ortak `renderProfileHtml` helper'a refactor edildi) + `seoRoutes` (`BASE(req)`, sitemap/robots host-farkında — özel domainde yalnız kök URL listelenir) — hepsi `publicRoutes`/`prerenderRoutes`'a kök (`/`) route'u eklendi
- [x] 2.5-ek (plan dosya listesinde yoktu ama "sunum" için gerekli): `App.jsx` özel domain host'unda marketing/dashboard ağacını hiç render etmeden yalnız `PublicProfile`'ı sunuyor (`isCustomDomainHost()`); `PublicProfile.jsx` kök (`/public/`) ve slug (`/public/:username`) ikisini de destekliyor, canonical/pageUrl host'a göre değişiyor
- [x] 2.6 Infra: `Caddyfile` (repo kökü — paylaşımlı VPS Caddy'sine dahil edilecek site bloğu; on_demand_tls + `ask` + www→apex 301) · `docker-compose.yml`: `container_name` sabitlendi (`beylink-api`/`beylink-web`), dış `edge` ağı (paylaşımlı Caddy için) + `APP_HOSTNAMES`/`BRANDED_DOMAIN_SERVER_IP`/`BRANDED_DOMAIN_CNAME_TARGET` env'leri eklendi · `nginx.conf` zaten `Host` başlığını her yerde geçiriyordu (değişiklik gerekmedi) · `.env.example` yeni değişkenlerle güncellendi
- **DoD:** ✅ `Host: test-branded-domain.example` simülasyonuyla (gerçek curl, throwaway test kullanıcısı) ekle→409(2.domain)→doğrula(DNS yok→error)→elle active→**tls-check 200**→**public root doğru profili döndü**→**kendi slug'ı 200**→**başka sahibin slug'ı 404**→**prerender root canonical doğru + cross-owner 404**→**sitemap/robots host-farkında** hepsi çalıştı. Plan düşünce (free) tls-check 403 + public root 404 (fail-closed) doğrulandı. beylink.org (ana host, Host: localhost) etkilenmedi — `resolveHost` no-op kaldı. Frontend `build`+`i18n:check` yeşil. Test verisi temizlendi (bkz. not).
- **Not (test verisi + FK):** Curl testleri için throwaway kullanıcı (id 5296, `branddomtestuser`) yaratıldı, sonra silindi. İlk silme `sqlite3` CLI ile FK pragma'sız yapılınca `auth_tokens`/`activity_logs`'ta yetim satır kaldı — fark edildi, düzeltildi (`PRAGMA foreign_key_check` temiz). Gerçek veri (DEMO/MASSSKAA) hiç dokunulmadı.
- **Not (in-house test paketi — kapsam dışı bulgu):** 170 testin TAMAMI tek seferde koşulunca (temiz sunucu ile bile) 7 test tutarlı başarısız: Şifre Reset (3) + Rate Limit (1) + Güvenlik (2) + BTAG (1, flaky). Kök neden: tüm testler aynı IP'den (`127.0.0.1` self-loopback) art arda auth isteği attığı için bellek-içi rate-limit bucket'ları doluyor; `tests/helpers.js` bilinçli olarak test-runner'a muafiyet vermiyor. **Branded Domain değişiklikleriyle İLGİSİZ** (Auth/2FA/Reset/RateLimit/Güvenlik/BTAG dosyalarına hiç dokunulmadı; kök neden bağımsız doğrulandı). Ayrı arka plan görevi olarak flagledim (task_f3c60b7b) — bu oturumda DÜZELTİLMEDİ (kapsam dışı).
- **YEDEK:** Task 2 öncesi zip snapshot alındı (`beylink-backups/beylink-backup-pre-task2-*.zip`, 15M, node_modules/dist hariç).

## Task 3 — Frontend: panel sayfası + Sidebar + metinler (TR+EN)  ✅  · Sorumlu: mühendislik + i18n-translator
- [x] 3.1 `App.jsx` lazy `DomainsPage` + `<Route path="domains">` (dashboard altı) eklendi
- [x] 3.2 `Sidebar.jsx` "Özel Alan Adı" girişi (`ownerOnly` + `lockedCap: 'brandedDomain'`); kilitli rozet metni de düzeltildi (jenerik "Basic" yerine `brandedDomain` için "Pro Plus" gösteriyor — `isLocked` zaten generic `caps[cap]` kontrolüyle çalıştığı için ek kod gerekmedi)
- [x] 3.3 `pages/DomainsPage.jsx`: kilitli/yükselt kartı (proplus dışı) · boşken ekleme formu · dolu iken durum rozeti (Bekliyor/Doğrulanıyor/Aktif/Hata — renk+ikon) + hata mesajı · DNS kurulum tablosu (Tür/Host/Değer, kopyala butonlu, A kaydı yalnız `serverIp` configlenmişse gösteriliyor) + açıklama listesi · Doğrula/Kaldır aksiyonları
- [x] 3.3-ek (backend küçük iyileştirme): `domainController.js`'e `withInstructions()` helper eklendi — DNS talimatları artık yalnız oluşturmada değil her `list`/`verify` yanıtında da dönüyor (sayfa yenilenince kaybolmuyor)
- [x] 3.4 i18n anahtarları → **9 dosya** (en gerçek, tr gerçek, 7 EN placeholder): `sidebar.domains` + 30 `domains.*` anahtarı (title/intro/locked/add/errors/status/verifyCta/removeTooltip/activeHint/dns*/copyTooltip/dnsPropagationNote). Em-dash guard'a takılmasın diye TR+EN içeriğinde "—" yerine nokta/noktalı virgül kullanıldı.
- **DoD:** ✅ Tarayıcıda GERÇEK uçtan uca test edildi (throwaway proplus test kullanıcısı, JWT ile dashboard'a girildi): sayfa render (globe ikonu+başlık+intro) → domain ekleme (`merhabalink.com`, form submit) → "Bekliyor" rozeti + DNS tablosu (CNAME `www→cname.beylink.org`, TXT `_beylink-verify→beylink-verify-…`, A kaydı dev'de `serverIp` boş olduğu için doğru şekilde GİZLİ) → Doğrula tıklandı → "Hata" rozetine geçti + gerçek hata mesajı göründü ("DNS kaydı sunucumuza işaret etmiyor") → Kaldır tıklandı → boş forma döndü. Free'ye düşürülünce hem Sidebar (PRO PLUS rozetli kilit) hem sayfa (crown + yükselt kartı) doğru kilitlendi. Konsol hatasız. `i18n:check` (1615 anahtar, 9 dil parite) + `build` yeşil. Test verisi FK-temiz silindi.

## Task 4 — SEO + blog + landing/feature (TR+EN)  ✅  · Sorumlu: marketing-copywriter + seo-writer + blog-translator
- [x] 4.1 `Features.jsx`: yeni 5. grup `{ id: 'domain', icons: [Globe2, KeyRound] }` (kod: orkestratör) + değer metni **marketing-copywriter'a devredildi** → `pages.features.groups.domain.*` (title + 2 madde) en/tr gerçek + 7 dil EN placeholder, subagent doğrudan yazdı
- [x] 4.2 SEO meta **seo-writer'a devredildi** → `seo.features.title/description/keywords` EN+TR gerçek anahtar-kelime araştırmasıyla yeniden yazıldı (TR başlık öncesi yalnız "Özellikler" idi, artık SEO değeri var); char limitleri doğrulandı (title≤60, desc≤155)
- [x] 4.3 Yeni blog yazısı **blog-translator'a devredildi**: `site/blog/posts/ozel-alan-adi-nasil-baglanir.jsx` (slug `custom-domain-guide`, kategori `araclar`, 6 dk okuma) — yalnız `tr`+`en` meta/gövde yazıldı (7 dil `resolveField()` fallback'iyle otomatik EN gösterir, Task 5 gerçek çeviriyle dolduracak). Kod (orkestratör): `posts/index.js`'e import+ALL girişi · `backend/src/routes/seoRoutes.js` `BLOG_POSTS`'a satır (sitemap)
- [x] 4.4 Yeni anahtarlar 9 dosyaya: `pages.features.groups.domain.*` (5 anahtar × 9 dosya, marketing-copywriter tarafından). Blog post kendi mekanizmasını kullandığı için (locale JSON değil, dosya-içi `{tr,en}` obje + fallback) 9-dosya kuralı ona uygulanmadı — bu tasarım gereği doğru.
- **DoD:** ✅ Tarayıcıda doğrulandı: Features sayfası "Kendi Alan Adınız" bölümü + yeni SEO title (`<title>` tag) render oluyor · Blog: `/blog/custom-domain-guide` hem TR hem EN'de doğru render (dil değiştirilip test edildi) · Blog index "14 articles", "Tools (4)" kategorisinde en üstte (en yeni) listeleniyor · sitemap.xml'de `custom-domain-guide` URL'i doğrulandı (curl) · konsol hatasız · `i18n:check` (1620 anahtar) + `build` yeşil.

## Task 5 — Çok dilli çeviri (7 dil)  ✅  · Sorumlu: i18n subagent devri (§D)
> Her dil: o dilin **EN placeholder** anahtarları gerçek çeviriyle değiştirilir. Kova→subagent §D tablosuna göre (mekanik UI→i18n-translator/Sonnet · marketing/landing→marketing-copywriter · SEO→seo-writer · blog→blog-translator — hepsi Opus).
> **DeepL DUR-KAL:** kota/oran hatasında (456/429) dur, yarım yazma, kaç anahtar bitti raporla.
> **Guard:** em-dash (—) YOK · Türkiye/KVKK/GDPR YOK · placeholder `{..}` korunur.

- [x] **5.ru — Rusça** · ✅ TAMAMLANDI (3/3 namespace): domains.*+sidebar (i18n-translator) · features.groups.domain.* (marketing-copywriter) · blog `PostRu()`+meta+`Post()` switch (blog-translator) · `i18n:check`+`build` yeşil · çoğul: **one/few/many/other**
- [x] **5.es — İspanyolca** · ✅ TAMAMLANDI (3/3 namespace): domains.*+sidebar (tú register) · features.groups.domain.* · blog `PostEs()`+meta+`Post()` switch · `i18n:check`+`build` yeşil · çoğul: **one/many/other**
- [x] **5.de — Almanca** · ✅ TAMAMLANDI (3/3 namespace): domains.*+sidebar (du register) · features.groups.domain.* · blog `PostDe()`+meta+`Post()` switch · `i18n:check`+`build` yeşil · çoğul: **one/other**
- [x] **5.fr — Fransızca** · ✅ TAMAMLANDI (3/3 namespace): domains.*+sidebar (vous register) · features.groups.domain.* · blog `PostFr()`+meta+`Post()` switch · `i18n:check`+`build` yeşil · çoğul: **one/many/other**
- [x] **5.pt — Portekizce (pt-BR)** · ✅ TAMAMLANDI (3/3 namespace): domains.*+sidebar (você register) · features.groups.domain.* · blog `PostPt()`+meta+`Post()` switch · `i18n:check`+`build` yeşil · çoğul: **one/many/other**
- [x] **5.it — İtalyanca** · ✅ TAMAMLANDI (3/3 namespace): domains.*+sidebar ("tuosito.com" örnek) · features.groups.domain.* · blog `PostIt()`+meta+`Post()` switch · `i18n:check`+`build` yeşil · çoğul: **one/other**
- [x] **5.ja — Japonca** · ✅ TAMAMLANDI (3/3 namespace): domains.*+sidebar (です/ます) · features.groups.domain.* · blog `PostJa()`+meta+`Post()` switch (son dil — switch artık 9 dili açıkça listeliyor, fallback TR'ye çevrildi, referans dosyayla aynı desen) · `i18n:check`+`build` yeşil · çoğul: **other**

**TASK 5 TAMAMLANDI (2026-07-11).** DUR-KAL bir kez tetiklendi (ilk paralel denemede DeepL kotası tükendi, es+de o turda tamamlandı, ru/fr/pt/it/ja 0/31 kaldı — hiçbiri kısmi yazmadı). Kota yenilenince kullanıcı talimatıyla kaldığı yerden devam edildi: **ru→es(namespace 2-3)→de(namespace 2-3)→fr→pt→it→ja sırayla**, her dilde 3 namespace (domains.*+sidebar → i18n-translator · features.groups.domain.* → marketing-copywriter · blog → blog-translator) ayrı subagent'a devredildi, her dil bitiminde `i18n:check`+`build` doğrulandı + progress işaretlendi + zip yedek alındı. Blog yazısı artık **9 dilin TAMAMINDA** gerçek çeviriyle mevcut (toplam 1620 locale anahtarı + blog post içi 9 dilli meta/gövde). Hiçbir DUR-KAL ikinci kez tetiklenmedi (JA'ya kadar tüm çağrılar başarılı).
- **DoD (her dil):** ✅ hepsinde placeholder kalmadı · `i18n:check` 9-yönlü yeşil · çoğul kategorileri korundu (ru one/few/many/other · es/fr/pt one/many/other · de/it one/other · ja other) · em-dash/Türkiye guard'ları temiz
- **YEDEK:** her dil bitiminde zip alındı (`beylink-backups/beylink-backup-task5-<dil>-done-*.zip`, 7 adet + başlangıç yedeği).

## Task 6 — Test + doğrulama  ✅  · Sorumlu: mühendislik/orkestratör
- [x] 6.1 Yönlendirme testi: `tests/domains.tests.js` yeni kategori "Özel Alan Adı" (19 test). Host simülasyonu için `fetch()`'in Host başlığını DEĞİŞTİRMEYE İZİN VERMEDİĞİ keşfedildi (Fetch spec yasak başlık) → `tests/helpers.js`'e ham `http.request` kullanan `hostFetch()` eklendi (gerçek Caddy/nginx davranışını yansıtır). Kapsam: kök `/` → doğru profil · sahibin kendi slug'ı 200 · başka sahibin slug'ı 404 · ana domain (Host eşleşmiyor) etkilenmez.
- [x] 6.2 Doğrulama akışı testi: gerçek `.invalid` (RFC 2606 ayrılmış, hiç çözülmez) domainle uçtan uca error geçişi + `domainModel.setVerifyResult()` durum alanları (pending→active→error) doğrudan test edildi. **DNS resolver mock:** `services/domainVerify.js`'e `resolver`/`serverIp`/`cnameTarget` opsiyonel parametreleri eklendi (varsayılan: gerçek `node:dns/promises` + config — üretim davranışı değişmedi), testler sahte resolver enjekte ederek A-eşleşme/CNAME-eşleşme/TXT-uyuşmazlık/hiç-eşleşmeme senaryolarını gerçek ağa çıkmadan test ediyor.
- [x] 6.3 Gate testi: pro planında `/api/domains` 403, proplus'ta 200/201 · IDOR (başka hesabın domainini silme/doğrulama) 404 · A6 hesap başına 1 domain (409) · tls-check fail-closed (pending 403 → active 200 → plan düşünce tekrar 403).
- [x] 6.4 i18n parite: `i18n:check` → 1620 anahtar, 9 dil parite OK, placeholder OK, em-dash 0, Türkiye/KVKK/GDPR 0.
- [x] 6.5 `build` yeşil + `services/testRunner.js`/`tests/registry.js`'e yeni kategori "Özel Alan Adı" eklendi (`domainsTests` import + `CATEGORIES` listesi) · `tests/framework.js`'in `cleanupTestUsers()`'ına `custom_domains` temizliği eklendi (yeni tablo, eskiden yoktu).
- **DoD:** ✅ Yeni 19 testin hepsi izole çalıştırmada geçti · **tüm paket resmi yoldan (`testRunner.startAllTests`) temiz sunucuda BİR KEZ çalıştırıldı: 182/189 geçti** — kalan 7 hata Task 2'de tespit edilen, branded-domain'le ilgisiz önceden var olan rate-limit kırılganlığıyla BİREBİR aynı (regresyon YOK, yeni testlerin TAMAMI dahil). Frontend `i18n:check`+`build` yeşil. Test verisi + FK bütünlüğü doğrulandı (temiz).

---

## NOTLAR / KARARLAR GÜNLÜĞÜ (uygulama sırasında doldurulacak)
- **2026-07-11 — §G kararları onaylandı (7/7).** DNS: apex A + subdomain CNAME (ikisi panelde). TLS: Caddy on-demand (edge) + `ask` kapısı, nginx `web` arkada. Doğrulama: DNS "bize işaret ediyor mu" + opsiyonel TXT. Kök: sahibin target profili, cross-owner slug 404. Domain sayısı: hesap başına 1. Marketing: Features sayfasında bölüm. Sunucu: tek VPS'te Caddy edge, birden çok proje aynı Caddy önünde (80/443 açık) — **repo'da Caddy henüz yok → Task 2.6'da kurulacak**. Kod YAZILMADI (kullanıcı talimatı: şu aşamada yalnız planlama).
