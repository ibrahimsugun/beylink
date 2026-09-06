# Progress — Admin: Kullanıcının 2FA'sını Sıfırlama

**ŞU AN:** ✅ Tamamlandı — 4 task uygulandı. i18n-check exit 0, vite build hatasız, `admin.totp_reset` yalnız ACTIVITY'de, response'ta `totp_secret` yok, backend sözdizimi OK.
İşaretleme: ⬜ bekliyor · 🔄 devam · ✅ bitti

## Genel Özet
| Task | Başlık | Durum |
|---|---|---|
| 1 | Backend — action seti + controller + route | ✅ |
| 2 | i18n — 9 locale × 6 anahtar (`admin.twofaReset.*`) | ✅ |
| 3 | Frontend — buton + yazarak-teyitli modal | ✅ |
| 4 | Doğrulama — i18n-check + build + testler | ✅ |

**Bitti:** 4 / 4 · **Bekliyor:** 0 / 4

---

## TASK 1 — Backend (frontend/src dışı → hook tetiklemez)
- [x] **1.1** `backend/src/services/activityLog.js` → `ACTIVITY_ACTIONS`'a `'admin.totp_reset'` ekle (satır 30-42; CREDIT'e KOYMA)
  - SORUMLU: Orkestratör · DoD: yalnız ACTIVITY'de; kesişim-boş guard yeşil
- [x] **1.2** `backend/src/controllers/adminController.js` → `resetUser2fa` fonksiyonu: findUser→notFound · `userModel.disableTotp` · `logActivity('admin.totp_reset', {targetUserId, targetEmail})` · `res.json({ user })`
  - SORUMLU: Orkestratör · DoD: response'ta `totp_enabled=0`, `totp_secret` YOK
- [x] **1.3** `backend/src/routes/adminRoutes.js` → import + `router.post('/users/:id/reset-2fa', resetUser2fa)`
  - SORUMLU: Orkestratör · DoD: admin token 200 `{user}`; token'sız 401/403; yok id 404

## TASK 2 — i18n: 9 locale × 6 anahtar (JSX'ten ÖNCE)
> Anahtarlar: `admin.twofaReset.{btn,title,body,onlyIfLost,confirmLabel,error}` · `body`'de `{user}` · `common.cancel` yeniden kullanılır
- [x] **2.1** `frontend/src/locales/tr.json` (kanonik) — 6 anahtar
  - SORUMLU: Orkestratör (ops: `i18n-translator` Opus/high) · DoD: geçerli JSON (hook bu adımda kırmızı olabilir — normal)
- [x] **2.2** Diğer 8 locale (değerler plan §3 tablosundan)
  - [x] en.json
  - [x] ru.json
  - [x] es.json
  - [x] de.json
  - [x] fr.json
  - [x] pt.json
  - [x] it.json
  - [x] ja.json
  - SORUMLU: Orkestratör (ops: `i18n-translator`) · DoD: `node frontend/scripts/i18n-check.mjs` exit 0; son kayıtta hook yeşil

## TASK 3 — Frontend: buton + modal (i18n'den SONRA)
> Dosya: `frontend/src/pages/AdminDashboard.jsx`
- [x] **3.1** `KeyRound` lucide import'una eklenir (satır 5-8)
  - SORUMLU: Orkestratör · DoD: geçerli import; kullanılmayan-import uyarısı yok
- [x] **3.2** `reset2fa` state (`{user,value,busy,error}`) + `open2faReset`/`submit2faReset` (creditEdit deseni; `api.post('/admin/users/:id/reset-2fa')` → `loadUsers(q)`)
  - SORUMLU: Orkestratör · DoD: başarıda tablo tazelenir; hata state'e yazılır
- [x] **3.3** 2FA hücresi (satır 423-429) `u.totp_enabled` **true** dalına buton: `flex gap-2` + chip + `text-danger` `KeyRound` "2FA Sıfırla" (pasif dal DEĞİŞMEZ)
  - SORUMLU: Orkestratör · DoD: yalnız 2FA aktifken buton; pasifte yok
- [x] **3.4** Yazarak-teyitli onay modalı: danger/amber uyarı + kullanıcı/tanımlayıcı gösterimi + teyit input + `[Vazgeç]`/`[2FA Sıfırla]`; buton `disabled` until `value.trim() === (email||username)`; `busy`/`error`
  - SORUMLU: Orkestratör · DoD: yanlış tanımlayıcıda onay pasif; doğruda aktif; başarıda kapanır+rozet Pasif; `common.cancel` kullanıldı

## TASK 4 — Doğrulama
- [x] **4.1** `cd frontend && node scripts/i18n-check.mjs` → exit 0
  - SORUMLU: Orkestratör · DoD: exit 0, hata yok
- [x] **4.2** `npm --prefix frontend run build` → hatasız
  - SORUMLU: Orkestratör · DoD: build başarılı
- [x] **4.3** Backend test paketi — **admin** (activity-log guard `admin.totp_reset`) + **i18n** yeşil (`POST /api/admin/tests/run-all`)
  - SORUMLU: Orkestratör · DoD: kırmızı yeni test yok; erişilemezse 4.1 + `totp_secret` yokluğu + action yalnız-ACTIVITY teyidi
- [ ] **4.4** (Ops) Manuel smoke: 2FA aktif hesapta reset → 200, `totp_enabled=0`, secret yok; yanlış teyit → onay pasif
  - SORUMLU: Orkestratör · DoD: akış çalışır, secret sızmaz

---

## Notlar / Karar Günlüğü
- KİLİTLİ: K1 yazarak-teyitli modal (email||username, sub edge-case) · K2 buton yalnız 2FA aktifken · K3 text-danger KeyRound "2FA Sıfırla" · K4 `disableTotp` yeniden kullanılır (yeni metod yok) · K5 `admin.totp_reset`→ACTIVITY_ACTIONS · K6 `POST /admin/users/:id/reset-2fa` · K7 totp_secret ASLA response'ta · K8 admin hedefine de izin, loglanır · K9 6 anahtar×9 locale, `common.cancel` reuse · K10 kullanıcıya HİÇBİR ipucu yok
- Guardrail: değişiklik öncesi zip yedek (plan §8). Task 2 yarımken hook parite hatası NORMAL.
- DUR-KAL: totp_secret sızarsa · action iki sette birden olursa · onay butonu teyitsiz aktif kalırsa · i18n tam-sette kırmızıysa · build açıklanamayan hatayla kırılırsa.
