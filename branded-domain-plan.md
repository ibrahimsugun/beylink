# Branded Domain (Özel Alan Adı) — Uygulama Planı

> BeyLink'e uyarlanmış. Görev metni Tıklatbari referansları içeriyordu; hepsi BeyLink karşılıklarına eşlendi:
> `routes/domains.js`→**yeni** `routes/domainRoutes.js` · `server.js`→`src/index.js`+`src/app.js` ·
> `§12.8/§13`→CLAUDE.md gerçek bölümleri (11 bölüm) · `i18n-multilang-plan.md`→`~/.claude/plans/ok-g-zel-al-t-imdi-keen-brook.md` +
> `frontend/src/locales/_i18n-progress.md` · kısa-link `domain.com/rastgelekod`→link-in-bio `satinalinmisdomain.com/{slug}`.

## Bağlam

BeyLink link-in-bio: public URL `beylink.org/{username}` (tüm profil sayfası, SPA + bot `prerender`). Şu an özel alan adı YOK. Bu özellik, kullanıcının kendi satın aldığı domaini bağlayıp profilini **`satinalinmisdomain.com/{slug}`** biçiminde sunmasını sağlar (host değişir, yol/slug korunur). Yalnız **Pro Plus**.

Kullanıcı kararı (onaylandı): (1) BeyLink'e uyarla. (2) Özel alan adında kullanıcının profili sunulur; `beylink.org/{slug}` → `satinalinmisdomain.com/{slug}`.

---

## A. KARARLAR (kilitli, gerekçeli)

**A1 — DNS yaklaşımı: hem apex (A kaydı) hem subdomain (CNAME).**
Apex/kök domain (`site.com`) DNS standardı gereği CNAME alamaz → **A kaydı** ile sunucunun statik IP'sine yönlendirilir. Subdomain (`www.site.com` / `links.site.com`) → **CNAME** ile `cname.beylink.org` hedefine. Panelde ikisi de adım adım gösterilir. Gerekçe: kullanıcı çoğu zaman kök domaini ister; kök CNAME alamadığı için A kaydı şart, subdomain isteyenler için CNAME esnek.

**A2 — TLS: Caddy on-demand TLS (edge), `ask` kapısıyla.**
Rastgele kullanıcı domainleri otomatik sertifika ister. certbot-per-domain yüksek sürtünmeli (her domain için elle/script). **Caddy on-demand TLS** sertifikayı ilk HTTPS isteğinde otomatik alır+yeniler (sıfır bakım). Kötüye kullanımı (rastgele host ile sertifika taşkını) önlemek için Caddy önce bir **`ask` endpoint'ine** sorar: `GET /api/domains/tls-check?domain=X` → domain kayıtlı+active ise 200, değilse 403. Bu, oturum içinde konuştuğumuz "Caddy'yi edge reverse-proxy yap" kararıyla da örtüşür.

**A3 — Doğrulama: "bize işaret ediyor mu" (DNS çözümleme) + opsiyonel TXT.**
Aktivasyon kapısı: girilen domainin A/CNAME kaydı **bizim IP'mize/host'umuza çözümleniyor mu** (Node `dns.resolve`). Ek katı sahiplik için opsiyonel `TXT _beylink-verify.<domain> = <token>`. Gerekçe: içerik sunmak için kullanıcı zaten DNS'i bize yöneltmek zorunda → "bize işaret ediyor" kanıtı düşük sürtünmeli ve yeterli; TXT isteğe bağlı sıkılaştırma. Caddy `ask` kapısı ayrıca sertifikayı yalnız `active` domaine verir.

**A4 — Sunum/yönlendirme: Host-farkında, sahibiyle sınırlı.**
`custom_domains(domain → user_id, target_profile_id)`. Host=özel domain isteğinde: kök `/` → sahibin **target_profile** slug'ı; `/{slug}` → **yalnız o sahibin kendi profilleri** (başka BeyLink kullanıcısının slug'ı → 404; gizlilik/güvenlik). Backend `prerender`/`sitemap`/`robots` **Host-farkında** olur (canonical/OG/JSON-LD URL'leri istekteki host'u kullanır → doğru SEO, duplicate sinyali yok).

