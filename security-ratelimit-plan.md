# Güvenlik Sıkılaştırma — Rate Limit (Global Fallback + Hedefli Limitler + Bellek GC) — Uygulama Planı

> BeyLink backend güvenlik-sıkılaştırma işi. İKİ iş tek planda:
> **İş 1** — App seviyesinde global fallback limiter + suistimale açık uçlara (billing / upload / tls-check) hedefli sıkı limitler (ADDITIVE — mevcut auth/go/track limitleri KALIR).
> **İş 2** — Bellek-içi limiter'ın (`utils/rateLimit.js`) `Map`'inin sınırsız büyümesini önleyen periyodik süpürme (GC).
> Yaklaşım: yeni ağır bağımlılık YOK — mevcut `utils/rateLimit.js` genişletilir (proje "sıfır gereksiz npm bağımlılığı" felsefesi). **Bu görevde KOD YAZILMADI** (yalnız planlama).

## Bağlam

BeyLink tek `api` konteyneri, nginx (`web`) arkasında. `backend/src/app.js` → `app.set('trust proxy', 1)` → gerçek istemci IP `req.ip`'de (nginx X-Forwarded-For'un son güvenilir hop'u). Mevcut limiter (`backend/src/utils/rateLimit.js`) bellek-içi `Map`, yalnız **başarısız denemeleri** sayar; her limit controller içine ELLE gömülü; **global/orta-katman (middleware) limiter YOK** → yeni eklenen rota otomatik korunmuyor. **Global süpürme yok** → çok sayıda benzersiz IP'de `Map` sınırsız büyüyebilir.

**Kilit keşif — test muafiyet kancası hazır:** `globalThis.__beylinkTestRunning` bayrağı, in-house test paketi koşarken `services/testRunner.js` tarafından sunucu tarafında `true` yapılır (bitince `false`). Zaten `services/mailer.js` bunu demo-mod için kullanıyor. İstemci sahteleyemez (global değişken) → YENİ limitleri bu bayrakla muaf tutmak, 189 testin `127.0.0.1`'den seri koşarken yeni limite takılmamasını garantiler.

---

## A. KARARLAR (kilitli, gerekçeli) — hepsi kullanıcı onaylı (2026-07-11)

**A1 — Genel (global) fallback limiter: IP başına 300/dk.**
`app.js`'te tüm isteklere uygulanan orta-katman limiter. Anahtar `global:<req.ip>`, pencere 60 sn, blok 60 sn. **Muaf:** `/health` (uptime/monitoring), `/uploads/*` (tek profil sayfası birden çok statik GET üretir — düşük riskli), ve `__beylinkTestRunning` (test paketi). Gerekçe: elle limiti olmayan tüm rotalar (gelecekte eklenenler dahil) taban korumaya kavuşur; 300/dk tek insan kullanıcı için fazlasıyla bol, sadece otomasyonu/scraping'i sınırlar.

