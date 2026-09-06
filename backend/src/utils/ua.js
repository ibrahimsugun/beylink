/**
 * Basit User-Agent çözümleyiciler (harici bağımlılık yok) — analitik kırılımları için.
 * Cihaz kategorisi, tarayıcı ve işletim sistemi (mobil dahil) çıkarır.
 */

// mobile / tablet / desktop
export function parseDevice(userAgent = '') {
  const ua = (userAgent || '').toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) return 'mobile';
  return 'desktop';
}

// Tarayıcı adı. Sıra önemli: Edge/Opera/Samsung UA'ları "Chrome" içerir → Chrome'dan ÖNCE;
// Chrome UA'sı "Safari" içerir → Safari en sonda.
export function parseBrowser(userAgent = '') {
  const ua = (userAgent || '').toLowerCase();
  if (!ua) return null;
  if (/edg(a|ios)?\//.test(ua) || /\bedge\//.test(ua)) return 'Edge';
  if (/opr\/|opera|opios/.test(ua)) return 'Opera';
  if (/samsungbrowser/.test(ua)) return 'Samsung Internet';
  if (/firefox|fxios/.test(ua)) return 'Firefox';
  if (/chrome|crios|chromium/.test(ua)) return 'Chrome';
  if (/safari/.test(ua)) return 'Safari';
  return 'Diğer';
}

// İşletim sistemi (iOS/Android mobil olduğunu gösterir). Sıra önemli:
// iPhone UA'sı "like Mac OS X" içerir → macOS'ten ÖNCE; Android UA'sı "Linux" içerir → Linux'tan ÖNCE.
export function parseOs(userAgent = '') {
  const ua = (userAgent || '').toLowerCase();
  if (!ua) return null;
  if (/windows/.test(ua)) return 'Windows';
  if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
  if (/android/.test(ua)) return 'Android';
  if (/mac os x|macintosh/.test(ua)) return 'macOS';
  if (/cros/.test(ua)) return 'Chrome OS';
  if (/linux/.test(ua)) return 'Linux';
  return 'Diğer';
}
