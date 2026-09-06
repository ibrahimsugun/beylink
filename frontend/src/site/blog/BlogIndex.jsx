import { useState, useMemo } from 'react';
import { useSeo, breadcrumbSchema, absoluteUrl, SITE_NAME } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { PostCard } from './PostCard.jsx';
import { POSTS } from './posts/index.js';
import { CATEGORIES, categoryOf, categoryLabel, categoryDesc } from './categories.js';
import { postTitle, postDescription } from './postI18n.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

/** Blog liste sayfası — `/blog`. Kategori filtresi ile. */
export default function BlogIndex() {
  const { t, lang } = useLanguage();
  const breadcrumbs = [{ name: t('nav.home'), path: '/' }, { name: t('nav.blog'), path: '/blog' }];
  const [cat, setCat] = useState('all');

  const filtered = useMemo(
    () => (cat === 'all' ? POSTS : POSTS.filter((p) => p.category === cat)),
    [cat]
  );

  // Blog anasayfası — Blog + BreadcrumbList schema.org
  useSeo({
    title: t('seo.blogIndex.title'),
    description: t('seo.blogIndex.description'),
    keywords: t('seo.blogIndex.keywords'),
    path: '/blog',
    jsonLd: [
      breadcrumbSchema(breadcrumbs),
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `${SITE_NAME} Blog`,
        url: absoluteUrl('/blog'),
        description: t('seo.blogIndex.schemaDescription'),
        blogPost: POSTS.slice(0, 10).map((p) => ({
          '@type': 'BlogPosting',
          headline: postTitle(p, lang),
          description: postDescription(p, lang),
          url: absoluteUrl(`/blog/${p.slug}`),
          datePublished: p.publishedAt,
          dateModified: p.updatedAt || p.publishedAt,
        })),
      },
    ],
  });

  return (
    <>
      <PageHero
        kicker={t('nav.blog')}
        title={t('blog.hero.title')}
        lead={t('blog.hero.lead', { count: POSTS.length })}
        breadcrumbs={breadcrumbs}
      />

      <Section id="blog-list" ariaLabel={t('blog.listAria')}>
        {/* Kategori filtresi */}
        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label={t('blog.categoryFilterAria')}>
          <button
            type="button"
            role="tab"
            aria-selected={cat === 'all'}
            onClick={() => setCat('all')}
            className={`chip transition ${
              cat === 'all' ? 'bg-brand-violet text-white' : 'bg-surface text-ink-soft hover:bg-brand-violet/10'
            }`}
          >
            {t('blog.allCategories')} ({POSTS.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = POSTS.filter((p) => p.category === c.key).length;
            if (count === 0) return null;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={cat === c.key}
                onClick={() => setCat(c.key)}
                className={`chip transition ${
                  cat === c.key ? 'bg-brand-violet text-white' : 'bg-surface text-ink-soft hover:bg-brand-violet/10'
                }`}
              >
                {categoryLabel(c, t)} ({count})
              </button>
            );
          })}
        </div>

        {cat !== 'all' && (
          <p className="mb-6 text-sm text-muted">{categoryDesc(categoryOf(cat), t)}</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-muted">{t('blog.emptyCategory')}</p>
        )}
      </Section>
    </>
  );
}
