import { Check, X } from 'lucide-react';
import { useSeo, breadcrumbSchema, productSchema } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { PricingSection } from '../sections/PricingSection.jsx';
import { FaqSection } from '../sections/FaqSection.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { PLANS, PLAN_ORDER, MICRO, planLabel } from '../../lib/plans.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Karşılaştırma tablosu — kısaltılmış (temel yetenekler); tam liste her plan kartında zaten var.
// Etiketler i18n'de: pages.pricing.compare.<key>
const COMPARE = [
  { key: 'links' },
  { key: 'templates_free' },
  { key: 'qr' },
  { key: 'analyticsAdvanced' },
  { key: 'seo' },
  { key: 'btag' },
  { key: 'presetThemes' },
  { key: 'richText' },
  { key: 'csv' },
  { key: 'subAccounts' },
  { key: 'bulkTemplateApply' },
  { key: 'hideBranding' },
  { key: 'brandedDomain', upsellOnly: true }, // yalnız proplus'ta var; diğerlerinde X yerine üstü çizili "dahil değil"
];

const hasCap = (plan, key) => {
  if (key === 'links' || key === 'templates_free' || key === 'qr') return true; // Free dahil hepsinde
  const c = plan.caps || {};
  if (key === 'subAccounts') return c.subAccounts > 0 ? c.subAccounts : false;
  return !!c[key];
};

export default function Pricing() {
  const { t } = useLanguage();
  const breadcrumbs = [{ name: t('nav.home'), path: '/' }, { name: t('nav.pricing'), path: '/pricing' }];

  // NOT (i18n): features artık anahtar dizisi (bkz. lib/plans.js) — JSON-LD açıklaması t() ile çözülür.
  const products = PLAN_ORDER.filter((k) => k !== 'free').map((k) =>
    productSchema({
      name: `BeyLink ${planLabel(k, t)}`,
      description: PLANS[k].features.slice(0, 3).map((f) => t(f)).join('; '),
      price: (PLANS[k].priceMicro / MICRO).toFixed(2),
      priceCurrency: 'USD',
      path: '/pricing',
    })
  );

  useSeo({
    title: t('seo.pricing.title'),
    description: t('seo.pricing.description'),
    keywords: t('seo.pricing.keywords'),
    path: '/pricing',
    jsonLd: [breadcrumbSchema(breadcrumbs), ...products],
  });

  return (
    <>
      <PageHero
        kicker={t('nav.pricing')}
        title={t('pages.pricing.hero.title')}
        lead={t('pages.pricing.hero.lead')}
        breadcrumbs={breadcrumbs}
      />

      {/* Ana sayfa PricingSection'ı reuse — DRY. Kart karşılaştırması altta detaylı. */}
      <PricingSection />

      <Section
        id="comparison"
        kicker={t('pages.pricing.comparison.kicker')}
        title={t('pages.pricing.comparison.title')}
        lead={t('pages.pricing.comparison.lead')}
        className="bg-white border-y border-line"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-4 text-left font-display text-sm font-bold text-ink">{t('pages.pricing.table.feature')}</th>
                {PLAN_ORDER.map((k) => (
                  <th key={k} scope="col" className="py-4 text-center font-display text-sm font-bold text-ink">
                    {planLabel(k, t)}
                    <span className="block text-xs font-normal text-muted">
                      ${(PLANS[k].priceMicro / MICRO).toFixed(0)}{t('landing.pricing.perMonth')}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.key} className="border-b border-line/70">
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-ink-soft">{t(`pages.pricing.compare.${row.key}`)}</th>
                  {PLAN_ORDER.map((k) => {
                    const v = hasCap(PLANS[k], row.key);
                    return (
                      <td key={k} className="py-3 text-center">
                        {typeof v === 'number' ? (
                          <span className="font-semibold text-ink">{v}</span>
                        ) : v ? (
                          <Check size={18} className="mx-auto text-brand-teal" aria-label={t('pages.pricing.table.has')} />
                        ) : row.upsellOnly ? (
                          <span className="text-xs text-muted line-through decoration-line">{t('pages.pricing.table.hasnt')}</span>
                        ) : (
                          <X size={18} className="mx-auto text-line" aria-label={t('pages.pricing.table.hasnt')} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <FaqSection />
    </>
  );
}
