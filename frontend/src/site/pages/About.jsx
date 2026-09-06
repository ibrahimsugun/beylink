import { Target, Sparkles, Heart, Users } from 'lucide-react';
import { useSeo, breadcrumbSchema, orgSchema } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { FinalCtaSection } from '../sections/FinalCtaSection.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Metinler i18n'de: pages.about.value.<id>.title|desc · pages.about.timeline.<i>.year|title|desc
const VALUES = [
  { icon: Target, id: 'simplicity' },
  { icon: Sparkles, id: 'quality' },
  { icon: Heart, id: 'turkish' },
  { icon: Users, id: 'together' },
];

export default function About() {
  const { t } = useLanguage();
  const breadcrumbs = [{ name: t('nav.home'), path: '/' }, { name: t('footer.link.about'), path: '/about' }];
  useSeo({
    title: t('seo.about.title'),
    description: t('seo.about.description'),
    keywords: t('seo.about.keywords'),
    path: '/about',
    jsonLd: [breadcrumbSchema(breadcrumbs), orgSchema()],
  });

  return (
    <>
      <PageHero
        kicker={t('footer.link.about')}
        title={t('pages.about.hero.title')}
        lead={t('pages.about.hero.lead')}
        breadcrumbs={breadcrumbs}
      />

      <Section id="story" title={t('pages.about.story.title')} lead="">
        <div className="prose max-w-3xl text-base leading-relaxed text-ink-soft">
          <p>{t('pages.about.story.p1')}</p>
          <p className="mt-4">{t('pages.about.story.p2')}</p>
          <p className="mt-4">{t('pages.about.story.p3')}</p>
        </div>
      </Section>

      <Section id="values" title={t('pages.about.values.title')} className="bg-white border-y border-line">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <article key={v.id} className="card p-6">
              <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <v.icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{t(`pages.about.value.${v.id}.title`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`pages.about.value.${v.id}.desc`)}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="timeline" title={t('pages.about.timeline.title')} lead={t('pages.about.timeline.lead')}>
        <ol className="relative border-l-2 border-line pl-6">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="mb-8 last:mb-0">
              <span
                aria-hidden="true"
                className="absolute -left-2 mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient ring-4 ring-surface"
              />
              <time className="chip bg-brand-violet/10 text-brand-violet">{t(`pages.about.timeline.${i}.year`)}</time>
              <h3 className="mt-2 font-display text-lg font-bold text-ink">{t(`pages.about.timeline.${i}.title`)}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t(`pages.about.timeline.${i}.desc`)}</p>
            </li>
          ))}
        </ol>
      </Section>

      <FinalCtaSection />
    </>
  );
}
