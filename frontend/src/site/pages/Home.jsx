import { useSeo, orgSchema, websiteSchema, softwareApplicationSchema, faqSchema } from '../../lib/seo.js';
import { HeroSection } from '../sections/HeroSection.jsx';
import { StatsSection } from '../sections/StatsSection.jsx';
import { WhyBeylinkSection } from '../sections/WhyBeylinkSection.jsx';
import { HowItWorksSection } from '../sections/HowItWorksSection.jsx';
import { FeaturesSection } from '../sections/FeaturesSection.jsx';
import { TemplatesSection } from '../sections/TemplatesSection.jsx';
import { PricingSection } from '../sections/PricingSection.jsx';
import { TestimonialsSection } from '../sections/TestimonialsSection.jsx';
import { FaqSection } from '../sections/FaqSection.jsx';
import { FinalCtaSection } from '../sections/FinalCtaSection.jsx';
import { FAQS, resolveFaqs } from '../data/faqs.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Kurumsal ana sayfa — Faz 1 tüm görevler (12 section) tek H1 (Hero) + semantik <section id=...> zinciri.
// SEO: Organization + WebSite + SoftwareApplication + FAQPage (ilk 8 soru) JSON-LD hepsi head'e enjekte.
export default function Home() {
  const { t } = useLanguage();
  useSeo({
    title: t('seo.home.title'),
    description: t('seo.home.description'),
    keywords: t('seo.home.keywords'),
    path: '/',
    image: '/og-image.png',
    jsonLd: [
      orgSchema(),
      websiteSchema(),
      softwareApplicationSchema(),
      faqSchema(resolveFaqs(t, FAQS.slice(0, 8))),
    ],
  });

  return (
    <>
      <HeroSection />
      <StatsSection />
      <WhyBeylinkSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TemplatesSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
