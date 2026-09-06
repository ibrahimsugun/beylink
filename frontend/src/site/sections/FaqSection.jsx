import { Link } from 'react-router-dom';
import { Section } from '../../components/ui/Section.jsx';
import { FAQS } from '../data/faqs.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.11 — SSS. Ana sayfada özet olarak ilk 8 soru; tam liste /sss sayfasında.
// FAQPage JSON-LD ana sayfa için useSeo({ jsonLd }) ile head'e ayrıca eklenir.
// <details>/<summary> semantik akordeon — sıfır JS, screen reader dostu, Google FAQ zengin snippet için ideal.
const HOME_FAQS = FAQS.slice(0, 8);

export function FaqSection() {
  const { t } = useLanguage();
  return (
    <Section
      id="faq"
      kicker={t('landing.faq.kicker')}
      title={t('landing.faq.title')}
      lead={t('landing.faq.lead')}
    >
      <div className="mx-auto max-w-3xl divide-y divide-line">
        {HOME_FAQS.map((f, i) => (
          <details
            key={i}
            className="group py-4"
          >
            <summary className="flex cursor-pointer items-start justify-between gap-4 text-left list-none [&::-webkit-details-marker]:hidden">
              <h3 className="font-display text-base font-bold text-ink">{t(f.qKey)}</h3>
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

      <div className="mt-8 text-center">
        <Link to="/faq" className="btn-ghost">{t('landing.faq.cta')}</Link>
      </div>
    </Section>
  );
}
