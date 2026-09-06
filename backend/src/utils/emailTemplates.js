import { escapeHtml } from './html.js';

// Profesyonel, kısa ve spam'a dirençli e-posta şablonları.
// Tasarım ilkeleri (deliverability):
//  - Tablo tabanlı layout + INLINE stiller (email istemcileri <style>'ı çoğu zaman soyar).
//  - Gerçek metin ağırlıklı (görsel yok) → metin/HTML dengesi sağlıklı, "image-only" spam sinyali yok.
//  - Tek net CTA; abartılı dil / ALL CAPS / çok sayıda link yok.
//  - Her HTML e-postası bir text/plain alternatifiyle gönderilir (sendMail html+text).
//  - Preheader (gizli önizleme satırı) gelen kutusu snippet'ini düzgün gösterir.

const BRAND = {
  navy: '#1B2340',
  teal: '#12C4B0',
  violet: '#6D3BEA',
  green: '#0F9D58',
  red: '#D64545',
  surface: '#F6F8FB',
  ink: '#1B2340',
  muted: '#6B7280',
  line: '#E6E9EF',
};
const FONT = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// ---- Bölüm (section) üreticileri — her biri shell tablosuna oturan bir <tr> döndürür ----

// Büyük, okunur doğrulama kodu kutusu
function codeSection(code, label = 'Doğrulama kodun') {
  return `
        <tr>
          <td style="padding:22px 32px 0 32px;font-family:${FONT};">
            <p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.muted};">${escapeHtml(label)}</p>
            <div style="background:${BRAND.surface};border:1px solid ${BRAND.line};border-radius:12px;padding:16px 12px;text-align:center;">
              <span style="font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:34px;font-weight:800;letter-spacing:8px;color:${BRAND.navy};">${escapeHtml(code)}</span>
            </div>
          </td>
        </tr>`;
}

// Detay tablosu (Sipariş No / Tutar / Plan …) — ödeme & satın alım e-postaları için
function rowsSection(rows) {
  const trs = rows
    .filter((r) => r && r.value != null && r.value !== '')
    .map(
      (r) => `
              <tr>
                <td style="padding:9px 0;font-size:13px;color:${BRAND.muted};font-family:${FONT};border-bottom:1px solid ${BRAND.line};">${escapeHtml(r.label)}</td>
                <td style="padding:9px 0;font-size:14px;font-weight:600;color:${BRAND.ink};text-align:right;font-family:${FONT};border-bottom:1px solid ${BRAND.line};">${escapeHtml(String(r.value))}</td>
              </tr>`
    )
    .join('');
  return `
        <tr>
          <td style="padding:20px 32px 0 32px;font-family:${FONT};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};border:1px solid ${BRAND.line};border-radius:12px;padding:4px 16px;">
              ${trs}
            </table>
          </td>
        </tr>`;
}

