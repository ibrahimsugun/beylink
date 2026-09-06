// Makale gövdesi için tutarlı, semantik bileşenler. Her makale JSX'te bunları kullanır
// → aynı görsel dil, aynı hiyerarşi. TOC (BlogPost.jsx) H2'lerin id'lerini otomatik çıkarır,
// bu yüzden H2 için slug ID zorunlu tutulur.

import { slugify } from './slug.js';

/** H2 — TOC'a girer, id otomatik slugify. */
export function H2({ children, id }) {
  const finalId = id || slugify(String(children));
  return (
    <h2 id={finalId} className="mt-14 scroll-mt-24 font-display text-2xl font-bold text-ink sm:text-3xl">
      {children}
    </h2>
  );
}

/** H3 alt başlık. */
export function H3({ children, id }) {
  const finalId = id || slugify(String(children));
  return (
    <h3 id={finalId} className="mt-8 scroll-mt-24 font-display text-lg font-bold text-ink sm:text-xl">
      {children}
    </h3>
  );
}

/** Paragraf — makale gövdesinin ana bloğu. */
export function P({ children }) {
  return <p className="mt-4 text-base leading-relaxed text-ink-soft">{children}</p>;
}

/** Madde işaretli liste. */
export function UL({ children }) {
  return <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-ink-soft marker:text-brand-violet">{children}</ul>;
}

/** Numaralı liste. */
export function OL({ children }) {
  return <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed text-ink-soft marker:font-bold marker:text-brand-violet">{children}</ol>;
}

/** İç veya dış bağlantı — rel="noopener" ve gerekiyorsa external=true ile target="_blank". */
export function A({ href, external, children }) {
  const isExternal = external || /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      className="font-semibold text-brand-violet underline decoration-brand-violet/30 underline-offset-2 hover:decoration-brand-violet"
      {...(isExternal ? { target: '_blank', rel: 'nofollow noopener' } : {})}
    >
      {children}
    </a>
  );
}

/** Vurgulanmış alıntı bloğu. */
export function Quote({ children, cite }) {
  return (
    <figure className="mt-8 border-l-4 border-brand-violet bg-brand-violet/5 pl-5 pr-4 py-4">
      <blockquote className="text-lg italic leading-relaxed text-ink">{children}</blockquote>
      {cite && <figcaption className="mt-2 text-xs uppercase tracking-wider text-muted">— {cite}</figcaption>}
    </figure>
  );
}

/** Bilgi/uyarı kutusu. */
export function Callout({ tone = 'info', title, children }) {
  const tones = {
    info: { border: 'border-brand-teal/40', bg: 'bg-brand-teal/8', accent: 'text-brand-teal' },
    warn: { border: 'border-warning/40', bg: 'bg-warning/10', accent: 'text-warning' },
    success: { border: 'border-success/40', bg: 'bg-success/10', accent: 'text-success' },
  };
  const t = tones[tone] || tones.info;
  return (
    <aside className={`mt-8 rounded-2xl border ${t.border} ${t.bg} p-5`}>
      {title && <div className={`font-display font-bold ${t.accent}`}>{title}</div>}
      <div className="mt-1 text-sm leading-relaxed text-ink-soft [&>p:first-child]:mt-0">{children}</div>
    </aside>
  );
}

/** Kısa CTA kutusu — makale ortasına ekilir, kayıt/plana yönlendirir. */
export function InlineCta({ title, desc, href, label }) {
  return (
    <aside className="mt-10 rounded-2xl border border-line bg-gradient-to-br from-brand-teal/8 to-brand-violet/8 p-6 sm:p-7">
      <h3 className="font-display text-lg font-bold text-ink sm:text-xl">{title}</h3>
      {desc && <p className="mt-1.5 text-sm text-muted">{desc}</p>}
      <a href={href} className="btn-brand mt-4 inline-flex">{label}</a>
    </aside>
  );
}
