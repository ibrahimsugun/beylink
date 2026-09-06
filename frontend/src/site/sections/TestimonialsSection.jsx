import { Section } from '../../components/ui/Section.jsx';
import { Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.10 — Referanslar/testimonial. Rakamlar gerçekçi tanıtım niyetlidir; canlıda gerçek kullanıcılarla değiştirilecek.
// İsim ve baş harfler gerçek/örnek veri — çevrilmez; yalnız yorum metni + unvan t()'den geçer.
const TESTIMONIALS = [
  { k: 't1', author: 'Deniz Kaya', initials: 'DK' },
  { k: 't2', author: 'Selin Aksoy', initials: 'SA' },
  { k: 't3', author: 'Emre Tuncer', initials: 'ET' },
];

export function TestimonialsSection() {
  const { t } = useLanguage();
  return (
    <Section
      id="testimonials"
      kicker={t('landing.testimonials.kicker')}
      title={t('landing.testimonials.title')}
      lead={t('landing.testimonials.lead')}
      className="bg-white border-y border-line"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <figure key={item.author} className="card p-6">
            <div className="flex gap-1 text-warning" aria-label={t('landing.testimonials.starsAria')}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <blockquote className="mt-4 text-sm leading-relaxed text-ink-soft">
              "{t(`landing.testimonials.${item.k}.quote`)}"
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white"
              >
                {item.initials}
              </span>
              <span>
                <cite className="not-italic font-display font-bold text-ink">{item.author}</cite>
                <span className="block text-xs text-muted">{t(`landing.testimonials.${item.k}.role`)}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