**A5 — Plan kısıtı: `brandedDomain` cap, yalnız proplus.**
`config/plans.js` caps'ine `brandedDomain` eklenir (free/basic/pro = `false`, proplus = `true`). Backend `assertPlanCap('brandedDomain')`, frontend `planCaps`. Fiyatlandırma/karşılaştırma kartında satır **tüm planlarda görünür** ama proplus dışı planlarda **üstü çizili / "planına dahil değil"** biçiminde (kullanıcı özelliğin varlığını görür, planına dahil olmadığını anlar). Sidebar girişi proplus dışı için kilitli + "yükselt" CTA.

**A6 — Kapsam sınırları.** Hesap başına **1 özel domain** (sonra genişletilebilir). Yalnız web (e-posta/MX yok). Wildcard/sub-of-user yok. www↔apex kanonik yönlendirmesi yapılır. Gerçek veri (DEMO/MASSSKAA) ve `username` slug değişmez.

---

## B. TEKNİK MİMARİ

**B1 — DB şeması (`backend/src/db/migrate.js`, idempotent).** Yeni tablo (mevcut `CREATE TABLE IF NOT EXISTS` deseni):
```sql
CREATE TABLE IF NOT EXISTS custom_domains (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain            TEXT UNIQUE NOT NULL,                 -- normalize: lowercase, şema/nokta yok
  target_profile_id INTEGER REFERENCES profiles(id) ON DELETE SET NULL, -- kök '/' buraya
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','verifying','active','error')),
  verify_method     TEXT,                                 -- 'dns_a' | 'dns_cname' | 'txt'
  verify_token      TEXT,                                 -- opsiyonel TXT sahiplik token'ı
  last_error        TEXT,
  verified_at       TEXT,
  last_checked_at   TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_custom_domains_user   ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
```
Yeni tablo olduğu için `ensureColumn` gerekmez; ileride sütun eklenirse `ensureColumn('custom_domains', ...)` deseniyle.

**B2 — Doğrulama akışı.** Panelde domain girilir → `pending` satır + talimat (A/CNAME + opsiyonel TXT) gösterilir → kullanıcı DNS'i ayarlar → "Doğrula" (veya periyodik `last_checked_at` yoklaması) → `services/domainVerify.js` `dns.resolve` ile A/CNAME (ve varsa TXT) kontrol eder → bize işaret ediyorsa `active` + `verified_at`; değilse `error` + `last_error`. `active` olunca Caddy `ask` kapısı 200 döner → ilk HTTPS'te sertifika otomatik.

**B3 — Host-farkında yönlendirme motoru.**
- **Edge:** Caddy (on-demand TLS + `ask`) → mevcut `web` (nginx SPA + bot `prerender`) + `api`. beylink.org ve özel domain aynı web/api'den akar; fark yalnız `Host` başlığı.
- **Backend:** `middleware/resolveHost.js` Host'u `custom_domains`'te arar → `req.customDomain` (user_id, target_profile_id) ekler. `publicController` + `prerenderController` + `seoRoutes` bunu kullanır: kök `/` → target profil; `/{slug}` sahibin profilleriyle sınırlı; canonical/OG/sitemap host-farkında.
- **Yeni endpoint:** `GET /api/domains/tls-check?domain=` (auth YOK; Caddy `ask` için 200/403).

**B4 — Yeni dosyalar (backend).** `routes/domainRoutes.js`, `controllers/domainController.js`, `models/domainModel.js`, `services/domainVerify.js`, `middleware/resolveHost.js`. `app.js`'e `app.use('/api/domains', domainRoutes)` + resolveHost mount. **Infra:** `Caddyfile` (on_demand_tls { ask ... } + tls { on_demand }), `docker-compose.yml`'e `caddy` servisi (edge, 80/443), `web` artık host'a değil Caddy'ye açılır.

