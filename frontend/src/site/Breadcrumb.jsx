import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

/**
 * Erişilebilir breadcrumb — <nav aria-label="Ekmek kırıntısı"> + <ol>. Son öğe `aria-current="page"`.
 * Görsel bileşen; BreadcrumbList JSON-LD ayrı olarak sayfanın `useSeo({ jsonLd: [breadcrumbSchema(items)] })`
 * ile eklenir (bunun için `lib/seo.js` içindeki helper kullanılır).
 *
 * items: [{ name, path }] — son öğe genellikle path'siz (mevcut sayfa) verilebilir.
 */
export function Breadcrumb({ items = [] }) {
  const { t } = useLanguage();
  if (!items.length) return null;
  return (
    <nav aria-label={t('breadcrumb.aria')} className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="opacity-40" aria-hidden="true" />}
              {last || !it.path ? (
                <span aria-current={last ? 'page' : undefined} className="font-semibold text-ink-soft">{it.name}</span>
              ) : (
                <Link to={it.path} className="hover:text-brand-violet">{it.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
