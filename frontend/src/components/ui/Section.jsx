/**
 * Marketing sayfaları için semantic <section> wrapper.
 * SEO kuralı (roadmap Faz 3): sayfadaki her içerik bloğu `<section id="anlamlı">` içinde ve
 * uygun bir başlık (h2/h3) taşır. Bu component id'yi ZORUNLU kılar, aria-labelledby'yi otomatik
 * bağlar ve başlık iskeletini standartlaştırır → yanlışlıkla id'siz section eklenemez.
 *
 * Props:
 *  - id (zorunlu) · title (opsiyonel h2) · kicker (opsiyonel üst rozet) · lead (opsiyonel spot metni)
 *  - as: 'section' | 'article' (default 'section') · headingLevel: 2 (default) | 3
 *  - className/innerClassName: layout hook'ları
 *  - noContainer: dış max-w container'ı kapat (özel layout için)
 */
export function Section({
  id,
  title,
  kicker,
  lead,
  children,
  as: Tag = 'section',
  headingLevel = 2,
  className = '',
  innerClassName = '',
  ariaLabel,
  noContainer = false,
}) {
  if (!id) throw new Error('<Section> id zorunlu (SEO kuralı).');
  const H = `h${headingLevel}`;
  const headingId = title ? `${id}-heading` : undefined;
  const container = noContainer ? '' : 'mx-auto max-w-6xl px-6';
  return (
    <Tag
      id={id}
      aria-labelledby={headingId}
      aria-label={!title ? (ariaLabel || id) : undefined}
      className={`py-16 sm:py-20 ${className}`}
    >
      <div className={`${container} ${innerClassName}`}>
        {(kicker || title || lead) && (
          <header className="mb-10 max-w-2xl">
            {kicker && (
              <span className="chip bg-brand-violet/10 text-brand-violet">{kicker}</span>
            )}
            {title && (
              <H
                id={headingId}
                className={`${kicker ? 'mt-3' : ''} font-display font-extrabold tracking-tight text-ink ${
                  headingLevel === 2 ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
                }`}
              >
                {title}
              </H>
            )}
            {lead && <p className="mt-3 text-lg leading-relaxed text-muted">{lead}</p>}
          </header>
        )}
        {children}
      </div>
    </Tag>
  );
}
