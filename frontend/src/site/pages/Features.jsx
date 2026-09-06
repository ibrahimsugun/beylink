import {
  Link2, QrCode, BarChart3, Search, Users, Palette, Sparkles, Contact,
  ShieldCheck, LineChart, FileImage, Smartphone, Layers, Globe, Lock, Zap,
  Globe2, KeyRound,
} from 'lucide-react';
import { useSeo, breadcrumbSchema } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { FeatureCard } from '../sections/FeatureCard.jsx';
import { FinalCtaSection } from '../sections/FinalCtaSection.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Kategorize edilmiş özellik listesi — statik SSS/pricing sayfalarına iç bağlantı akışını korur.
// Metinler i18n'e taşındı: pages.features.groups.<id>.title + .items.<i>.title/desc
const GROUPS = [
  { id: 'links', icons: [Link2, Contact, FileImage, Layers] },
  { id: 'design', icons: [Palette, Sparkles, QrCode, Smartphone] },
  { id: 'analytics', icons: [BarChart3, LineChart, Search, Globe] },
  { id: 'team', icons: [Users, ShieldCheck, Lock, Zap] },
  { id: 'domain', icons: [Globe2, KeyRound] }, // özel alan adı — yalnız Pro Plus (bkz. Pricing karşılaştırma tablosu)
];

export default function Features() {
  const { t } = useLanguage();
  const breadcrumbs = [{ name: t('nav.home'), path: '/' }, { name: t('nav.features'), path: '/features' }];
  useSeo({
    title: t('seo.features.title'),
    description: t('seo.features.description'),
    keywords: t('seo.features.keywords'),
    path: '/features',
    jsonLd: [breadcrumbSchema(breadcrumbs)],
  });

  return (
    <>
      <PageHero
        kicker={t('nav.features')}
        title={t('pages.features.hero.title')}
        lead={t('pages.features.hero.lead')}
        breadcrumbs={breadcrumbs}
      />

      {GROUPS.map((g, i) => (
        <Section
          key={g.id}
          id={g.id}
          title={t(`pages.features.groups.${g.id}.title`)}
          className={i % 2 === 1 ? 'bg-white border-y border-line' : ''}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {g.icons.map((icon, idx) => (
              <FeatureCard
                key={idx}
                icon={icon}
                title={t(`pages.features.groups.${g.id}.items.${idx}.title`)}
                desc={t(`pages.features.groups.${g.id}.items.${idx}.desc`)}
              />
            ))}
          </div>
        </Section>
      ))}

      <FinalCtaSection />
    </>
  );
}