**B5 — i18n parite ele alışı (KRİTİK).** 9 dil de `visible:true` ve `i18n-check.mjs` hepsinde birebir anahtar-kümesi parite zorluyor. Yeni anahtarlar **9 dosyaya da eş zamanlı** eklenir: `en.json`=kaynak (gerçek), `tr.json`=gerçek, diğer 7 dil = **EN placeholder** (parite yeşil kalsın + `createT` fallback zaten İngilizce gösterir). **Task 5** bu 7 placeholder'ı gerçek çeviriyle değiştirir. Çoğul anahtar varsa her dilin CLDR kategorileri (ru: one/few/many/other · es/…: one/many/other · tr/en: one/other) baştan konur.

---

## C. GÖREVLER (Task / Alt-Task) — dosyalar · sorumlu · DoD

### Task 1 — Plan/cap altyapısı  `[mühendislik/orkestratör]`
- **1.1** `backend/src/config/plans.js` + `frontend/src/lib/plans.js`: caps'e `brandedDomain` (proplus=true, diğerleri=false).
- **1.2** Gating: backend `assertPlanCap('brandedDomain')` kullanımı hazır; frontend `planCaps(user).brandedDomain`.
- **1.3** Fiyatlandırma/karşılaştırma: `frontend/src/site/pages/Pricing.jsx` (+ `sections/PricingSection.jsx`) karşılaştırma tablosuna "Özel Alan Adı" satırı; proplus ✓, diğerlerinde **üstü çizili / "planına dahil değil"**.
- **DoD:** cap dört planda doğru; tablo satırı proplus'ta ✓, diğerlerinde üstü çizili; `i18n:check` + `build` yeşil.

