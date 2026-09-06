# Özel Alan Adı — DNS UX İyileştirmesi (Cloudflare Uyarısı + Subdomain Desteği) — Uygulama Planı

> Kaynak referans: repo kökü `claude.md` (§5 değişmezler). Mevcut özellik planı: `branded-domain-plan.md` + `_branded-domain-progress.md`.
> Bu plan, TAMAMLANMIŞ "Özel Alan Adı" (branded domain) özelliğine İKİ küçük iyileştirme ekler. Yeni özellik değil; mevcut akışın genişletilmesi.

## Bağlam

BeyLink'te Pro Plus kullanıcıları kendi alan adlarını panelden (`DomainsPage.jsx`) bağlıyor: domain eklenir → panel DNS talimatları (apex A kaydı `@ → serverIp`, `www` CNAME `→ cname.beylink.org`, opsiyonel TXT) gösterir → kullanıcı "Doğrula" der → `dns.resolve` ile "bize işaret ediyor mu" kontrol edilir → `active` olunca Caddy on-demand TLS sertifikayı otomatik alır. Kilit dosyalar: `models/domainModel.js` (`normalizeDomain` + CRUD), `controllers/domainController.js` (`withInstructions()` talimat üretici + CRUD + `tls-check`), `services/domainVerify.js` (A/CNAME/TXT çözümleme), `middleware/resolveHost.js` (Host-farkında yönlendirme), `routes/domainRoutes.js`, `frontend/src/pages/DomainsPage.jsx` (panel), repo kökü `Caddyfile`.

**İki iyileştirme isteniyor:**

- **Parça 1 — Cloudflare/proxy uyarısı.** BeyLink yakında Cloudflare arkasına alınacak (`beylink.org`+`www` TURUNCU/proxied; `cname.beylink.org` GRİ/DNS-only olmak ZORUNDA). Müşterilerin kendi branded domainleri de GRİ olmalı. Müşteri kendi Cloudflare'inde domainini TURUNCU yaparsa: (a) `dns.resolve4` CF edge IP'lerini görür → `serverIp` ile eşleşmez → doğrulama "sunucumuza işaret etmiyor" hatası verir; (b) Caddy on-demand TLS sertifika alamaz. İSTENEN: DNS talimatlarına kısa, kullanıcı-dostu bir uyarı: "Cloudflare veya benzeri proxy kullanıyorsanız kayıtları 'DNS only / gri bulut' ekleyin; proxy açıkken doğrulama ve sertifika çalışmaz."

- **Parça 2 — Subdomain ekleme desteği.** Şu an panel yalnız apex (kök) senaryosunu üretiyor (A `@` + `www` CNAME). Kullanıcı `siyahkus.com` YERİNE `linkim.siyahkus.com` gibi bir alt alan adı ekleyebilmeli; panel tipe göre DOĞRU talimat üretmeli (apex → A + www CNAME; subdomain → yalnız o alt alan için CNAME + opsiyonel TXT, A kaydı YOK). Panelde bir görünür seçim/özellik olmalı ("kullanıcı tıklayıp ayarlayabilsin"). A6 kuralı korunur: hesap başına yine 1 domain (apex YA DA subdomain).

---

## KEŞİF BULGULARI (mevcut kodun subdomain'e tepkisi — plan bunlara dayanıyor)

Görevde sorulan keşif noktalarının GERÇEK kod üzerinden yanıtları:

1. **`normalizeDomain` subdomain'i olduğu gibi kabul ediyor mu?** EVET. `HOSTNAME_RE` çok etiketli girdiyi (en az bir nokta, daha fazlası serbest) kabul eder. `linkim.siyahkus.com` → `linkim.siyahkus.com` (korunur). Tek müdahale: `s.replace(/^www\./, '')` yalnız **lider `www.`** önekini atar → `www.siyahkus.com` → `siyahkus.com` (apex'e çöker), ama `linkim.siyahkus.com` gibi www-dışı alt alanları **bozmaz**. Yani normalize subdomain için hazır; kararı bozan tek şey www (bkz. A4).

2. **`resolveHost`'un `www.` atarak araması subdomain kaydıyla nasıl etkileşir?** Sorunsuz. `hostHeader.replace(/^www\./,'')` → subdomain host `linkim.siyahkus.com` www ile başlamadığından değişmez → `findActiveByDomain('linkim.siyahkus.com')` birebir eşleşir. **Kod değişmez**, yalnız yorum güncellenir ("artık apex + subdomain satırları verbatim saklanır" — eski "her zaman apex" yorumu geçersiz).

3. **`domainVerify` subdomain için hangi yöntemi kullanmalı?** `dns_cname`. Mevcut mantık: `serverIp` doluysa önce `resolve4` (A), sonra `resolveCname`. Bir subdomain CNAME→`cname.beylink.org`→serverIp olduğunda `resolve4` zinciri takip edip serverIp'i döndürebilir (dns_a geçer) VEYA `resolveCname` doğrudan `cname.beylink.org` döndürür (dns_cname geçer) — OR mantığı sayesinde ikisi de doğrular. **İşlevsel olarak çalışıyor**; yine de `kind`-farkında hale getirilip subdomain'de CNAME'i **birincil** kontrol yapmak method etiketini doğru ("dns_cname") tutar ve serverIp boş dev ortamında da nettir. TXT zaten `_beylink-verify.<tam-domain>` ile subdomain'de doğru çalışır.

4. **`withInstructions()` talimat üretimi nerede/nasıl tip-farkında yapılmalı?** `controllers/domainController.js` içinde. Şu an DAİMA apex-tarzı döner (`aRecord`, `www` için `cnameTarget`, `txt`). Bu, tipe göre dallanmalı: apex → A(`@`)+CNAME(`www`)+TXT; subdomain → CNAME(alt alan)+TXT, `aRecord=null`, www YOK. **Ana backend değişikliği burası.**

