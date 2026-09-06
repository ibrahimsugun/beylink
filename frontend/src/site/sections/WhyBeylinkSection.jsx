import { Zap, Search, BarChart3, QrCode, Users, Smartphone } from 'lucide-react';
import { Section } from '../../components/ui/Section.jsx';
import { FeatureCard } from './FeatureCard.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.5 — 6 kart, her biri ayrı component (FeatureCard).
const ITEMS = [
  { icon: Zap, k: 'fast' },
  { icon: Search, k: 'seo' },
  { icon: BarChart3, k: 'analytics' },
  { icon: QrCode, k: 'qr' },
  { icon: Users, k: 'subaccount' },
  { icon: Smartphone, k: 'mobile' },
];

export function WhyBeylinkSection() {
  const { t } = useLanguage();
  return (
    <Section
      id="why"
      kicker={t('landing.why.kicker')}
      title={t('landing.why.title')}
      lead={t('landing.why.lead')}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => (
          <FeatureCard key={it.k} icon={it.icon} title={t(`landing.why.${it.k}.title`)} desc={t(`landing.why.${it.k}.desc`)} />
        ))}
      </div>
    </Section>
  );
}
