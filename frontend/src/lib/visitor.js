// Birinci-taraf, kalıcı ziyaretçi kimliği (tekil ziyaretçi sayımı için).
// localStorage'da saklanır; aynı tarayıcının tekrar ziyaretleri tek sayılır.
const KEY = 'beylink_vid';

function randomId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* yok */ }
  // Yedek: yeterince benzersiz (UUID yoksa)
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(KEY, id);
    }
    // /api/go (sunucu tıklama loglaması) visitor'ı COOKIE'den okur — URL/Referer üzerinden sızmaz.
    // SameSite=Lax → aynı-site link navigasyonunda sunucuya gider; böylece tıklama satırı visitor taşır.
    try {
      document.cookie = `${KEY}=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch { /* cookie yoksa yok say */ }
    return id;
  } catch {
    // localStorage yoksa (gizli mod/izin) — kimlik gönderilmez
    return null;
  }
}
