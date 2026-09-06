import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Section } from '../../components/ui/Section.jsx';
import { TEMPLATES, PRESET_THEMES, themeName, themeSector, templateName, templateCat } from '../../lib/themes.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.8 — Popüler template örnekleri. Gerçek katalogtan 6 tanesini vitrin olarak gösterir.
// Her kart clicable → /sablonlar sayfasına (Faz 6 statik sayfa) yönlendirir; SEO iç bağlantı.
const SHOWCASE = [
  ...TEMPLATES.slice(0, 4),
  ...PRESET_THEMES.slice(0, 2),
];

export function TemplatesSection() {
  const { t } = useLanguage();
  return (
    <Section
      id="templates"
      kicker={t('landing.templates.kicker')}
      title={t('landing.templates.title')}
      lead={t('landing.templates.lead')}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SHOWCASE.map((item) => {
          const pageBg = item.pageStyle?.background || 'linear-gradient(135deg,#F6F8FB 0%,#E5E9F2 100%)';
          const btnBg = item.button?.background || '#1B2340';
          const btnColor = item.button?.color || '#fff';
          return (
            <article key={item.key} className="card overflow-hidden">
              <div className="relative h-56 w-full" style={{ background: pageBg }}>
                <div className="absolute left-1/2 top-6 flex -translate-x-1/2 flex-col items-center gap-2">
                  <span className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-sm" aria-hidden="true" />
                  <span className="h-2 w-20 rounded-full bg-white/40" aria-hidden="true" />
                </div>
                <div className="absolute inset-x-6 bottom-5 flex flex-col gap-1.5" aria-hidden="true">
                  <div className="h-8 rounded-lg" style={{ background: btnBg, color: btnColor, opacity: 0.95 }} />
                  <div className="h-8 rounded-lg" style={{ background: btnBg, color: btnColor, opacity: 0.75 }} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-display font-bold text-ink">
                    {item.category != null ? templateName(item, t) : themeName(item, t)}
                  </h3>
                  {item.sector && <p className="text-xs text-muted">{themeSector(item, t)}</p>}
                  {item.category && <p className="text-xs text-muted">{templateCat(item, t)}</p>}
                </div>
                {item.professional && <span className="chip bg-brand-violet/10 text-brand-violet">{t('landing.templates.badgePro')}</span>}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link to="/templates" className="btn-ghost">
          {t('landing.templates.cta')} <ArrowRight size={16} />
        </Link>
      </div>
    </Section>
  );
}
