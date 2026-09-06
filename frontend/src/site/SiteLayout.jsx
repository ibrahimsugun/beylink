import { Outlet } from 'react-router-dom';
import { SiteHeader } from './SiteHeader.jsx';
import { SiteFooter } from './SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

// Marketing site kabuk — SiteHeader + Outlet + SiteFooter.
// Dashboard/panel bu layout'un DIŞINDA (izole) → Faz 9'da subdomain'e taşınırken dokunulmaz.
// Skip-link: klavye kullanıcıları için navigation'ı atlayıp doğrudan main'e geçme (WCAG 2.4.1).
export function SiteLayout() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        {t('layout.skipToContent')}
      </a>
      <SiteHeader />
      <main id="main" role="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
