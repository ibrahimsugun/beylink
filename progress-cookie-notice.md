# Progress — İlk Ziyaret Çerez/Gizlilik Bildirimi (alt şerit)

**ŞU AN:** ✅ Tamamlandı — 3 task uygulandı. i18n-check exit 0, vite build hatasız, tarayıcı smoke geçti (banner görünür → Detaylar `/privacy` → Tamam → reload'da çıkmaz; EN dil değişimi doğru; konsol hatası yok).
İşaretleme: ⬜ bekliyor · 🔄 devam · ✅ bitti

## Genel Özet
| Task | Başlık | Durum |
|---|---|---|
| 1 | i18n — 9 locale × 3 anahtar (`cookieNotice.*`) | ✅ |
| 2 | Bileşen (`CookieNotice.jsx`) + App entegrasyonu | ✅ |
| 3 | Doğrulama — i18n-check + build + smoke | ✅ |

**Bitti:** 3 / 3 · **Bekliyor:** 0 / 3

---

## TASK 1 — i18n: 9 locale × 3 anahtar (JSX'ten ÖNCE)
> Anahtarlar: `cookieNotice.text`, `cookieNotice.accept`, `cookieNotice.details` · placeholder YOK · em-dash YOK · Türkiye/KVKK/GDPR YOK
- [x] **1.1** `frontend/src/locales/tr.json` (kanonik) — 3 anahtar (metin K1 birebir)
  - SORUMLU: Orkestratör (ops: `i18n-translator` Opus/high) · DoD: geçerli JSON (hook bu adımda kırmızı olabilir — normal)
- [x] **1.2** Diğer 8 locale (değerler plan §3 tablosundan)
  - [x] en.json
  - [x] ru.json
  - [x] es.json
  - [x] de.json
  - [x] fr.json
  - [x] pt.json
  - [x] it.json
  - [x] ja.json
  - SORUMLU: Orkestratör (ops: `i18n-translator`) · DoD: `node frontend/scripts/i18n-check.mjs` exit 0; son kayıtta hook yeşil

## TASK 2 — Bileşen + App (i18n'den SONRA)
- [x] **2.1** `frontend/src/components/CookieNotice.jsx` (YENİ) — `export function CookieNotice()`; localStorage `beylink_notice_ack` (try/catch); `fixed bottom-0` ince şerit; metin + `<Link to="/privacy">Detaylar</Link>` + "Tamam" butonu
  - SORUMLU: Orkestratör · DoD: 9-dilli metin render; Tamam → localStorage + gizlenir; reload'da çıkmaz; localStorage erişilemezse hata yok
- [x] **2.2** `frontend/src/App.jsx` — import `CookieNotice`; ana dal return'ü (satır 103-186) fragment'e sar + `<CookieNotice/>` (branded dal 93-101 DEĞİŞMEZ — K2)
  - SORUMLU: Orkestratör · DoD: ana host'ta ilk ziyarette görünür; branded host'ta HİÇ görünmez

## TASK 3 — Doğrulama
- [x] **3.1** `cd frontend && node scripts/i18n-check.mjs` → exit 0
  - SORUMLU: Orkestratör · DoD: exit 0, hata yok
- [x] **3.2** `npm --prefix frontend run build` → hatasız
  - SORUMLU: Orkestratör · DoD: build başarılı
- [x] **3.3** Manuel smoke: banner görünür → Detaylar `/privacy` → Tamam kaybolur → reload'da çıkmaz; branded host'ta çıkmaz; dil değişince metin döner; sayfa akışı engellenmez
  - SORUMLU: Orkestratör · DoD: tüm davranışlar beklendiği gibi

---

## Notlar / Karar Günlüğü
- KİLİTLİ: K1 sade çereze-odaklı metin (kanonik TR kilitli; "hiçbir veri toplamıyoruz" YOK) · K2 branded'da çıkmaz (yalnız ana host) · K3 "Detaylar"→/privacy Link (`cookieNotice.details`) · K4 tek "Tamam" (`cookieNotice.accept`) · K5 localStorage `beylink_notice_ack` · K6 alt-sabit ince şerit (modal değil) · K7 `components/CookieNotice.jsx` named export · K8 3 anahtar×9 locale · K9 yeni npm yok
- Guardrail: değişiklik öncesi zip yedek (App.jsx + locales). Task 1 yarımken hook parite hatası NORMAL.
- DUR-KAL: metne "hiçbir veri toplamıyoruz" sızarsa · banner branded dalda görünürse · i18n tam-sette kırmızıysa · build açıklanamayan hatayla kırılırsa.
