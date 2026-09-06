import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher.jsx';

// Marketing site header — sticky, scroll'da shadow, mobile drawer.
const NAV = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/features', labelKey: 'nav.features' },
  { to: '/templates', labelKey: 'nav.templates' },
  { to: '/blog', labelKey: 'nav.blog' },
  { to: '/pricing', labelKey: 'nav.pricing' },
  { to: '/help', labelKey: 'nav.help' },
  { to: '/faq', labelKey: 'nav.faq' },
];

export function SiteHeader() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  // Scroll shadow (12px threshold)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Rota değişince mobil menüyü kapat + body scroll'u geri aç
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const linkCls = ({ isActive }) =>
    `text-sm font-semibold transition ${isActive ? 'text-brand-violet' : 'text-ink-soft hover:text-ink'}`;

  return (
    <>
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled ? 'border-line bg-white/85 backdrop-blur-md shadow-card' : 'border-transparent bg-white/70 backdrop-blur-sm'
      }`}
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <Link to="/" aria-label={t('header.logoAria')} className="shrink-0"><Logo /></Link>

        <nav aria-label={t('header.navAria')} className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>{t(n.labelKey)}</NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link to="/register" className="btn-ghost">{t('header.cta.register')}</Link>
              <Link to="/dashboard" className="btn-brand">{t('header.cta.dashboard')} <ArrowRight size={15} /></Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">{t('header.cta.login')}</Link>
              <Link to="/register" className="btn-brand">{t('header.cta.start')}</Link>
            </>
          )}
        </div>

        {/* Mobil (lg altı): dil değiştirici + menü butonu yan yana */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('header.menuClose') : t('header.menuOpen')}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              open
                ? 'border-brand-violet/40 bg-brand-violet/10 text-brand-violet'
                : 'border-line bg-white text-ink-soft hover:border-brand-violet/40 hover:bg-surface hover:text-brand-violet'
            }`}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      </header>

      {/* Mobil dropdown — header DIŞINDA (backdrop-filter fixed'i hapsetmesin), sağa yapışık, içeriği kadar */}
      {open && (
        <>
          <div className="fixed inset-0 top-[69px] z-30 lg:hidden" onClick={() => setOpen(false)} />
          <div
            id="site-mobile-menu"
            className="card fixed right-4 top-[77px] z-40 max-h-[calc(100vh-96px)] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto p-2 lg:hidden"
          >
            <nav aria-label={t('header.mobileNavAria')}>
              <ul className="flex flex-col divide-y divide-line">
                {NAV.map((n) => (
                  <li key={n.to}>
                    <NavLink to={n.to} end={n.end} className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition ${
                        isActive ? 'text-brand-violet' : 'text-ink hover:bg-surface'
                      }`
                    }>
                      {t(n.labelKey)}
                      <ArrowRight size={14} className="opacity-40" />
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
                {user ? (
                  <>
                    <Link to="/register" className="btn-ghost w-full justify-center py-2.5">{t('header.cta.register')}</Link>
                    <Link to="/dashboard" className="btn-brand w-full justify-center py-2.5">{t('header.cta.dashboard')} <ArrowRight size={15} /></Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-ghost w-full justify-center py-2.5">{t('header.cta.login')}</Link>
                    <Link to="/register" className="btn-brand w-full justify-center py-2.5">{t('header.cta.start')}</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
