# BeyLink Logo Varlıkları — Drop Klasörü

Dosyalarını bu klasöre bırak, sonra `Logo.jsx` ve `favicon.svg` bunları kullanacak şekilde güncellenir.

Kapsam: yalnızca **kare ikon/amblem** değişiyor. "BeyLink" yazısı kod içinde metin
(`Sora` fontu, "Link" kısmı menekşe renkli — `frontend/src/components/ui/Logo.jsx`)
olarak kalıyor, resim değil — bu yüzden ayrı bir "wordmark" (yazı+ikon birleşik görsel)
dosyasına gerek yok.

## Zorunlu — mevcut 2 varlığın yerini alacak

| Dosya adı | Format / boyut | Nereye gidecek | Notlar |
|---|---|---|---|
| `logo-mark.svg` | Vektör SVG, kare (1:1) viewBox | `frontend/src/components/ui/Logo.jsx` içindeki inline SVG'nin yerine | Ana kaynak dosya. En küçük kullanım **18px** (public profil altındaki "Powered by" rozeti), en büyük **40px** (profil bulunamadı ekranı) — bu yüzden çok ince/detaylı çizgilerden kaçın. Hem beyaz sidebar/login ekranında hem de kullanıcının **kendi profil temasının rastgele renginin üzerinde** okunaklı olmalı: ya kendi zemin/arka planını taşısın (mevcut tasarımdaki gibi dolgulu kare), ya da şeffafsa hem açık hem koyu fonda test et. |
| `favicon.svg` | Vektör SVG, kare | `frontend/public/favicon.svg` (aynı isimle direkt değişir) | Tarayıcı sekmesinde 16-32px gibi çok küçük render edilir — sadeleştirilmiş bir versiyon olsun. İstersen `logo-mark.svg` ile birebir aynı da olabilir. |

## Opsiyonel — şu an projede olmayan, istersen ekleyebileceğimiz iyileştirmeler

| Dosya adı | Format / boyut | Ne için | Notlar |
|---|---|---|---|
| `logo-mark.png` | PNG, 512×512, şeffaf arka plan | Yüksek çözünürlük kaynak / gelecekte PWA manifest | SVG'nin raster yedeği. |
| `favicon-32.png` | PNG, 32×32 | Eski tarayıcı favicon fallback | Şu an sadece SVG favicon var, PNG/ICO fallback yok. |
| `favicon-16.png` | PNG, 16×16 | Eski tarayıcı favicon fallback | " |
| `apple-touch-icon.png` | PNG, 180×180, **şeffaf DEĞİL** | iOS "Ana Ekrana Ekle" ikonu | iOS şeffaflığı desteklemez — kendi zemin rengi/gradyanı olsun. Köşeleri kare bırak, iOS otomatik yuvarlıyor. |
| `logo-mark-192.png` | PNG, 192×192, şeffaf arka plan | Gelecekte PWA manifest ikonu | |
| `logo-mark-512.png` | PNG, 512×512, şeffaf arka plan | Gelecekte PWA manifest ikonu (büyük boyut) | |

## Renk referansı (istersen kullan, zorunlu değil)

Mevcut marka paleti: Teal `#12C4B0` → Menekşe `#6D3BEA` gradyan, Navy `#1B2340`.

---

Dosyaları bıraktıktan sonra haber ver, `Logo.jsx` ve `favicon.svg`'yi bunlara bağlayayım.