### Task 2 — Backend: DB + doğrulama + Host yönlendirme + TLS  `[mühendislik/orkestratör]`
- **2.1** `db/migrate.js`: `custom_domains` tablosu + indeksler. `models/domainModel.js` (CRUD, normalize).
- **2.2** `routes/domainRoutes.js` + `controllers/domainController.js`: list/add/remove (`requireAuth` + `requirePlanCap('brandedDomain')` + `guardSuspended`). `app.js` mount.
- **2.3** `services/domainVerify.js`: `dns.resolve` A/CNAME/TXT; `POST /api/domains/:id/verify` + durum geçişleri (pending→verifying→active/error).
- **2.4** `GET /api/domains/tls-check` (public, Caddy `ask`): domain `active` → 200, değilse 403.
- **2.5** `middleware/resolveHost.js` + `publicController`/`prerenderController`/`seoRoutes` host-farkında (kök→target profil, slug sahiple sınırlı, canonical/OG/sitemap host'a göre).
- **2.6** Infra: `Caddyfile` (on-demand TLS + ask) + `docker-compose.yml` `caddy` servisi; `nginx.conf` Host geçişi (SPA zaten her host'u sunar).
- **DoD:** yerelde `Host: test.com` simülasyonuyla ekle/doğrula/sun çalışır; `tls-check` doğru kod; beylink.org etkilenmez; ilgili testler yeşil.

### Task 3 — Frontend: panel sayfası + Sidebar + metinler (TR+EN kaynak)  `[mühendislik + i18n-translator]`
- **3.1** `App.jsx`: lazy `DomainsPage` + `<Route path="domains">` (/dashboard altı).
- **3.2** `components/dashboard/Sidebar.jsx`: "Özel Alan Adı" girişi, proplus dışı **kilitli + yükselt CTA** (mevcut cap-gating deseni).
- **3.3** `pages/DomainsPage.jsx`: domain ekleme formu, durum rozeti (pending/active/error), **adım adım DNS talimatları** (A/CNAME/TXT) + tooltip'ler, "Doğrula"/"Kaldır", proplus dışı için yükselt yönlendirmesi.
- **3.4** i18n anahtarları → **9 dosyaya** (`en`=kaynak, `tr`=gerçek, 7 dil=EN placeholder): `domains.*`, `sidebar.domains`, sayfa/tooltip/durum metinleri, layout başlığı.
- **DoD:** sayfa render + gated; TR+EN gerçek, 7 dil placeholder; `i18n:check` 9-yönlü yeşil; `build` yeşil.

### Task 4 — SEO + blog + landing/feature içeriği (TR+EN kaynak)  `[marketing-copywriter + seo-writer + blog-translator]`
- **4.1** Marketing tanıtımı: `site/pages/Features.jsx` (veya `sections/*`) özel-alan-adı feature bloğu/değer metni.
- **4.2** SEO meta: ilgili sayfanın `useSeo` başlık/açıklama/keyword (İngilizce anahtar-kelime; title≤60, desc≤155).
- **4.3** Blog yazısı: yeni `site/blog/posts/*` + `App.jsx` blog rotası + `backend/src/routes/seoRoutes.js` `BLOG_POSTS` dizisine satır (sitemap).
- **4.4** Yeni anahtarlar → 9 dosya (en=kaynak, tr=gerçek, 7=placeholder): `feature.*`/`landing.*`, `seo.*`, `blog.*`.
- **DoD:** içerik TR+EN render; SEO checklist geçer; blog yazısı rotalı + sitemap'te; `i18n:check` + `build` yeşil.

### Task 5 — Çok dilli çeviri (yeni metinler → ru/es/de/fr/pt/it/ja)  `[i18n subagent devri]`
Her dil ayrı alt-görev: o dilin **EN placeholder** anahtarları gerçek çeviriyle değiştirilir. Kova→subagent §D tablosuna göre. CLDR çoğul (yeni çoğul anahtar varsa), placeholder `{..}` korunması, em-dash + Türkiye/KVKK/GDPR guard, DeepL DUR-KAL.
- Alt-görevler: **5.ru · 5.es · 5.de · 5.fr · 5.pt · 5.it · 5.ja** (§D'deki devir).
- **DoD (her dil):** o dilde placeholder kalmadı; `i18n:check` 9-yönlü yeşil; çoğul kategorileri doğru; guard'lar temiz.

### Task 6 — Test + doğrulama  `[mühendislik/orkestratör]`
- **6.1** Yönlendirme testi: Host simülasyonu → doğru profil; başka sahibin slug'ı → 404; `tls-check` kapısı.
- **6.2** Doğrulama akışı testi: durum geçişleri; DNS resolver mock.
- **6.3** Gate testi: proplus dışı domain API'de 403; proplus'ta izin.
- **6.4** i18n parite: 9-yönlü yeşil + em-dash/Türkiye guard + çoğul kategorileri.
- **6.5** `build` + (uygunsa) in-house test paneline (`services/testRunner.js`) yeni kategori.
- **DoD:** hepsi yeşil.

---

## D. SUBAGENT DEVİR TABLOSU (çeviri alt-görevleri)

| Kova (yeni metin türü) | Subagent | Model |
|---|---|---|
| Mekanik UI: `domains.*`, sidebar, tooltip, form, durum, layout başlığı | **i18n-translator** | Sonnet 5 · high |
| Marketing/landing/feature değer metni | **marketing-copywriter** | Opus 4.8 · high |
| SEO meta (title/description/keywords, JSON-LD) | **seo-writer** | Opus 4.8 · high |
| Blog yazısı (uzun içerik + meta/FAQ) | **blog-translator** | Opus 4.8 · high |
| Hukuki güncelleme (yalnız Terms/Privacy'e domain maddesi eklenirse) | **legal-translator** | Opus 4.8 · high |

Kod/altyapı (Task 1, 2, 3-kod, 6) = **orkestratör/mühendislik**, çeviri subagent'ı değil. Task 5'te her dil kendi kovasının subagent'ına devredilir; nüanslı içerik (marketing/SEO/blog) Opus, mekanik UI Sonnet.

---

## E. SIRA / BAĞIMLILIK

`1 → 2 → (3 ∥ 4)` → `5` → `6`.
- Task 1 (cap) önce: gating temeli.
- Task 2 (backend infra) core.
- Task 3 (panel) ve Task 4 (içerik) paralel olabilir; ikisi de **EN kaynak + TR + 7 placeholder** üretir.
- **Task 5, Task 3+4 bitmeden BAŞLAMAZ** (çeviri kaynağı EN içerik tamamlanmış olmalı).
- Task 6 en son (uçtan uca).

---

## F. GUARDRAIL

- **Parite:** `frontend/scripts/i18n-check.mjs` 9 dili birebir zorlar → yeni anahtar **9 dosyaya birden** (en gerçek, tr gerçek, 7 EN placeholder), Task 5 placeholder'ları çevirir. Hook (`i18n:check && build`) her kayıtta yeşil kalmalı.
- **DeepL DUR-KAL:** kota/oran hatasında (456/429) dur, yarım yazma, kaç anahtar bitti raporla.
- **Yedek (git YOK):** Task 2 (DB/infra) ve Task 5 (toplu locale yazımı) öncesi **zip snapshot** (`beylink` klasörü, node_modules hariç).
- **Kaynak DAİMA EN:** tüm çeviriler en.json pivotundan; anlam için tr.json çapraz-kontrol.
- **İçerik guard'ları:** em-dash (—) YOK + Türkiye/KVKK/GDPR YOK — yeni içeriğe de uygulanır (EN placeholder zaten temiz İngilizce). `lang.*` etiketleri muaf.
- **DB:** migrasyon idempotent (`CREATE IF NOT EXISTS`); gerçek veri (DEMO/MASSSKAA) + `username` slug dokunulmaz. `assertPlanCap` fail-closed.
- **Güvenlik:** özel domain yalnız sahibinin profillerini sunar (cross-owner slug 404); `tls-check` yalnız `active` domaine 200 (sertifika taşkını önlenir).

---

## G. KARARLAR — ✅ HEPSİ ONAYLANDI (2026-07-11)

Aşağıdaki 7 teknik seçim kullanıcı onayıyla kilitlendi (§A ile birebir):

1. **DNS yaklaşımı** — ✅ Hem apex (A kaydı) hem subdomain (CNAME); ikisi de panelde adım adım gösterilir. (A1)
2. **TLS** — ✅ Caddy on-demand TLS (edge), `ask` kapısı backend'e sorar; nginx `web` arkada kalır. (A2)
3. **Doğrulama** — ✅ "Bize işaret ediyor mu" DNS çözümleme kapısı + **opsiyonel** TXT (zorunlu değil). (A3)
4. **Kök/apex + gizlilik** — ✅ `domain.com/` → sahibin target profili; `domain.com/{başka-slug}` → 404 (yalnız sahibinin profilleri). (A4)
5. **Domain sayısı** — ✅ Hesap başına 1 (sonra genişletilebilir). (A6)
6. **Sunucu/dağıtım** — ✅ Self-managed VPS: **tek sunucuda Caddy edge, birden çok projeyi (ör. Tıklatbari + BeyLink) aynı Caddy önünde** barındırır; 80 + 443 internete açık. on-demand TLS her projenin backend `tls-check` (`ask`) kapısına ayrı ayrı sorar. **NOT:** repo'da şu an Caddy YOK (mevcut prod: nginx `web`, `8080:80`, HTTPS'siz) → Caddy edge + 80/443 **Task 2.6'da kurulur**. VPS/edge farklı çıkarsa yalnız A2 (TLS) yeniden değerlendirilir.
7. **Marketing yeri** — ✅ Ayrı sayfa değil; mevcut **Features/Özellikler sayfasında bir bölüm** (Task 4.1). (A5/1.3)

---

**DURUM:** Plan yazıldı + §G kararları **ONAYLANDI (2026-07-11)**. Uygulama Task 1'den başlanabilir. **Bu görevde KOD YAZILMADI** (yalnız planlama; kullanıcı talimatı: "şu aşamada kod yazma").
