# Plan — İlk Ziyaret Çerez/Gizlilik Bildirimi (alt şerit banner)

> Kapsam: BeyLink ana sitesinde **ilk ziyarette ekranın altında ince, sabit bir bilgilendirme
> şeridi** (modal DEĞİL, sayfa akışını engellemez). Kısa dürüst metin + "Detaylar" linki (Gizlilik)
> + tek **"Tamam"** butonu (Kabul/Red YOK). Tamam'a basınca localStorage'a işaretlenir, bir daha
> çıkmaz. Yalnız ana BeyLink host'unda; branded (özel-domain) profillerde ÇIKMAZ.
> Tamamen frontend; yeni npm paketi YOK (saf React + localStorage).

---

## 1) Kararlar

### KİLİTLİ
| # | Karar | Gerekçe |
|---|---|---|
| K1 | Metin = **sade, çereze odaklı** (dürüst/savunulabilir). Kanonik TR birebir: *"Çerez kullanmıyoruz ve sizi reklam için izlemiyoruz. Yalnız hizmetin çalışması ve temel istatistikler için gereken verileri kullanırız. Sitemizi kullanmaya devam ederek bunu kabul etmiş olursunuz."* | Kullanıcı seçimi. "Hiçbir veri toplamıyoruz" iddiası YOK → analitik gerçeğiyle çelişmez, yasal risk yok |
| K2 | Banner **yalnız ana BeyLink host'unda**; `isCustomDomainHost()` **true** dalında (App.jsx 93-101) ÇIKMAZ | Özel domain müşterinin markası; orada BeyLink bildirimi yersiz |
| K3 | Banner içinde **"Detaylar" linki → `/privacy`** (react-router `Link`), metni i18n (`cookieNotice.details`) | Kullanıcı istedi; sade metinle doğal birleşir; `/privacy` sayfası mevcut |
| K4 | Tek **"Tamam"** butonu (Kabul/Red YOK); yeni anahtar `cookieNotice.accept` | `common.ok`/`gotIt` yok; `common.close`="Kapat" nüansı farklı |
| K5 | İlk-ziyaret hatırlama = **localStorage** `beylink_notice_ack='1'` (LanguageContext deseni) | Mevcut desen; yeni bağımlılık yok. Cookie DEĞİL → "çerez kullanmıyoruz" metniyle tutarlı |
| K6 | Alt-sabit **ince şerit** (`fixed bottom-0`, modal değil, backdrop yok) | Kullanıcı isteği: sayfa akışını engellemeyen banner |
| K7 | Yeni bileşen `frontend/src/components/CookieNotice.jsx` (kök seviye, `ProtectedRoute.jsx` gibi); **named export** | Global UI parçası; belirli alan grubuna ait değil |
| K8 | Yeni i18n anahtarları `cookieNotice.*` (3 adet), **9 locale'in hepsine**; çeviriler planda kilitli (§3 Task 1) | Parite testi + PostToolUse hook zorunlu |
| K9 | Yeni npm paketi YOK (saf React + localStorage) | claude.md "sıfır gereksiz bağımlılık" |

### AÇIK KALAN
- Yok.

