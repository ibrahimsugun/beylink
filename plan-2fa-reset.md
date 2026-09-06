# Plan — Admin: Kullanıcının 2FA'sını Sıfırlama (reset)

> Kapsam: Admin panelindeki **Kullanıcılar** tablosunda, 2FA rozetinin yanına küçük bir
> **"2FA Sıfırla"** butonu; tıklanınca **e-posta/kullanıcı-adı yazarak teyitli** onay modalı;
> onaylanınca hedefin TOTP'si kapatılır (`totp_secret=NULL`, `totp_enabled=0`) ve olay loglanır.
> **Son kullanıcıya HİÇBİR yerde gösterilmez** (yalnız admin paneli; kullanıcı arayüzü/e-posta/
> dokümanda ipucu YOK). Yeni şema/endpoint dışında iş mantığı yok; mevcut `disableTotp` yeniden kullanılır.

---

## 1) Kararlar

### KİLİTLİ
| # | Karar | Gerekçe |
|---|---|---|
| K1 | Onay modalı = **e-posta/kullanıcı-adı yazarak teyit** (danger/amber tonlu). Hedefin gösterilen tanımlayıcısını (`email \|\| username`) birebir yazınca "2FA Sıfırla" aktifleşir | Kullanıcı seçimi — "istisnai eylem" hissi; yanlış tıklamayı sıfırlar |
| K2 | Buton **yalnız `u.totp_enabled` iken** görünür (2FA kapalıysa sıfırlanacak şey yok) | Kullanıcı + mantık; gereksiz eylem yüzeyi açılmaz |
| K3 | Buton stili = rozet yanında küçük, `text-danger` tonlu, `KeyRound` ikonu + "2FA Sıfırla" (Kredi Düzenle butonu boyutunda) | Kullanıcı onayı; mevcut küçük-buton deseni |
| K4 | Backend mutasyonu = mevcut **`userModel.disableTotp(id)`** doğrudan çağrılır (yeni model metodu YOK) | Hazır metod birebir uygun; `totp_secret=NULL`+`findById` (secret'sız) döner |
| K5 | Log action = **`admin.totp_reset`** → `ACTIVITY_ACTIONS` setine (CREDIT'e DEĞİL). detail: `{ targetUserId, targetEmail }` | Güvenlik/kimlik olayı; para etkilemez. Mevcut admin log deseni |
| K6 | Route = **`POST /api/admin/users/:id/reset-2fa`** (`requireAuth+requireAdmin` arkasında) | Eylem-tipi mutasyon; mevcut admin rota deseni |
| K7 | `totp_secret` reset sonrası dahil **ASLA** response'ta olmaz | claude.md değişmezi; `disableTotp`→`findById` (PUBLIC_COLS, secret yok) |
| K8 | Hedef başka bir **admin olsa bile** reset'e izin (ekstra kısıt yok); loglanır | Meşru destek senaryosu; kendini-kilitleme riski yok (reset girişi kolaylaştırır) |
| K9 | Yeni i18n anahtarları `admin.twofaReset.*` (6 adet), **9 locale'in hepsine**; çeviriler planda kilitli (§3 Task 2) | Parite testi + PostToolUse hook zorunlu; `common.cancel` yeniden kullanılır |
| K10 | **Kullanıcı arayüzünde/e-postada/dokümanda hiçbir ipucu YOK** — özellik yalnız admin panelinde | Kullanıcının kritik notu: "nasılsa admin sıfırlar" rahatlığı istenmiyor |

### AÇIK KALAN
- Yok.

### Edge-case (K1 ile bağlantılı — plana işlendi)
- **Sub hesaplarda `email` NULL olabilir.** Teyit değeri = `target.email || target.username` (owner→e-posta, sub→kullanıcı adı; `@` prefix'i YOK). Modal, admin'in ne yazacağını bilmesi için bu tanımlayıcıyı **açıkça** gösterir. Karşılaştırma trim'li ve birebir.

---

## 2) Teknik Mimari (gerçek dosyalar / satırlar)

**Veri akışı:** Admin butona basar → yazarak-teyitli modal → `POST /admin/users/:id/reset-2fa` → `resetUser2fa` controller → `userModel.disableTotp(id)` (`userModel.js:118`) → `logActivity('admin.totp_reset')` → `res.json({ user })` → frontend `loadUsers(q)` ile tablo tazelenir (rozet Pasif'e döner).

**Dokunulacak gerçek dosyalar:**
| Dosya | Değişiklik |
|---|---|
| `backend/src/services/activityLog.js` | `ACTIVITY_ACTIONS` setine `'admin.totp_reset'` (satır 30-42 bloğu, `auth.2fa_*` yanına) |
| `backend/src/controllers/adminController.js` | yeni `resetUser2fa` fonksiyonu (export) — `userModel` zaten import (satır 4) |
| `backend/src/routes/adminRoutes.js` | import satırına `resetUser2fa` (satır 2) + `router.post('/users/:id/reset-2fa', resetUser2fa)` (satır 13 civarı) |
| `frontend/src/locales/{tr,en,ru,es,de,fr,pt,it,ja}.json` | 6 yeni `admin.twofaReset.*` anahtarı × 9 dosya (§3 Task 2 tablosu) |
| `frontend/src/pages/AdminDashboard.jsx` | `KeyRound` import; `reset2fa` state + handler'lar; 2FA hücresine buton (satır 423-429); yeni onay modalı |
| (doğrulama) `frontend/scripts/i18n-check.mjs`, backend test paneli | çalıştırılır — düzenlenmez |

**Referans desenler (birebir taklit):**
- Controller mutasyon deseni: `changeUserPlan`/`adjustUserCredits` (`adminController.js` satır 23-38, 55-90) — `adminModel.findUser(Number(req.params.id))` → yoksa `notFound('Kullanıcı bulunamadı')` → mutasyon → `logActivity({...})` → `res.json(...)`. `asyncHandler` + `utils/ApiError.js`.
- Modal + iki-adımlı akış + `busy`/`error`: `creditEdit` state ve modalı (`AdminDashboard.jsx` satır ~239, 297-317, 486-566).
- Küçük satır butonu: Kredi Düzenle butonu (satır 414-419), `<div className="flex items-center gap-2">` içinde chip + buton (satır 411-421).
- 2FA hücresinin GÜNCEL hali (buton buraya girecek): satır 423-429 — `u.totp_enabled ? (chip bg-success/10 + ShieldCheck + twofaOn) : (chip bg-surface text-muted + ShieldOff + twofaOff)`.

**Değişmez güvenlik:** `userModel.PUBLIC_COLS` (satır 3-5) `totp_secret` içermez; `disableTotp`→`findById` bu kolonları döner → K7 otomatik korunur. `activityLog` kesişim-boş sözleşmesi (CREDIT ⟂ ACTIVITY) test guard'lı → K5'te `admin.totp_reset` yalnız ACTIVITY'ye.

**Kritik operasyonel gerçek — PostToolUse hook (önceki işte kanıtlandı):**
`.claude/settings.json`: `frontend/src` altında her düzenlemeden sonra otomatik `node frontend/scripts/i18n-check.mjs && npm --prefix frontend run build`. → JSX'te yeni `t('...')` anahtarı 9 locale'de yoksa build KIRILIR; locale seti yarımken parite hatası verir (beklenen). Bu yüzden **i18n (Task 2), JSX'ten (Task 3) ÖNCE** bitmeli (§6, §8).

---

## 3) Task / Alt-task Yapısı (uygulamanın kalbi)

> SORUMLU: tamamı **Orkestratör (tek uygulayıcı, mevcut oturum)**. İş desen-belli + düşük-riskli →
> subagent devri YOK (bkz. §4). Devredilirse önerilen profil: **Sonnet, effort xhigh**.

---

### TASK 1 — Backend: action seti + controller + route
**Amaç:** `POST /admin/users/:id/reset-2fa` çalışsın; hedefin TOTP'si kapansın; olay `admin.totp_reset` ile loglansın.

**Alt-task 1.1 — Log action'ı kategorize et**
- (a) **Dosya:** `backend/src/services/activityLog.js` — `ACTIVITY_ACTIONS` Set'i (satır 30-42).
- (b) **Ne:** Set'e `'admin.totp_reset',` ekle (tercihen `auth.2fa_*` satırlarının yanına, kısa yorumla: "admin bir kullanıcının 2FA'sını sıfırladı"). **`CREDIT_ACTIONS`'a KOYMA** (kesişim boş kalmalı).
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** Bağımsız, ilk yapılır. `frontend/src` dışı → hook tetiklemez.
- (e) **DoD:** `admin.totp_reset` yalnız `ACTIVITY_ACTIONS`'ta; `CREDIT_ACTIONS`'ta yok. Backend **admin** test kategorisindeki activity-log kesişim/kategorize guard'ı yeşil.

**Alt-task 1.2 — `resetUser2fa` controller fonksiyonu**
- (a) **Dosya:** `backend/src/controllers/adminController.js` — yeni export fonksiyon (mevcut `changeUserPlan`/`adjustUserCredits` yanına). `userModel` zaten import (satır 4); ek import gerekmez.
- (b) **Ne:** `asyncHandler` ile:
  1. `const target = adminModel.findUser(Number(req.params.id));` → yoksa `throw notFound('Kullanıcı bulunamadı');`
  2. `const user = userModel.disableTotp(target.id);` (K4 — secret NULL'lanır, `findById` döner)
  3. `logActivity({ userId: req.user.id, action: 'admin.totp_reset', detail: { targetUserId: target.id, targetEmail: target.email }, ip: req.ip });` (K5; sub'da `target.email` NULL olabilir → detail null-güvenli)
  4. `res.json({ user });` (K7 — `user`'da `totp_secret` YOK)
  - Not: `adminModel.findUser` id/email/plan döndürür (satır 51-53) — hedefi bulmak ve loglamak için yeterli.
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 1.1 tamamlandıktan sonra (action seti hazır olmadan loglama uncategorized uyarısı verir).
- (e) **DoD:** Fonksiyon export edilmiş; `disableTotp` çağrısı + `admin.totp_reset` logu var; response `{ user }` içinde `totp_enabled=0`, `totp_secret` **yok** (grep + `PUBLIC_COLS` teyidi).

**Alt-task 1.3 — Route bağla**
- (a) **Dosya:** `backend/src/routes/adminRoutes.js` — import (satır 2) + rota kaydı (satır 13 civarı, `credits` rotasından sonra).
- (b) **Ne:** (1) import listesine `resetUser2fa` ekle: `import { getStats, getUsers, changeUserPlan, adjustUserCredits, getLogs, resetUser2fa } from '../controllers/adminController.js';` (2) `router.post('/users/:id/reset-2fa', resetUser2fa);` ekle (`router.use(requireAuth, requireAdmin)` zaten tüm rotaları koruyor — K6).
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 1.2'den sonra (fonksiyon var olmalı).
- (e) **DoD:** `POST /api/admin/users/:id/reset-2fa` admin token ile 200 + `{ user }` döner; token'sız/admin-olmayan 401/403. Var olmayan id → 404.

---

### TASK 2 — i18n: 9 locale'e 6 anahtar (JSX'ten ÖNCE)
**Amaç:** buton/modal metinlerini 9 dilde hazır etmek.

**Yeni anahtarlar + çeviri tablosu (birebir uygulanacak — K9). `common.cancel` (Vazgeç) yeniden kullanılır, yeni açılmaz.**

| Anahtar | tr | en | ru | es | de | fr | pt | it | ja |
|---|---|---|---|---|---|---|---|---|---|
| `admin.twofaReset.btn` | 2FA Sıfırla | Reset 2FA | Сбросить 2FA | Restablecer 2FA | 2FA zurücksetzen | Réinitialiser la 2FA | Redefinir 2FA | Reimposta 2FA | 2FAをリセット |
| `admin.twofaReset.title` | 2FA'yı sıfırla | Reset 2FA | Сброс 2FA | Restablecer 2FA | 2FA zurücksetzen | Réinitialiser la 2FA | Redefinir 2FA | Reimposta 2FA | 2FAをリセット |
| `admin.twofaReset.body` | {user} kullanıcısının 2FA doğrulaması kapatılacak. Tekrar giriş yapabilmek için authenticator uygulamasını yeniden kurması gerekir. | Two-factor authentication for {user} will be turned off. They will need to set up their authenticator app again to sign in. | Двухфакторная аутентификация для {user} будет отключена. Чтобы снова войти, пользователю нужно заново настроить приложение-аутентификатор. | Se desactivará la verificación en dos pasos de {user}. Deberá volver a configurar su aplicación de autenticación para iniciar sesión. | Die Zwei-Faktor-Authentifizierung für {user} wird deaktiviert. Zum Anmelden muss die Authenticator-App erneut eingerichtet werden. | La double authentification de {user} sera désactivée. L'utilisateur devra reconfigurer son application d'authentification pour se connecter. | A verificação em duas etapas de {user} será desativada. Será necessário configurar novamente o app autenticador para entrar. | La verifica in due passaggi di {user} verrà disattivata. Dovrà configurare di nuovo l'app di autenticazione per accedere. | {user} の二段階認証が無効になります。再度ログインするには、認証アプリを設定し直す必要があります。 |
| `admin.twofaReset.onlyIfLost` | Yalnızca kullanıcı authenticator erişimini kaybettiyse kullanın. | Use only if the user has lost access to their authenticator. | Используйте, только если пользователь потерял доступ к аутентификатору. | Úsalo solo si el usuario perdió el acceso a su autenticador. | Nur verwenden, wenn der Benutzer den Zugriff auf seinen Authenticator verloren hat. | À utiliser uniquement si l'utilisateur a perdu l'accès à son authentificateur. | Use apenas se o usuário perdeu o acesso ao autenticador. | Usare solo se l'utente ha perso l'accesso all'autenticatore. | ユーザーが認証アプリにアクセスできなくなった場合にのみ使用してください。 |
| `admin.twofaReset.confirmLabel` | Onaylamak için kullanıcının e-posta veya kullanıcı adını yazın | To confirm, type the user's email or username | Для подтверждения введите e-mail или имя пользователя | Para confirmar, escribe el correo o nombre de usuario | Zur Bestätigung E-Mail oder Benutzernamen eingeben | Pour confirmer, saisissez l'e-mail ou le nom d'utilisateur | Para confirmar, digite o e-mail ou nome de usuário | Per confermare, digita l'email o il nome utente | 確認するには、ユーザーのメールまたはユーザー名を入力してください |
| `admin.twofaReset.error` | 2FA sıfırlanamadı. | Could not reset 2FA. | Не удалось сбросить 2FA. | No se pudo restablecer la 2FA. | 2FA konnte nicht zurückgesetzt werden. | Impossible de réinitialiser la 2FA. | Não foi possível redefinir a 2FA. | Impossibile reimpostare la 2FA. | 2FAをリセットできませんでした。 |

> GUARD teyidi: Yalnız `body`'de `{user}` placeholder var — 9 dilde birebir korunmalı (çevrilmez). Hiçbir değerde em-dash (—) yok (tümü düz tire). Türkiye/KVKK/GDPR referansı yok.

**Alt-task 2.1 — Kanonik `tr.json`'a 6 anahtar**
- (a) **Dosya:** `frontend/src/locales/tr.json` — mevcut `admin.users.*` / `admin.planConfirm.*` bloğu civarı (okunur bir yere; ör. `admin.users.empty` satır ~1070 sonrası).
- (b) **Ne:** Tablodaki `tr` değerlerini 6 anahtarla ekle; geçerli JSON.
- (c) **SORUMLU:** Orkestratör (opsiyonel `i18n-translator` — §4).
- (d) **Bağımlılık:** Task 1'den sonra önerilir. **Bu dosya kaydında hook "8 dilde EKSİK(6)" verir — BEKLENEN** (bkz. §8).
- (e) **DoD:** `tr.json` geçerli; 6 anahtar mevcut.

**Alt-task 2.2 — Diğer 8 locale'e aynı 6 anahtar**
- (a) **Dosya:** `frontend/src/locales/{en,ru,es,de,fr,pt,it,ja}.json`.
- (b) **Ne:** Her dosyaya, ilgili dil sütunundan 6 anahtar/değeri ekle. Anahtar adları 9 dilde AYNI; yalnız değer değişir. `{user}` her dilde korunur.
- (c) **SORUMLU:** Orkestratör (opsiyonel `i18n-translator`).
- (d) **Bağımlılık:** 2.1'den sonra; kesintisiz tamamlanmalı.
- (e) **DoD:** 9 locale'de 6 anahtar; `node frontend/scripts/i18n-check.mjs` → **exit 0**; son kayıtta hook yeşil.

---

### TASK 3 — Frontend: buton + yazarak-teyitli modal (i18n'den SONRA)
**Amaç:** 2FA rozetinin yanına buton; tıklanınca teyitli onay modalı; onayda `POST reset-2fa` + tablo tazele.

**Alt-task 3.1 — `KeyRound` ikon importu**
- (a) **Dosya:** `frontend/src/pages/AdminDashboard.jsx` — lucide import (satır 5-8; şu an `ShieldCheck, ShieldOff, MailCheck, MailX, ...` var).
- (b) **Ne:** import listesine `KeyRound` ekle.
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** Task 2 bitmiş olmalı (bu dosya kaydında hook yeni `t('...')` anahtarlarını arar).
- (e) **DoD:** import geçerli; `KeyRound` 3.3'te kullanılır (kullanılmayan-import uyarısı yok).

**Alt-task 3.2 — `reset2fa` state + handler'lar**
- (a) **Dosya:** `AdminDashboard.jsx` — state grubu (satır ~231-241) + handler'lar (creditEdit/planConfirm yanına).
- (b) **Ne:**
  - State: `const [reset2fa, setReset2fa] = useState(null); // { user, value, busy, error }`
  - `open2faReset(u)` → `setReset2fa({ user: u, value: '', busy: false, error: '' })`
  - `submit2faReset()`:
    - `identifier = reset2fa.user.email || reset2fa.user.username` (K1 edge-case)
    - Guard: `reset2fa.value.trim() !== identifier` ise dur (buton zaten disabled).
    - `setReset2fa(s => ({ ...s, busy: true, error: '' }))`
    - `await api.post(\`/admin/users/${reset2fa.user.id}/reset-2fa\`)` → başarıda `await loadUsers(q); setReset2fa(null);`
    - hata → `setReset2fa(s => ({ ...s, busy: false, error: err.message || t('admin.twofaReset.error') }))`
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 3.1 ile aynı dosya; sıralı.
- (e) **DoD:** State + iki handler mevcut; `api.post` çağrısı doğru rotaya; başarıda tablo tazelenir.

**Alt-task 3.3 — 2FA hücresine buton (yalnız aktifken)**
- (a) **Dosya:** `AdminDashboard.jsx` — 2FA hücresi (satır 423-429).
- (b) **Ne:** `u.totp_enabled` **true** dalını, Kredi hücresi (satır 411-421) gibi `<div className="flex items-center gap-2">` ile sar: içine mevcut yeşil chip + **yeni buton**:
  - Buton: `onClick={() => open2faReset(u)}`, `title={t('admin.twofaReset.btn')}`, küçük stil (Kredi Düzenle boyutunda ama **tehlike tonu**): ör. `rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-danger hover:border-danger` + içinde `<KeyRound size={13} />` + `{t('admin.twofaReset.btn')}` (ikon+metin, `inline-flex items-center gap-1`).
  - `u.totp_enabled` **false** dalı DEĞİŞMEZ (gri "Pasif" chip; buton YOK — K2).
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 3.2 (handler var olmalı).
- (e) **DoD:** 2FA aktif satırlarda rozet + kırmızı tonlu KeyRound "2FA Sıfırla" butonu yan yana; pasif satırlarda buton yok.

**Alt-task 3.4 — Yazarak-teyitli onay modalı**
- (a) **Dosya:** `AdminDashboard.jsx` — diğer modalların (`planConfirm`, `creditEdit`) yanına, koşullu render (`reset2fa && <Modal ...>`).
- (b) **Ne:** `Modal` (import zaten var) ile danger/amber tonlu onay:
  - `open`, `onClose={() => !reset2fa.busy && setReset2fa(null)}`, `title={t('admin.twofaReset.title')}`, `maxWidth="max-w-md"`.
  - Uyarı kutusu (creditEdit'in `border-warning/30 bg-warning/10` deseni + `AlertTriangle`): `t('admin.twofaReset.body', { user: reset2fa.user.email || reset2fa.user.username || \`#${reset2fa.user.id}\` })` + alt satır `t('admin.twofaReset.onlyIfLost')`.
  - **Kullanıcı gösterimi:** display_name + net şekilde **teyit tanımlayıcısı** (`reset2fa.user.email || reset2fa.user.username`) — admin ne yazacağını görsün.
  - **Teyit input'u:** label `t('admin.twofaReset.confirmLabel')`; `value={reset2fa.value}` `onChange` ile state; input HTML `placeholder`'ı = dinamik `reset2fa.user.email || reset2fa.user.username` (görsel ipucu; i18n değil).
  - `reset2fa.error` varsa `bg-danger/10 text-danger` kutusu.
  - Butonlar: `[Vazgeç]` = `t('common.cancel')` (`setReset2fa(null)`, `disabled={reset2fa.busy}`) + `[2FA Sıfırla]` = `t('admin.twofaReset.btn')`, `onClick={submit2faReset}`, **`disabled={reset2fa.busy || reset2fa.value.trim() !== (reset2fa.user.email || reset2fa.user.username)}`**, busy iken `<Loader2 className="animate-spin" />`. Onay butonu danger tonlu (`btn` + kırmızı vurgu).
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 3.2 + 3.3.
- (e) **DoD:** Modal açılır; tanımlayıcı doğru yazılmadan onay butonu **disabled**; doğru yazınca aktif; onayda `busy` spinner → başarıda kapanır + rozet Pasif'e döner; hata modal içinde gösterilir. `common.cancel` kullanıldı (yeni anahtar açılmadı).

---

### TASK 4 — Doğrulama
**Alt-task 4.1 — i18n paritesi:** `cd frontend && node scripts/i18n-check.mjs` → **exit 0** ("parite OK · placeholder OK · em-dash 0 · Türkiye/KVKK/GDPR 0"). DoD: exit 0.
**Alt-task 4.2 — Frontend build:** `npm --prefix frontend run build` → hatasız (import/JSX). DoD: build başarılı.
**Alt-task 4.3 — Backend test paketi:** admin panel → **Testler** ya da `POST /api/admin/tests/run-all` (admin token). **admin** (activity-log kesişim/kategorize guard `admin.totp_reset`'i kategorize görür) + **i18n** kategorileri yeşil. DoD: kırmızı yeni test yok; erişim yoksa 4.1 yeşilliği + `grep` ile `totp_secret` yokluğu + `admin.totp_reset` yalnız ACTIVITY'de teyidi.
**Alt-task 4.4 — Manuel uçtan-uca smoke (opsiyonel ama önerilir):** 2FA aktif bir test hesabında butonla reset → 200 `{ user }`, `totp_enabled=0`, response'ta `totp_secret` yok; yanlış tanımlayıcıda onay butonu pasif. DoD: akış çalışır, secret sızmaz.

---

## 4) Orkestrasyon Planı (devir mekaniği)

### Devir tablosu
| İş türü | Sorumlu | Model/effort | Devir? |
|---|---|---|---|
| Backend (Task 1: action+controller+route) | Orkestratör | mevcut oturum | Hayır — kendi yapar |
| i18n (Task 2) | Orkestratör | mevcut oturum | Hayır — çeviriler hazır (K9). **Opsiyonel** kalite: `i18n-translator` (Opus/high) |
| Frontend JSX (Task 3) | Orkestratör | mevcut oturum | Hayır — kendi yapar |
| Doğrulama (Task 4) | Orkestratör | mevcut oturum | Hayır — kendi yapar |

### Ne zaman devredilir
- **Varsayılan: DEVİR YOK.** Tüm işler desen-belli, düşük-riskli, tek dosya-grubu; kullanıcı "tek uygulayıcı yeterli" dedi. Orkestratör 4 task'ı kendi context'inde yürütür.
- **Tek opsiyonel devir:** Task 2 çevirilerinde ince ayar istenirse (cinsiyet/ton nüansı ru/it/fr/de) mevcut **`i18n-translator`** (Opus/high) kullanılabilir. ZORUNLU DEĞİL — plandaki çeviriler tüm guard'lardan geçer.

### Nasıl devredilir (opsiyonel i18n devri — kopyalanabilir şablon)
```
Görev: BeyLink admin "2FA Sıfırla" akışı için 6 yeni anahtarı 9 locale'de doğrula/incelt.
Kanonik (tr) referans değerleri: [plan §3 Task 2 tablosundaki tr sütunu]
Diller: en, ru, es, de, fr, pt, it, ja (tr kanonik, dokunma).
Bağlam: admin panelde 2FA sıfırlama onay modalı metinleri (buton, başlık, uyarı gövdesi, teyit etiketi, hata).
KISITLAR (ihlal = build kırmızı):
  - `body` anahtarındaki {user} placeholder AYNEN korunacak (çevrilmez), diğerlerinde placeholder yok.
  - em-dash (—) YASAK; yalnız düz tire (-). Türkiye/KVKK/GDPR/ülke-şehir referansı YASAK.
  - Anahtar adları 9 dilde AYNI; yalnız değer çevrilir.
Çıktı: her dil için 6 anahtarın JSON parçası (frontend/src/locales/<dil>.json'a eklenecek).
DoD: `node frontend/scripts/i18n-check.mjs` exit 0.
```

### Orkestratörün ASLA kendi yapmayacağı işler
- Bu görevde yok — hepsi kapsamında.

### Devir sırası / yarış önlemi
- Paralel subagent YOK; tüm düzenlemeler sıralı.
- **En kritik sıra:** i18n (Task 2) → JSX (Task 3). Aksi halde hook, JSX'teki `t('...')` anahtarlarını bulamaz ve build'i kırar.

---

## 5) Subagent Envanteri
**Mevcut (`.claude/agents/`):** `blog-translator`, `i18n-translator`, `legal-translator`, `marketing-copywriter`, `seo-writer`.
**Kullanılacak:** yalnız **opsiyonel** `i18n-translator` (Opus/high) — çeviri ince ayarı istenirse (Task 2). Varsayılan akışta hiçbir subagent çağrılmaz.
**Yeni subagent OLUŞTURULMADI** (kullanıcı kararı + iş desen-belli).

---

## 6) Sıra ve Bağımlılık
```
Task 1 (backend)  ──►  Task 2 (i18n 9 locale)  ──►  Task 3 (frontend JSX)  ──►  Task 4 (doğrulama)
  bağımsız (1.1→1.2→1.3)   JSX'ten ÖNCE bitmeli      i18n'den SONRA          en son
```
- Task 1 iç sıra: 1.1 (action seti) → 1.2 (controller) → 1.3 (route). `frontend/src` dışı → hook tetiklemez.
- **Task 2 → Task 3 ZORUNLU** (hook paritesi). Task 2 içi 9 locale kesintisiz; yarım set = geçici parite hatası (beklenen).
- İş küçük, tek oturumda biter. Bölünürse Task 2'yi yarım bırakma.

---

## 7) Sonraya Bırakılanlar
- `reset-2fa` için özel otomatik backend testi (`admin.tests.js`'e) — **opsiyonel**. Mevcut activity-log guard `admin.totp_reset`'i zaten kategorize doğrular; ayrı endpoint testi kapsamı büyütür, bu turda zorunlu değil. İstenirse eklenebilir.
- Kullanıcıya bildirim/e-posta — **KASITLI YOK** (K10; kullanıcının açık isteği).

---

## 8) Guardrail (yedek, geri-dönüş, DUR-KAL)

**Yedekleme (git yok):**
```
cd /Users/miracle/Desktop/Startings/beylink && \
zip -r "scratchpad-backup-2fareset-$(date +%Y%m%d-%H%M%S).zip" \
  backend/src/services/activityLog.js \
  backend/src/controllers/adminController.js \
  backend/src/routes/adminRoutes.js \
  frontend/src/pages/AdminDashboard.jsx \
  frontend/src/locales
```
Geri-dönüş: bir adım kırmızı kalırsa zip'ten ilgili dosya(lar) restore edilir.

**BEKLENEN (DUR-KAL DEĞİL):**
- Task 2'de 9 locale tamamlanana kadar hook parite hatası verir → normal; 9'uncu dosyada yeşile döner. Ara kırmızıda durma, seti tamamla.

**DUR-KAL koşulları (dur, kullanıcıya sor):**
- Response'ta `totp_secret` görülürse → DUR (K7 güvenlik ihlali). [Beklenmez; `disableTotp`→`findById` secret döndürmez.]
- `admin.totp_reset` yanlışlıkla `CREDIT_ACTIONS`'a da eklenirse (kesişim guard kırılır) → DUR.
- Teyit mantığı yanlış olur da onay butonu tanımlayıcı yazılmadan **aktif** kalırsa → DUR (K1 güvenlik/UX ihlali).
- Task 2 tam bitmesine rağmen `i18n-check` parite/placeholder/em-dash/Türkiye hatası veriyorsa → DUR.
- `vite build` açıklanamayan JSX/import hatasıyla kırılırsa → DUR.

**Riskli/dikkat:**
- Teyit karşılaştırmasında identifier = `email || username` (sub edge-case). `@` prefix'i KULLANMA (satır 401'deki `@username` yalnız gösterim; teyit değeri saf username).
- 9 locale anahtar-adı birebir tutarlılığı; `body`'de `{user}` korunması.
- JSON virgül/kapatma bütünlüğü (blok sonu eklerken).

---

## 9) Model / Effort Dağılımı
| Task | Sorumlu | Model/effort | Gerekçe |
|---|---|---|---|
| Task 1 — Backend | Orkestratör | mevcut oturum (devredilirse Sonnet/xhigh) | Mevcut mutasyon deseni + hazır `disableTotp`; mekanik |
| Task 2 — i18n | Orkestratör | mevcut oturum (opsiyonel `i18n-translator` Opus/high) | Çeviriler hazır; kopyalama. Nüans → Opus/high |
| Task 3 — Frontend | Orkestratör | mevcut oturum (devredilirse Sonnet/xhigh) | `creditEdit` modalı + küçük-buton desenleri birebir |
| Task 4 — Doğrulama | Orkestratör | mevcut oturum | Komut + yeşil teyidi |

- Orkestratör varsayılanı: mevcut oturum. Devredilecek mekanik işler **Sonnet, effort xhigh**.
- Opsiyonel içerik katmanı: `i18n-translator` = **Opus, high**.
- Güvenlik-hassas olsa da desen-belli (hazır `disableTotp`, `requireAdmin`, loglama) → Opus-extra gerekmez.
