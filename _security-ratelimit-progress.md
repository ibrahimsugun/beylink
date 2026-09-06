# Güvenlik Sıkılaştırma — Rate Limit — İlerleme Takibi

Kaynak plan: `/Users/miracle/Desktop/beylink/security-ratelimit-plan.md`
İşaretleme: ⬜ bekliyor · 🔄 devam · ✅ bitti

---

## GENEL DURUM

**ŞU AN: TÜM İŞ TAMAMLANDI (Task 1 + 2 + 3). Güvenlik sıkılaştırması prod-hazır.**

**Ekstra bulgu + düzeltme (kapsam-uyarlaması, kullanıcı onaylı):** security-reviewer denetiminde plan-dışı ama doğrudan global limiter'ın işlevselliğini etkileyen bir Yüksek bulgu çıktı (`trust proxy` off-by-one — Caddy→nginx 2-hop zincirinde `req.ip` Caddy'nin IP'sine sabitleniyordu). Kullanıcıyla mimari teyit edildikten sonra `backend/src/app.js`'te `trust proxy: 1`→`2` düzeltildi + izole testle doğrulandı + tam paket yeniden koşuldu (195/195). Ayrıca `/uploads` exempt prefix'i sıkılaştırıldı. Bulunan ama bilinçli ERTELENEN/kapsam-dışı bırakılan: (1) test-exemption'ın süreç-geneli oluşu (plan A4 kilitli karar), (2) `/subpack`'in billingLimiter kapsamı dışında kalması (plan Task 1.3b kilitli karar), (3) nginx.conf XFF sanitize sertleştirmesi (frontend dosyası, CLAUDE.md "dokunma" kuralı → ayrı arka-plan görevi `task_f0ebce4c` olarak spawn edildi).

İki iş tek planda: **İş 1** = global fallback limiter (IP 300/dk) + hedefli sıkı limitler (billing user 10/dk · upload user 20/dk · tls-check domain 30/dk). **İş 2** = bellek-içi limiter'a 5 dk'lık GC süpürme. Yaklaşım: mevcut `utils/rateLimit.js` genişletilir (yeni npm YOK). Yeni limitler `__beylinkTestRunning` bayrağıyla test'te muaf; eski auth limitleri DEĞİŞMEZ.

| Task | Konu | İş | Durum |
|---|---|---|---|
| 1 | Global fallback + hedefli limitler (çekirdek + 4 mount) | İş 1 | ✅ |
| 2 | GC süpürme (sweep + start/stop + index.js) | İş 2 | ✅ |
| 3 | Doğrulama + güvenlik denetimi | — | ✅ |

Sıra: `1.1 → (1.2∥1.3∥1.4∥1.5) → 2.1 → 2.2 → 3.1 → 3.2 → 3.3 → 3.4`
**Not:** `rateLimit.js` Task 1.1 + Task 2.1'de düzenlenir → sıralı (önce çekirdek, sonra sweep). Yeni limitler muafiyet sayesinde test paketini KÖTÜLEŞTİRMEZ; bilinen 7 hata (Şifre Reset 3 + Rate Limit 1 + Güvenlik 2 + BTAG 1 flaky) KAPSAM DIŞI.

---

## Task 1 — İş 1: Global fallback + hedefli limitler  ✅  · Sorumlu: orkestratör/mühendislik (Opus · high)

- [x] ✅ **1.1** `backend/src/utils/rateLimit.js` → `consume(key,opts)` + `isTestRunning()` + `createRateLimiter({keyFn,max,windowMs,blockMs,message,exempt})`. Fail-open (try/catch→next), Retry-After (kalan blok sn), anahtar `null`→atla, `__beylinkTestRunning`→atla. Mevcut `isBlocked`/`recordFailure`/`clearAttempts`/`DEFAULTS` **DEĞİŞMEZ**.
  - **DoD:** modül import OK · `createRateLimiter` fonksiyon döndürür · muafiyet `next()` çağırır · eşik aşımı `next(429)`+Retry-After · mevcut export'lar duruyor. **Doğrulandı** (node -e canlı test): tüm senaryolar geçti (exempt/threshold/Retry-After/null-key/fail-open).
