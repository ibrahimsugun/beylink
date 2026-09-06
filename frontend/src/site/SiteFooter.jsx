import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import { Logo } from '../components/ui/Logo.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

// Faz 7 — 4 kolonlu profesyonel footer + newsletter + copyright.
const COLS = [
  {
    titleKey: 'footer.col.product',
    links: [
      { to: '/features', labelKey: 'footer.link.features' },
      { to: '/pricing', labelKey: 'footer.link.pricing' },
      { to: '/blog', labelKey: 'footer.link.blog' },
      { to: '/templates', labelKey: 'footer.link.templates' },
    ],
  },
  {
    titleKey: 'footer.col.company',
    links: [
      { to: '/about', labelKey: 'footer.link.about' },
      { to: '/contact', labelKey: 'footer.link.contact' },
    ],
  },
  {
    titleKey: 'footer.col.support',
    links: [
      { to: '/help', labelKey: 'footer.link.helpCenter' },
      { to: '/faq', labelKey: 'footer.link.faq' },
    ],
  },
  {
    titleKey: 'footer.col.legal',
    links: [
      { to: '/privacy', labelKey: 'footer.link.privacy' },
      { to: '/terms', labelKey: 'footer.link.terms' },
      { to: '/cookies', labelKey: 'footer.link.cookies' },
    ],
  },
];

export function SiteFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer role="contentinfo" className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {t('footer.tagline')}
            </p>

            {/* Newsletter — Faz 7 opsiyonu */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex max-w-sm gap-2"
              aria-label={t('footer.newsletterAria')}
            >
              <label htmlFor="footer-newsletter" className="sr-only">{t('footer.emailLabel')}</label>
              <input
                id="footer-newsletter"
                type="email"
                required
                placeholder={t('footer.emailLabel')}
                className="input"
              />
              <button type="submit" className="btn-brand whitespace-nowrap">{t('footer.subscribe')}</button>
            </form>

            <div className="mt-5 flex items-center gap-3 text-muted">
              <a href="#" aria-label="Instagram" className="hover:text-brand-violet"><Instagram size={18} /></a>
              <a href="#" aria-label="Twitter/X" className="hover:text-brand-violet"><Twitter size={18} /></a>
              <a href="#" aria-label="YouTube" className="hover:text-brand-violet"><Youtube size={18} /></a>
              <a href="mailto:destek@beylink.org" aria-label={t('footer.social.emailAria')} className="hover:text-brand-violet"><Mail size={18} /></a>
            </div>
          </div>

          <nav aria-label={t('footer.navAria')} className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLS.map((c) => (
              <div key={c.titleKey}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">{t(c.titleKey)}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {c.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="text-muted hover:text-ink">{t(l.labelKey)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">{t('footer.copyright', { year })}</p>
          <p className="text-xs text-muted">
            <Link to="/privacy" className="hover:text-ink">{t('footer.bottom.privacy')}</Link> ·{' '}
            <Link to="/terms" className="hover:text-ink">{t('footer.link.terms')}</Link> ·{' '}
            <Link to="/cookies" className="hover:text-ink">{t('footer.link.cookies')}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