// Tek net CTA butonu
function ctaSection(url, label, accent) {
  return `
        <tr>
          <td style="padding:24px 32px 0 32px;font-family:${FONT};">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="${escapeHtml(url)}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;font-family:${FONT};padding:13px 30px;border-radius:12px;">${escapeHtml(label)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
}

// Serbest paragraf(lar)
function textSection(html, { center = false } = {}) {
  return `
        <tr>
          <td style="padding:18px 32px 0 32px;font-family:${FONT};">
            <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.muted};${center ? 'text-align:center;' : ''}">${html}</p>
          </td>
        </tr>`;
}

// Ortak kabuk — marka başlığı, başlık/giriş, verilen bölümler ve dipnot.
function shell({ preheader, accent = BRAND.violet, heading, intro, sections = [], footNote }) {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.surface};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;background:#ffffff;border:1px solid ${BRAND.line};border-radius:16px;overflow:hidden;">
        <tr>
          <td style="height:4px;background:${accent};line-height:4px;font-size:4px;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:26px 32px 8px 32px;font-family:${FONT};">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${BRAND.teal};vertical-align:middle;"></span>
            <span style="font-size:18px;font-weight:700;color:${BRAND.navy};letter-spacing:.2px;vertical-align:middle;margin-left:8px;">BeyLink</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 0 32px;font-family:${FONT};">
            <h1 style="margin:0 0 8px 0;font-size:21px;line-height:1.3;font-weight:700;color:${BRAND.ink};">${escapeHtml(heading)}</h1>
            <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(intro)}</p>
          </td>
        </tr>
        ${sections.join('')}
        ${
          footNote
            ? `<tr>
          <td style="padding:20px 32px 28px 32px;font-family:${FONT};">
            <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${footNote}</p>
          </td>
        </tr>`
            : `<tr><td style="height:28px;line-height:28px;font-size:28px;">&nbsp;</td></tr>`
        }
        <tr>
          <td style="padding:16px 32px;background:${BRAND.surface};border-top:1px solid ${BRAND.line};font-family:${FONT};">
            <p style="margin:0;font-size:12px;color:${BRAND.muted};">Bu otomatik bir mesajdır, lütfen yanıtlamayın. · BeyLink</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// =============================================================================
// 1) E-posta doğrulama (kayıt sonrası / yeniden gönderim) — 6 haneli kod + link
// =============================================================================
export function verificationEmail({ code, link, ttlMin = 15 }) {
  const subject = 'BeyLink doğrulama kodun: ' + code;
  const text =
    `BeyLink — E-posta doğrulama\n\n` +
    `Doğrulama kodun: ${code}\n` +
    `Bu kodu panelindeki alana girebilir ya da şu bağlantıyla tek tıkla doğrulayabilirsin:\n${link}\n\n` +
    `Kod ve bağlantı ${ttlMin} dakika geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok say.\n\n` +
    `BeyLink`;
  const html = shell({
    preheader: `Doğrulama kodun ${code} — ${ttlMin} dakika geçerli.`,
    accent: BRAND.violet,
    heading: 'E-postanı doğrula',
    intro: 'Hesabını güvence altına almak için e-posta adresini doğrula. Aşağıdaki kodu gir ya da butona tıkla.',
    sections: [
      codeSection(code),
      textSection('veya aşağıdaki butonla tek tıkla doğrula:', { center: true }),
      ctaSection(link, 'E-postamı doğrula', BRAND.violet),
    ],
    footNote: `Kodu panelindeki doğrulama alanına da girebilirsin. Kod ve bağlantı <strong style="color:${BRAND.ink};">${Number(ttlMin)} dakika</strong> geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.`,
  });
  return { subject, text, html };
}

// =============================================================================
// 2) Şifremi unuttum — sıfırlama bağlantısı (kod yok, yalnız güvenli link)
// =============================================================================
export function passwordResetEmail({ link, ttlMin = 30 }) {
  const subject = 'BeyLink — Şifre sıfırlama bağlantın';
  const text =
    `BeyLink — Şifre sıfırlama\n\n` +
    `Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla (${ttlMin} dakika geçerli):\n${link}\n\n` +
    `Bu isteği sen yapmadıysan hiçbir şey yapmana gerek yok; şifren değişmez.\n\n` +
    `BeyLink`;
  const html = shell({
    preheader: `Şifre sıfırlama bağlantın — ${ttlMin} dakika geçerli.`,
    accent: BRAND.violet,
    heading: 'Şifreni sıfırla',
    intro: 'Hesabının şifresini sıfırlamak için bir istek aldık. Devam etmek için aşağıdaki butona tıkla.',
    sections: [ctaSection(link, 'Şifremi sıfırla', BRAND.violet)],
    footNote: `Bağlantı <strong style="color:${BRAND.ink};">${Number(ttlMin)} dakika</strong> geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok say — şifren değişmez ve hesabın güvende kalır.`,
  });
  return { subject, text, html };
}

// =============================================================================
// 3) E-posta onaylandı + Hoş geldin (doğrulama başarıyla tamamlanınca)
// =============================================================================
export function welcomeEmail({ name, dashboardUrl }) {
  const who = name ? `Merhaba ${name},` : 'Merhaba,';
  const subject = 'E-postan onaylandı — BeyLink’e hoş geldin 🎉';
  const text =
    `${who}\n\n` +
    `E-posta adresin başarıyla onaylandı ve hesabın artık tam aktif. BeyLink'e hoş geldin!\n\n` +
    `Şimdi profilini oluşturabilir, linklerini ekleyebilir ve sayfanı yayınlayabilirsin:\n${dashboardUrl}\n\n` +
    `İyi kullanımlar dileriz.\nBeyLink`;
  const html = shell({
    preheader: 'E-postan onaylandı — hesabın tam aktif. Hadi başlayalım!',
    accent: BRAND.teal,
    heading: 'E-postan onaylandı 🎉',
    intro: `${who} e-posta adresin başarıyla onaylandı ve hesabın artık tam aktif. BeyLink’e hoş geldin!`,
    sections: [
      textSection('Profilini oluştur, sosyal linklerini ve butonlarını ekle, tek tıkla sayfanı yayınla. Her şey hazır — başlaman yeterli.'),
      ctaSection(dashboardUrl, 'Panele git', BRAND.violet),
    ],
    footNote: 'Aklına takılan olursa panelindeki “Ne Nedir?” bölümüne göz atabilirsin. İyi kullanımlar!',
  });
  return { subject, text, html };
}

