import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { categoryOf, categoryLabel } from './categories.js';
import { postTitle, postDescription, postReadingMinutes } from './postI18n.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Blog liste ve related posts için makale kartı.
export function PostCard({ post }) {
  const { t, lang, locale } = useLanguage();
  const cat = categoryOf(post.category);
  const title = postTitle(post, lang);
  const description = postDescription(post, lang);
  const readingMinutes = postReadingMinutes(post, lang);
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition hover:shadow-pop">
      <Link to={`/blog/${post.slug}`} className="flex h-full flex-col p-6">
        <div className="flex items-center gap-3 text-xs">
          <span className="chip bg-brand-violet/10 text-brand-violet">{categoryLabel(cat, t)}</span>
          <span className="flex items-center gap-1 text-muted">
            <Clock size={12} aria-hidden="true" />
            {t.plural('blog.readTime', readingMinutes)}
          </span>
        </div>
        <h2 className="mt-4 font-display text-lg font-bold text-ink group-hover:text-brand-violet sm:text-xl">
          {title}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5 flex items-center justify-between text-xs">
          {date && <time dateTime={post.publishedAt} className="text-muted">{date}</time>}
          <span className="flex items-center gap-1 font-semibold text-brand-violet">
            {t('blog.readMore')} <ArrowRight size={12} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
