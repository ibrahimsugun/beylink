import { UserPlus, LayoutDashboard, Link2, Share2 } from 'lucide-react';
import { Section } from '../../components/ui/Section.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.6 — 4 adımlı akış.
const STEPS = [
  { n: '01', icon: UserPlus, k: 'step1' },
  { n: '02', icon: LayoutDashboard, k: 'step2' },
  { n: '03', icon: Link2, k: 'step3' },
  { n: '04', icon: Share2, k: 'step4' },
];

export function HowItWorksSection() {
  const { t } = useLanguage();
  return (
    <Section
      id="how"
      kicker={t('landing.how.kicker')}
      title={t('landing.how.title')}
      lead={t('landing.how.lead')}
    >
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ n, icon: Icon, k }) => (
          <li key={n} className="card relative p-6">
            <span className="absolute right-5 top-4 font-display text-3xl font-extrabold text-brand-violet/15">{n}</span>
            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Icon size={20} />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-ink">{t(`landing.how.${k}.title`)}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`landing.how.${k}.desc`)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
