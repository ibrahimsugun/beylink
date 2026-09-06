# Plan — Admin "Kullanıcılar" Tablosuna 2FA + E-Posta Kolonları

> Kapsam: Admin panelindeki **Kullanıcılar** tablosuna iki yeni durum kolonu eklemek:
> **2FA** (TOTP durumu) ve **E-Posta** (e-posta doğrulama durumu). Her ikisi de dolgulu pill rozet.
> Bu bir UI + veri-görünürlüğü işidir; yeni iş mantığı / yeni endpoint / şema değişikliği YOK.

---

## 1) Kararlar

### KİLİTLİ (uygulama sırasında değişmez)
| # | Karar | Gerekçe |
|---|---|---|
| K1 | 2FA **Aktif** rozeti = yeşil (`text-success`) + `ShieldCheck` ikonu | Olumlu/güvenli durum; projede yeşil = onay/vurgu |
| K2 | 2FA **Pasif** rozeti = nötr gri (`bg-surface text-muted`) + `ShieldOff` ikonu | 2FA'sız olmak hata değil, nötr durum; vurgu yok (görsel de nötr gri) |
| K3 | E-Posta **Onaylı** rozeti = yeşil (`text-success`) + `MailCheck` ikonu | Olumlu durum; yeşil = onay |
| K4 | E-Posta **Onaysız** rozeti = amber (`text-warning`) + `MailX` ikonu | Dikkat çekilmesi gereken eksik durum; amber = dikkat |
| K5 | Rozet stili = **dolgulu pill**: mevcut `.chip` sınıfı (`rounded-full`, ikon+metin) + ton | Görseldeki rozetler dolgulu pill; `.chip` deseni projede kurulu |
| K6 | Kolon sırası = `Kullanıcı \| Plan \| **2FA** \| **E-Posta** \| Aktif Link \| Toplam Tıklama \| Kredi \| Plan Düzenle` | İki durum kolonu yan yana; aksiyon kolonu (select) en sonda kalır |
| K7 | Backend response'ta **yalnız** `totp_enabled` + `email_verified` (0/1) döner; `totp_secret` ASLA | claude.md değişmezi: secret sadece `*WithHash`'te, PUBLIC değil |
| K8 | Yeni i18n anahtarları `admin.users.*` altında (6 adet), **9 locale'in hepsine** eklenir | Parite testi + PostToolUse hook zorunlu kılıyor; yeniden kullanılabilir genel anahtar yok |
| K9 | Çeviriler bu planda **hazır tablo** olarak kilitli (bkz. §3, Task 2); orkestratör birebir uygular | 6 kısa durum etiketi; subagent devrine gerek yok (kullanıcı kararı: tek uygulayıcı) |

### AÇIK KALAN
- Yok. Tüm görsel/teknik kararlar netleşti.

---

## 2) Teknik Mimari (gerçek dosyalar ve mevcut desenler)

**Veri akışı:** `users.totp_enabled` / `users.email_verified` (şema, `db/migrate.js:222` ve `:229`, `INTEGER NOT NULL DEFAULT 0`) → `adminModel.listUsers()` SELECT → `adminController.getUsers` (dönüşümsüz `res.json`) → `GET /api/admin/users` → `AdminDashboard.jsx` `loadUsers()` → tablo satırı `u.totp_enabled` / `u.email_verified`.

**Dokunulacak gerçek dosyalar (4 grup):**
| Dosya | Değişiklik özeti |
|---|---|
| `backend/src/models/adminModel.js` | `listUsers()` SELECT'ine `u.totp_enabled, u.email_verified` ekle (satır 36) |
| `frontend/src/locales/{tr,en,ru,es,de,fr,pt,it,ja}.json` | 6 yeni anahtar × 9 dosya (§3 çeviri tablosu) |
| `frontend/src/pages/AdminDashboard.jsx` | ikon importu + 2 `<th>` + 2 `<td>` rozet + boş-durum `colSpan` 6→8 |
| (doğrulama) `frontend/scripts/i18n-check.mjs`, backend test paneli | çalıştırılır, yeşil olmalı — düzenlenmez |

