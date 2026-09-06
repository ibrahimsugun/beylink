import { useSeo, breadcrumbSchema } from '../lib/seo.js';
import { PageHero } from './PageHero.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

/**
 * Yasal sayfaların (Gizlilik/Kullanım Şartları/Çerez) ortak kabuğu — kod tekrarı sıfır.
 * SEO: title/description/canonical + Breadcrumb JSON-LD (Ana Sayfa → sayfa).
 *
 * sections: [{ id, title, body: React node/string }] — her section id'li ve <h2>'li.
 * son güncelleme metni sağda ısrarla gösterilir (uyumluluk için).
 */
export function LegalPage({ title, description, path, breadcrumbs, lastUpdated, intro, sections = [] }) {
  const { t } = useLanguage();
  useSeo({
    title,
    description,
    path,
    keywords: `${title}, beylink, ${title.toLowerCase()}`,
    jsonLd: [breadcrumbSchema(breadcrumbs)],
    robots: 'index,follow',
  });

  return (
    <>
      <PageHero title={title} lead={description} breadcrumbs={breadcrumbs} />
      <article className="mx-auto max-w-4xl px-6 py-14">
        {lastUpdated && (
          <p className="mb-8 text-xs text-muted">
            {t('legal.lastUpdated')} <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
        )}
        {intro && <p className="mb-10 text-base leading-relaxed text-ink-soft">{intro}</p>}

        {/* İçindekiler — anchor'lı iç bağlantılar (uzun sayfada okunabilirlik + Google FAQ dostu) */}
        {sections.length > 3 && (
          <nav aria-label={t('legal.toc')} className="mb-10 rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink">{t('legal.toc')}</h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm marker:text-muted">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-brand-violet hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mb-10 scroll-mt-24">
            <h2 id={`${s.id}-h`} className="font-display text-2xl font-bold text-ink">{s.title}</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-soft prose-legal">
              {typeof s.body === 'string' ? <p>{s.body}</p> : s.body}
            </div>
          </section>
        ))}
      </article>
    </>
  );
}