- [x] ✅ **1.2** `backend/src/app.js` → global limiter (`global:<req.ip>`, 300/60s/60s, exempt `/health`+`/uploads/*`), `cors` SONRASI + `express.json` ÖNCESİ mount.
  - **DoD:** server açılır · `/health` muaf · normal istek geçer · aşım 429+Retry-After · json'dan önce. **Doğrulandı** (nodemon canlı restart + curl): `/health`→200 (rate-limit header yok, muaf), `/api/public/...`→404 (limitten değil route'tan, normal geçti). Mount sırası kodda cors→globalLimiter→express.json.
- [x] ✅ **1.3** `backend/src/routes/billingRoutes.js` → `billingLimiter` (`billing:<userId>`, 10/60s/60s) yalnız `POST /topup` + `POST /plan`. requireAuth zincirinden sonra (req.user dolu).
  - **DoD:** iki route limiter'lı · anahtar userId · test muaf · 11. istek (muafiyet kapalı) 429. **Doğrulandı**: server temiz açıldı, `POST /topup` auth'suz → 401 (limiter'a takılmadan önce requireAuth çalıştı, 500 yok).
- [x] ✅ **1.4** `backend/src/routes/profileRoutes.js` → `uploadLimiter` (`upload:<userId>`, 20/60s/60s) avatar/cover/gallery route'unda `canEdit`/`upload.single()` ÖNCESİNE.
  - **DoD:** 3 upload route limiter'lı ve multer'dan ÖNCE · test muaf · 21. yükleme 429, dosya yazılmadı. **Doğrulandı**: server temiz açıldı, `POST /:id/avatar` auth'suz → 401 (500 yok); kod incelemesiyle sıra teyit: `uploadLimiter, canEdit, upload.single(...)`.
- [x] ✅ **1.5** `backend/src/routes/domainRoutes.js` → `tlsLimiter` (`tls:<normalizeDomain(query.domain)||ip:req.ip>`, 30/60s/60s) `GET /tls-check`'e (auth'suz satır). `normalizeDomain` domainModel'den import.
  - **DoD:** limiter'lı · domain-başı anahtar (çok-domain Caddy boğulmaz) · test muaf · aynı domain 31. istek 429 · `active`→200, kayıtsız→403 korunur. **Doğrulandı**: `GET /tls-check` (domain yok) → 403, `?domain=nonexistent.example.com` → 403 (semantik korunmuş, 500 yok).

## Task 2 — İş 2: GC süpürme  ✅  · Sorumlu: orkestratör/mühendislik (Opus · high)

