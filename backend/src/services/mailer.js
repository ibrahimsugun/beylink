import { config } from '../config/env.js';

// E-posta gönderimi SOYUTLAMASI. Sağlayıcı:
//   - RESEND_API_KEY varsa → Resend HTTP API (fetch; ekstra npm yok).
//   - MAIL_ENABLED=true    → SMTP (TODO: nodemailer entegrasyonu — altyapı hazır).
//   - hiçbiri              → demo: gerçek göndermez, konsola loglar; çağıran taraf DEĞİŞMEZ.

// In-house test paketi çalışırken (testRunner server-side set eder) mailer demo moda düşer:
// gerçek Resend/SMTP çağrısı YAPILMAZ, token yanıtta gösterilir → testler gerçek e-posta
// göndermeden çalışır. Client bu bayrağı set EDEMEZ (yalnız sunucu içi worker) → güvenli.
function testMode() {
  return globalThis.__beylinkTestRunning === true;
}

export function mailEnabled() {
  return !testMode() && !!config.mail.enabled;
}

// Demo token'ı HTTP yanıtında göster: (a) test paketi çalışırken, ya da
// (b) gerçek e-posta kapalıyken VE üretim değilken. Üretimde gerçek gönderimle ASLA sızmaz.
export function exposeDemoToken() {
  if (testMode()) return true;
  return !config.mail.enabled && config.env !== 'production';
}

// Resend API ile gönderim. Başarılıysa {ok:true, sent:true, id}; hata koddan anlaşılır.
async function sendViaResend({ to, subject, text, html }) {
  const payload = {
    from: config.mail.from,
    to: [to],
    subject,
    html,
    text, // text/plain alternatifi → spam skoru düşer, düz-metin yedeği kalır
  };
  if (config.mail.replyTo) payload.reply_to = config.mail.replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.mail.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json().catch(() => ({}));
  return { ok: true, sent: true, id: data?.id || null };
}

// Gerçek gönderim (Resend/SMTP) ya da demo. HATAYI YUTMAZ — çağıran karar verir; ama hiçbir
// akış (auth/ödeme) mail hatasında BOZULMAMALI → çağıranlar sendMailSafe kullanmalı ya da .catch'lemeli.
export async function sendMail({ to, subject, text, html }) {
  // Test paketi çalışırken gerçek gönderim YOK (Resend'e sahte adres çağrısı yapılmaz).
  if (testMode()) {
    console.log(`[MAIL:TEST] → ${to} :: ${subject} (test modu — gönderilmedi)`);
    return { ok: true, sent: false, test: true };
  }
  if (config.mail.resendApiKey) {
    return sendViaResend({ to, subject, text, html });
  }
  if (config.mail.smtpEnabled) {
    // TODO(prod): gerçek SMTP gönderimi (ör. nodemailer). html + text multipart/alternative.
    console.log(`[MAIL:SMTP] → ${to} :: ${subject} (SMTP gönderimi henüz yapılandırılmadı, loglandı)`);
    return { ok: true, sent: false };
  }
  // Demo modu — gerçek e-posta gitmez; içerik konsola. Token/kod frontend'e ayrıca döner.
  console.log(`\n[MAIL:DEMO] → ${to}\n  Konu: ${subject}\n  ${text || '(html)'}\n`);
  return { ok: true, sent: false, demo: true };
}

// Best-effort gönderim — ASLA throw etmez. Kritik olmayan bildirimler (hoş geldin, ödeme
// bildirimi, satın alma onayı) için: mail sağlayıcı hatası kullanıcının işlemini bozmamalı.
export async function sendMailSafe(opts) {
  try {
    return await sendMail(opts);
  } catch (e) {
    console.error('[MAIL] gönderim hatası:', opts?.subject, '→', e.message);
    return { ok: false, sent: false, error: e.message };
  }
}