**Değişmeyen / dokunulmayacak:**
- `adminController.js` / `adminRoutes.js` — model çıktısını olduğu gibi geçiriyor, ek dönüşüm yok.
- `userModel.js` `PUBLIC_COLS` — zaten `totp_enabled, email_verified` içeriyor, `totp_secret` içermiyor (referans desen; değişmez).
- Şema / migration — kolonlar zaten mevcut, migration YOK.

**Kritik operasyonel gerçek — PostToolUse hook:**
`.claude/settings.json` içinde `frontend/src` altındaki her düzenlemeden sonra otomatik çalışan komut:
`node frontend/scripts/i18n-check.mjs && npm --prefix frontend run build`.
Bu hook:
- Kodda kullanılan `t('...')` anahtarı `tr.json`'da yoksa **fail** eder (kural 6).
- 9 locale arası anahtar paritesi bozuksa **fail** eder (eksik/fazla).
- Herhangi bir değerde em-dash (—) veya Türkiye/KVKK/GDPR referansı varsa **fail** eder.
→ Sıralama bu yüzden hayati (bkz. §6 Sıra ve §8 Guardrail).

---

## 3) Task / Alt-task Yapısı (uygulamanın kalbi)

> SORUMLU: bu görevin tamamı **Orkestratör (tek uygulayıcı, mevcut oturum)** tarafından yapılır.
> İş mekanik + desen-belli + düşük-riskli olduğu için subagent devri YOK (bkz. §5). Bir subagent'a
> devredilmek istenirse önerilen profil: **Sonnet, effort xhigh**.

---

### TASK 1 — Backend: `listUsers` SELECT'ine iki kolon ekle
**Amaç:** admin kullanıcı listesi API'si her satırda `totp_enabled` ve `email_verified` dönsün.