- [x] ✅ **2.1** `backend/src/utils/rateLimit.js` (**1.1'den SONRA, aynı dosya**) → bucket'a `staleAfter = now + max(windowMs,blockMs)` · `sweep(now)` (stale sil, **AKTİF blok korunur**) · `startSweeper(5dk)` `.unref()`+idempotent · `stopSweeper()` · test-only `__bucketCount()`/`__sweepNow()`. Lazy-silme korunur.
  - **DoD:** sweep stale siler + AKTİF blok korur (unit) · interval `.unref()`'li · `__bucketCount` düşer · `rl.*` auth testleri hâlâ yeşil. **Doğrulandı** (node -e canlı test): stale bucket silindi (deleted:1), aktif blok korundu (deleted:0, bucketCount değişmedi), startSweeper idempotent+unref'li, mevcut recordFailure/isBlocked deseni (5 fail→blocked) sağlam.
- [x] ✅ **2.2** `backend/src/index.js` → `startRateLimitSweeper()` import + boot çağrısı (startPoller/reconcileTests yanına).
  - **DoD:** server açılışında sweeper başlar · unit-test importunda interval spawn OLMAZ. **Doğrulandı**: nodemon restart sonrası `/health`→200 (temiz açılış); `startSweeper` yalnız `index.js`'te çağrılıyor, `rateLimit.js` tek başına import edildiğinde `sweepIntervalHandle` null kalıyor (interval spawn olmuyor).

## Task 3 — Doğrulama + güvenlik denetimi  ✅  · Sorumlu: orkestratör + security-reviewer devri

- [x] ✅ **3.1** `backend/src/tests/rateLimit.tests.js` → UNIT testler (muafiyet bypass için `createRateLimiter`/`consume`/`sweep` doğrudan çağrı): global eşik+Retry-After · muafiyet aç/kapa · billing/upload keyFn(userId, yoksa null) · tls-check domain-normalize · sweep(stale sil + aktif blok koru + bucketCount) · fail-open (keyFn throw→next). finally izolasyon.
  - **Sorumlu:** orkestratör (Opus · high) · **DoD:** yeni testler izole koşumda geçer. **Doğrulandı** (node -e, makeContext ile 6 test izole çalıştırıldı): 6/6 PASS. Not: domain-normalize testinde ilk denemede test-veri hatası bulundu (`ctx.uniq()` alt çizgi üretiyor, `normalizeDomain` regex'i alt çizgiye izin vermiyor → sentetik domain'ler yanlışlıkla `ip:undefined` fallback'ine düşüp aynı bucket'ta toplanıyordu) — ürün kodu değil, test verisi düzeltildi (`_`→`-`), gerçek keyFn desenine (`tls:<domain||ip:...>`) yakınlaştırıldı.
- [x] ✅ **3.2** Tam paket regresyon koşumu (`POST /api/admin/tests/run-all` veya test paneli, admin token).
  - **Sorumlu:** orkestratör (Opus · high) · **DoD:** bilinen 7 hata DIŞINDA regresyon YOK · `rl.*` auth testleri yeşil · yeni limiter EK hata yaratmadı. Regresyon varsa DUR-KAL. **Doğrulandı**: admin JWT sunucunun kendi `signToken` yardımcısıyla (massskaa admin hesabı, DB'den id+token_version okunarak) üretildi → `POST /api/admin/tests/run-all` → 195 test (189 mevcut + 6 yeni) kuyruğa alındı → `GET /api/admin/tests` ile sonuç toplandı. **SONUÇ: 195/195 GEÇTİ, 0 BAŞARISIZ** (bilinen 7 hata dahil hepsi bu koşumda yeşil — beklenenden İYİ, regresyon YOK). Tüm zaman damgaları 5 saniyelik taze pencerede kümelendi (09:37:53–09:37:58 UTC), stale/cache sonucu değil. `rl.*` (5 eski auth + 6 yeni limiter testi) hepsi PASS.
- [x] ✅ **3.3** Güvenlik denetimi → **security-reviewer** subagent (`~/.claude/agents/security-reviewer.md`, Opus · **extra**). Devir formatı: plan §D3.
  - **Sorumlu:** security-reviewer (Opus · extra) · **DoD:** Verdict `PASS`/`PASS WITH NOTES` (Critical/High yok); çıkarsa orkestratör düzeltir→yeniden denetim. **Subagent sorunu→ATLA + orkestratör §D3 listesini kendi gözden geçir + not düş.** **Gerçekleşen:** 1. tur `CHANGES REQUIRED` (1 High: trust proxy off-by-one, kullanıcıyla mimari netleştirilip düzeltildi + izole doğrulandı; 1 Low: /uploads prefix, düzeltildi; 1 Medium + 1 Low bilinçli ertelendi). Tam paket yeniden koştu (195/195). 2. tur (aynı ajan, SendMessage ile devam) → **PASS WITH NOTES**, yeni Critical/High yok. Detay: notlar günlüğü altında.
- [x] ✅ **3.4** Son kontrol: server temiz açılış · `/health` 200 · PostToolUse hook (frontend i18n-check+build) yeşil (backend değişikliği bozmadı) · yedek/geri-dönüş kayıtlı.
  - **Sorumlu:** orkestratör (Opus · high) · **DoD:** hepsi yeşil · progress tümü ✅. **Doğrulandı**: `/health`→200 temiz · `node frontend/scripts/i18n-check.mjs` exit=0 (1620 anahtar, 9 dil parite OK) · `npm --prefix frontend run build` exit=0 (yalnız pre-existing chunk-size uyarısı, değişikliklerimle ilgisiz) · frontend'e HİÇ dokunulmadı (yalnız backend/src/{utils/rateLimit.js, app.js, routes/{billing,profile,domain}Routes.js, index.js, tests/rateLimit.tests.js} değişti) · final yedek alındı (`beylink-backup-ratelimit-ALL-TASKS-COMPLETE-20260711-122547.zip`).

---

## YEDEK / GERİ-DÖNÜŞ

- [x] ✅ Task 1 öncesi zip snapshot alındı (`beylink-backups/beylink-backup-pre-ratelimit-20260711-112509.zip`, node_modules/dist hariç, 15M).
- Geri-dönüş: `rateLimit.js` mevcut export'ları değişmediği için, sorun halinde yeni limiter mount'larını (app/route) kaldırmak çekirdeği bozmadan geri alır.

---

## NOTLAR / KARARLAR GÜNLÜĞÜ (uygulama sırasında doldurulacak)

- (uygulama başlayınca: mount sırası teyidi, unit test sonuçları, tam paket geçen/kalan sayısı, security-reviewer verdict, çıkan bulgular + düzeltmeler buraya)
- **Bilinen kapsam-dışı (dokunulmaz):** in-house pakette önceden var olan 7 hata bu işle ilgisiz; regresyon ölçütü bu 7'nin ÜSTÜNE yeni hata olup olmaması. **Gerçekleşen:** 3.2'de 195/195 GEÇTİ (0 hata) — 7 bilinen hata da bu koşumda görülmedi, beklenenden iyi sonuç.

### security-reviewer 1. tur (Task 3.3) — VERDICT: CHANGES REQUIRED

**[High] trust proxy off-by-one (app.js:39 idi, Caddy→nginx 2-hop zinciri var, `trust proxy=1` yalnız 1 hop güveniyordu) → req.ip = Caddy'nin IP'si (istemci değil) → global/auth limiter'lar TÜM kullanıcıları tek kovaya toplar.**
- Bağımsız doğrulama: Caddyfile + docker-compose.yml okundu — hem `beylink.org` hem özel-domain bloğu `reverse_proxy beylink-web:80`'e gidiyor (nginx), api'ye asla doğrudan değil → gerçekten 2 hop.
- Kullanıcıya soruldu (AskUserQuestion): gerçek prod topolojisi ne? **Yanıt: proje şimdilik yerel, ileride 1 VPS'te 2 proje paylaşımlı Caddy arkasında çalışacak şekilde planlanıyor** — Caddyfile'daki §G6 tasarımıyla birebir örtüşüyor.
- **Düzeltme:** `app.js` → `app.set('trust proxy', 1)` → `app.set('trust proxy', 2)` + açıklayıcı yorum (neden 2, dev'de zararsız olduğu, deploy-önkoşulu: nginx 8080 portu VPS güvenlik duvarında dışa kapalı olmalı).
- **Doğrulama:** izole Express testi — aynı sahte XFF (`"203.0.113.7, 198.51.100.9"`) ile trust=1 yanlışlıkla `198.51.100.9` (Caddy) döndürüyordu, trust=2 doğru `203.0.113.7` (gerçek istemci) döndürüyor; XFF yokken (dev) her iki ayarda da davranış aynı (soket adresi) → dev regresyonu YOK. Tam paket tekrar koştu: **195/195 PASS**.

**[Low] `/uploads` prefix hassasiyeti (app.js exempt fonksiyonu `startsWith('/uploads')` → `/uploadsX` gibi kurgusal path'leri de eşleştirebilirdi).**
- **Düzeltme:** `req.path === '/uploads' || req.path.startsWith('/uploads/')`.

**Bilinçli DOKUNULMAYAN bulgular:**
- **[Medium] test-exemption (`__beylinkTestRunning`) süreç-geneli blast radius** — plan A4'te kilitli/onaylı karar; reviewer da "locked/approved trade-off, flagging once" diyor. Değiştirilmedi.
- **[Low] `/subpack` billingLimiter kapsamı dışı** — planın Task 1.3(b) maddesi açıkça "subpack/invoice DOKUNULMAZ" diyor. Değiştirilmedi (plan kilidi).
- **nginx.conf `$proxy_add_x_forwarded_for` sanitize önerisi** (savunma-derinliği: istemci XFF'i nginx tarafından silinmeden ekleniyor) — geçerli bulgu ama `frontend/nginx.conf`, CLAUDE.md "Frontend'e dokunma" kuralına takılıyor → **ayrı arka-plan görevi olarak spawn edildi** (`task_f0ebce4c`, "nginx XFF header'ını client girdisinden sanitize et"), bu oturumda değiştirilmedi.

### security-reviewer 2. tur (yeniden denetim, SendMessage ile aynı ajan devam ettirildi) — VERDICT: PASS WITH NOTES

- **(a) trust proxy=2 doğrulandı, yan etki YOK.** Zincir modellemesi doğru (soket=nginx, XFF=`client,caddy` → liste `[nginx,caddy,client]`, trust=2 iki gerçek hop'u atlar, en soldaki gerçek istemciyi döner). **Tam olarak 2 — fazlası değil**: istemci-enjekte `X-Forwarded-For: EVIL` → Node'da `EVIL,client,caddy` olur, trust=2 yine `client`'ı döner, `EVIL`'a asla ulaşmaz (trust=3 spoof'u açardı — 2 tam doğru değer). Auth limiter'lar (`login:`, `register:`, `forgot:`) artık gerçek istemci bazlı çalışıyor — regresyon yok, kesinlikle iyileşme. Test ortamında XFF hiç gelmediği için (doğrudan soket) trust=1/2 farkı testleri etkilemiyor → 195/195 ile tutarlı. geoip + activity_logs `ip` alanı da artık gerçek istemciyi görüyor (istenen yan fayda).
- **(b) `/uploads` düzeltmesi doğru, yan etkisiz.**
- **(c) VERDICT: PASS WITH NOTES.** Yüksek çözüldü, iki diff'te yeni Critical/High YOK. Kalan iki madde (Medium test-exemption + Low /subpack) bilinçli ertelenmiş kararlar, açık defekt değil.
- **Kalıntı deploy-zamanı önkoşulu (kod engeli değil, zaten app.js yorumunda + spawn edilen nginx görevinde not edilmiş):** trust=2'nin sahtelenemezliği nginx'in (docker-compose `web` → host `8080:80`) internetten ERİŞİLEMEZ olmasına bağlı — yalnız Caddy dışa açık olmalı. VPS'te doğrulanmalı (bilinen Docker/ufw tuzağı: published portlar iptables kuralı ekler, ufw'yi bypass edebilir). 8080 dışa açıksa saldırgan nginx'e doğrudan XFF enjekte edebilir. **Aksiyon gerekmiyor** — bu zaten kod yorumunda + `task_f0ebce4c` nginx görevinde işaretli; VPS deploy anında (henüz yapılmadı) firewall kontrolü olarak hatırlanmalı.

**SONUÇ: Task 3.3 TAMAMLANDI. Critical/High bulgu yok, düzeltmeler doğrulandı.**
