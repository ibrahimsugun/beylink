// E-posta onay gating yardımcıları — profil yayınlama + satın alım gibi kritik işlemler,
// e-postası doğrulanmamış hesaplarda engellenir. Alt hesaplar (e-postasız) muaftır.

const EVENT = 'beylink:email-unverified';

// Kullanıcının e-postası var ama doğrulanmamış mı? (alt hesap = e-postasız → false)
export function emailUnverified(user) {
  return !!(user?.email && user.email_verified !== 1);
}

// Doğrulama bildirimini aç (DashboardLayout'taki EmailVerifyGateModal dinler).
export function promptEmailVerify() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Modal'ın dinleyeceği olay adı.
export const EMAIL_UNVERIFIED_EVENT = EVENT;
