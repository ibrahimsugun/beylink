import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSeo, breadcrumbSchema } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { THEMES, PRESET_THEMES, TEMPLATES, themeName, themeSector, templateName, templateCat } from '../../lib/themes.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Kategorize tam katalog: Ücretsiz temalar (Free) · Profesyonel temalar (Basic+) · Komple şablonlar (Basic+).
// Başlık/kicker i18n'de: pages.templates.cats.<id>.title|kicker
const CATS = [
  { id: 'free', items: THEMES },
  { id: 'preset', items: PRESET_THEMES },
  { id: 'templates', items: TEMPLATES },
];

function ThemeCard({ t: item }) {
  const { t } = useLanguage();
  const pageBg = item.pageStyle?.background || 'linear-gradient(135deg,#F6F8FB 0%,#E5E9F2 100%)';
  const btnBg = item.button?.background || '#1B2340';
  const btnColor = item.button?.color || '#fff';
  return (
    <article className="card overflow-hidden transition hover:shadow-pop">
      <div className="relative h-52 w-full" style={{ background: pageBg }}>
        <div className="absolute left-1/2 top-6 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="h-11 w-11 rounded-full bg-white/30 backdrop-blur-sm" aria-hidden="true" />
          <span className="h-2 w-16 rounded-full bg-white/40" aria-hidden="true" />
        </div>
        <div className="absolute inset-x-6 bottom-4 flex flex-col gap-1.5" aria-hidden="true">
          <div className="h-7 rounded-lg" style={{ background: btnBg, color: btnColor, opacity: 0.95 }} />
          <div className="h-7 rounded-lg" style={{ background: btnBg, color: btnColor, opacity: 0.75 }} />
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-display font-bold text-ink">
            {item.category != null ? templateName(item, t) : themeName(item, t)}
          </h3>
          {item.sector && <p className="text-xs text-muted">{themeSector(item, t)}</p>}
          {item.category && <p className="text-xs text-muted">{templateCat(item, t)}</p>}
        </div>
        {item.professional && <span className="chip bg-brand-violet/10 text-brand-violet">{t('landing.templates.badgePro')}</span>}
      </div>
    </article>
  );
}

export default function Templates() {
  const { t } = useLanguage();
  const breadcrumbs = [{ name: t('nav.home'), path: '/' }, { name: t('nav.templates'), path: '/templates' }];
  useSeo({
    title: t('seo.templates.title'),
    description: t('seo.templates.description'),
    keywords: t('seo.templates.keywords'),
    path: '/templates',
    jsonLd: [breadcrumbSchema(breadcrumbs)],
  });

  return (
    <>
      <PageHero
        kicker={t('nav.templates')}
        title={t('landing.templates.title')}
        lead={t('pages.templates.hero.lead', { count: THEMES.length + PRESET_THEMES.length + TEMPLATES.length })}
        breadcrumbs={breadcrumbs}
      />

      {CATS.map((c, i) => (
        <Section
          key={c.id}
          id={c.id}
          kicker={t(`pages.templates.cats.${c.id}.kicker`)}
          title={t(`pages.templates.cats.${c.id}.title`)}
          className={i % 2 === 1 ? 'bg-white border-y border-line' : ''}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.items.map((t) => <ThemeCard key={t.key} t={t} />)}
          </div>
        </Section>
      ))}

      <Section id="templates-cta" ariaLabel={t('pages.templates.cta.aria')} innerClassName="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold text-ink">{t('pages.templates.cta.title')}</h2>
          <p className="mt-3 text-base text-muted">{t('pages.templates.cta.lead')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-brand px-6 py-3">{t('landing.cta.primary')} <ArrowRight size={16} /></Link>
            <Link to="/pricing" className="btn-ghost px-6 py-3">{t('landing.cta.secondary')}</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
