import { Link } from 'react-router-dom';
import { useSeo, faqSchema, breadcrumbSchema } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { FAQS, resolveFaqs } from '../data/faqs.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.11 tam liste + FAQPage JSON-LD (Google FAQ zengin snippet için).
export default function Faq() {
  const { t } = useLanguage();
  const breadcrumbs = [{ name: t('nav.home'), path: '/' }, { name: t('nav.faq'), path: '/faq' }];
  useSeo({
    title: t('seo.faq.title'),
    description: t('seo.faq.description'),
    keywords: t('seo.faq.keywords'),
    path: '/faq',
    jsonLd: [breadcrumbSchema(breadcrumbs), faqSchema(resolveFaqs(t))],
  });

  return (
    <>
      <PageHero
        kicker={t('nav.help')}
        title={t('pages.faq.hero.title')}
        lead={t('pages.faq.hero.lead')}
        breadcrumbs={breadcrumbs}
      />
      <Section id="faq-all" ariaLabel={t('pages.faq.allAria')}>
        <div className="mx-auto max-w-3xl divide-y divide-line">
          {FAQS.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="flex cursor-pointer items-start justify-between gap-4 text-left list-none [&::-webkit-details-marker]:hidden">
                <h2 className="font-display text-base font-bold text-ink">{t(f.qKey)}</h2>
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-muted transition group-open:rotate-45 group-open:border-brand-violet group-open:text-brand-violet"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t(f.aKey)}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-surface p-6 text-center">
          <h2 className="font-display text-lg font-bold text-ink">{t('pages.faq.cta.title')}</h2>
          <p className="mt-2 text-sm text-muted">{t('pages.faq.cta.lead')}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-brand">{t('pages.faq.cta.contact')}</Link>
            <Link to="/help" className="btn-ghost">{t('footer.link.helpCenter')}</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
