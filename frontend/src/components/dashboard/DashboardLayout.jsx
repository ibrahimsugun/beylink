import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Lock, ShieldOff } from 'lucide-react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { LivePreview } from './LivePreview.jsx';
import { EmailVerifyBanner } from './EmailVerifyBanner.jsx';
import { EmailVerifyGateModal } from './EmailVerifyGateModal.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { FullScreenLoader } from '../ui/Spinner.jsx';

// Canlı önizlemenin gösterilmeyeceği sayfalar (analizler gibi geniş içerik)
const NO_PREVIEW = ['/dashboard/analytics', '/dashboard/sub-accounts', '/dashboard/plans', '/dashboard/settings', '/dashboard/admin'];

export function DashboardLayout() {
  const [mobileNav, setMobileNav] = useState(false);
  const { loading, profile, canEdit } = useProfile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const showPreview = !NO_PREVIEW.includes(location.pathname);
  const suspended = user?.is_suspended === 1; // ana hesabın premium'u bitti → salt-okunur

  if (loading && !profile) return <FullScreenLoader />;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar (masaüstü) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar (mobil çekmece) */}
      {mobileNav && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileNav(true)} />
        <div className="flex min-h-0 flex-1">
          <main className="thin-scroll min-w-0 flex-1 overflow-y-auto p-5 lg:p-8">
            <EmailVerifyGateModal />
            <EmailVerifyBanner />
            {suspended ? (
              <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink-soft">
                <ShieldOff size={18} className="shrink-0 text-warning" />
                <span className="flex-1">
                  <b className="text-ink">{t('dashboard.suspended.title')}</b> {t('dashboard.suspended.body')}
                </span>
                <button
                  disabled
                  title={t('dashboard.suspended.reactivateTooltip')}
                  className="cursor-not-allowed rounded-lg bg-warning/20 px-3 py-1.5 text-xs font-semibold text-ink/60"
                >
                  {t('dashboard.suspended.reactivateBtn')}
                </button>
              </div>
            ) : !canEdit && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-ink-soft">
                <Lock size={16} className="text-warning" />
                {t('dashboard.readOnly.text')}
              </div>
            )}
            <fieldset disabled={!canEdit || suspended} className="m-0 min-w-0 border-0 p-0">
              <Outlet />
            </fieldset>
          </main>
          {showPreview && (
            <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-line bg-surface p-6 xl:block">
              <LivePreview />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
