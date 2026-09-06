import { Breadcrumb } from './Breadcrumb.jsx';

/**
 * Statik sayfaların ortak üst banner'ı — sayfanın TEK <h1>'i. Breadcrumb'ı üstte gösterir.
 * SEO: h1, description (p), breadcrumb — sırayla.
 *
 * Props: kicker (rozet), title (h1), lead (spot metni), breadcrumbs [{name, path}]
 */
export function PageHero({ kicker, title, lead, breadcrumbs, children }) {
  return (
    <section
      id="page-hero"
      aria-labelledby="page-hero-heading"
      className="border-b border-line bg-white"
    >
      <div className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        {breadcrumbs?.length > 0 && <Breadcrumb items={breadcrumbs} />}
        {kicker && (
          <span className={`chip mt-4 bg-brand-violet/10 text-brand-violet ${breadcrumbs?.length ? '' : 'mt-0'}`}>
            {kicker}
          </span>
        )}
        <h1
          id="page-hero-heading"
          className={`${kicker || breadcrumbs?.length ? 'mt-3' : ''} font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl`}
        >
          {title}
        </h1>
        {lead && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