**Alt-task 1.1 — SELECT'e kolon ekle**
- (a) **Dosya:** `backend/src/models/adminModel.js` — `listUsers(q)`, SELECT bloğu (satır 36).
- (b) **Ne yapılacak:** Mevcut `SELECT u.id, u.email, u.plan, u.plan_expires_at, u.credits_micro, u.is_admin, u.created_at,` satırının sütun listesine **`u.totp_enabled, u.email_verified`** iki kolonunu ekle (mevcut `u.*` kolonlarının yanına; alt sorgular `display_name/username/active_links/total_clicks` aynen kalır). Başka hiçbir şey değişmez; `WHERE u.role = 'owner'` ve `ORDER BY` aynı.
- (c) **SORUMLU:** Orkestratör (mevcut oturum). Devredilirse Sonnet/xhigh.
- (d) **Bağımlılık:** Bağımsız — hiçbir şeyi beklemez, ilk yapılabilir. `frontend/src` dışında → PostToolUse hook TETİKLEMEZ.
- (e) **DoD:**
  - `GET /api/admin/users` yanıtındaki her `user` nesnesinde `totp_enabled` ve `email_verified` alanları (0 veya 1) mevcut.
  - Yanıtta `totp_secret` **yok** (K7 — grep ile teyit: `adminModel.js` SELECT'inde `totp_secret` geçmemeli).
  - Backend **admin** test kategorisi yeşil kalır (kolon eklemek mevcut testleri bozmaz).

---

### TASK 2 — i18n: 9 locale'e 6 yeni anahtar (JSX'ten ÖNCE)
**Amaç:** rozet başlık ve etiketleri için i18n anahtarlarını 9 dilde hazır etmek. **JSX değişikliğinden önce** yapılmalı (hook paritesi).

**Yeni anahtarlar ve çeviri tablosu (birebir uygulanacak — K9):**

| Anahtar | tr | en | ru | es | de | fr | pt | it | ja |
|---|---|---|---|---|---|---|---|---|---|
| `admin.users.table.twofa` | 2FA | 2FA | 2FA | 2FA | 2FA | 2FA | 2FA | 2FA | 2FA |
| `admin.users.table.email` | E-Posta | Email | Эл. почта | Correo | E-Mail | E-mail | E-mail | Email | メール |
| `admin.users.twofaOn` | Aktif | Active | Активна | Activo | Aktiv | Activé | Ativo | Attivo | 有効 |
| `admin.users.twofaOff` | Pasif | Inactive | Неактивна | Inactivo | Inaktiv | Désactivé | Inativo | Inattivo | 無効 |
| `admin.users.emailVerified` | Onaylı | Verified | Подтверждён | Verificado | Bestätigt | Vérifié | Verificado | Verificata | 確認済み |
| `admin.users.emailUnverified` | Onaysız | Unverified | Не подтверждён | Sin verificar | Unbestätigt | Non vérifié | Não verificado | Non verificata | 未確認 |

> NOT (guardlar): Hiçbir değerde em-dash (—) yok — "E-Posta"/"E-Mail"/"E-mail" düz tire (-) ile. Hiçbirinde `{placeholder}` yok. Hiçbirinde Türkiye/KVKK/GDPR referansı yok. Bu üç guard otomatik geçer.

**Alt-task 2.1 — Kanonik `tr.json`'a 6 anahtarı ekle**
- (a) **Dosya:** `frontend/src/locales/tr.json` — mevcut `admin.users.table.*` bloğu (satır ~1056-1064) civarına, `admin.users.table.editPlan` ve `admin.users.editCreditBtn` yakınına.
- (b) **Ne yapılacak:** Tablodaki `tr` sütunundaki 6 anahtar/değeri ekle. Anahtar sırası okunur olsun (önce iki `table.*` başlık, sonra dört rozet etiketi). JSON geçerli kalsın (virgüller).
- (c) **SORUMLU:** Orkestratör. (Opsiyonel kalite: §5 — `i18n-translator`.)
- (d) **Bağımlılık:** Task 1'den sonra önerilir (backend bittikten sonra frontend'e geç). **DİKKAT:** bu dosya kaydedilince PostToolUse hook çalışır ve **parite "8 dilde EKSİK(6)" hatası verir** — bu BEKLENEN, çünkü diğer 8 locale henüz güncellenmedi (bkz. §8).
- (e) **DoD:** `tr.json` geçerli JSON; 6 anahtar mevcut. (Hook bu adımda kırmızı olabilir — set tamamlanınca yeşile döner.)

**Alt-task 2.2 — Diğer 8 locale'e aynı 6 anahtarı ekle**
- (a) **Dosya:** `frontend/src/locales/{en,ru,es,de,fr,pt,it,ja}.json` (8 dosya), her birinde `admin.users.table.*` bloğu civarı.
- (b) **Ne yapılacak:** Her dosyaya, o dile ait sütundan 6 anahtar/değeri ekle (yukarıdaki tablo). Anahtar adları 9 dilde AYNI; yalnız değerler dile göre değişir. Her dosya geçerli JSON kalmalı.
- (c) **SORUMLU:** Orkestratör. (Opsiyonel: §5 `i18n-translator` — cinsiyet-çekimli ru/it/fr ince ayarı istenirse.)
- (d) **Bağımlılık:** 2.1'den sonra. Kesintisiz tek oturumda tamamlanmalı — **9'uncu dosya kaydedilene kadar hook parite hatası verir (normal)**.
- (e) **DoD:**
  - 9 locale'in her birinde 6 yeni anahtar mevcut; hepsi geçerli JSON.
  - `node frontend/scripts/i18n-check.mjs` → **exit 0** ("parite OK · placeholder OK · em-dash 0 · Türkiye/KVKK/GDPR 0").
  - Bu adım sonunda PostToolUse hook (son locale kaydında) **yeşil** olmalı.

---

### TASK 3 — Frontend: kolon başlıkları + rozet hücreleri (i18n'den SONRA)
**Amaç:** Users tablosuna iki `<th>` başlık ve iki `<td>` dolgulu-pill rozet eklemek; boş-durum `colSpan`'ı güncellemek.

