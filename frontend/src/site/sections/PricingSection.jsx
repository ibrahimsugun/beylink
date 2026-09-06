import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Section } from '../../components/ui/Section.jsx';
import { PLANS, PLAN_ORDER, MICRO, planLabel } from '../../lib/plans.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.9 — 4 paket kartı. Login öncesi tanıtım; "Satın al" butonları register/login akışına yönlendirir.
// Gerçek satın alma dashboard'daki PlansPage üzerinden (kayıt sonrası).
// NOT (i18n): kicker/title/lead/"Popüler"/"Ekip"/"/ay"/CTA metinleri Task 3.1 (marketing-copywriter)
// kapsamında — burada YALNIZCA Config Anahtar Kuralı'na tabi plan.label + features çevrilir.
const HIGHLIGHT = 'pro';

const price = (p) => (p.priceMicro / MICRO).toFixed(0);

export function PricingSection() {
  const { t } = useLanguage();
  return (
    <Section
      id="pricing"
      kicker={t('landing.pricing.kicker')}
      title={t('landing.pricing.title')}
      lead={t('landing.pricing.lead')}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((key) => {
          const p = PLANS[key];
          const isHighlight = key === HIGHLIGHT;
          const isProPlus = key === 'proplus';
          return (
            <article
              key={key}
              className={`card flex flex-col p-6 ${
                isProPlus ? 'border-ink bg-ink text-white' : ''
              } ${isHighlight ? 'ring-2 ring-brand-violet' : ''}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className={`font-display text-lg font-bold ${isProPlus ? 'text-white' : 'text-ink'}`}>
                  {planLabel(key, t)}
                </h3>
                {isHighlight && !isProPlus && (
                  <span className="chip bg-brand-violet/10 text-brand-violet">{t('landing.pricing.badgePopular')}</span>
                )}
                {isProPlus && <span className="chip bg-brand-teal/20 text-brand-teal">{t('landing.pricing.badgeTeam')}</span>}
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className={`font-display text-4xl font-extrabold ${isProPlus ? 'text-white' : 'text-ink'}`}>
                  ${price(p)}
                </span>
                <span className={`text-sm ${isProPlus ? 'text-white/60' : 'text-muted'}`}>{t('landing.pricing.perMonth')}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className={isProPlus ? 'mt-0.5 shrink-0 text-brand-teal' : 'mt-0.5 shrink-0 text-brand-violet'} aria-hidden="true" />
                    <span className={isProPlus ? 'text-white/85' : 'text-ink-soft'}>{t(f)}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`btn mt-6 w-full justify-center py-2.5 ${
                  isProPlus ? 'bg-brand-gradient text-white' : isHighlight ? 'btn-brand' : 'btn-ghost'
                }`}
              >
                {key === 'free' ? t('landing.pricing.ctaFree') : t('landing.pricing.ctaSelect')}
              </Link>
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        {t('landing.pricing.footerPrefix')}{' '}
        <Link to="/pricing" className="font-semibold text-brand-violet hover:underline">{t('landing.pricing.footerLink')}</Link>.
      </p>
    </Section>
  );
}
