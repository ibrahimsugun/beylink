// Tema plan-gating için TEK GÜVENLİK KAYNAĞI (backend).
// Serbest (herkese açık) şablon anahtarları — frontend lib/themes.js `THEMES` ile AYNI olmalı.
// Bu allowlist DIŞINDAKİ her `template` değeri (hazır iş-koluna özel presetler VE bilinmeyen
// değerler dahil) `presetThemes` (Pro) yeteneğini gerektirir → fail-closed:
//   - Yeni bir preset frontend'e eklenince backend'de otomatik gate'lenir (unutulsa bile).
//   - Non-Pro'nun rastgele/çöp template göndermesi de reddedilir.
export const FREE_TEMPLATE_KEYS = new Set([
  'wave', 'brand', 'minimal', 'midnight', 'sunset', 'forest', 'blush', 'mono',
]);

export function isFreeTemplate(key) {
  return FREE_TEMPLATE_KEYS.has(key);
}