// =============================================================================
// 4) Ödemen tamamlandı (kredi yükleme başarıyla tahsil edildi)
// =============================================================================
export function paymentSuccessEmail({ amountUsd, orderRef, balanceUsd, dashboardUrl }) {
  const subject = `Ödemen tamamlandı — ${amountUsd} USDT yüklendi`;
  const text =
    `BeyLink — Ödeme onayı\n\n` +
    `Ödemen başarıyla alındı ve bakiyene eklendi.\n\n` +
    `Sipariş No: ${orderRef}\n` +
    `Yüklenen tutar: ${amountUsd} USDT\n` +
    (balanceUsd != null ? `Güncel bakiye: ${balanceUsd} USDT\n` : '') +
    `\nCüzdanını panelden görüntüleyebilirsin:\n${dashboardUrl}\n\nBeyLink`;
  const html = shell({
    preheader: `${amountUsd} USDT bakiyene eklendi. Sipariş ${orderRef}.`,
    accent: BRAND.green,
    heading: 'Ödemen tamamlandı ✅',
    intro: 'Ödemen başarıyla alındı ve kredi bakiyene eklendi. Detaylar aşağıda.',
    sections: [
      rowsSection([
        { label: 'Sipariş No', value: orderRef },
        { label: 'Yüklenen tutar', value: `${amountUsd} USDT` },
        { label: 'Güncel bakiye', value: balanceUsd != null ? `${balanceUsd} USDT` : '' },
      ]),
      ctaSection(dashboardUrl, 'Cüzdanı görüntüle', BRAND.violet),
    ],
    footNote: 'Bu tutarı plan yükseltme veya ek alt hesap hakkı almak için kullanabilirsin.',
  });
  return { subject, text, html };
}

// =============================================================================
// 5) Ödemen tamamlanamadı (fatura süresi doldu, tutar alınamadı)
// =============================================================================
export function paymentFailedEmail({ orderRef, amountUsd, dashboardUrl }) {
  const subject = 'Ödemen tamamlanamadı — fatura süresi doldu';
  const text =
    `BeyLink — Ödeme bildirimi\n\n` +
    `${orderRef} numaralı ödeme faturanın süresi doldu ve ödeme alınamadı. Bakiyene bir tahsilat yapılmadı.\n\n` +
    (amountUsd != null ? `Beklenen tutar: ${amountUsd} USDT\n` : '') +
    `\nDilersen panelden yeni bir ödeme başlatabilirsin:\n${dashboardUrl}\n\nBeyLink`;
  const html = shell({
    preheader: `${orderRef} faturasının süresi doldu — ödeme alınamadı.`,
    accent: BRAND.red,
    heading: 'Ödemen tamamlanamadı',
    intro: 'Ödeme faturanın süresi doldu ve tutar alınamadı. Hesabına herhangi bir tahsilat yapılmadı.',
    sections: [
      rowsSection([
        { label: 'Sipariş No', value: orderRef },
        { label: 'Beklenen tutar', value: amountUsd != null ? `${amountUsd} USDT` : '' },
        { label: 'Durum', value: 'Süresi doldu' },
      ]),
      ctaSection(dashboardUrl, 'Yeni ödeme başlat', BRAND.violet),
    ],
    footNote: 'Ödemeyi yaptıysan ve tutar hesabına yansımadıysa bize ulaş — birlikte kontrol edelim.',
  });
  return { subject, text, html };
}

// =============================================================================
// 6) Satın alımın tamamlandı (plan yükseltme / ek alt hesap hakkı paketi)
// =============================================================================
export function purchaseSuccessEmail({ itemLabel, orderRef, amountUsd, methodLabel, expiresLabel, dashboardUrl }) {
  const subject = `Satın alımın tamamlandı — ${itemLabel}`;
  const text =
    `BeyLink — Satın alma onayı\n\n` +
    `Satın alımın başarıyla tamamlandı ve hesabına tanımlandı.\n\n` +
    `Ürün: ${itemLabel}\n` +
    (orderRef ? `Sipariş No: ${orderRef}\n` : '') +
    (amountUsd != null ? `Tutar: ${amountUsd} USDT\n` : '') +
    (methodLabel ? `Ödeme: ${methodLabel}\n` : '') +
    (expiresLabel ? `Geçerlilik: ${expiresLabel}\n` : '') +
    `\nAyrıntıları panelden görebilirsin:\n${dashboardUrl}\n\nBeyLink`;
  const html = shell({
    preheader: `${itemLabel} hesabına tanımlandı.`,
    accent: BRAND.green,
    heading: 'Satın alımın tamamlandı ✅',
    intro: 'Satın alımın başarıyla tamamlandı ve hesabına tanımlandı. Özet aşağıda.',
    sections: [
      rowsSection([
        { label: 'Ürün', value: itemLabel },
        { label: 'Sipariş No', value: orderRef },
        { label: 'Tutar', value: amountUsd != null ? `${amountUsd} USDT` : '' },
        { label: 'Ödeme yöntemi', value: methodLabel },
        { label: 'Geçerlilik', value: expiresLabel },
      ]),
      ctaSection(dashboardUrl, 'Panele git', BRAND.violet),
    ],
    footNote: 'Yeni özelliklerin keyfini çıkar! Sorun yaşarsan panelinden bize ulaşabilirsin.',
  });
  return { subject, text, html };
}
