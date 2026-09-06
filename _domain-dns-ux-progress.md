# Özel Alan Adı — DNS UX (Cloudflare Uyarısı + Subdomain) — İlerleme Takibi

Kaynak plan: `/Users/miracle/Desktop/beylink/domain-dns-ux-plan.md`
İşaretleme: ⬜ bekliyor · 🔄 devam · ✅ bitti

---

## GENEL DURUM

**ŞU AN: ✅ TAMAMLANDI. Task 1–4 bitti. Backend `kind`+tip-farkında talimat/doğrulama; frontend toggle+subdomain talimat+Cloudflare uyarısı; 10 anahtar 9 dilde; 25 domain testi (201/201 tam paket) yeşil; i18n+build yeşil; Caddyfile teyit. Kapsam dışına çıkılmadı; değişmezler korundu.**

İki iyileştirme: **Parça 1** = DNS talimatlarına Cloudflare/proxy "gri bulut" uyarısı. **Parça 2** = panelden subdomain (`links.siteniz.com`) ekleme + tipe göre doğru talimat (apex → A+www CNAME; subdomain → yalnız CNAME + TXT, A yok).

| Task | Konu | Parça | Sorumlu (model/effort) | Durum |
|---|---|---|---|---|
| 1 | Backend: `kind` sütunu + tip-farkında talimat + doğrulama | 2 | orkestratör (Opus·high) | ✅ |
| 2 | Frontend: apex/subdomain toggle + subdomain talimat + Cloudflare uyarısı + i18n seed | 1+2 | orkestratör (Opus·high) | ✅ |
| 3 | Çok dilli çeviri (10 yeni anahtar → 7 dil) | 1+2 | i18n-translator (Sonnet·xhigh) | ✅ |
| 4 | Test + doğrulama (tam paket + i18n + build) | 1+2 | orkestratör (Opus·high) | ✅ |