**A2 — Hedefli sıkı limitler (ADDITIVE, üç uç).**
- **Billing** (`POST /api/billing/topup` + `POST /api/billing/plan`): **kullanıcı-başı** `billing:<userId>`, **10/dk**. Gerekçe: `requireAuth` arkasında → user-başı anahtar IP-başından isabetli (ortak IP'deki masum kullanıcı etkilenmez); ödeme-intent / `order_ref` / DB satırı spam'ini sınırlar.
- **Upload** (avatar/kapak/galeri: `POST /api/profiles/:id/{avatar,cover,gallery-image}`): **kullanıcı-başı** `upload:<userId>`, **20/dk**. Gerekçe: 5MB boyut limiti VAR ama sayı/hız limiti YOK → disk/bant suistimali; limiter multer'dan ÖNCE çalışır (dosya diske yazılmadan 429).
- **tls-check** (`GET /api/domains/tls-check`, public, auth YOK, Caddy on-demand TLS `ask` kapısı): **domain-başı** `tls:<normalizeDomain(query.domain)>` (domain yoksa `tls:ip:<req.ip>`), **30/dk**. Gerekçe: Caddy tek IP'den birçok domain için sorabilir → IP-başı anahtar legit çok-domain Caddy'yi boğardı; domain-başı anahtar tek kötü domaini sınırlar, legit sertifika alımı/yenilemesini BOZMAZ. 30/dk cömert (handshake seyrek + sertifika cache'li).

**A3 — Yaklaşım: mevcut `utils/rateLimit.js` genişletilir (express-rate-limit EKLENMEZ).**
Yeni middleware fabrikası (`createRateLimiter`) + her isteği sayan yardımcı + muafiyet, mevcut dosyaya eklenir. **Mevcut public API (`isBlocked` / `recordFailure` / `clearAttempts`) ve DEFAULTS DEĞİŞMEZ** → auth/go/track limitleri birebir korunur. Gerekçe: "sıfır bağımlılık" felsefesi + tek dosya, tek semantik.

**A4 — Test/loopback muafiyeti: `__beylinkTestRunning` bayrağı, YALNIZ yeni limitlere.**
Dört yeni limiter (global + billing + upload + tls-check) `globalThis.__beylinkTestRunning === true` iken atlanır. **Mevcut auth limitleri DEĞİŞMEZ** → bilinen 7 test hatası (Şifre Reset 3 + Rate Limit 1 + Güvenlik 2 + BTAG 1 flaky) KAPSAM DIŞI, bu iş onları ne düzeltir ne kötüleştirir. Gerekçe: bayrak sunucu-tarafı + spoof-edilemez; tam olarak in-house test paketini kapsar; eşik-yükseltme tek başına kırılgan olurdu (189 test dakikada 300'ü aşabilir).

**A5 — GC süpürme (İş 2): 5 dk aralık + `.unref()`.**
`setInterval` ile eski/expired bucket'lar süpürülür. **AKTİF bloklar silinmez** (blokta olan bir saldırgan sweep ile serbest kalmamalı). Interval `.unref()` → süreç çıkışını engellemez. Sweeper `index.js`'te (server entry) başlatılır → unit-test importları interval spawn etmez. Tek-süreç semantiği korunur (BeyLink tek konteyner). Yatay ölçekleme (Redis) = NOT, KAPSAM DIŞI.

**A6 — Ortak davranış: fail-open + Retry-After + 429.**
Tüm yeni limiter'lar **fail-open**: limiter'ın KENDİ beklenmedik hatası `next()` ile yutulur (legit trafiği engellemez); yalnız KASITLI 429 istemciye iletilir. 429 yanıtına `Retry-After` header'ı (kalan blok süresi, saniye) eklenir. 429 mesajı mevcut `tooManyRequests()` helper'ından (`utils/ApiError.js`) üretilir → `middleware/error.js` zaten `status/code` döndürüyor.

**A7 — Kapsam sınırları (DEĞİŞMEZ).**
Yalnız bu iki iş. KAPSAM DIŞI: `/api/domains/:id/verify` DNS throttle · public profil scraping (`/public/:username`) · `helmet` başlıkları · Redis/yatay ölçekleme · mevcut auth/go/track limitlerinin değeri veya davranışı · bilinen 7 test hatasının düzeltilmesi. Gerçek veri (DEMO/MASSSKAA) dokunulmaz.

---

## B. TEKNİK MİMARİ

**B1 — `utils/rateLimit.js` genişletme (tek çekirdek dosya, İş 1 + İş 2 ortak).**
Mevcut export'lar korunur. Eklenecekler (imza düzeyinde — tam kod uygulamada):

```
// --- İş 1: her isteği sayan karar + middleware fabrikası ---
// Mevcut recordFailure'a benzer ama semantik "her istek" (başarı/başarısızlık ayrımı yok).
// isBlocked kontrolü + sayaç artır; blokluysa kalan süreyi de döndürür.
function consume(key, opts) -> { blocked: boolean, retryAfterSec: number }

// Yeni limitler için ORTAK muafiyet (spoof-edilemez, sunucu-tarafı bayrak).
function isTestRunning() -> globalThis.__beylinkTestRunning === true

// Express middleware fabrikası.
// keyFn(req) -> string|null  (null => limiter atlanır, ör. req.user yoksa)
// exempt(req) -> boolean     (opsiyonel; global limiter path muafiyetleri için)
createRateLimiter({ keyFn, max, windowMs, blockMs, message, exempt }) -> (req,res,next) => {
  try {
    if (isTestRunning()) return next();          // A4
    if (exempt && exempt(req)) return next();    // A1 path muafiyetleri
    const key = keyFn(req);
    if (!key) return next();                      // anahtar üretilemezse geç
    const { blocked, retryAfterSec } = consume(key, { max, windowMs, blockMs });
    if (blocked) {
      if (retryAfterSec > 0) res.setHeader('Retry-After', String(retryAfterSec)); // A6
      return next(tooManyRequests(message));      // kasıtlı 429 → error middleware
    }
    return next();
  } catch { return next(); }                       // A6 fail-open
}

// --- İş 2: süpürme (GC) ---
// bucket'a stale zamanı eklenir: recordFailure/consume içinde b.staleAfter = now + max(windowMs, blockMs)
function sweep(now = Date.now()) -> silinenSayısı   // now > staleAfter && (!blockedUntil || now >= blockedUntil) => sil; AKTİF blok korunur
function startSweeper(intervalMs = 5*60*1000)       // setInterval(sweep).unref(); tek örnek (idempotent)
function stopSweeper()                              // clearInterval (test/kapanış)
// test-only introspection:
function __bucketCount() -> buckets.size
function __sweepNow() -> sweep(Date.now())
```

**Önemli:** `tooManyRequests` import edilir (`utils/ApiError.js` — zaten var). `recordFailure` içine `b.staleAfter` eklenmesi mevcut auth limitlerini ETKİLEMEZ (yalnız sweep için ek alan; okuma/blok mantığı aynı). `isBlocked` içindeki lazy-silme KORUNUR (sweep ek güvence).

**B2 — Mount noktaları (dosya-dosya).**
| Limiter | Dosya | Nereye | Anahtar | max/pencere/blok | Muafiyet |
|---|---|---|---|---|---|
| **Global** | `backend/src/app.js` | `cors` SONRASI, `express.json` ÖNCESİ (`app.use(globalLimiter)`) | `global:<req.ip>` | 300 / 60s / 60s | test + `/health` + `/uploads/*` |
| **Billing** | `backend/src/routes/billingRoutes.js` | `POST /topup` ve `POST /plan` route'una (router.use auth zincirinden SONRA çalışır) | `billing:<req.user.id>` | 10 / 60s / 60s | test |
| **Upload** | `backend/src/routes/profileRoutes.js` | avatar/cover/gallery route'una, `canEdit` + `upload.single()` ÖNCESİNE | `upload:<req.user.id>` | 20 / 60s / 60s | test |
| **tls-check** | `backend/src/routes/domainRoutes.js` | `GET /tls-check` route'una (auth'suz, `router.use` ÖNCESİ satır) | `tls:<normalizeDomain(query.domain)>` (yoksa `tls:ip:<req.ip>`) | 30 / 60s / 60s | test |

Global limiter mount sırası (yeni):
```
app.set('trust proxy', 1)
app.use(cors(...))
app.use(globalLimiter)      // <-- YENİ (json'dan önce → büyük gövde parse edilmeden 429)
app.use(express.json(...))
app.use(resolveHost)
...
```
`billing`/`upload`/`tls-check` limiter'ları `createRateLimiter` ile ilgili route dosyasında oluşturulur ve route'a inline eklenir. Billing/upload'da `keyFn` `req.user?.id` kullanır (auth middleware'den SONRA çalıştığı için doludur); tls-check `normalizeDomain` (`models/domainModel.js`'ten import) kullanır.

**B3 — Sweeper başlatma (`backend/src/index.js`).**
Mevcut boot adımlarının (`migrate()`, `startPoller()`, `reconcileTests()`) yanına `startRateLimitSweeper()` eklenir. Böylece unit-test dosyaları `rateLimit.js`'i import edince interval spawn olmaz (yalnız gerçek server entry başlatır).

**B4 — Test etkisi (KRİTİK — kötüleştirmeme garantisi).**
- Yeni dört limiter `__beylinkTestRunning` iken ATLANIR → 189 test seri koşarken yeni limite HİÇ takılmaz. Bilinen 7 hata (eski auth limitlerinden) aynen kalır — bu iş onlara dokunmaz.
- Yeni limiter'ların 429 davranışı **unit-test** ile doğrulanır (HTTP değil): `createRateLimiter`/`consume`/`sweep` doğrudan sahte `req`/`res` objesiyle çağrılır → muafiyet bypass edilir, davranış izole test edilir. Böylece "muaf olduğu için test edilemiyor" paradoksu çözülür.

**B5 — Yeni/değişen dosyalar.**
- Değişen: `backend/src/utils/rateLimit.js` (çekirdek genişletme), `backend/src/app.js` (global mount), `backend/src/routes/billingRoutes.js`, `backend/src/routes/profileRoutes.js`, `backend/src/routes/domainRoutes.js`, `backend/src/index.js` (sweeper başlat), `backend/src/tests/rateLimit.tests.js` (yeni unit testler).
- Yeni dosya YOK (mevcut dosyalar genişletilir).
- Frontend DOKUNULMAZ → PostToolUse hook'un `i18n-check` + frontend build'i etkilenmez (backend değişikliği; hook yeşil kalır).

---

## C. GÖREVLER (Task / Alt-Task) — dosya · ne · sorumlu(model/effort) · bağımlılık · DoD

### Task 1 — İş 1: Global fallback limiter + hedefli sıkı limitler `[orkestratör/mühendislik]`

**1.1 — Çekirdek: `createRateLimiter` + `consume` + muafiyet**
- (a) Dosya: `backend/src/utils/rateLimit.js`
- (b) Ne: B1'deki `consume(key, opts)`, `isTestRunning()`, `createRateLimiter({keyFn,max,windowMs,blockMs,message,exempt})` eklenir. `tooManyRequests` import edilir. Fail-open (try/catch→next), Retry-After (kalan blok sn), anahtar `null` ise atla. **Mevcut `isBlocked`/`recordFailure`/`clearAttempts`/`DEFAULTS` DEĞİŞTİRİLMEZ.**
- (c) Sorumlu: orkestratör/mühendislik (Opus, effort: high — güvenlik-hassas ama desen-belli)
- (d) Bağımlılık: yok (çekirdek). Task 1.2–1.5 ve Task 2 buna dayanır. **Aynı dosya Task 2.1'de de düzenlenecek → sıralı (önce 1.1, sonra 2.1).**
- (e) DoD: `node -e` ile modül import edilebilir; `createRateLimiter` fonksiyon döndürür; sahte `req` ile muafiyet (`__beylinkTestRunning=true`) `next()` çağırır; eşik aşımında `next(err)` 429+Retry-After ile çağrılır. Mevcut export'lar hâlâ mevcut.

**1.2 — Global limiter mount**
- (a) Dosya: `backend/src/app.js`
- (b) Ne: `createRateLimiter` ile global limiter: `keyFn: req => 'global:'+req.ip`, max 300, windowMs 60000, blockMs 60000, `exempt: req => req.path==='/health' || req.path.startsWith('/uploads')`. `app.use(cors(...))` SONRASI, `app.use(express.json(...))` ÖNCESİ mount.
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: 1.1. Diğer route limiter'larından bağımsız (paralel yazılabilir ama tek elden sıralı).
- (e) DoD: server açılır; `/health` limite takılmaz (muaf); normal API isteği 300/dk altı geçer; sınır aşımı (unit/manuel) 429+Retry-After. `express.json`'dan önce (büyük gövde parse edilmeden).

**1.3 — Billing limiter**
- (a) Dosya: `backend/src/routes/billingRoutes.js`
- (b) Ne: `createRateLimiter` ile `billingLimiter` (`keyFn: req => req.user ? 'billing:'+req.user.id : null`, 10/60s/60s). `router.post('/topup', billingLimiter, createTopup)` ve `router.post('/plan', billingLimiter, purchasePlan)`. (subpack/invoice DOKUNULMAZ — kullanıcı yalnız topup+plan istedi.) Limiter `router.use(requireAuth,...)` zincirinden sonra çalışır → `req.user` dolu.
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: 1.1
- (e) DoD: topup+plan route'ları limiter'lı; `req.user.id` anahtarı doğru; test muaf; 11. istek (unit/manuel, muafiyet kapalıyken) 429.

**1.4 — Upload limiter**
- (a) Dosya: `backend/src/routes/profileRoutes.js`
- (b) Ne: `createRateLimiter` ile `uploadLimiter` (`keyFn: req => req.user ? 'upload:'+req.user.id : null`, 20/60s/60s). Üç upload route'unda `canEdit`/`upload.single()` ÖNCESİNE eklenir: `router.post('/:id/avatar', uploadLimiter, canEdit, upload.single('image'), uploadAvatar)` (cover + gallery-image aynı). Böylece limit aşımında dosya diske YAZILMAZ.
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: 1.1
- (e) DoD: üç upload route'u limiter'lı ve limiter multer'dan ÖNCE; test muaf; 21. yükleme (muafiyet kapalıyken) 429, dosya yazılmadı.

**1.5 — tls-check limiter**
- (a) Dosya: `backend/src/routes/domainRoutes.js`
- (b) Ne: `createRateLimiter` ile `tlsLimiter` (`keyFn: req => 'tls:'+(normalizeDomain(req.query.domain) || 'ip:'+req.ip)`, 30/60s/60s). `normalizeDomain` `../models/domainModel.js`'ten import. `router.get('/tls-check', tlsLimiter, tlsCheck)` (auth'suz satır, `router.use` ÖNCESİ). tls-check'in 200/403 semantiği KORUNUR; 429 ayrı katman.
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: 1.1
- (e) DoD: tls-check limiter'lı; anahtar domain-başı (aynı Caddy'den farklı domainler AYRI sayılır → legit çok-domain boğulmaz); test muaf; aynı domain 31. istek (muafiyet kapalıyken) 429; `active` domain hâlâ 200, kayıtsız hâlâ 403.

