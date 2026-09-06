import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProfileView } from '../../components/profile/ProfileView.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Mevcut anasayfa hero'su korunuyor (kullanıcı onayı) — sadece SiteLayout ile uyumlandı.
// Semantik: sayfanın TEK <h1>'i burada; içerik <section id="hero"> içinde ama başlığı görsel bütünlük
// için özel formatlandığından Section wrapper yerine elle yazıyoruz (id + aria-label korunur).
const DEMO = {
  profile: { username: 'demo', display_name: 'Deniz Kaya', bio: 'Müzisyen · Prodüktör 🎧', theme_settings: { template: 'midnight', title_align: 'center' } },
  links: [
    { id: 1, type: 'social', title: 'Instagram', icon_name: 'instagram', url: '#' },
    { id: 2, type: 'social', title: 'YouTube', icon_name: 'youtube', url: '#' },
    { id: 3, type: 'social', title: 'TikTok', icon_name: 'tiktok', url: '#' },
    { id: 4, type: 'link', title: 'Yeni Single 🎵', icon_name: 'music', url: '#' },
    { id: 5, type: 'link', title: 'Konser Biletleri', icon_name: 'link', url: '#' },
  ],
};

export function HeroSection() {
  const { t } = useLanguage();
  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="chip bg-brand-violet/10 text-brand-violet">{t('landing.hero.chip')}</span>
          <h1 id="hero-heading" className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            {t('landing.hero.titleLine1')}<br />
            <span className="bg-brand-gradient bg-clip-text text-transparent">{t('landing.hero.titleLine2')}</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            {t('landing.hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-brand px-6 py-3 text-base">{t('landing.hero.ctaPrimary')} <ArrowRight size={18} /></Link>
            <Link to="/demo" className="btn-ghost px-6 py-3 text-base">{t('landing.hero.ctaSecondary')}</Link>
          </div>
          <p className="mt-3 text-sm text-muted">beylink.org/<span className="font-semibold text-ink">{t('landing.hero.usernamePlaceholder')}</span></p>
        </div>

        <div className="flex justify-center">
          <div className="relative h-[540px] w-[270px] rotate-2 rounded-[2.4rem] border-[10px] border-ink bg-ink shadow-pop">
            <div className="thin-scroll h-full w-full overflow-hidden rounded-[1.7rem]">
              {/* headingAs="div" → hero'daki dekoratif mock isim sayfanın h1 hiyerarşisini kirletmez (SEO: tek H1) */}
              <ProfileView profile={DEMO.profile} links={DEMO.links} showBranding={false} headingAs="div" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
