import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.12 — Son CTA. Kullanıcıyı kayıt olmaya yönlendirir.
export function FinalCtaSection() {
  const { t } = useLanguage();
  return (
    <section id="cta" aria-labelledby="cta-heading" className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="card overflow-hidden bg-brand-gradient p-10 text-center text-white shadow-pop sm:p-14">
          <h2 id="cta-heading" className="font-display text-3xl font-extrabold sm:text-4xl">
            {t('landing.cta.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-white/90">
            {t('landing.cta.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="btn bg-white text-ink hover:bg-white/95 px-6 py-3 text-base font-bold"
            >
              {t('landing.cta.primary')} <ArrowRight size={18} />
            </Link>
            <Link
              to="/pricing"
              className="btn border border-white/40 bg-white/10 text-white hover:bg-white/15 px-6 py-3 text-base font-semibold"
            >
              {t('landing.cta.secondary')}
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/70">{t('landing.cta.fine')}</p>
        </div>
      </div>
    </section>
  );
}