**Bağımlılık:** `1 → 2 → 3 → 4`. Task 3, Task 2.4 (EN kaynak + 7 placeholder) bitmeden başlamaz. Diller SIRALI: ru → es → de → fr → pt → it → ja.
**Taban:** 195/195 test (19'u "Özel Alan Adı"). Yeni testlerle artacak; bilinen 7 rate-limit self-loopback kırılganlığı bu işle İLGİSİZ (belgeli).

---

## Task 1 — Backend: subdomain-farkında model + talimat + doğrulama  ✅  · Sorumlu: orkestratör (Opus·high)
- [x] 1.1 ✅ `backend/src/db/migrate.js` → `ensureColumn('custom_domains','kind',"TEXT NOT NULL DEFAULT 'apex'")` (satır 242) + `npm run migrate` + `PRAGMA table_info` doğrulandı
  - DoD ✅: `kind` kolonu var (`TEXT NOT NULL DEFAULT 'apex'`, cid 12); mevcut satırlar apex; migrate 2× hatasız (idempotent)
- [x] 1.2 ✅ `backend/src/models/domainModel.js` → `create({..., kind='apex'})` INSERT'e `kind` kolonu (garbage→apex normalize); `normalizeDomain` DEĞİŞMEZ
  - DoD ✅: `create({kind:'subdomain'})` yazar; default apex; garbage→apex; `listByUser` kind döner (rollback'li sanity)
- [x] 1.3 ✅ `backend/src/controllers/domainController.js` → `withInstructions` tip-farkında (apex: aRecord+cnameHost'www'+txt / subdomain: aRecord null+cnameHost=FQDN+txt, `kind` döner) · `createDomain` `req.body.kind` (garbage→apex) + subdomain `domain.split('.').length<3` → `badRequest` · `verifyDomainNow` `{kind: row.kind}` geçer
  - DoD ✅: apex→A(@)+CNAME(www)+TXT; subdomain→CNAME(FQDN)+TXT, aRecord:null, kind:'subdomain'; 2-etiket subdomain→400 (Task 4 HTTP testiyle de doğrulanacak)
- [x] 1.4 ✅ `backend/src/services/domainVerify.js` → `verifyDomain(domain,{kind='apex',...})`; checkA/checkCname helper'ları; subdomain CNAME birincil (dns_cname), apex A birincil; OR fallback + TXT bloğu + resolver enjeksiyonu korunur
  - DoD ✅: mock subdomain CNAME→dns_cname (A eşleşse bile); apex A→dns_a; subdomain A-fallback→dns_a; TXT uyuşmazlığı→ok:false; üretim varsayılanı değişmedi
- [x] 1.5 ✅ `backend/src/middleware/resolveHost.js` → yorum güncellendi (apex+subdomain verbatim; www-strip yalnız www→apex kanonikliği); mantık no-op
  - DoD ✅: yorum güncel; davranış değişmedi (host-routing 3 testi hâlâ yeşil)
- **Task 1 DoD ✅:** sanity 11/11 geçti (verifyDomain kind ordering + model create kind, rollback'li); `npm run migrate` temiz+idempotent; **mevcut 19 domain testi 19/19 yeşil** (yeni kodla, :4099 throwaway server)
- **YEDEK ✅:** `beylink-backups/beylink-backup-pre-task1-20260711-141406.zip`

## Task 2 — Frontend: tip seçimi + subdomain talimat + Cloudflare uyarısı + i18n seed  ✅  · Sorumlu: orkestratör (Opus·high)
- [x] 2.1 ✅ [Parça 2] `DomainsPage.jsx` → apex/subdomain segmented toggle (`kind`+`kindTouched` state; `onDomainChange` etiket-sayısı sezgisi ≥3→subdomain; `chooseKind` manuel override sezgiyi durdurur); placeholder tipe göre; `create()` → `{domain, kind}` + istemci ön-kontrolü (subdomain etiket<3 → `errorSubdomainNeedsLabel`)
  - DoD ✅: toggle + sezgi iki yönde de çalıştı (tarayıcıda doğrulandı); kind API'ye gitti (POST 201, `kind:'subdomain'`); placeholder değişti
- [x] 2.2 ✅ [Parça 2] `dnsRows()` → `instructions.kind||domain.kind` dallanır: subdomain CNAME(host=cnameHost=FQDN)+TXT(host=txtHost=FQDN), A YOK; apex mevcut 3 satır (A yalnız aRecord doluysa)
  - DoD ✅: subdomain'de CNAME(FQDN)+TXT görünür, A yok (tarayıcı screenshot); apex'te CNAME(www)+TXT korunur (dev serverIp boş → A gizli, mevcut davranış)
- [x] 2.3 ✅ [Parça 1] `DomainsPage.jsx` → DNS kartına Cloudflare/proxy uyarı bloğu (`AlertTriangle`+`dnsProxyWarningTitle`+`dnsProxyWarning`, `bg-warning/10`), tablonun üstünde her tipte
  - DoD ✅: uyarı hem apex hem subdomain kartında render oldu (screenshot)
- [x] 2.4 ✅ [Parça 1+2] `frontend/src/locales/{9 dil}.json` → §I'deki 10 anahtar: en=gerçek, tr=gerçek, 7=EN placeholder
  - DoD ✅: `npm run i18n:check` 9-parite yeşil (1630 anahtar), em-dash 0, Türkiye/KVKK/GDPR 0
- **Task 2 DoD ✅:** tarayıcıda uçtan uca (throwaway Pro Plus, :5181→:4099): **subdomain**→CNAME(links.mysubtest.example)+TXT, A yok, Cloudflare uyarısı; **apex**→CNAME(www)+TXT, uyarı; toggle+sezgi çalışır; API instructions doğru (aRecord:null, cnameHost:FQDN, kind:subdomain); `i18n:check`+`build` yeşil

## Task 3 — Çok dilli çeviri (10 anahtar → 7 dil)  ✅  · Sorumlu: i18n-translator (Sonnet·xhigh) — §D devri
> Her dil: §I'deki 10 anahtarın EN placeholder değerleri gerçek çeviriyle değiştirilir. Devir şablonu: plan §D3.
> Guard: em-dash YOK · Türkiye/KVKK/GDPR YOK · placeholder yok (bu anahtarlar `{}` içermez) · çoğul yok · DeepL DUR-KAL (456/429).
> SIRALI devir (D6): aynı dosyaya iki subagent aynı anda yazmaz.
- [x] 3.ru ✅ Rusça (i18n-translator devri) · você/siz nezaket · i18n:check+build yeşil · locales snapshot
- [x] 3.es ✅ İspanyolca · "tú" (dosya register'ıyla tutarlı, subagent course-correct) · yeşil · snapshot
- [x] 3.de ✅ Almanca · "du" register · "Subdomain" Almanca'da da aynı (loanword, leak değil) · yeşil · snapshot
- [x] 3.fr ✅ Fransızca · "vous" register · yeşil · snapshot
- [x] 3.pt ✅ Portekizce (pt-BR) · "você" register · yeşil · snapshot
- [x] 3.it ✅ İtalyanca · "tu" register · yeşil · snapshot
- [x] 3.ja ✅ Japonca · masu-form (です・ます) · yeşil · snapshot
- **Task 3 DoD ✅ (her dil):** 9 çevrilebilir anahtar gerçek çeviri (addPlaceholderSubdomain kasıtlı verbatim `links.yoursite.com`) · `i18n:check` 9-yönlü yeşil (1630 tr anahtar) · em-dash 0 · Türkiye/KVKK/GDPR 0 · placeholder leak yok
- **YEDEK ✅:** pre-task3 tam yedek + 7 dil locales snapshot + post-task3 tam yedek (beylink-backups/, 10 arşiv)
- **NOT:** Örnek alan adları (yoursite.com/links.yoursite.com) plan §D3 gereği 7 dilde verbatim korundu; bazı eski komşu anahtarlar (fr votresite / es tusitio) yerelleştirilmiş — kozmetik, kapsam dışı (isteğe bağlı sonraki iş).

## Task 4 — Test + doğrulama  ✅  · Sorumlu: orkestratör (Opus·high)
- [x] 4.1 ✅ `backend/src/tests/domains.tests.js` → güncelle+ekle (config import eklendi):
  - [x] `model-normalize-…` güncellendi: subdomain (`links.example.com`, `a.b.c.example.com`) korunuyor + `www.example.com`→apex çöküyor
  - [x] `create-subdomain-instructions-cname-only` (kind:subdomain, aRecord null, cnameHost=FQDN, txtValue var, A yok)
  - [x] `create-subdomain-needs-label-400` (2-etiket girdi subdomain modunda → 400)
  - [x] `create-apex-instructions-regression` (kind:apex, cnameHost='www', aRecord=config.serverIp||null, regresyon guard)
  - [x] `verify-subdomain-cname-match` (mock resolver, kind:subdomain → dns_cname ok)
  - [x] `host-routing-subdomain-serves-target` (subdomain kök→target, own slug 200, cross-owner 404)
  - [x] `tls-check-subdomain-active-200` (pending 403→active 200→plan düşünce 403 fail-closed)
  - DoD ✅: 25 domain testi (19+6) izole çalıştırmada 25/25 yeşil; "Özel Alan Adı" sayısı 19→25
- [x] 4.2 ✅ Tam paket + `i18n:check` + `build`
  - DoD ✅: **in-process tam paket 201/201 yeşil** (195 taban + 6 yeni; 0 regresyon). NOT: harici-runner ilk denemesinde 7 test kırmızıydı ama bunlar `__beylinkTestRunning` bayrağının yanlış process'te set edilmesi + :4099 rate-limit sayaç doygunluğu kaynaklı ARTEFAKT (reset.*/rl.*/sec.* — domain'le İLGİSİZ); in-process (bayrak paylaşımlı + taze rate-limit) 201/201 tam yeşil. `i18n:check` 9-parite yeşil + `build` yeşil.
- [x] 4.3 ✅ Caddyfile davranış teyidi (kod DEĞİŞMEDİ): `@www header_regexp ^www\.(.+)$` yalnız `www.`-önekli host'ları yakalar → subdomain (`links.siteniz.com`) 301'e TAKILMAZ, doğrudan sunulur; catch-all `:443 { tls { on_demand } }` her host'u (subdomain dahil) karşılar, `ask`→tls-check kapılı
  - DoD ✅: subdomain host akışı Caddy tarafında bozulmuyor (teyit edildi)
- **Task 4 DoD ✅:** yeni 6 test yeşil, 0 regresyon (201/201), i18n+build yeşil, test verisi `bltest_z_` FK-temiz (cleanupTestUsers)

---

## NOTLAR / KARARLAR GÜNLÜĞÜ
- **§H varsayılanları KABUL** ("BAŞLA"): toggle UX (H1), FQDN+ipucu (H2), `kind` sütunda saklanır (H3), www apex-kanonik değişmez (H4), Cloudflare uyarısı i18n bilgi tonu (H5), her tipte daima görünür (H6), §I metinleri orkestratör seed (H7), ek güvenlik turu YOK (H8), `domains.intro` değişmez (H9).
- **DoD/değişmez teyitleri:** subdomain instructions `aRecord:null`+`cnameHost=FQDN`+`kind:subdomain` (API+test doğrulandı); apex regresyon (`cnameHost:'www'`) korunuyor; `tls-check` fail-closed 200/403 subdomain'de de geçerli (test); cross-owner slug 404 + IDOR 404 subdomain host'ta da korunuyor (test); A6 (hesap başına 1) değişmedi.
- **`kind` normalize savunması:** hem controller (`req.body.kind==='subdomain'?...:'apex'`) hem model (`kind==='subdomain'?...:'apex'`) → geçersiz değer daima apex'e düşer (fail-safe).
- **verifyDomain kind sırası:** subdomain→CNAME birincil (dns_cname etiketi doğru), apex→A birincil; OR fallback + TXT bloğu + resolver enjeksiyonu korundu.
- **Frontend istemci ön-kontrolü:** subdomain etiket<3 → `errorSubdomainNeedsLabel` (i18n, yerelleştirilmiş) gösterilir; backend 400 ikinci savunma hattı.
- **Test runner artefaktı (önemli):** domain/tam paket testleri HARİCİ process'ten :4099'a koşulursa `__beylinkTestRunning` bayrağı server process'te set edilmediğinden reset.*/demo-token testleri ve doygun rate-limit sayaçları nedeniyle rl.*/sec.* testleri yanlış kırmızı verir. **IN-PROCESS koşum** (server+testRunner tek process, taze rate-limit) → 201/201 tam yeşil. Gelecekte tam paketi in-process (veya admin `run-all`) ile koş.
- **de "Subdomain" loanword:** Almanca'da da "Subdomain"/"Subdomain (CNAME)" → EN ile birebir; çeviri eksikliği DEĞİL.
- **Kozmetik (kapsam dışı):** yeni anahtarlardaki örnek alan adları (yoursite.com) 7 dilde verbatim; bazı eski komşu anahtarlar yerelleştirilmiş (fr votresite / es tusitio). İstenirse ayrı iş.
- **Sağlık taraması + ek testler (aynı gün, sonradan):** Portlar sibling çakışması için 4501/5501/8501'e taşındı (env.js/vite fallback'leri dahil tutarlı). "Özel Alan Adı" kategorisine **5 ek kenar-durum testi**: www+subdomain çökmesi→400, www.links.x.com→www'suz saklama, geçersiz kind→apex fail-safe, GET /domains kind+instructions kalıcılığı, www-önekli subdomain host eşleşmesi. **Tam paket 206/206 in-process yeşil**; i18n+build yeşil; DB integrity ok, FK 0, DEMO/MASSSKAA korunmuş, test artığı 0.

## YEDEK / GERİ-DÖNÜŞ
- Task 1 (DB) öncesi + Task 3 (toplu locale) öncesi + her dil bitiminde zip snapshot → `beylink-backups/` (node_modules/dist/.git hariç).
- Geri-dönüş: herhangi bir DoD kırmızısında ilgili zip'ten geri al; DUR-KAL koşulları plan §F.