### İçerik dürüstlüğü notu (çözüldü)
- Proje **HTTP çerezi kullanmıyor** (oturum Bearer/JWT, tarayıcı hafızasında) → "çerez kullanmıyoruz" savunulabilir. Analitik (ziyaret/tıklama, cihaz/tarayıcı/OS, ülke-düzeyi geoip, referrer) toplanıyor ama metin "hiçbir veri toplamıyoruz" DEMİYOR; "hizmet + temel istatistikler için gereken veriler" diyor → **doğru**. İroni (banner kendi ack bayrağını localStorage'a yazar) K1/K5 ile uyumlu (localStorage ≠ çerez).

---

## 2) Teknik Mimari (gerçek dosyalar / satırlar)

**Mount noktası (doğrulandı):**
- `frontend/src/main.jsx` (satır 9-19): `BrowserRouter > LanguageProvider > AuthProvider > App`. Banner App **içinde** olmalı → `t()` (LanguageProvider) ve tüm rotalar erişilir.
- `frontend/src/App.jsx`:
  - `isCustomDomainHost()` (satır 59-60) + branded dal (satır 93-101): **yalnız `PublicProfile`**. Banner buraya EKLENMEZ (K2).
  - Ana dal (satır 103-186): `return ( <Routes> … </Routes> )`. → Fragment'e sarılıp `<CookieNotice/>` eklenir (§3 Task 2.2).

**Dokunulacak / yeni dosyalar:**
| Dosya | Değişiklik |
|---|---|
| `frontend/src/locales/{tr,en,ru,es,de,fr,pt,it,ja}.json` | 3 yeni `cookieNotice.*` anahtarı × 9 dosya (§3 Task 1 tablosu) |
| `frontend/src/components/CookieNotice.jsx` | **YENİ** bileşen (saf React + localStorage + react-router `Link`) |
| `frontend/src/pages/../App.jsx` (`frontend/src/App.jsx`) | ana dal return'ü fragment'e sar + `<CookieNotice/>` + import (branded dal dokunulmaz) |
| (doğrulama) `frontend/scripts/i18n-check.mjs` | çalıştırılır — düzenlenmez |

**Referans desenler:**
- localStorage: `LanguageContext.jsx` (satır 11-20) — `localStorage.getItem/setItem(LS_KEY)`. Banner: `beylink_notice_ack`.
- Bileşen export biçimi: `components/ProtectedRoute.jsx` (named export) → `export function CookieNotice()`.
- i18n kullanımı: `useLanguage()` → `t('...')` (App.jsx satır 6, 72 örnekleri).
- Rota linki: react-router `Link to="/privacy"` (App satır 117'de `/privacy` rotası mevcut → `site/pages/Privacy.jsx`).

**Kritik operasyonel gerçek — PostToolUse hook (önceki işlerde kanıtlandı):**
`.claude/settings.json`: `frontend/src` her düzenlemede `node frontend/scripts/i18n-check.mjs && npm --prefix frontend run build`.
→ JSX/bileşende yeni `t('cookieNotice.*')` anahtarı 9 locale'de yoksa build KIRILIR; locale seti yarımken parite hatası (beklenen). **i18n (Task 1) → JSX (Task 2) sırası ZORUNLU** (§6, §8).

---

## 3) Task / Alt-task Yapısı (uygulamanın kalbi)

> SORUMLU: tamamı **Orkestratör (tek uygulayıcı, mevcut oturum)**. Desen-belli + düşük-riskli →
> subagent devri YOK (§4). Devredilirse önerilen profil: **Sonnet, effort xhigh**.

---

### TASK 1 — i18n: 9 locale'e 3 anahtar (JSX'ten ÖNCE)
**Amaç:** banner metni/link/buton metinlerini 9 dilde hazır etmek.

**Yeni anahtarlar + çeviri tablosu (birebir uygulanacak — K8). Hiçbirinde `{placeholder}` yok, em-dash yok, Türkiye/KVKK/GDPR referansı yok.**

| Anahtar | Değer |
|---|---|
| `cookieNotice.text` (tr) | Çerez kullanmıyoruz ve sizi reklam için izlemiyoruz. Yalnız hizmetin çalışması ve temel istatistikler için gereken verileri kullanırız. Sitemizi kullanmaya devam ederek bunu kabul etmiş olursunuz. |
| `cookieNotice.text` (en) | We don't use cookies and we don't track you for advertising. We only use the data needed to run the service and for basic statistics. By continuing to use our site, you accept this. |
| `cookieNotice.text` (ru) | Мы не используем файлы cookie и не отслеживаем вас в рекламных целях. Мы используем только данные, необходимые для работы сервиса и базовой статистики. Продолжая пользоваться сайтом, вы соглашаетесь с этим. |
| `cookieNotice.text` (es) | No usamos cookies ni te rastreamos con fines publicitarios. Solo usamos los datos necesarios para que el servicio funcione y para estadísticas básicas. Al seguir usando nuestro sitio, aceptas esto. |
| `cookieNotice.text` (de) | Wir verwenden keine Cookies und verfolgen dich nicht für Werbung. Wir nutzen nur die Daten, die für den Betrieb des Dienstes und einfache Statistiken nötig sind. Durch die weitere Nutzung unserer Website stimmst du dem zu. |
| `cookieNotice.text` (fr) | Nous n'utilisons pas de cookies et ne vous suivons pas à des fins publicitaires. Nous utilisons uniquement les données nécessaires au fonctionnement du service et à des statistiques de base. En continuant à utiliser notre site, vous acceptez cela. |
| `cookieNotice.text` (pt) | Não usamos cookies e não rastreamos você para publicidade. Usamos apenas os dados necessários para o funcionamento do serviço e estatísticas básicas. Ao continuar usando nosso site, você aceita isso. |
| `cookieNotice.text` (it) | Non usiamo cookie e non ti tracciamo per la pubblicità. Usiamo solo i dati necessari per far funzionare il servizio e per statistiche di base. Continuando a usare il nostro sito, accetti tutto ciò. |
| `cookieNotice.text` (ja) | 当サイトはCookieを使用せず、広告目的で追跡することもありません。サービスの運営と基本的な統計に必要なデータのみを使用します。サイトの利用を続けることで、これに同意したものとみなされます。 |

| Anahtar | tr | en | ru | es | de | fr | pt | it | ja |
|---|---|---|---|---|---|---|---|---|---|
| `cookieNotice.accept` | Tamam | Got it | Понятно | Entendido | Verstanden | Compris | Entendi | Ho capito | 了解 |
| `cookieNotice.details` | Detaylar | Details | Подробнее | Detalles | Details | Détails | Detalhes | Dettagli | 詳細 |

> GUARD teyidi: `{...}` yok; em-dash (—) yok (apostrof/düz tire güvenli, ör. fr `n'utilisons`); Türkiye/KVKK/GDPR yok. `document.title`/marka referansı yok.

**Alt-task 1.1 — Kanonik `tr.json`'a 3 anahtar**
- (a) **Dosya:** `frontend/src/locales/tr.json` (okunur bir yere; ör. `common.*` bloğu ~satır 80 civarı veya dosya sonu — mevcut düzene uy).
- (b) **Ne:** `cookieNotice.text/accept/details` (tr değerleri); geçerli JSON.
- (c) **SORUMLU:** Orkestratör (opsiyonel `i18n-translator`).
- (d) **Bağımlılık:** İlk yapılır. Kaydında hook "8 dilde EKSİK(3)" verir — BEKLENEN (§8).
- (e) **DoD:** `tr.json` geçerli; 3 anahtar mevcut.

**Alt-task 1.2 — Diğer 8 locale'e aynı 3 anahtar**
- (a) **Dosya:** `frontend/src/locales/{en,ru,es,de,fr,pt,it,ja}.json`.
- (b) **Ne:** Her dosyaya ilgili dil değerleriyle 3 anahtar. Anahtar adları 9 dilde AYNI.
- (c) **SORUMLU:** Orkestratör (opsiyonel `i18n-translator`).
- (d) **Bağımlılık:** 1.1'den sonra; kesintisiz tamamlanır.
- (e) **DoD:** 9 locale'de 3 anahtar; `node frontend/scripts/i18n-check.mjs` **exit 0**; son kayıtta hook yeşil.

---

### TASK 2 — Bileşen + App entegrasyonu (i18n'den SONRA)
**Amaç:** `CookieNotice` bileşenini oluşturmak ve App ana dalına (branded hariç) mount etmek.

**Alt-task 2.1 — `CookieNotice.jsx` bileşeni**
- (a) **Dosya (YENİ):** `frontend/src/components/CookieNotice.jsx`.
- (b) **Ne:** `export function CookieNotice()` — saf React:
  - `import { useState } from 'react'; import { Link } from 'react-router-dom'; import { useLanguage } from '../context/LanguageContext.jsx';`
  - Sabit: `const ACK_KEY = 'beylink_notice_ack';`
  - State: `const [visible, setVisible] = useState(() => { try { return localStorage.getItem(ACK_KEY) !== '1'; } catch { return true; } });` (try/catch — gizli mod/erişilemez localStorage akışı bozmasın; K5).
  - `if (!visible) return null;`
  - `const accept = () => { try { localStorage.setItem(ACK_KEY, '1'); } catch {} setVisible(false); };`
  - Render — **alt-sabit ince şerit** (modal değil, backdrop yok; K6):
    - Kapsayıcı: `fixed bottom-0 inset-x-0 z-40 border-t border-line bg-white/95 backdrop-blur` (marka paletiyle uyumlu; gölge opsiyonel). `role="region"` + `aria-label` (t('cookieNotice.text') veya sabit).
    - İç: `mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between` (mobilde alt alta, geniş ekranda yan yana).
    - Metin bloğu: `text-xs sm:text-sm text-ink-soft` → `{t('cookieNotice.text')}` + boşlukla `<Link to="/privacy" className="text-brand-violet underline hover:no-underline">{t('cookieNotice.details')}</Link>` (K3).
    - Buton: sağda, `shrink-0`, `btn-brand` (veya küçük eşdeğeri) → `onClick={accept}` → `{t('cookieNotice.accept')}` (K4).
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** Task 1 bitmiş olmalı (kaydında hook `t('cookieNotice.*')` anahtarlarını arar).
- (e) **DoD:** Bileşen 9-dilli metinle render olur; "Tamam" → localStorage `beylink_notice_ack='1'` + gizlenir; yeniden yüklemede çıkmaz; localStorage erişilemezse hata fırlatmaz.

**Alt-task 2.2 — App ana dalına mount (branded hariç)**
- (a) **Dosya:** `frontend/src/App.jsx` — import + ana dal return (satır 103-186).
- (b) **Ne:**
  1. Import ekle: `import { CookieNotice } from './components/CookieNotice.jsx';`
  2. Ana dal return'ünü fragment ile sar ve `<Routes>`'ın **kardeşi** olarak ekle:
     `return ( <> <Routes> … mevcut … </Routes> <CookieNotice /> </> );`
  3. **Branded dal (satır 93-101) DEĞİŞMEZ** — `isCustomDomainHost()` true iken `<CookieNotice/>` render EDİLMEZ (K2).
- (c) **SORUMLU:** Orkestratör.
- (d) **Bağımlılık:** 2.1 (bileşen var olmalı).
- (e) **DoD:** Ana host'ta (marketing/auth/dashboard/public profil) banner ilk ziyarette görünür; branded host'ta HİÇ görünmez; Tamam sonrası kalıcı gizli.

---

### TASK 3 — Doğrulama
**Alt-task 3.1 — i18n paritesi:** `cd frontend && node scripts/i18n-check.mjs` → **exit 0** ("parite OK · placeholder OK · em-dash 0 · Türkiye/KVKK/GDPR 0"). DoD: exit 0.
**Alt-task 3.2 — Frontend build:** `npm --prefix frontend run build` → hatasız (import/JSX). DoD: build başarılı.
**Alt-task 3.3 — Manuel smoke (önerilir):**
- Ana host (localhost): temiz localStorage → banner altta görünür; "Detaylar" → `/privacy`; "Tamam" → kaybolur; reload → çıkmaz; `localStorage.removeItem('beylink_notice_ack')` → tekrar çıkar.
- Branded host simülasyonu (APP_HOSTNAMES dışı hostname) → banner ÇIKMAZ.
- Dil değiştir → banner metni o dile döner (henüz ack'lenmediyse).
- DoD: tüm davranışlar beklendiği gibi; sayfa akışı engellenmiyor (modal değil).

---

## 4) Orkestrasyon Planı (devir mekaniği)

### Devir tablosu
| İş türü | Sorumlu | Model/effort | Devir? |
|---|---|---|---|
| i18n (Task 1) | Orkestratör | mevcut oturum | Hayır — çeviriler hazır (K8). **Opsiyonel**: `i18n-translator` (Opus/high) |
| Bileşen + App (Task 2) | Orkestratör | mevcut oturum | Hayır — kendi yapar |
| Doğrulama (Task 3) | Orkestratör | mevcut oturum | Hayır — kendi yapar |

### Ne zaman devredilir
- **Varsayılan: DEVİR YOK.** İş desen-belli, düşük-riskli, tek uygulayıcı. Orkestratör 3 task'ı kendi context'inde yürütür.
- **Tek opsiyonel devir:** Task 1 çevirilerinde ton/ince ayar istenirse mevcut **`i18n-translator`** (Opus/high). ZORUNLU DEĞİL — plandaki çeviriler tüm guard'lardan geçer.

### Nasıl devredilir (opsiyonel i18n devri — kopyalanabilir şablon)
```
Görev: BeyLink çerez bildirimi şeridi için 3 anahtarı 9 locale'de doğrula/incelt.
Kanonik (tr) referans: [plan §3 Task 1 tablosundaki tr değerleri]
Diller: en, ru, es, de, fr, pt, it, ja (tr kanonik, dokunma).
Bağlam: sitenin altında ilk-ziyaret bilgilendirme şeridi (kısa metin + "Detaylar" linki + "Tamam" butonu).
KISITLAR (ihlal = build kırmızı):
  - "hiçbir veri toplamıyoruz" gibi MUTLAK iddia YAZMA (analitik toplanıyor) — yalnız "çerez yok +
    hizmet/temel istatistik için gereken veriler" çerçevesi.
  - {placeholder} YOK; em-dash (—) YASAK (düz tire); Türkiye/KVKK/GDPR/ülke-şehir referansı YASAK.
  - Anahtar adları 9 dilde AYNI; yalnız değer çevrilir.
Çıktı: her dil için 3 anahtarın JSON parçası (frontend/src/locales/<dil>.json'a).
DoD: `node frontend/scripts/i18n-check.mjs` exit 0.
```

### Orkestratörün ASLA kendi yapmayacağı işler
- Bu görevde yok.

### Devir sırası / yarış önlemi
- Paralel subagent YOK; sıralı. **En kritik sıra:** i18n (Task 1) → JSX (Task 2). Aksi halde hook `t('cookieNotice.*')` anahtarlarını bulamaz, build kırılır.
- Task 2 içi: 2.1 (bileşen) → 2.2 (App import+mount).

---

## 5) Subagent Envanteri
**Mevcut (`.claude/agents/`):** `blog-translator`, `i18n-translator`, `legal-translator`, `marketing-copywriter`, `seo-writer`.
**Kullanılacak:** yalnız **opsiyonel** `i18n-translator` (Opus/high) — çeviri ince ayarı istenirse (Task 1). Varsayılan akışta subagent çağrılmaz.
**Yeni subagent OLUŞTURULMADI** (iş desen-belli, tek uygulayıcı).

---

## 6) Sıra ve Bağımlılık
```
Task 1 (i18n 9 locale)  ──►  Task 2 (CookieNotice.jsx → App.jsx)  ──►  Task 3 (doğrulama)
  JSX'ten ÖNCE bitmeli        i18n'den SONRA                          en son
```
- Bu görev tamamen frontend → İLK düzenleme (locale) bile hook'u tetikler. Task 1 yarımken parite hatası (beklenen).
- **Task 1 → Task 2 ZORUNLU** (hook). Task 2 içi 2.1 → 2.2.
- İş küçük, tek oturumda biter. Bölünürse Task 1'i yarım bırakma.

---

## 7) Sonraya Bırakılanlar
- Banner'ı marketing/public dışında (dashboard) gizleme gibi ince ayar — **YOK** (ana host'ta her yerde tek sefer; kabul edildi). İstenirse sonradan rota-bazlı koşul eklenebilir.
- "Reddet" veya çerez tercih yönetimi — **KASITLI YOK** (Kabul/Red istenmiyor; tek "Tamam").

---

## 8) Guardrail (yedek, geri-dönüş, DUR-KAL)

**Yedekleme (git yok):**
```
cd /Users/miracle/Desktop/Startings/beylink && \
zip -r "scratchpad-backup-cookienotice-$(date +%Y%m%d-%H%M%S).zip" \
  frontend/src/App.jsx \
  frontend/src/locales
```
(`CookieNotice.jsx` yeni dosya — yedeğe gerek yok; silinerek geri alınır.) Geri-dönüş: kırmızı adımda zip'ten restore + yeni dosyayı sil.

**BEKLENEN (DUR-KAL DEĞİL):**
- Task 1'de 9 locale tamamlanana kadar hook parite hatası → normal; son dosyada yeşilir. Ara kırmızıda durma.

**DUR-KAL koşulları (dur, kullanıcıya sor):**
- Metne "hiçbir veri toplamıyoruz/saklamıyoruz" gibi MUTLAK iddia sızarsa → DUR (K1; kanonik metin kilitli).
- Banner `isCustomDomainHost()` **true** dalında (branded) görünür olursa → DUR (K2 ihlali).
- Task 1 tam bitmesine rağmen `i18n-check` parite/placeholder/em-dash/Türkiye hatası veriyorsa → DUR.
- `vite build` açıklanamayan JSX/import hatasıyla kırılırsa → DUR.

**Riskli/dikkat:**
- `App.jsx` ana dal return'ünü fragment'e sararken JSX bütünlüğü (tek kök → `<>…</>`); branded dal (93-101) DEĞİŞMEZ.
- z-index: alt şerit `z-40`; mevcut `Modal` z-index'i ile çakışmadığını smoke'ta gözle (banner modalların ÜSTÜNE çıkmamalı). Gerekirse z değerini düşür.
- localStorage try/catch (gizli mod). JSON virgül/kapatma bütünlüğü.

---

## 9) Model / Effort Dağılımı
| Task | Sorumlu | Model/effort | Gerekçe |
|---|---|---|---|
| Task 1 — i18n | Orkestratör | mevcut oturum (opsiyonel `i18n-translator` Opus/high) | Çeviriler hazır; kopyalama. Nüans → Opus/high |
| Task 2 — Bileşen + App | Orkestratör | mevcut oturum (devredilirse Sonnet/xhigh) | Saf React + localStorage + mevcut desenler; mekanik |
| Task 3 — Doğrulama | Orkestratör | mevcut oturum | Komut + smoke |

- Orkestratör varsayılanı: mevcut oturum. Devredilecek mekanik iş **Sonnet, effort xhigh**.
- Opsiyonel içerik katmanı: `i18n-translator` = **Opus, high**.
- Güvenlik/mimari Opus-extra gerektiren adım YOK (frontend UI + localStorage; para/oturum/şemaya dokunulmaz).
