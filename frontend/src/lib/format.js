const MICRO = 1_000_000;

// i18n: aktif dil değişince LanguageContext bunu günceller (tr-TR ↔ en-US).
// Yalnız locale ETİKETİ değişir; timezone/UTC-parse davranışı asla değişmez.
let _locale = 'en-US';
export function setFormatLocale(l) {
  _locale = l || 'en-US';
}

// micro-USDT → "$5.00"
export function usd(micro) {
  return `$${(Number(micro || 0) / MICRO).toFixed(2)}`;
}

// micro-USDT → "5.000347 USDT" (gönderilecek tam tutar; tuz nedeniyle ondalık olabilir)
export function usdt(micro) {
  const v = Number(micro || 0) / MICRO;
  const s = v.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  return `${s} USDT`;
}

// Ham USDT sayı (kopyalama için) — "10.000347"
export function usdtAmount(micro) {
  return (Number(micro || 0) / MICRO).toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

// ISO/SQL tarih → "2 Ağu 2026" (tr) / "Aug 2, 2026" (en) — locale parametresi opsiyonel, varsayılan aktif dil.
export function shortDate(s, locale = _locale) {
  if (!s) return '';
  const d = new Date(String(s).replace(' ', 'T') + (String(s).includes('T') ? '' : 'Z'));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

// plan_expires_at → kalan gün (yukarı yuvarlar). Süresiz/Free → null; bitmişse 0.
export function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  const d = new Date(String(expiresAt).replace(' ', 'T') + (String(expiresAt).includes('T') ? '' : 'Z'));
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.now();
  return ms <= 0 ? 0 : Math.ceil(ms / (24 * 60 * 60 * 1000));
}