**Alt-task 3.1 — Lucide ikon importları**
- (a) **Dosya:** `frontend/src/pages/AdminDashboard.jsx` — import bloğu (satır 5-8).
- (b) **Ne yapılacak:** `lucide-react` importuna **`ShieldOff`, `MailCheck`, `MailX`** ekle. (`ShieldCheck` ve `Mail` zaten import edilmiş — tekrar ekleme.)
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** Task 2 tamamlanmış olmalı (bu dosya kaydedilince hook, JSX'teki yeni `t('...')` anahtarlarını arar; anahtarlar 9 dilde yoksa hook fail eder).
- (e) **DoD:** Import satırı geçerli; kullanılmayan import uyarısı olmasın (üç ikon da 3.3'te kullanılacak).

**Alt-task 3.2 — İki yeni başlık `<th>` (Kredi ile Plan Düzenle arasına)**
- (a) **Dosya:** `frontend/src/pages/AdminDashboard.jsx` — `<thead>` içindeki başlık satırı (satır 381-386), `credit` başlığından (satır 385) sonra, `editPlan` başlığından (satır 386) önce.
- (b) **Ne yapılacak:** İki yeni `<th>` ekle, mevcut başlıklarla aynı sınıf (`className="px-4 py-3 font-semibold"`):
  - 2FA başlığı → `{t('admin.users.table.twofa')}`
  - E-Posta başlığı → `{t('admin.users.table.email')}`
  - Sıra K6: `... credit → **twofa → email** → editPlan`.
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 3.1 ile aynı dosya; 3.2/3.3/3.4 tek düzenlemede/ardışık yapılır (aynı dosya → yarış yok, sıralı).
- (e) **DoD:** `<thead>` 8 sütun başlığı gösterir; sıra K6 ile birebir.

**Alt-task 3.3 — İki yeni rozet hücresi `<td>` (her kullanıcı satırında)**
- (a) **Dosya:** `frontend/src/pages/AdminDashboard.jsx` — `<tbody>` satır gövdesi (satır 390-436), **Kredi hücresinden (satır 409-420) sonra**, Plan Düzenle hücresinden (satır 421-433) önce.
- (b) **Ne yapılacak:** Her `u` satırına iki `<td className="px-4 py-3">` ekle; içlerine **dolgulu pill rozet** (`.chip` sınıfı + ton + Lucide ikon (`size={13}`) + `t(...)` metni):
  - **2FA hücresi:** `u.totp_enabled` doğruysa → `chip bg-success/10 text-success` + `<ShieldCheck size={13} />` + `{t('admin.users.twofaOn')}`; değilse → `chip bg-surface text-muted` + `<ShieldOff size={13} />` + `{t('admin.users.twofaOff')}`. (K1/K2/K5)
  - **E-Posta hücresi:** `u.email_verified` doğruysa → `chip bg-success/10 text-success` + `<MailCheck size={13} />` + `{t('admin.users.emailVerified')}`; değilse → `chip bg-warning/10 text-warning` + `<MailX size={13} />` + `{t('admin.users.emailUnverified')}`. (K3/K4/K5)
  - Değerler 0/1 tamsayı → `!!u.totp_enabled` / `!!u.email_verified` biçiminde boolean koşul kullan.
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 3.2 ile aynı düzenleme; hücre sırası başlık sırasıyla (K6) birebir hizalı olmalı.
- (e) **DoD:** Her satırda 2FA + E-Posta rozetleri doğru ton/ikon/metinle görünür; başlık sırasıyla hücre sırası aynı sütuna denk gelir.

**Alt-task 3.4 — Boş-durum `colSpan` güncelle**
- (a) **Dosya:** `frontend/src/pages/AdminDashboard.jsx` — kullanıcı yoksa gösterilen satır (satır 438): `<td colSpan={6} ...>{t('admin.users.empty')}</td>`.
- (b) **Ne yapılacak:** `colSpan={6}` → **`colSpan={8}`** (kolon sayısı 6'dan 8'e çıktı). Sadece bu Users tablosundaki boş-durum; log tablolarındaki `colSpan={5}` DEĞİŞMEZ.
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 3.2/3.3 ile birlikte (kolon sayısı değişince zorunlu).
- (e) **DoD:** Kullanıcı listesi boşken "Kullanıcı bulunamadı." satırı tabloyu 8 kolon boyunca doğru kaplar (görsel bozulma yok).

---

### TASK 4 — Doğrulama: i18n-check + testler + build
**Amaç:** Değişikliklerin tüm guard'lardan geçtiğini kanıtlamak.

**Alt-task 4.1 — Frontend i18n paritesi**
- (a) **Dosya/komut:** `cd frontend && node scripts/i18n-check.mjs` (veya `npm --prefix frontend run i18n:check`).
- (b) **Ne yapılacak:** Çalıştır; çıktı "✓ i18n: … parite OK · placeholder OK · em-dash 0 · Türkiye/KVKK/GDPR 0 · 0 eksik" olmalı, **exit 0**.
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** Task 2 + Task 3 bitmiş olmalı.
- (e) **DoD:** exit 0; hata listesi boş.

**Alt-task 4.2 — Frontend build (hook zaten koşar, manuel de teyit)**
- (a) **Komut:** `npm --prefix frontend run build`.
- (b) **Ne yapılacak:** Vite build hatasız tamamlanmalı (kullanılmayan import / JSX hatası olmamalı).
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** Task 3 bitmiş olmalı.
- (e) **DoD:** Build başarılı; import/JSX hatası yok.

**Alt-task 4.3 — Backend test paketi (admin + i18n kategorileri)**
- (a) **Yol:** Admin panel → **Testler** sekmesi, ya da çalışan server'a admin token ile `POST /api/admin/tests/run-all`. (claude.md: tam paket server ile AYNI process'te koşulmalı.)
- (b) **Ne yapılacak:** **admin** ve **i18n** kategorileri yeşil olmalı. i18n kategorisi (`tests/i18n.tests.js`, 5 test) frontend kaynağını okuyup pariteyi arka uçtan tekrar doğrular. Not: frontend kaynağı erişilebilir değilse i18n testi "atla+geç" yapar; bu durumda 4.1 (i18n-check) yeşil olması yeterli kanıttır.
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** Task 1-3 bitmiş; server ayakta.
- (e) **DoD:** admin + i18n kategorileri yeşil (kırmızı yeni test yok). Erişim yoksa 4.1 yeşilliği + `grep` ile `totp_secret` yokluğu kanıt sayılır.

---

## 4) Orkestrasyon Planı (devir mekaniği)

### Devir tablosu
| İş türü | Sorumlu | Model/effort | Devir? |
|---|---|---|---|
| Backend SELECT (Task 1) | Orkestratör | mevcut oturum | Hayır — kendi yapar |
| i18n anahtar ekleme (Task 2) | Orkestratör | mevcut oturum | Hayır — çeviriler planda hazır (K9). **Opsiyonel** kalite katmanı: `i18n-translator` (Opus, high) |
| Frontend JSX (Task 3) | Orkestratör | mevcut oturum | Hayır — kendi yapar |
| Doğrulama (Task 4) | Orkestratör | mevcut oturum | Hayır — kendi yapar |

### Ne zaman devredilir
- **Bu görevde varsayılan: DEVİR YOK.** Tüm işler mekanik, desen-belli, tek dosya-grubu ve düşük-riskli; kullanıcı da açıkça "tek uygulayıcı yeterli" dedi. Orkestratör 4 task'ı da kendi context'inde yürütür.
- **Tek opsiyonel devir:** Kullanıcı çeviri kalitesinde ince ayar isterse (özellikle cinsiyet-çekimli **ru / it / fr** durum etiketleri: "Подтверждён", "Verificata", "Activé/Désactivé"), Task 2 mevcut **`i18n-translator`** subagent'ına devredilebilir. Bu devir ZORUNLU DEĞİL — plandaki çeviriler zaten uygulanabilir ve tüm guard'lardan geçer.

### Nasıl devredilir (opsiyonel i18n devri için kopyalanabilir şablon)
> Yalnız kullanıcı çeviri inceltmesi isterse kullanılır.
```
Görev: BeyLink admin "Kullanıcılar" tablosu için 6 yeni durum etiketini 9 locale'de doğrula/incelt.
Kaynak-doğru referans (kanonik tr) ve mevcut değerler:
  admin.users.table.twofa      = "2FA" (tüm dillerde 2FA — DEĞİŞTİRME)
  admin.users.table.email      = tr:"E-Posta"
  admin.users.twofaOn          = tr:"Aktif"   (2FA etkin durumu)
  admin.users.twofaOff         = tr:"Pasif"   (2FA kapalı durumu)
  admin.users.emailVerified    = tr:"Onaylı"  (e-posta doğrulanmış)
  admin.users.emailUnverified  = tr:"Onaysız" (e-posta doğrulanmamış)
Diller: en, ru, es, de, fr, pt, it, ja (tr kanonik, dokunma).
Bağlam: admin panelde kullanıcı tablosunda kısa DURUM ROZETİ etiketleri (1-2 kelime, sığ hücre).
KISITLAR (ihlal = build kırmızı):
  - Değerlerde em-dash (—) YASAK; yalnız düz tire (-).
  - Değerlerde {placeholder} OLMAYACAK.
  - Türkiye/KVKK/GDPR/ülke-şehir referansı YASAK.
  - Anahtar adları 9 dilde AYNI; yalnız değer çevrilir.
Çıktı: her dil için 6 anahtarın nihai değerleri (JSON parçası), doğrudan
  frontend/src/locales/<dil>.json'a eklenecek biçimde.
DoD: `node frontend/scripts/i18n-check.mjs` exit 0.
```

### Orkestratörün ASLA kendi yapmayacağı işler
- Bu görevde yok — hepsi orkestratörün kapsamında. (Genel kural olarak: nüanslı çok-dilli metin üretimi gerekseydi `i18n-translator`'a giderdi; burada metinler hazır olduğu için gerekmiyor.)

### Devir sırası / yarış önlemi
- Aynı dosyaya yazan paralel subagent YOK. Tüm düzenlemeler tek uygulayıcıda **sıralı**.
- **En kritik sıra kuralı:** i18n locale seti (Task 2) **JSX'ten (Task 3) ÖNCE** bitmeli — yoksa hook, JSX'teki `t('...')` anahtarlarını JSON'da bulamaz ve build'i kırar (bkz. §6, §8).

---

## 5) Subagent Envanteri

**Mevcut (`.claude/agents/`):** `blog-translator`, `i18n-translator`, `legal-translator`, `marketing-copywriter`, `seo-writer`.

**Bu görevde kullanılacak:**
| Subagent | Durum | Rol | Model/effort |
|---|---|---|---|
| `i18n-translator` | Mevcut | **Opsiyonel** — yalnız çeviri ince ayarı istenirse (Task 2) | Opus, high (nüanslı çok-dilli içerik) |

**Yeni subagent OLUŞTURULMADI** — kullanıcı kararı (tek uygulayıcı) + iş mekanik/desen-belli. Varsayılan akışta hiçbir subagent çağrılmaz; orkestratör tüm işi yürütür.

---

## 6) Sıra ve Bağımlılık

```
Task 1 (backend)  ──►  Task 2 (i18n 9 locale)  ──►  Task 3 (frontend JSX)  ──►  Task 4 (doğrulama)
   bağımsız              JSX'ten ÖNCE bitmeli         i18n'den SONRA           en son
```

- **Task 1** bağımsız, `frontend/src` dışı → hook tetiklemez, güvenle ilk yapılır.
- **Task 2 → Task 3 sırası ZORUNLU:** JSX'teki yeni `t('...')` anahtarları 9 locale'de hazır OLMADAN JSX kaydedilirse PostToolUse hook build'i kırar.
- **Task 2 içi:** 9 locale kesintisiz tamamlanmalı; set yarımken hook parite hatası verir (beklenen, DUR-KAL değil — bkz. §8).
- Oturum bölme uyarısı: iş küçük, tek oturumda biter. Bölünürse Task 2'yi yarım bırakma (parite kırık kalır).

---

## 7) Sonraya Bırakılanlar
- Yok. Kullanıcı ertelenen/sıraya konan iş belirtmedi. (İleride istenebilecek ama kapsam DIŞI: kolonlara tıklayınca sıralama/filtre, ya da 2FA/e-posta durumuna göre arama — bu planda YOK.)

---

## 8) Guardrail (yedek, geri-dönüş, DUR-KAL)

**Yedekleme (git yok — proje git reposu değil):**
- Değişikliğe başlamadan önce dokunulacak dosyaların zip yedeği alınır:
  ```
  cd /Users/miracle/Desktop/Startings/beylink && \
  zip -r "scratchpad-backup-$(date +%Y%m%d-%H%M%S).zip" \
    backend/src/models/adminModel.js \
    frontend/src/pages/AdminDashboard.jsx \
    frontend/src/locales
  ```
  (Zip'i proje kökü yerine scratchpad'e koymak istersen hedefi oraya al.)
- Geri-dönüş noktası: herhangi bir adım kırmızı kalırsa zip'ten ilgili dosya(lar) restore edilir.

**BEKLENEN (DUR-KAL DEĞİL):**
- Task 2 sırasında 9 locale seti tamamlanana kadar PostToolUse hook'un **parite hatası** vermesi normaldir (tr'de var, ötekilerde yok → "EKSİK/FAZLA"). 9'uncu dosya bitince yeşile döner. Ara kırmızıda **durma**, seti tamamla.

**DUR-KAL koşulları (bunlarda dur, kullanıcıya sor):**
- `adminModel.js` SELECT'ine yanlışlıkla `totp_secret` girerse → DUR (K7 ihlali, güvenlik).
- Task 2 tam bitmesine rağmen `i18n-check.mjs` hâlâ **parite/placeholder** hatası veriyorsa → DUR (anahtar adı yazım hatası / eksik dil / bozuk JSON).
- Herhangi bir locale değerinde em-dash (—) veya Türkiye/KVKK/GDPR guard tetiklenirse → DUR ve değeri düzelt (tabloda yok; sızarsa yazım hatasıdır).
- `vite build` JSX/import hatasıyla kırılır ve neden açık değilse → DUR.

**Riskli adımlar (düşük ama dikkat):**
- 9 locale'de anahtar adı tutarlılığı (birebir aynı 6 anahtar). Tek harf farkı pariteyi kırar.
- JSON virgül/kapatma hatası (özellikle blok sonuna eklerken). Her dosya kaydından sonra hook zaten parse eder.

---

## 9) Model / Effort Dağılımı

| Task | Sorumlu | Model/effort | Gerekçe |
|---|---|---|---|
| Task 1 — Backend SELECT | Orkestratör | mevcut oturum (devredilirse Sonnet/xhigh) | Tek satır kolon ekleme; mekanik, desen-belli |
| Task 2 — i18n 9 locale | Orkestratör | mevcut oturum (opsiyonel `i18n-translator` Opus/high) | Çeviriler hazır; kopyalama işi. Nüans istenirse Opus/high |
| Task 3 — Frontend JSX | Orkestratör | mevcut oturum (devredilirse Sonnet/xhigh) | Desen-belli tablo hücresi/rozet; mevcut `.chip` + ton desenleri |
| Task 4 — Doğrulama | Orkestratör | mevcut oturum | Komut çalıştırma + yeşil teyidi |

- **Orkestratör varsayılanı:** mevcut oturum (bu iş için Opus gereksiz karmaşıklık değil; mekanik). Devredilecekse mekanik işler **Sonnet, effort xhigh**.
- **Opsiyonel içerik katmanı:** `i18n-translator` = **Opus, high** (nüanslı çok-dilli içerik kuralı).
- Güvenlik/mimari Opus-extra gerektiren adım YOK (şema/para/oturum'a dokunulmuyor).