### Task 2 — İş 2: Bellek-içi limiter'a periyodik süpürme (GC) `[orkestratör/mühendislik]`

**2.1 — Sweep + bucket TTL + start/stop + introspection**
- (a) Dosya: `backend/src/utils/rateLimit.js` (**Task 1.1 ile AYNI dosya → 1.1'den SONRA düzenlenir, sıralı; yarış yok çünkü tek elden**)
- (b) Ne: `recordFailure`/`consume` içinde bucket'a `staleAfter = now + Math.max(windowMs, blockMs)` yaz. `sweep(now)`: `now > b.staleAfter && (!b.blockedUntil || now >= b.blockedUntil)` olan bucket'ları sil (AKTİF blok = `now < blockedUntil` KORUNUR). `startSweeper(intervalMs = 5*60*1000)`: `setInterval(()=>sweep(), intervalMs)` + `.unref()` + idempotent (varsa yeniden başlatma). `stopSweeper()`. Test-only: `__bucketCount()`, `__sweepNow()`. Lazy-silme (`isBlocked`) KORUNUR.
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: 1.1 (aynı dosya, sonra). Task 2.2 buna dayanır.
- (e) DoD: `sweep` stale bucket'ı siler, AKTİF bloğu korur (unit); `startSweeper` interval `.unref()`'li (süreç çıkışını engellemez); `__bucketCount` sweep sonrası düşer; auth limit testleri (`rl.*`) hâlâ yeşil (staleAfter eklenmesi davranışı bozmadı).

**2.2 — Sweeper başlatma**
- (a) Dosya: `backend/src/index.js`
- (b) Ne: `startRateLimitSweeper()` import + `startPoller()`/`reconcileTests()` yanına çağrı. (İsim `rateLimit.js`'teki export'la eşleşmeli — ör. `startSweeper` re-export `startRateLimitSweeper`.)
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: 2.1
- (e) DoD: server açılışında sweeper başlar (log/manuel doğrulama); `rateLimit.js`'i import eden unit testlerde interval spawn OLMAZ (yalnız index.js başlatır).

### Task 3 — Doğrulama + güvenlik denetimi `[orkestratör + security-reviewer devri]`

**3.1 — Yeni unit testler**
- (a) Dosya: `backend/src/tests/rateLimit.tests.js` (kategori: `Rate Limit`)
- (b) Ne: HTTP değil UNIT (muafiyet bypass'ı için `createRateLimiter`/`consume`/`sweep`'i doğrudan çağır): (1) global limiter eşik aşımı → sahte `req`/`res`/`next` ile 300 geçer, 301. blocked + Retry-After set; (2) muafiyet: `__beylinkTestRunning=true` → `next()` çağrılır (429 yok), `false`+eşik → 429; (3) billing/upload keyFn `req.user.id` → doğru anahtar, `req.user` yoksa `null` (atla); (4) tls-check keyFn domain-normalize (farklı domain = ayrı bucket); (5) sweep: stale silinir + AKTİF blok korunur + `__bucketCount` düşer; (6) fail-open: `keyFn` throw ederse `next()` (hatasız geçer). Test finally'de `stopSweeper()`/`clearAttempts` ile izolasyon.
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: Task 1 + Task 2
- (e) DoD: yeni testlerin hepsi izole koşumda geçer.

**3.2 — Tam paket regresyon koşumu**
- (a) Dosya: — (çalıştırma: admin token ile `POST /api/admin/tests/run-all` veya test paneli)
- (b) Ne: Tüm paketi (yeni testler dahil) temiz sunucuda BİR KEZ koştur. Beklenti: **bilinen 7 hata (Şifre Reset 3 + Rate Limit 1 + Güvenlik 2 + BTAG 1 flaky) DIŞINDA regresyon YOK**; özellikle mevcut `rl.*` auth limit testleri yeşil (eski limitler değişmedi) ve yeni limiter muafiyeti sayesinde EK hata yok.
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: 3.1
- (e) DoD: geçen sayısı ≥ önceki taban (yeni testler dahil); yeni başarısızlık = yalnız bilinen 7; regresyon yoksa devam, VARSA DUR-KAL (F bölümü).

**3.3 — Güvenlik denetimi (subagent devri)**
- (a) Dosya: — (denetim; `security-reviewer` yalnız okur)
- (b) Ne: Uygulanan tüm limiter kodu bağımsız güvenlik denetiminden geçer: fail-open doğru mu, `__beylinkTestRunning`/`req.ip` muafiyeti spoof-edilebilir mi (XFF injection ile loopback/exempt taklidi), anahtar üretimi güvenli mi, bellek gerçekten sınırlı mı, sweep AKTİF bloğu koruyor mu, tls-check domain-başı anahtar legit Caddy'yi boğuyor mu, auth limitlerinde regresyon var mı. Bulgular önem sırasına göre döner; orkestratör Critical/High bulguları KENDİ düzeltir, sonra gerekirse yeniden denetletir.
- (c) Sorumlu: **security-reviewer** subagent (`~/.claude/agents/security-reviewer.md`) — **Opus · effort: extra**. (Devir formatı §D.) **Not:** subagent oluşturma/çalıştırmada sorun olursa bu adım ATLANIR (kullanıcı notu — plan+progress asıl çıktı); atlanırsa orkestratör §D'deki denetim listesini kendi gözden geçirir ve progress'e not düşer.
- (d) Bağımlılık: 3.2 (kod + testler yeşil olmalı — denetim son kapı)
- (e) DoD: security-reviewer verdict `PASS` veya `PASS WITH NOTES` (Critical/High yok); Critical/High çıkarsa orkestratör düzeltir → yeniden denetim → temiz.

**3.4 — Son kontrol (build/hook + guardrail teyidi)**
- (a) Dosya: —
- (b) Ne: Backend değişikliği olduğu için PostToolUse hook (frontend `i18n-check` + build) etkilenmez ama son bir teyit; server temiz açılıyor; `/health` çalışıyor; yedek/geri-dönüş noktası kayıtlı.
- (c) Sorumlu: orkestratör/mühendislik (Opus, high)
- (d) Bağımlılık: 3.3
- (e) DoD: server açılış temiz; `/health` 200; hook yeşil (backend değişikliği i18n/build'i bozmadı); progress tümü ✅.

---

## D. ORKESTRASYON PLANI (devir mekaniği) — KRİTİK

**D1 — Devir tablosu**
| İş türü | Sorumlu | Model / effort |
|---|---|---|
| Limiter çekirdek kodu (rateLimit.js) | Orkestratör/mühendislik | Opus · high |
| Mount + route entegrasyonu (app/billing/profile/domain routes) | Orkestratör/mühendislik | Opus · high |
| GC sweep + index.js başlatma | Orkestratör/mühendislik | Opus · high |
| Unit testler + tam paket koşumu | Orkestratör/mühendislik | Opus · high |
| **Güvenlik denetimi (son kapı)** | **security-reviewer (subagent)** | **Opus · extra** |

**D2 — Ne zaman devredilir / orkestratör ne yapar**
- Kod işlerinin TAMAMINI (Task 1, 2, 3.1, 3.2, 3.4) orkestratör KENDİ yapar — bunlar pattern-belli backend düzenlemeleri (bu projede kod orkestratör işidir; branded-domain precedent'i).
- **Orkestratörün kendi yapmayacağı tek iş: bağımsız güvenlik denetimi (Task 3.3).** Kod + testler yeşil olunca orkestratör DURUR ve `security-reviewer`'a devreder. Orkestratör güvenlik denetimini "göz kararı kendi context'inde" yapmaz — bağımsız göz için subagent'a verir (bu güvenlik-kritik işin ayrı denetim gerektiren doğası gereği). İstisna: subagent hatası → atla + kendi gözden geçir + not düş.

**D3 — Devir formatı (kopyalanabilir şablon — security-reviewer çağrısı)**
```
security-reviewer subagent'ını şu görevle çağır:

GÖREV: BeyLink backend rate-limit güvenlik-sıkılaştırmasının (İş 1 global+hedefli limitler, İş 2 GC)
uygulanmış kodunu READ-ONLY denetle. Kod YAZMA — bulguları önem sırasıyla döndür.

İNCELENECEK DOSYALAR:
- backend/src/utils/rateLimit.js  (createRateLimiter, consume, isTestRunning, sweep, startSweeper)
- backend/src/app.js              (global limiter mount + sırası)
- backend/src/routes/billingRoutes.js, profileRoutes.js, domainRoutes.js  (hedefli limitler)
- backend/src/index.js            (sweeper başlatma)
- backend/src/tests/rateLimit.tests.js  (yeni testler)

KİLİTLİ KARARLAR (relitigate ETME, uygulamanın bunlara sadık + güvenli olduğunu denetle):
- Global: IP başına 300/dk; muaf /health + /uploads/* + __beylinkTestRunning.
- Billing: kullanıcı-başı 10/dk. Upload: kullanıcı-başı 20/dk. tls-check: domain-başı 30/dk.
- Yaklaşım: mevcut utils/rateLimit.js genişletildi (express-rate-limit YOK).
- Test muafiyeti: globalThis.__beylinkTestRunning (sunucu-tarafı bayrak) YALNIZ yeni limitlere;
  eski auth/go/track limitleri değişmedi.
- Ortam: trust proxy 1 → req.ip = nginx X-Forwarded-For son güvenilir hop.

ÖZELLİKLE DOĞRULA:
1. Fail-open: limiter'ın kendi hatası next() ile yutuluyor mu; kasıtlı 429 hâlâ iletiliyor mu?
2. Anahtar spoof: XFF injection ile req.ip forge edilip loopback/exempt taklidi veya anahtar
   rotasyonu mümkün mü? __beylinkTestRunning istemciden set edilebilir mi (spoof)?
3. Bellek sınırı: benzersiz-anahtar seli Map'i sınırsız büyütebilir mi? sweep çalışıyor,
   interval .unref()'li ve AKTİF blok korunuyor mu? sweep↔okuma/yazma yarışı?
4. Sıra: upload limiter multer'dan ÖNCE mi (yetkisiz/limit-aşımı dosya yazmıyor)? billing limiter
   requireAuth'tan SONRA mı (req.user dolu)?
5. tls-check: domain-başı anahtar legit çok-domain Caddy'yi boğuyor mu; 200/403 semantiği bozuldu mu?
6. Regresyon: mevcut auth limitleri (isBlocked/recordFailure/clearAttempts + rl.* testleri) zarar gördü mü?

BİLİNEN/KAPSAM DIŞI: in-house test paketinde önceden var olan 7 hata (Şifre Reset 3 + Rate Limit 1 +
Güvenlik 2 + BTAG 1 flaky) bu işle İLGİSİZ — bunları bulgu sayma. Redis/yatay ölçekleme kapsam dışı.

ÇIKTI: Verdict (PASS / PASS WITH NOTES / CHANGES REQUIRED) + Verified OK + Findings (Critical→Low,
file:line) + sorular. Rapor dosyası YAZMA — bulguları doğrudan mesajda döndür.
```

**D4 — Bağlam bütünlüğü**
Devir talimatı, subagent'ın ihtiyaç duyduğu TÜM bağlamı içerir: kilitli kararlar (eşik/anahtar/muafiyet), ortam (trust proxy), inceleme dosyaları, doğrulanacak spesifik saldırı yolları, kapsam-dışı bilinen hatalar, çıktı formatı. Subagent eksik bilgiyle çalışmaz.

**D5 — Devir sırası / yarış önleme**
- `security-reviewer` yalnız-okuma (Write/Edit yok) → hiçbir dosyaya yazmaz → orkestratör koduyla yazma yarışı YOK.
- `rateLimit.js` iki alt-görevde (1.1 + 2.1) düzenlenir → orkestratör tek elden SIRALI yapar (önce 1.1 çekirdek, sonra 2.1 sweep) → yarış yok.
- Denetim (3.3) yalnız kod+testler yeşil olunca (3.2 sonrası) tetiklenir → yarım kodu denetlemez.

---

## E. SIRA / BAĞIMLILIK

`1.1 → (1.2 ∥ 1.3 ∥ 1.4 ∥ 1.5) → 2.1 → 2.2 → 3.1 → 3.2 → 3.3 → 3.4`

- **1.1 (çekirdek) önce** — diğer her şey `createRateLimiter`'a dayanır.
- 1.2–1.5 (mount'lar) birbirinden bağımsız; tek elden sıralı yazılır (paralelleştirilmez, hepsi kısa).
- **2.1, 1.1 ile AYNI dosya** (`rateLimit.js`) → 1.1'den SONRA (sweep, çekirdeğin üstüne).
- 2.2 (index.js) 2.1'den sonra.
- 3.1 (testler) tüm kod bitince; 3.2 (paket) 3.1'den sonra; 3.3 (denetim) 3.2 yeşil olunca; 3.4 en son.
- Oturum bölünmesi: iş küçük+tek-modül; tek oturumda bitebilir. Bölünürse doğal kesme noktası Task 1 sonu (İş 1 tam) veya Task 2 sonu (İş 2 tam).

---

## F. GUARDRAIL

- **Yedek (git YOK):** Task 1 öncesi zip snapshot (`beylink` klasörü, `node_modules`/`dist` hariç → `beylink-backups/beylink-backup-pre-ratelimit-*.zip`). En kritik dosya `backend/src/utils/rateLimit.js` (auth limitleri buna bağlı).
- **Geri-dönüş noktası:** `rateLimit.js`'te mevcut `isBlocked`/`recordFailure`/`clearAttempts`/`DEFAULTS` DEĞİŞTİRİLMEZ (yalnız eklenir) → auth/go/track limitleri risksiz. Sorun çıkarsa yeni export'ların mount'unu kaldırmak (route/app.js) çekirdeği bozmadan geri alır.
- **DUR-KAL koşulları:**
  1. Tam paket koşumunda (3.2) **bilinen 7 hata DIŞINDA** yeni başarısızlık (özellikle `rl.*` auth limit testleri kırılırsa) → DUR, yarım bırakma, hangi test/neden bozuldu raporla.
  2. security-reviewer (3.3) **Critical/High** bulgu döndürürse → düzeltmeden "bitti" işaretleme; düzelt → yeniden denetlet.
  3. `req.ip` muafiyet/anahtar spoof riski doğrulanırsa (loopback exempt eklenmişse XFF injection) → DUR, muafiyeti yalnız `__beylinkTestRunning`'e indir.
- **Riskli adımlar:** (i) global limiter mount **sırası** (`express.json` ÖNCESİ) — yanlış sıra büyük gövde parse'ını 429'dan önce yaptırır; (ii) **fail-open** — limiter kendi hatasında `next()` yapmalı (legit trafiği kesme); (iii) upload limiter **multer'dan önce** — yoksa limit-aşımı dosyayı diske yazar; (iv) sweep **AKTİF bloğu silmemeli** — silerse blokta olan saldırgan serbest kalır.
- **Değişmezler:** mevcut auth/go/track limitleri (değer + davranış) korunur; bilinen 7 test hatası bu işin sorumluluğu DEĞİL; gerçek veri (DEMO/MASSSKAA) dokunulmaz; frontend dokunulmaz (hook yeşil kalır); Redis/yatay ölçekleme kapsam dışı (yalnız NOT).

---

## G. MODEL / EFFORT DAĞILIMI

- **Orkestratör varsayılanı:** Opus · effort: high — tüm kod işleri (Task 1, 2, 3.1, 3.2, 3.4). Güvenlik-hassas ama desen-belli backend düzenlemeleri; bu projede kod orkestratör tarafından yazılır.
- **security-reviewer (Task 3.3):** Opus · effort: **extra** — güvenlik-kritik bağımsız denetim (fail-open, spoof, DoS, bellek). Yalnız-okuma.
- Çeviri/içerik subagent'ları (i18n/marketing/seo/blog/legal) bu işte KULLANILMAZ (backend güvenlik işi, içerik yok).

---

## H. AÇIK SORULAR / KARARLAR — ✅ HEPSİ ONAYLANDI (2026-07-11)

Kullanıcı tüm önerilen varsayılanlarla "BAŞLA" dedi:
1. **Genel limit** — ✅ IP başına 300/dk · `/health` + `/uploads/*` muaf. (A1)
2. **Hedefli** — ✅ billing kullanıcı-başı 10/dk · upload kullanıcı-başı 20/dk · tls-check domain-başı 30/dk. (A2)
3. **Yaklaşım** — ✅ mevcut `utils/rateLimit.js` genişletilir; express-rate-limit EKLENMEZ. (A3)
4. **Test muafiyeti** — ✅ `__beylinkTestRunning` bayrağı, YALNIZ yeni limitlere; eski auth limitleri değişmez. (A4)
5. **GC** — ✅ 5 dk süpürme + `.unref()`; 429'a `Retry-After` header. (A5/A6)
6. **security-reviewer** — ✅ **GLOBAL** oluşturuldu (`~/.claude/agents/security-reviewer.md`) → başka projelerde de kullanılabilir; sorun olursa denetim adımı atlanabilir (plan+progress asıl çıktı).

---

**DURUM:** Plan yazıldı + kararlar ONAYLANDI (2026-07-11). Uygulama Task 1.1'den başlanabilir. **Bu görevde KOD YAZILMADI** (yalnız planlama + global subagent tanımı). İlerleme: `_security-ratelimit-progress.md`.
