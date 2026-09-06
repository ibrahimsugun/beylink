import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlayCircle, CreditCard, Users, BarChart3, Settings, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { useSeo, breadcrumbSchema } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { FAQS, resolveFaqs } from '../data/faqs.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Yardım kategorileri — her biri /faq'a sorunun keyword'üne göre filtrelenerek yönlendirir (basit).
// Başlık/açıklama i18n'de: pages.help.cat.<id>.title|desc
const CATEGORIES = [
  { icon: PlayCircle, id: 'baslangic' },
  { icon: Settings, id: 'profil' },
  { icon: BarChart3, id: 'analytics' },
  { icon: CreditCard, id: 'odeme' },
  { icon: Users, id: 'ekip' },
  { icon: ShieldCheck, id: 'guvenlik' },
];

export default function Help() {
  const { t } = useLanguage();
  const breadcrumbs = [{ name: t('nav.home'), path: '/' }, { name: t('footer.link.helpCenter'), path: '/help' }];
  useSeo({
    title: t('seo.help.title'),
    description: t('seo.help.description'),
    keywords: t('seo.help.keywords'),
    path: '/help',
    jsonLd: [breadcrumbSchema(breadcrumbs)],
  });

  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return resolveFaqs(t, FAQS).filter((f) =>
      f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [q, t]);

  return (
    <>
      <PageHero
        kicker={t('footer.link.helpCenter')}
        title={t('pages.help.hero.title')}
        lead={t('pages.help.hero.lead')}
        breadcrumbs={breadcrumbs}
      >
        <form onSubmit={(e) => e.preventDefault()} className="mt-2 max-w-xl" role="search" aria-label={t('pages.help.search.aria')}>
          <div className="relative">
            <label htmlFor="help-search" className="sr-only">{t('pages.help.search.label')}</label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="help-search"
              type="search"
              placeholder={t('pages.help.search.placeholder')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input !pl-11 !py-3 !text-base"
            />
          </div>
        </form>

        {results.length > 0 && (
          <div className="mt-3 max-w-xl rounded-2xl border border-line bg-white p-4 shadow-card">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('pages.help.search.results')}</p>
            <ul className="space-y-1.5">
              {results.map((r, i) => (
                <li key={i}>
                  <Link
                    to={`/faq#faq-${i}`}
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-soft hover:bg-surface"
                  >
                    <HelpCircle size={14} className="mt-0.5 shrink-0 text-brand-violet" aria-hidden="true" />
                    <span>{r.q}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageHero>

      <Section id="categories" title={t('pages.help.categories.title')} lead={t('pages.help.categories.lead')}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <article key={c.id} id={c.id} className="card p-6 transition hover:shadow-pop">
              <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <c.icon size={20} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink">{t(`pages.help.cat.${c.id}.title`)}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`pages.help.cat.${c.id}.desc`)}</p>
              <Link to="/faq" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-violet hover:underline">
                {t('pages.help.seeGuides')} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section id="contact-cta" className="bg-white border-y border-line" innerClassName="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold text-ink">{t('pages.help.contactCta.title')}</h2>
          <p className="mt-3 text-base text-muted">{t('pages.help.contactCta.lead')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-brand px-6 py-3">{t('pages.help.contactCta.contact')}</Link>
            <Link to="/faq" className="btn-ghost px-6 py-3">{t('pages.help.contactCta.allFaq')}</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
