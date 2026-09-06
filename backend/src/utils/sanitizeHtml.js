import { toHttpTarget } from './url.js';

// Zengin metin bio için KATI allowlist HTML sanitizer (sıfır ekstra npm).
// Strateji: girdiyi TEKRAR SERİLEŞTİR — orijinal attribute'ları ASLA geçirme, tüm metni
// escape et, yalnız allowlist tag'lerini temiz haliyle üret. Bu sayede <script>, on*=,
// javascript:/data: ve bozuk işaretleme XSS'e dönüşemez.

const ALLOWED = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'a', 'br', 'p', 'ul', 'ol', 'li']);
const VOID = new Set(['br']);
const MAX_LEN = 4000; // ham HTML üst sınırı (kötüye kullanım/DoS'a karşı)

function escapeText(s) {
  // Yalnız < > kaçışlanır (tag enjeksiyonunu keser — güvenlik için yeterli). & DOKUNULMAZ:
  // girdi contentEditable innerHTML'inden gelir (& zaten &amp; olarak kodlu); tekrar kaçışlamak
  // &amp;amp; çift-kodlamasına yol açardı. Metin düğümündeki &lt; bir TAG'e dönüşemez (güvenli).
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'); // tek tırnak da (ileriye dönük — attribute'lar şu an çift tırnaklı)
}

// href için: sayısal/isimli entity çöz → obfuscated `javascript:` görünür hale gelir
function decodeEntities(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch { return ''; } })
    .replace(/&#(\d+);?/g, (_, d) => { try { return String.fromCodePoint(parseInt(d, 10)); } catch { return ''; } })
    .replace(/&colon;/gi, ':')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

// Tüm kontrol karakterlerini + boşlukları söker (charCode ile — regex kontrol-karakter belirsizliği yok).
// `java\tscript:` / satırsonu ile obfuscation'ı kırar; URL'de anlamlı boşluk olmaz.
function stripControl(s) {
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code > 0x20 && code !== 0x7f) out += ch;
  }
  return out;
}

function extractSafeHref(rawAttrs) {
  const m = rawAttrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/i);
  if (!m) return null;
  const raw = m[2] ?? m[3] ?? m[4] ?? '';
  const cleaned = stripControl(decodeEntities(raw));
  return toHttpTarget(cleaned); // yalnız http/https; değilse null
}

/**
 * Ham (güvenilmez) HTML'i güvenli, allowlist'li HTML'e indirger. Her YAZIMDA çalışır
 * (tek doğruluk kaynağı). Public sayfa bunu dangerouslySetInnerHTML ile güvenle basar.
 */
export function sanitizeBioHtml(input) {
  if (input == null) return '';
  let html = String(input).slice(0, MAX_LEN);

  // 1) Tehlikeli blokları İÇERİKLERİYLE sil (script/style/comment; kapanışsızlar dahil)
  html = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<script[\s\S]*$/gi, '')
    .replace(/<style[\s\S]*$/gi, '');

  const out = [];
  const stack = [];
  // Tag eşleştirici: tırnak içindeki > güvenli şekilde atlanır
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g;
  let last = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m.index > last) out.push(escapeText(html.slice(last, m.index)));
    last = tagRe.lastIndex;

    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const rawAttrs = m[3] || '';
    if (!ALLOWED.has(tag)) continue; // izinli değil → tag'i at (iç metin akışı korunur/escape'lenir)

    if (closing) {
      const idx = stack.lastIndexOf(tag);
      if (idx !== -1) {
        for (let i = stack.length - 1; i >= idx; i--) out.push(`</${stack[i]}>`);
        stack.length = idx;
      }
      continue;
    }

    if (VOID.has(tag)) {
      out.push('<br>');
    } else if (tag === 'a') {
      const href = extractSafeHref(rawAttrs);
      if (href) out.push(`<a href="${escapeAttr(href)}" rel="nofollow noopener" target="_blank">`);
      else out.push('<a>'); // href yok/geçersiz → çıplak <a> (metin yine görünür)
      stack.push('a');
    } else {
      out.push(`<${tag}>`);
      stack.push(tag);
    }
  }
  if (last < html.length) out.push(escapeText(html.slice(last)));

  // Açık kalan tag'leri kapat (dengeli çıktı)
  for (let i = stack.length - 1; i >= 0; i--) out.push(`</${stack[i]}>`);

  return out.join('').trim();
}

/**
 * Sanitize edilmiş HTML'den düz metin türetir (meta description / SEO / non-Pro render için).
 * Zaten güvenli HTML üzerinde çalışır.
 */
export function htmlToText(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|ul|ol)>/gi, '\n')
    .replace(/<(p|li|ul|ol)\b[^>]*>/gi, '\n') // blok öğelerinin başında da ayraç
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\n{2,}/g, '\n') // ardışık satırsonlarını tek satıra indir (düz-metin SEO fallback)
    .trim();
}
