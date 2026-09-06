// Merkezi aktivite/denetim log yardımcısı.
// Kullanıcı görmez; yalnızca admin dashboard + ileride mutabakat/analiz için tutulur.
import db from '../db/connection.js';

const insertStmt = db.prepare(
  `INSERT INTO activity_logs (user_id, action, detail, ip) VALUES (?, ?, ?, ?)`
);

/**
 * SÖZLEŞME: Her log aksiyonu YA CREDIT_ACTIONS'a YA da ACTIVITY_ACTIONS'a
 * eklenmelidir. Aksi halde admin panelinde /admin/logs?category=... filtresine
 * takılmaz (hiçbir sekmede görünmez). Yeni bir action yazıyorsan aşağıdaki iki
 * Set'ten uygun olanına ekle. Kesişim BOŞ olmalı.
 *
 * - CREDIT_ACTIONS: kredi/plan mutasyonları (para veya paket etkiler)
 * - ACTIVITY_ACTIONS: kimlik/güvenlik olayları (bakiyeyi etkilemez)
 */
export const CREDIT_ACTIONS = new Set([
  'plan.purchase',        // buyPlan başarılı — kullanıcı planı satın aldı
  'subpack.purchase',     // buySubPack başarılı — ekstra alt hesap paketi
  'credit.demo_load',     // billing/topup/demo — anında kredi yükleme
  'credit.topup',         // services/payments.settlePayment — gerçek USDT tahsilatı
  'admin.plan_change',    // admin PUT /users/:id/plan
  'admin.credit_adjust',  // admin PUT /users/:id/credits — mutlak set + delta
  'plan.expired',         // applyExpiryIfNeeded — süre dolmuş plan Free'ye düştü
  'plan.resumed',         // applyExpiryIfNeeded — üst plan bitti, saklanan alt plandan devam edildi
  'plan.user_downgrade',  // kullanıcı elle Free'ye geçti (PATCH /auth/plan)
]);

export const ACTIVITY_ACTIONS = new Set([
  'auth.login',                    // başarılı giriş (parola veya 2FA sonrası)
  'auth.logout',                   // çıkış (client-tetikli)
  'auth.login_failed',             // hatalı giriş — detail.reason: password_wrong|unknown_email|2fa_wrong
  'auth.register',                 // yeni kayıt
  'auth.password_change',          // oturum içi şifre güncelleme
  'auth.password_reset_request',   // forgot-password çağrısı
  'auth.password_reset',           // reset-password başarılı
  'auth.email_verify',             // e-posta doğrulama başarılı
  'auth.2fa_enable',
  'auth.2fa_disable',
  'auth.2fa_challenge',            // login sonrası 2FA kodu istendi
  'admin.totp_reset',              // admin bir kullanıcının 2FA'sını sıfırladı (özel durum)
]);

export function isCreditAction(action) { return CREDIT_ACTIONS.has(action); }
export function isActivityAction(action) { return ACTIVITY_ACTIONS.has(action); }

/**
 * logActivity({ userId, action, detail, ip })
 * - action: nokta-ayraçlı sabit string ('auth.login', 'plan.purchase', 'admin.plan_change', ...)
 * - detail: serileştirilebilir obje (JSON'a çevrilir) ya da null
 * - userId null olabilir (sistem olayları, ör. zincir tahsilatı; hatalı giriş — kimlik bilinmiyor)
 * Loglama ASLA ana akışı bozmamalı → hata yalnızca konsola yazılır.
 * Uyarı: bilinmeyen action + prod-dışı ortam → console.warn (sözleşmeyi hatırlatır).
 */
export function logActivity({ userId = null, action, detail = null, ip = null } = {}) {
  if (!action) return;
  if (process.env.NODE_ENV !== 'production' && !CREDIT_ACTIONS.has(action) && !ACTIVITY_ACTIONS.has(action)) {
    console.warn(`[audit] uncategorized action "${action}" — CREDIT_ACTIONS veya ACTIVITY_ACTIONS'a ekleyin (services/activityLog.js).`);
  }
  try {
    insertStmt.run(userId ?? null, action, detail != null ? JSON.stringify(detail) : null, ip || null);
  } catch (err) {
    console.error('[audit] log yazılamadı:', err.message);
  }
}
