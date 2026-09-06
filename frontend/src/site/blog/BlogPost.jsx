import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Clock, Calendar, Share2, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { useSeo, articleSchema, breadcrumbSchema, faqSchema, absoluteUrl } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { PostCard } from './PostCard.jsx';
import { findPostBySlug, relatedPosts } from './posts/index.js';
import { categoryOf, categoryLabel } from './categories.js';
import { postTitle, postDescription, postTags, postFaq, postReadingMinutes } from './postI18n.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

/** Tek makale — `/blog/:slug`. TOC + share + related + Article/FAQ JSON-LD. */
export default function BlogPost() {
  const { slug } = useParams();
  const { t, lang, locale } = useLanguage();
  const post = findPostBySlug(slug);

  // Slug bulunamazsa 404 → blog listeye yönlendir
  if (!post) return <Navigate to="/blog" replace />;

  // Dile bağlı alanları bir kez çöz (fallback tr→en postI18n içinde)
  const title = postTitle(post, lang);
  const description = postDescription(post, lang);
  const tags = postTags(post, lang);
  const faq = postFaq(post, lang);
  const readingMinutes = postReadingMinutes(post, lang);

  const cat = categoryOf(post.category);
  const breadcrumbs = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.blog'), path: '/blog' },
    { name: title, path: `/blog/${post.slug}` },
  ];

  const jsonLd = [
    breadcrumbSchema(breadcrumbs),
    articleSchema({
      title,
      description,
      path: `/blog/${post.slug}`,
      image: post.image,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
    }),
  ];
  if (faq?.length) jsonLd.push(faqSchema(faq));

  useSeo({
    title,
    description,
    keywords: (tags || []).join(', '),
    path: `/blog/${post.slug}`,
    image: post.image,
    type: 'article',
    jsonLd,
  });

  const Body = post.Component;
  const related = relatedPosts(post.slug, 3);
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      <PageHero
        kicker={categoryLabel(cat, t)}
        title={title}
        lead={description}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          {dateStr && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden="true" />
              <time dateTime={post.publishedAt}>{dateStr}</time>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" />
            {t.plural('blog.readTime', readingMinutes)}
          </span>
        </div>
      </PageHero>

      <article className="mx-auto max-w-4xl px-6 py-10 lg:grid lg:grid-cols-12 lg:gap-10 lg:py-14">
        {/* İçindekiler — sticky sol sütun (lg+) */}
        <aside className="lg:col-span-3">
          <TableOfContents t={t} />
        </aside>

        {/* Ana içerik */}
        <div className="lg:col-span-9">
          <div id="post-body" className="prose-article max-w-none">
            <Body />
          </div>

          {/* Share bar */}
          <ShareBar post={post} title={title} t={t} />

          {/* Tag'ler */}
          {tags?.length > 0 && (
            <div className="mt-10 border-t border-line pt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted">{t('blog.tags.title')}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="chip bg-surface text-ink-soft">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <Section
          id="related"
          title={t('blog.related.title')}
          className="bg-white border-y border-line"
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/blog" className="btn-ghost">{t('blog.related.viewAll')}</Link>
          </div>
        </Section>
      )}
    </>
  );
}

/** İçindekiler — makale gövdesindeki H2'leri otomatik toplar. Scroll spy yok (basit). */
function TableOfContents({ t }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    // Body render'ından sonra H2'leri çıkar
    const raf = requestAnimationFrame(() => {
      const body = document.getElementById('post-body');
      if (!body) return;
      const h2s = body.querySelectorAll('h2[id]');
      setItems([...h2s].map((h) => ({ id: h.id, text: h.textContent })));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (items.length < 2) return null;
  return (
    <nav
      aria-label={t('blog.toc.title')}
      className="mb-8 rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24 lg:mb-0"
    >
      <div className="text-xs font-bold uppercase tracking-wider text-ink">{t('blog.toc.title')}</div>
      <ol className="mt-3 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="text-ink-soft hover:text-brand-violet">
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Sosyal medya paylaşımı — Twitter, WhatsApp, LinkedIn, kopyala. */
function ShareBar({ post, title, t }) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const text = encodeURIComponent(title);

  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="mt-14 flex items-center gap-3 border-t border-line pt-6">
      <span className="flex items-center gap-1.5 text-sm text-muted">
        <Share2 size={14} aria-hidden="true" /> {t('blog.share.label')}
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener nofollow"
        aria-label={t('blog.share.twitter')}
        className="btn-ghost !p-2"
      >
        <Twitter size={16} />
      </a>
      <a
        href={`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener nofollow"
        aria-label={t('blog.share.whatsapp')}
        className="btn-ghost !p-2"
      >
        <MessageCircle size={16} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener nofollow"
        aria-label={t('blog.share.linkedin')}
        className="btn-ghost !p-2"
      >
        {/* LinkedIn için basit "in" harfi (Lucide LinkedIn ikonu bazı sürümlerde yok) */}
        <span aria-hidden="true" className="text-xs font-bold">in</span>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={t('blog.share.copyLink')}
        className="btn-ghost !p-2"
      >
        {copied ? <Check size={16} className="text-brand-teal" /> : <Copy size={16} />}
      </button>
    </div>
  );
}
