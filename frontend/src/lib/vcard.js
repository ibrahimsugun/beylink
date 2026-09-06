// İletişim kartı config'inden vCard 3.0 (.vcf) metni üretir ve indirir.

// vCard yapısal karakterlerini kaçır: \ ; , ve yeni satır
const esc = (v = '') =>
  String(v).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// t?: opsiyonel çeviri fonksiyonu — verilirse `vcard.fallbackName`/`vcard.fallbackFile`
// anahtarlarından okunur (i18n); verilmezse geriye dönük uyumluluk için TR sabitleri kullanılır.
// Render eden component (Task 2b/2d: components/profile/ContactCard.jsx) `t` geçmeli.
export function buildVCard(c = {}, t) {
  const fn = [c.firstName, c.lastName].filter(Boolean).join(' ') || (t ? t('vcard.fallbackName') : 'Kişi');
  const a = c.address || {};
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  lines.push(`N:${esc(c.lastName)};${esc(c.firstName)};;;`);
  lines.push(`FN:${esc(fn)}`);
  if (c.company) lines.push(`ORG:${esc(c.company)}`);
  if (c.role) lines.push(`TITLE:${esc(c.role)}`);
  if (c.phone) lines.push(`TEL;TYPE=CELL:${esc(c.phone)}`);
  if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(c.email)}`);
  if (c.website) lines.push(`URL:${esc(c.website)}`);
  if (a.street || a.city || a.country || a.zip) {
    lines.push(`ADR;TYPE=WORK:;;${esc(a.street)};${esc(a.city)};;${esc(a.zip)};${esc(a.country)}`);
  }
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(c = {}, t) {
  const name = ([c.firstName, c.lastName].filter(Boolean).join('-') || (t ? t('vcard.fallbackFile') : 'kisi')).toLowerCase();
  const blob = new Blob([buildVCard(c, t)], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.vcf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