5. **Caddyfile'daki www→apex 301 regex'i subdomain host'larına ne yapar?** `@www header_regexp wwwHost Host ^www\.(.+)$` yalnız `www.` ile BAŞLAYAN host'ları yakalar. `linkim.siyahkus.com` eşleşmez → yönlendirme yok → doğrudan sunulur. `:443 { tls { on_demand } }` catch-all her host'u (subdomain dahil) karşılar. **Caddyfile değişmez** (yalnız doğrula).

6. **`tls-check` etkilenir mi?** Hayır. `normalizeDomain(req.query.domain)` subdomain'i korur → `findActiveByDomain` eşleşir → aktif+cap'li ise 200. **Değişmez.**

7. **Hangi domain testleri güncellenmeli/eklenmeli?** `backend/src/tests/domains.tests.js` (mevcut 19 test). Güncelle: `domains.model-normalize-domain-strips-scheme-www-path` (subdomain'in korunduğu assert'i). Ekle: subdomain create→CNAME-only talimat, subdomain verify→dns_cname (mock), subdomain host routing (root/own-slug/cross-owner), subdomain tls-check active→200, apex regresyon guard'ı, subdomain-modu-apex-girdi→400. (bkz. Task 4).

**En kritik karar noktası — apex mı subdomain mı ayırt etme:** Güvenilir eTLD+1 tespiti Public Suffix List (PSL) gerektirir (`co.uk`, `com.tr` gibi çok parçalı TLD'ler etiket-sayma ile ayırt edilemez). BeyLink "sıfır gereksiz bağımlılık" felsefesinde → PSL kütüphanesi EKLENMEZ. Çözüm: **tipi kullanıcı panelde açıkça seçer** (kullanıcının "tıklayıp ayarlayabilsin" ifadesiyle birebir örtüşür), sunucu `kind` olarak saklar. Bu, PSL sorununu tamamen elimine eder (bkz. A1 + §H1).

---

## A. KARARLAR (kilitli, gerekçeli)

**A1 — Domain tipi kullanıcı tarafından açıkça seçilir (toggle), sunucu `kind` sütununda saklar.**
Ekleme formunda iki seçenekli bir toggle: "Ana alan adı" (apex, ör. `siteniz.com`) / "Alt alan adı" (subdomain, ör. `links.siteniz.com`). Toggle, girdi etiket sayısına göre hafif bir sezgiyle ön-seçilir (≥3 etiket → subdomain önerilir) ama SON KARAR kullanıcının; toggle backend'e `kind: 'apex'|'subdomain'` olarak gider. Gerekçe: PSL bağımlılığı olmadan %100 güvenilir tespit + kullanıcının açık niyeti ("tıklayıp ayarlayabilsin") + sıfır-bağımlılık felsefesi korunur.

**A2 — Talimatlar tipe göre üretilir (tek gerçek kaynak: backend `withInstructions()`).**
apex → 3 kayıt: A (`@` → serverIp, yalnız serverIp configliyse), CNAME (`www` → cnameTarget), TXT (`_beylink-verify` → token, opsiyonel). subdomain → 2 kayıt: CNAME (alt alan → cnameTarget), TXT (`_beylink-verify.<tam-domain>` → token, opsiyonel). Subdomain'de **A kaydı YOK, www YOK**. Frontend `dnsRows()` yalnız `domain.kind`'e göre render eder (talimat mantığı tek yerde: backend). Gerekçe: apex/subdomain dallanması iki yerde tekrarlanmaz; frontend "aptal" kalır.

**A3 — Subdomain CNAME "Host" değeri tam FQDN gösterilir + sağlayıcı ipucu.**
Subdomain CNAME satırında Host = tam alt alan adı (`links.siteniz.com`) gösterilir; altında ipucu: "Bazı DNS sağlayıcıları yalnızca kök alan adınızın önündeki kısmı ister (ör. `links`)." Gerekçe: PSL olmadan kök/etiket sınırı kesin bilinemez; FQDN her zaman doğru (Cloudflare tam adı kabul eder, Namecheap/GoDaddy yalnız etiketi ister → ipucu ikisini de kapsar). Doğruluk + zero-dep.

**A4 — www daima apex-kanonik kalır; subdomain modu yalnız www-DIŞI alt alanlar içindir.**
`normalizeDomain` www-strip davranışı KORUNUR (`www.x.com` → `x.com`). Subdomain modunda normalize sonucu bir apex'e çökerse (etiket sayısı <3) girdi reddedilir (`errorSubdomainNeedsLabel`). Gerekçe: mevcut apex-www kanonik yönlendirme mantığı (Caddy 301) bozulmaz; kullanıcı yanlışlıkla `www.x.com`'u subdomain diye ekleyemez.

**A5 — `kind` sütunu saklanır (türetilmez), `ensureColumn` ile idempotent migrasyon.**
`custom_domains`'e `kind TEXT NOT NULL DEFAULT 'apex'`. Mevcut satırlar (hepsi apex-tarzı eklenmişti) `apex` alır → geriye-uyum tam. Gerekçe: her istekte türetmek yerine kullanıcının açık seçimini kalıcı saklamak talimat/doğrulama mantığını basitleştirir; `ensureColumn` deseni repo'da yerleşik.

**A6 — Cloudflare/proxy uyarısı her iki tipte de görünür, bilgi tonunda, i18n'li.**
DNS talimat kartında kısa bir uyarı bloğu (başlık + 1 paragraf). Hem apex hem subdomain akışında gösterilir (ikisi de proxy TURUNCU olursa kırılır). Bilgi tonu (pazarlama değil) → i18n-translator ile 7 dile. Gerekçe: kök neden ikisi için ortak; kullanıcı özelliğe her girdiğinde görmeli.

**A7 — Kapsam sınırları (DEĞİŞMEZ).** Yalnız bu iki parça. KAPSAM DIŞI (plana KONMAZ): docker-compose port değişikliği, trust proxy 2→3 / Caddy `trusted_proxies`, Cloudflare hesap kurulumu, rate-limit değişiklikleri. A6 (hesap başına 1 domain), fail-closed gating, `tls-check` 200/403 semantiği, gerçek veri (DEMO/MASSSKAA), `username` slug DOKUNULMAZ.

---

## B. TEKNİK MİMARİ (dosya-dosya)

**B1 — DB (`backend/src/db/migrate.js`).** Mevcut `ensureColumn(table, column, definition)` deseniyle tek satır:
```js
ensureColumn('custom_domains', 'kind', "TEXT NOT NULL DEFAULT 'apex'");
```
(190–206. satırlardaki `CREATE TABLE custom_domains` bloğunun hemen ardındaki `ensureColumn(...)` yığınına eklenir.) Mevcut satırlar `apex` alır. CHECK kısıtı eklenmez (SQLite ALTER ADD CHECK sınırlı); geçerlilik controller'da doğrulanır.

**B2 — Model (`backend/src/models/domainModel.js`).**
- `normalizeDomain` DEĞİŞMEZ (www-strip korunur; subdomain zaten korunuyor — KEŞİF #1).
- `create({ userId, domain, targetProfileId, verifyToken, kind = 'apex' })` → INSERT'e `kind` kolonu eklenir.
- `listByUser`/`findById`/`findByDomain` zaten `SELECT *` → `kind` otomatik döner.
- (Not: `subdomainLabel` gibi bir etiket-ayrıştırıcı EKLENMEZ — A3 gereği FQDN gösterilecek, PSL yok.)

**B3 — Controller (`backend/src/controllers/domainController.js`).**
- `withInstructions(row)` → `row.kind`'e göre dallanır. Dönen `instructions` objesi:
  - apex: `{ kind:'apex', aRecord: serverIp||null, cnameHost:'www', cnameTarget, txtHost:'_beylink-verify.<domain>', txtValue }`
  - subdomain: `{ kind:'subdomain', aRecord:null, cnameHost:'<tam-domain>', cnameTarget, txtHost:'_beylink-verify.<domain>', txtValue }`
  - (`kind` üst seviye row alanında da döner; frontend hem `row.kind` hem `instructions.kind` görebilir.)
- `createDomain` → `req.body.kind` okunur (`'apex'|'subdomain'`, geçersiz/boş → `'apex'`). `normalizeDomain` sonrası: `kind==='subdomain'` ise etiket sayısı (`domain.split('.').length`) **<3** ise `badRequest(errorSubdomainNeedsLabel-metni, 'domain')`. `domainModel.create({ ..., kind })`.
- `verifyDomainNow` → `verifyDomain(row.domain, { kind: row.kind, verifyToken: row.verify_token })`.
- `tlsCheck` DEĞİŞMEZ (KEŞİF #6).

**B4 — Doğrulama (`backend/src/services/domainVerify.js`).**
- İmza: `verifyDomain(domain, { kind='apex', verifyToken, resolver, serverIp, cnameTarget } = {})`.
- `kind==='subdomain'` → önce `resolveCname` (dns_cname), eşleşmezse `resolve4` (dns_a) yedeği. `kind==='apex'` → mevcut sıra (önce A, sonra CNAME). İkisi de fallback yapabilir → OR mantığı korunur. TXT bloğu değişmez.
- Üretim davranışı korunur (varsayılan resolver = `node:dns/promises`, serverIp/cnameTarget = config). Test enjeksiyonu (`resolver`) korunur.

**B5 — Middleware (`backend/src/middleware/resolveHost.js`).** Kod DEĞİŞMEZ; yalnız satır 20–22 yorumu güncellenir ("custom_domains artık apex + subdomain satırlarını verbatim saklar; www-strip yalnız www→apex kanonikliği içindir").

**B6 — Frontend (`frontend/src/pages/DomainsPage.jsx`).**
- Ekleme formu: apex/subdomain toggle (segmented control, `kind` state). Placeholder tipe göre (`domains.addPlaceholder` / `domains.addPlaceholderSubdomain`). Heuristik ön-seçim: input `.` sayısı ≥2 (etiket ≥3) → subdomain önerilir; kullanıcı override edebilir. `create()` gövdesine `kind` eklenir: `api.post('/domains', { domain: value, kind })`.
- `dnsRows(domain, t)` → `domain.kind`'e göre dallanır:
  - apex: mevcut 3 satır (A `@` yalnız `instructions.aRecord` doluysa, CNAME `www`, TXT).
  - subdomain: 2 satır → CNAME (host = `instructions.cnameHost` = FQDN, label `domains.dnsSubdomainCnameLabel`, hint `domains.dnsSubdomainCnameHint`), TXT. A satırı YOK.
- DNS kartına Cloudflare uyarı bloğu (başlık `domains.dnsProxyWarningTitle` + metin `domains.dnsProxyWarning`) — `dnsTitle`/`dnsIntro` altına, tablonun üstüne, uyarı stili (ör. `bg-warning/10`).

**B7 — Caddyfile / docker / nginx.** DEĞİŞMEZ (KEŞİF #5). Task 4'te yalnız DAVRANIŞ doğrulanır (subdomain host 301'e takılmıyor, catch-all karşılıyor).

**B8 — i18n parite (KRİTİK).** 10 yeni anahtar (bkz. §I) **9 dosyaya birden** eklenir: `en`=gerçek, `tr`=gerçek (§I metinleri), diğer 7 dil=**EN placeholder** (parite yeşil kalsın + `createT` fallback zaten İngilizce gösterir). Task 3 bu 7 placeholder'ı gerçek çeviriyle değiştirir. Hiçbiri çoğul değil (tekil anahtarlar) → CLDR varyantı gerekmez. `{...}` placeholder içermezler → placeholder-parite riski yok.

---

## C. GÖREVLER (Task / Alt-Task) — dosya · ne · sorumlu(model/effort) · bağımlılık · DoD

### Task 1 — Backend: subdomain-farkında model + talimat + doğrulama `[Parça 2 · orkestratör/mühendislik · Opus · high]`

- **1.1 — Migrasyon (`kind` sütunu).**
  - Dosya: `backend/src/db/migrate.js`.
  - Ne: `custom_domains` `CREATE TABLE` bloğundan sonraki `ensureColumn(...)` yığınına `ensureColumn('custom_domains', 'kind', "TEXT NOT NULL DEFAULT 'apex'");` ekle. `npm run migrate` çalıştır, `PRAGMA table_info(custom_domains)` ile `kind` doğrula.
  - Sorumlu: orkestratör (Opus·high).
  - Bağımlılık: yok (ilk adım). Açar: 1.2/1.3.
  - DoD: `kind` kolonu var; mevcut satırlar `apex`; migrate ikinci kez hatasız (idempotent).

- **1.2 — Model `create` + normalize koruması.**
  - Dosya: `backend/src/models/domainModel.js`.
  - Ne: `create()` imzasına `kind = 'apex'` ekle, INSERT'e `kind` kolonu ekle (`INSERT INTO custom_domains (user_id, domain, target_profile_id, verify_token, kind) VALUES (?,?,?,?,?)`). `normalizeDomain` DEĞİŞMEZ.
  - Sorumlu: orkestratör (Opus·high).
  - Bağımlılık: 1.1. Açar: 1.3.
  - DoD: `create({kind:'subdomain'})` satırı `kind='subdomain'` yazar; kind verilmezse `apex`; `listByUser` `kind` döndürür.

- **1.3 — Controller: `withInstructions` tip-farkında + `createDomain` kind + validasyon.**
  - Dosya: `backend/src/controllers/domainController.js`.
  - Ne: `withInstructions(row)`'u §B3'teki apex/subdomain şekline göre dallandır (`aRecord` subdomain'de null, `cnameHost` apex='www'/subdomain=FQDN, `kind` döner). `createDomain`'de `req.body.kind` oku (default 'apex'); subdomain + etiket<3 → `badRequest(...)` (mesaj §I `errorSubdomainNeedsLabel` TR/EN sabiti değil — controller'daki mevcut TR hata-mesajı deseniyle tutarlı kısa TR metin; kullanıcıya i18n frontend'de gösterilir). `domainModel.create({..., kind})`. `verifyDomainNow` → `verifyDomain(row.domain, { kind: row.kind, verifyToken: row.verify_token })`.
  - Sorumlu: orkestratör (Opus·high).
  - Bağımlılık: 1.2. Açar: 1.4, Task 2.
  - DoD: apex create → instructions A(@)+CNAME(www)+TXT; subdomain create → CNAME(FQDN)+TXT, `aRecord:null`, `kind:'subdomain'`; subdomain + 2-etiket girdi → 400.

- **1.4 — Doğrulama servisi: kind-farkında yöntem sırası.**
  - Dosya: `backend/src/services/domainVerify.js`.
  - Ne: `verifyDomain` imzasına `kind='apex'` ekle; subdomain'de CNAME birincil (dns_cname), apex'te A birincil (mevcut). OR fallback korunur, TXT bloğu değişmez, resolver enjeksiyonu korunur.
  - Sorumlu: orkestratör (Opus·high).
  - Bağımlılık: 1.3. Açar: Task 4.1 (mock testleri).
  - DoD: sahte resolver ile subdomain CNAME→`cname.beylink.org` → `ok:true, method:'dns_cname'`; apex A→serverIp → `dns_a`; TXT uyuşmazlığı → `ok:false`; üretim varsayılan davranışı değişmedi.

- **1.5 — resolveHost yorum güncellemesi (kod no-op).**
  - Dosya: `backend/src/middleware/resolveHost.js`.
  - Ne: Yalnız yorumu güncelle (subdomain verbatim saklanır açıklaması). Mantık değişmez.
  - Sorumlu: orkestratör (Opus·high).
  - Bağımlılık: yok. DoD: yorum güncel; davranış değişmedi (Task 4 host-routing testiyle doğrulanır).

- **DoD (Task 1):** yerelde `Host` simülasyonu gerektirmeyen birim doğrulamalar geçer (create/instructions/verify-mock); backend `npm run migrate` temiz; mevcut 19 domain testi kırılmadı (henüz yeni testler yok — Task 4).

### Task 2 — Frontend: tip seçimi + subdomain talimatları + Cloudflare uyarısı + i18n seed `[Parça 1 + Parça 2 · orkestratör/mühendislik · Opus · high]`

- **2.1 — Ekleme formu: apex/subdomain toggle. [Parça 2]**
  - Dosya: `frontend/src/pages/DomainsPage.jsx`.
  - Ne: `kind` state + segmented toggle (2 buton: `domains.kindApex` / `domains.kindSubdomain`, altında `kindApexHint`/`kindSubdomainHint`). Heuristik ön-seçim (input `.` sayısı ≥2 → subdomain). Placeholder tipe göre. `create()` → `api.post('/domains', { domain: value, kind })`. Boş/geçersiz hataları mevcut `error` mekanizmasıyla (yeni `errorSubdomainNeedsLabel` backend'den 400 gelince gösterilir).
  - Sorumlu: orkestratör (Opus·high). Bağımlılık: Task 1.3.
  - DoD: toggle çalışır, kind backend'e gider, subdomain modda placeholder değişir.

- **2.2 — `dnsRows()` tip-farkında render. [Parça 2]**
  - Dosya: `frontend/src/pages/DomainsPage.jsx`.
  - Ne: `dnsRows(domain, t)`'i `domain.kind` (veya `instructions.kind`) ile dallandır. subdomain: CNAME satırı host=`instructions.cnameHost` (FQDN), label/hint yeni subdomain anahtarları; A satırı YOK; TXT korunur. apex: mevcut davranış (A `@` yalnız `aRecord` doluysa, CNAME `www`, TXT).
  - Sorumlu: orkestratör (Opus·high). Bağımlılık: 2.1 + Task 1.3.
  - DoD: subdomain domaininde tabloda CNAME(FQDN)+TXT görünür, A satırı yok; apex domaininde eski 3-satır korunur.

- **2.3 — Cloudflare/proxy uyarı bloğu. [Parça 1]**
  - Dosya: `frontend/src/pages/DomainsPage.jsx`.
  - Ne: DNS kartına (tablonun üstü) uyarı bloğu: başlık `t('domains.dnsProxyWarningTitle')` + metin `t('domains.dnsProxyWarning')`, `bg-warning/10` benzeri stil + `AlertTriangle`/`Info` ikonu. Hem apex hem subdomain akışında görünür.
  - Sorumlu: orkestratör (Opus·high). Bağımlılık: 2.4 (anahtarlar).
  - DoD: uyarı her domain tipinde DNS kartında render olur.

- **2.4 — i18n seed (10 anahtar × 9 dosya). [Parça 1 + Parça 2]**
  - Dosya: `frontend/src/locales/{tr,en,ru,es,de,fr,pt,it,ja}.json`.
  - Ne: §I'deki 10 anahtarı 9 dosyaya ekle: `en`=§I gerçek EN, `tr`=§I gerçek TR, diğer 7=**EN placeholder** (birebir EN değeri). Anahtarlar: `domains.kindApex`, `domains.kindSubdomain`, `domains.kindApexHint`, `domains.kindSubdomainHint`, `domains.addPlaceholderSubdomain`, `domains.dnsSubdomainCnameLabel`, `domains.dnsSubdomainCnameHint`, `domains.errorSubdomainNeedsLabel`, `domains.dnsProxyWarningTitle`, `domains.dnsProxyWarning`.
  - Sorumlu: orkestratör (Opus·high) — §I'deki HAZIR metinleri transkribe eder (içerik uydurmaz; kaynak metin planda). Bağımlılık: yok. Açar: Task 3.
  - DoD: `npm run i18n:check` (frontend) 9-yönlü parite yeşil (yeni anahtarlar 9 dosyada), em-dash 0, Türkiye/KVKK/GDPR 0.

- **DoD (Task 2):** Tarayıcıda uçtan uca (throwaway Pro Plus kullanıcı): apex ekle → 3-satır talimat + Cloudflare uyarısı; subdomain ekle → CNAME(FQDN)+TXT (A yok) + uyarı; toggle çalışır; `i18n:check` + `build` yeşil.

### Task 3 — Çok dilli çeviri (yeni 10 anahtar → ru/es/de/fr/pt/it/ja) `[Parça 1 + Parça 2 · i18n-translator devri · Sonnet · xhigh]`

Her dil ayrı alt-görev: o dilin **EN placeholder** anahtarları (§I'deki 10 anahtar) gerçek çeviriyle değiştirilir. Mekanik UI microcopy → **i18n-translator** (Sonnet, effort **xhigh** — garanti marjı). Devir mekaniği §D'de.

- **3.ru · 3.es · 3.de · 3.fr · 3.pt · 3.it · 3.ja** — her biri o dilin 10 anahtarını çevirir.
- Guard: em-dash (—) YOK, Türkiye/KVKK/GDPR YOK, placeholder yok (bu anahtarlar `{}` içermez), çoğul yok. DeepL DUR-KAL (456/429).
- Sorumlu: i18n-translator (Sonnet·xhigh), dil başına ayrı devir. Bağımlılık: Task 2.4 (EN kaynak + placeholder hazır).
- **DoD (her dil):** o dilde placeholder kalmadı (10 anahtar gerçek çeviri); `i18n:check` 9-yönlü yeşil; `build` yeşil; guard'lar temiz.

### Task 4 — Test + doğrulama `[Parça 1 + Parça 2 · orkestratör/mühendislik · Opus · high]`

- **4.1 — Domain testleri güncelle/ekle.**
  - Dosya: `backend/src/tests/domains.tests.js`.
  - Ne (mevcut 19 teste ek/güncelleme):
    - **Güncelle** `domains.model-normalize-domain-strips-scheme-www-path`: subdomain korunuyor assert'i (`normalizeDomain('links.example.com') === 'links.example.com'`); www hâlâ apex'e çöküyor (`normalizeDomain('www.example.com') === 'example.com'`).
    - **Ekle** `domains.create-subdomain-instructions-cname-only`: subdomain create → `instructions.kind==='subdomain'`, `instructions.aRecord` null, `instructions.cnameHost` = tam domain, TXT var; A satırı üretilmiyor.
    - **Ekle** `domains.create-subdomain-needs-label-400`: subdomain modda 2-etiketli girdi (`siteniz.com`) → 400.
    - **Ekle** `domains.create-apex-instructions-regression`: apex create → `instructions.cnameHost==='www'`, `aRecord` config'e göre; regresyon guard.
    - **Ekle** `domains.verify-subdomain-cname-match`: sahte resolver ile `verifyDomain(sub, {kind:'subdomain'})` → CNAME eşleşme → `ok:true, method:'dns_cname'`.
    - **Ekle** `domains.host-routing-subdomain-serves-target`: aktif subdomain satırı + `hostFetch('/public/', 'links.<uniq>.example')` → 200 + doğru profil; own slug 200; cross-owner 404.
    - **Ekle** `domains.tls-check-subdomain-active-200`: aktif subdomain → `tls-check` 200; pending/plan-düşük → 403 (fail-closed korunur).
  - Sorumlu: orkestratör (Opus·high). Bağımlılık: Task 1 (backend). 4.1 backend testleri Task 3 çevirisine paralel koşabilir.
  - DoD: yeni testler izole çalıştırmada geçer; kategori "Özel Alan Adı" test sayısı 19'dan artar (registry'de otomatik toplanır).

- **4.2 — Tam paket + i18n + build.**
  - Ne: `testRunner.startAllTests` (veya admin `POST /api/admin/tests/run-all`) bir kez → yeni testler dahil; regresyon YOK (bilinen 7 rate-limit self-loopback kırılganlığı hariç — `_branded-domain-progress.md` Task 2 notunda belgeli, bu işle İLGİSİZ). Frontend `npm run i18n:check` + `npm run build` yeşil.
  - Sorumlu: orkestratör (Opus·high). Bağımlılık: Task 1–3 tamam.
  - DoD: taban 195 + yeni testler; bilinen rate-limit-flaky dışında tam yeşil; i18n 9-parite + build yeşil.

- **4.3 — Caddyfile davranış doğrulaması (kod değişmeden).**
  - Ne: subdomain host'un www→apex 301'e TAKILMADIĞINI ve catch-all `:443`'ün karşıladığını gözden geçir (elle `Caddyfile` okuması + mantık teyidi; canlı Caddy gerekmez). Değişiklik YOK.
  - Sorumlu: orkestratör (Opus·high). DoD: subdomain host akışı Caddy tarafında bozulmuyor teyidi (not olarak progress'e).

---

## D. ORKESTRASYON PLANI (devir mekaniği) — KRİTİK

Bu işte tek subagent devri var: **yeni UI microcopy'nin 7 dile çevrilmesi** (Task 3). TÜM uygulama kodu (backend model/controller/verify/tests + frontend panel) ve EN/TR kaynak seed'i orkestratör tarafından yazılır (repo'nun yerleşik deseni). Çeviri ASLA orkestratör tarafından yapılmaz.

**D1 — Devir tablosu.**

| İş türü | Kim | Model / effort | Ne zaman |
|---|---|---|---|
| Backend kod (migrate/model/controller/verify/middleware) | Orkestratör | Opus · high | Task 1 |
| Frontend kod (panel toggle/dnsRows/uyarı) | Orkestratör | Opus · high | Task 2.1–2.3 |
| i18n EN/TR seed (§I metinleri, 10 anahtar × 9 dosya, 7 placeholder) | Orkestratör | Opus · high | Task 2.4 |
| **Yeni UI anahtarlarının 7-dil çevirisi** | **i18n-translator** | **Sonnet · xhigh** | Task 3 (dil başına) |
| Test yazımı + tam paket + build | Orkestratör | Opus · high | Task 4 |

**D2 — Ne zaman devredilir (DUR noktası).** Orkestratör Task 2.4'te EN/TR seed + 7 placeholder'ı yazıp `i18n:check` yeşilini gördükten SONRA DURUR ve her dili sırayla i18n-translator'a devreder. Orkestratör 7 dilin çevirisini KENDİ context'inde ASLA yapmaz (yarım kalmış olsa bile devreder — bu, `_branded-domain-progress.md`'deki "Task 1/3'te içerik değerini orkestratör yazdı, bu HATAYDI" dersinin doğrudan uygulamasıdır).

**D3 — Nasıl devredilir (kopyalanabilir devir şablonu).** Her dil için i18n-translator'a şu talimat verilir (`<LANG>` = ru/es/de/fr/pt/it/ja):

```
TARGET_LANG: <LANG>  (locale: <ru-RU|es-ES|de-DE|fr-FR|pt-BR|it-IT|ja-JP>)
GÖREV: BeyLink Özel Alan Adı panelindeki YENİ 10 UI anahtarının <LANG> çevirisi.
DOSYA: frontend/src/locales/<LANG>.json — YALNIZ aşağıdaki 10 anahtarın EN placeholder
       değerlerini gerçek <LANG> çevirisiyle DEĞİŞTİR (başka anahtara dokunma).

Çevrilecek anahtarlar (kaynak = en.json'daki gerçek EN + tr.json anlam çapraz-kontrolü):
  domains.kindApex
  domains.kindSubdomain
  domains.kindApexHint
  domains.kindSubdomainHint
  domains.addPlaceholderSubdomain      (örnek subdomain; "links" gibi teknik parça KORUNUR,
                                        yalnız gerekiyorsa yerelleştir — genelde AYNEN bırak)
  domains.dnsSubdomainCnameLabel
  domains.dnsSubdomainCnameHint
  domains.errorSubdomainNeedsLabel
  domains.dnsProxyWarningTitle
  domains.dnsProxyWarning

BAĞLAM (çeviri için gerekli her şey):
  - Bunlar bir link-in-bio panelinde "kendi alan adını bağla" DNS kurulum metinleri.
  - "Cloudflare", "CNAME", "TXT", "DNS", "SSL", "cname.beylink.org", "links.siteniz.com",
    "gri bulut / grey cloud", "turuncu / orange" TEKNİK terimler; marka/teknik doğruluğu KORU.
  - Ton: kısa, net, bilgilendirici (pazarlama değil).

KISITLAR (İHLAL = DUR):
  - em-dash (—, U+2014) KULLANMA (nokta/virgül kullan).
  - "Türkiye/Turkey/KVKK/GDPR/İstanbul..." gibi ülke/otorite/yargı referansı EKLEME.
  - Bu 10 anahtar {placeholder} İÇERMEZ; hiçbirine {..} EKLEME.
  - Çoğul yok; anahtar SAYISINI ve isimlerini değiştirme (parite birebir kalmalı).
  - DeepL kota/oran hatası (456/429) → DUR, yarım yazma, kaç anahtar bitti raporla.

BİTİRİNCE: yalnız <LANG>.json'daki bu 10 değeri değiştirdiğini teyit et; başka dosya/anahtar
           değişmedi. (Doğrulama + build orkestratörde.)
```

**D4 — Devirde bağlam bütünlüğü.** Yukarıdaki şablon subagent'ın ihtiyaç duyacağı HER ŞEYİ taşır: hedef dil+locale, tam anahtar listesi, kaynak (en+tr), korunacak teknik terimler, ton, tüm guard'lar (em-dash/Türkiye/placeholder/çoğul), DUR-KAL koşulu, bitiş teyidi. "Şunu çevir" gibi eksik devir YAPILMAZ.

**D5 — Orkestratörün ASLA kendi yapmayacağı işler.** (a) 7 dilin çevirisi (yarım kalsa bile i18n-translator'a devreder). (b) Marka/pazarlama tonu gereken metin üretimi (bu işte yok; gerekirse marketing-copywriter). Orkestratör YAPAR: tüm backend/frontend kodu, EN/TR kaynak seed'i (§I hazır metinlerden), testler, doğrulama.

**D6 — Devir sırası / yarış önlemi.** 7 dil 7 AYRI dosyaya yazar (`ru.json`…`ja.json`) → teorik olarak paralel. ANCAK `_branded-domain-progress.md` Task 5 deneyimi: paralel çağrılar DeepL kotasını tüketip DUR-KAL tetikledi. Bu yüzden **SIRALI devir** (bir dil bitince sonraki): `ru → es → de → fr → pt → it → ja`. Her dil bitiminde orkestratör `i18n:check` + `build` koşar, progress işaretler, zip yedek alır, sonra sıradaki dile geçer. Aynı dosyaya iki subagent aynı anda YAZMAZ.

---

## E. SIRA / BAĞIMLILIK

`Task 1 → Task 2 → Task 3 → Task 4`.

- **Task 1 (backend)** önce: `kind` + talimat + doğrulama temeli. Task 2 ve Task 4.1 buna bağlı.
- **Task 2 (frontend + i18n seed)**: Task 1.3 (kind API'si) sonrası. Task 2.4 EN kaynak + 7 placeholder üretir → Task 3'ün ön koşulu.
- **Task 3 (çeviri)** Task 2.4 bitmeden BAŞLAMAZ (EN kaynak hazır olmalı). Diller SIRALI (D6).
- **Task 4**: 4.1 backend testleri Task 1 sonrası (Task 3'e paralel koşabilir); 4.2 tam paket + build EN SON (Task 1–3 tamam).
- Oturum bölme: iş küçük; tek oturumda bitebilir. DeepL kotası DUR-KAL tetiklerse Task 3 kaldığı dilden devam eder (§F).

---

## F. GUARDRAIL + DUR-KAL

- **Yedek (git YOK):** Task 1 (migrasyon/DB) öncesi ve Task 3 (toplu locale yazımı) öncesi **zip snapshot** → `beylink-backups/beylink-backup-pre-<task>-<tarih>.zip` (repo klasörü; `node_modules`/`dist`/`.git` hariç). `beylink-backups/` yoksa oluştur.
- **Parite:** yeni anahtar DAİMA **9 dosyaya birden** (en gerçek, tr gerçek, 7 EN placeholder); her kayıttan sonra `i18n:check` + `build` YEŞİL kalmalı (PostToolUse hook zaten zorlar).
- **İçerik guard'ları:** em-dash (—) YOK; Türkiye/KVKK/GDPR/ülke-şehir referansı YOK (EN placeholder zaten temiz; §I metinleri guard-temiz yazıldı; çeviride subagent'a hatırlatıldı).
- **Fail-closed & güvenlik değişmezleri KORUNUR:** `tls-check` yalnız active + cap'li domaine 200; cross-owner slug 404; IDOR (başkasının domaini) 404; A6 hesap başına 1 domain. Subdomain bu değişmezleri DEĞİŞTİRMEZ (yalnız talimat/doğrulama tipini genişletir) → mevcut + yeni testlerle regresyon-korumalı.
- **Gerçek veri:** DEMO/MASSSKAA + `username` slug DOKUNULMAZ. Test verisi `bltest_z_%` prefix + FK-temiz temizlik (mevcut `cleanupTestUsers` deseni; `custom_domains` zaten temizlik kapsamında).
- **Kapsam kilidi (DUR):** docker port / trust proxy / Caddy trusted_proxies / Cloudflare hesap kurulumu / rate-limit AYARI bu planın DIŞINDA — bunlara dokunma isteği doğarsa DUR, kullanıcıya sor.
- **DUR-KAL koşulları:**
  1. **DeepL kota/oran (456/429):** dur, yarım yazma, kaç anahtar/hangi dil bitti raporla; kota yenilenince kaldığı dilden devam.
  2. **`i18n:check` veya `build` kırmızı:** sonraki adıma geçme, önce düzelt.
  3. **Bilinen 7 rate-limit-flaky DIŞINDA herhangi bir mevcut test regresyonu:** dur, incele (branded-domain değişikliğiyle ilgisiz olduğu doğrulanmadan devam etme).
  4. **PSL/domain-tipi belirsizliği plan dışına taşarsa** (ör. çok parçalı TLD edge-case): §A1/§H1 varsayılanını uygula, progress'e not düş, kapsamı GENİŞLETME.

---

## G. MODEL / EFFORT DAĞILIMI

| İş | Sorumlu | Model / effort | Gerekçe |
|---|---|---|---|
| Orkestratör varsayılanı (tüm kod + seed + test) | Orkestratör | **Opus · high** | Mevcut, test edilmiş özelliğin genişletilmesi; DNS/host semantiği + fail-closed değişmezleri özen ister ama net-yeni mimari/güvenlik yüzeyi yok. |
| 7-dil UI çevirisi | i18n-translator | **Sonnet · xhigh** | Mekanik/desen-belli microcopy çevirisi; "high" yerine garanti marjı için **xhigh**. |

**Ek güvenlik gözden geçirmesi (security-reviewer) GEREKMEZ:** net-yeni saldırı yüzeyi yok — cross-owner 404, IDOR 404, fail-closed `tls-check`, A6 değişmezleri korunuyor ve Task 4'te yeni subdomain testleriyle regresyon-korumaya alınıyor. Orkestratör bu değişmezleri DoD olarak doğrular. (Kullanıcı isterse ayrı bir güvenlik turu opsiyonel — §H8.)

---

## H. AÇIK SORULAR / KARARLAR (önerilen varsayılanlarla — "BAŞLA" denince varsayılanlar kabul sayılır)

- **H1 — Domain tipi UX'i.** Öneri: **tek input + apex/subdomain toggle** (etiket-sayısı heuristiğiyle ön-seçili, kullanıcı override eder). Alternatif: iki ayrı alan (alt-alan etiketi + kök) — daha kesin ama daha çok form; ya da saf oto-algılama (PSL gerektirir, riskli). **Varsayılan: toggle.**
- **H2 — Subdomain CNAME Host gösterimi.** Öneri: **tam FQDN** (`links.siteniz.com`) + "sağlayıcı yalnız ön eki isteyebilir (ör. links)" ipucu. Alternatif: yalnız etiket (PSL sınırı belirsiz → yanlış olabilir). **Varsayılan: FQDN + ipucu.**
- **H3 — `kind` saklama.** Öneri: **sütunda sakla** (`ensureColumn`, default 'apex'). Alternatif: her istekte türet (heuristik → kırılgan). **Varsayılan: sakla.**
- **H4 — www davranışı.** Öneri: **www daima apex-kanonik** (subdomain modu yalnız www-dışı alt alanlar; www girilirse apex'e çöker). **Varsayılan: değişmez (mevcut davranış korunur).**
- **H5 — Cloudflare uyarısı yeri/tonu.** Öneri: **DNS kartı içinde kısa bilgi bloğu**, bilgi tonu, i18n-translator ile 7 dile. Alternatif: daha vurgulu pazarlama tonu → marketing-copywriter (Opus). **Varsayılan: i18n-translator, bilgi tonu.**
- **H6 — Uyarının görünürlüğü.** Öneri: **her iki tipte de daima görünür** (apex+subdomain, ikisi de proxy'den etkilenir). Alternatif: yalnız hata durumunda. **Varsayılan: daima görünür.**
- **H7 — EN/TR kaynak metni kim yazsın.** Öneri: **§I'deki hazır metinler orkestratör tarafından seed edilir** (içerik planda, orkestratör uydurmaz). Alternatif: EN/TR authoring de i18n-translator'a devredilir. **Varsayılan: §I metinleri (seed).**
- **H8 — Ek güvenlik turu.** Öneri: **gerekmez** (mevcut + yeni testler değişmezleri koruyor). Alternatif: kısa bir güvenlik gözden geçirmesi eklenir. **Varsayılan: gerekmez.**
- **H9 — `domains.intro` metni.** Öneri: mevcut apex-odaklı intro **DEĞİŞMEZ** (değişirse 7 dilde bayatlar; kapsam artışı). Alternatif: subdomain'i de anan yeni intro (o zaman o anahtar da 7-dil re-çeviriye girer). **Varsayılan: değişmez.**

---

## I. ÖNERİLEN METİNLER (EN/TR kaynak — guard-temiz; orkestratör bunları seed eder, 7 dil çevrilir)

Aşağıdaki 10 anahtar 9 dosyaya eklenir: `en` = EN sütunu, `tr` = TR sütunu, diğer 7 = EN sütunu (placeholder). Hiçbiri em-dash / Türkiye referansı / `{placeholder}` içermez.

| Anahtar | EN (gerçek + 7 placeholder) | TR (gerçek) |
|---|---|---|
| `domains.kindApex` | Root domain | Ana alan adı |
| `domains.kindSubdomain` | Subdomain | Alt alan adı |
| `domains.kindApexHint` | Use your main domain, e.g. yoursite.com | Ana alan adınızı kullanın, ör. siteniz.com |
| `domains.kindSubdomainHint` | Use a subdomain, e.g. links.yoursite.com | Bir alt alan adı kullanın, ör. links.siteniz.com |
| `domains.addPlaceholderSubdomain` | links.yoursite.com | links.siteniz.com |
| `domains.dnsSubdomainCnameLabel` | Subdomain (CNAME) | Alt alan adı (CNAME) |
| `domains.dnsSubdomainCnameHint` | Points your subdomain to us. Some providers only ask for the part before your root domain (e.g. links). | Alt alan adınızı bize yönlendirir. Bazı sağlayıcılar yalnızca kök alan adınızın önündeki kısmı ister (ör. links). |
| `domains.errorSubdomainNeedsLabel` | For a subdomain, add a name before your root domain, e.g. links.yoursite.com | Alt alan adı için kök alan adınızın önüne bir ad ekleyin, ör. links.siteniz.com |
| `domains.dnsProxyWarningTitle` | Using Cloudflare or another proxy? | Cloudflare veya başka bir proxy mi kullanıyorsunuz? |
| `domains.dnsProxyWarning` | If your DNS is managed by Cloudflare or a similar proxy, add these records as DNS only (grey cloud), not proxied (orange cloud). While the proxy is on, verification and the SSL certificate cannot complete. | DNS kayıtlarınız Cloudflare veya benzeri bir proxy tarafından yönetiliyorsa bu kayıtları yalnızca DNS (gri bulut) olarak ekleyin, proxy'li (turuncu bulut) değil. Proxy açıkken doğrulama ve SSL sertifikası tamamlanamaz. |

---

**DURUM:** Plan yazıldı. §H açık soruları önerilen varsayılanlarla dolu. "BAŞLA" denince varsayılanlar kabul, Task 1'den başlanır. **Bu görevde KOD YAZILMADI** (yalnız planlama).
