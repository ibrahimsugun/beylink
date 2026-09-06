# Progress — Admin "Kullanıcılar" Tablosu: 2FA + E-Posta Kolonları

**ŞU AN:** ✅ Tamamlandı — 4 task uygulandı, i18n-check exit 0, vite build hatasız.
İşaretleme: ⬜ bekliyor · 🔄 devam · ✅ bitti

## Genel Özet
| Task | Başlık | Durum |
|---|---|---|
| 1 | Backend — `listUsers` SELECT + 2 kolon | ✅ |
| 2 | i18n — 9 locale × 6 anahtar | ✅ |
| 3 | Frontend — kolon başlık + rozet + colSpan | ✅ |
| 4 | Doğrulama — i18n-check + build + testler | ✅ |

**Bitti:** 4 / 4 · **Bekliyor:** 0 / 4

---

## TASK 1 — Backend: `listUsers` SELECT'ine iki kolon
- [x] **1.1** `backend/src/models/adminModel.js` `listUsers()` SELECT'ine `u.totp_enabled, u.email_verified` ekle (satır 36)
  - SORUMLU: Orkestratör (mevcut oturum)
  - DoD: `GET /api/admin/users` her user'da `totp_enabled`+`email_verified` (0/1) döner; `totp_secret` YOK; admin test kategorisi yeşil

## TASK 2 — i18n: 9 locale'e 6 anahtar (JSX'ten ÖNCE)
> Anahtarlar: `admin.users.table.twofa`, `admin.users.table.email`, `admin.users.twofaOn`, `admin.users.twofaOff`, `admin.users.emailVerified`, `admin.users.emailUnverified`
- [x] **2.1** `frontend/src/locales/tr.json` (kanonik) — 6 anahtar ekle
  - SORUMLU: Orkestratör (opsiyonel: `i18n-translator` Opus/high)
  - DoD: geçerli JSON; 6 anahtar mevcut (hook bu adımda kırmızı olabilir — normal)
- [x] **2.2** Diğer 8 locale — aynı 6 anahtar (değerler §plan tablosundan)
  - [x] en.json
  - [x] ru.json
  - [x] es.json
  - [x] de.json
  - [x] fr.json
  - [x] pt.json
  - [x] it.json
  - [x] ja.json
  - SORUMLU: Orkestratör (opsiyonel: `i18n-translator` Opus/high — ru/it/fr çekim ince ayarı)
  - DoD: 9 locale'de 6 anahtar; `node frontend/scripts/i18n-check.mjs` exit 0; son kayıtta hook yeşil

## TASK 3 — Frontend: kolon + rozet (i18n'den SONRA)
> Dosya: `frontend/src/pages/AdminDashboard.jsx`
- [x] **3.1** Ikon importu: `ShieldOff, MailCheck, MailX` ekle (satır 5-8; `ShieldCheck`/`Mail` zaten var)
  - SORUMLU: Orkestratör · DoD: geçerli import, kullanılmayan-import uyarısı yok
- [x] **3.2** İki `<th>` başlık: `twofa` + `email` (Kredi ile Plan Düzenle arasına — K6)
  - SORUMLU: Orkestratör · DoD: thead 8 sütun; sıra K6 ile birebir
- [x] **3.3** İki `<td>` dolgulu-pill rozet (her kullanıcı satırında)
  - 2FA: aktif→`bg-success/10 text-success`+`ShieldCheck`; pasif→`bg-surface text-muted`+`ShieldOff`
  - E-Posta: onaylı→`bg-success/10 text-success`+`MailCheck`; onaysız→`bg-warning/10 text-warning`+`MailX`
  - SORUMLU: Orkestratör · DoD: rozetler doğru ton/ikon/metin; başlık-hücre hizalı
- [x] **3.4** Boş-durum `colSpan={6}` → `colSpan={8}` (satır 438; log tabloları colSpan=5 DEĞİŞMEZ)
  - SORUMLU: Orkestratör · DoD: boş liste satırı 8 kolonu doğru kaplar

## TASK 4 — Doğrulama
- [x] **4.1** `cd frontend && node scripts/i18n-check.mjs` → exit 0 ("parite OK · em-dash 0 · …")
  - SORUMLU: Orkestratör · DoD: exit 0, hata listesi boş
- [x] **4.2** `npm --prefix frontend run build` → hatasız
  - SORUMLU: Orkestratör · DoD: build başarılı; import/JSX hatası yok
- [x] **4.3** Backend test paketi — **admin** + **i18n** kategorileri yeşil (admin panel → Testler / `POST /api/admin/tests/run-all`)
  - SORUMLU: Orkestratör · DoD: admin+i18n yeşil; frontend kaynağı erişilemezse 4.1 yeşilliği + `totp_secret` yokluğu kanıt

---

## Notlar / Karar Günlüğü
- Kararlar (KİLİTLİ): K1 2FA aktif=yeşil+ShieldCheck · K2 pasif=gri+ShieldOff · K3 e-posta onaylı=yeşil+MailCheck · K4 onaysız=amber+MailX · K5 dolgulu pill (.chip) · K6 sıra `…Kredi\|2FA\|E-Posta\|Plan Düzenle` · K7 totp_secret ASLA dönmez · K8 6 anahtar×9 locale · K9 çeviriler planda kilitli
- Guardrail: değişiklik öncesi zip yedek (plan §8). Task 2 yarımken hook parite hatası NORMAL; 9 locale bitince yeşil.
- DUR-KAL: totp_secret sızarsa · i18n-check tam-sette hâlâ kırmızıysa · em-dash/Türkiye guard tetiklenirse · build açıklanamayan hatayla kırılırsa.
