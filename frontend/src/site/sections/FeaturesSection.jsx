import { Link2, QrCode, BarChart3, Search, Users, Palette, Sparkles, Contact } from 'lucide-react';
import { Section } from '../../components/ui/Section.jsx';
import { FeatureCard } from './FeatureCard.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.7 — Detaylı feature listesi. Kartlar FeatureCard'ı reuse eder.
const FEATURES = [
  { icon: Link2, k: 'link' },
  { icon: QrCode, k: 'qr' },
  { icon: BarChart3, k: 'analytics' },
  { icon: Search, k: 'seo' },
  { icon: Users, k: 'subaccount' },
  { icon: Palette, k: 'themes' },
  { icon: Sparkles, k: 'richtext' },
  { icon: Contact, k: 'contact' },
];

export function FeaturesSection() {
  const { t } = useLanguage();
  return (
    <Section
      id="features"
      kicker={t('landing.features.kicker')}
      title={t('landing.features.title')}
      lead={t('landing.features.lead')}
      className="bg-white border-y border-line"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.k} icon={f.icon} title={t(`landing.features.${f.k}.title`)} desc={t(`landing.features.${f.k}.desc`)} />
        ))}
      </div>
    </Section>
  );
}
