import { NavLink } from 'react-router-dom';
import { Link2, Palette, BarChart3, Users, Search, Sparkles, Settings, Crown, Tag, Wallet, Lock, Coins, FlaskConical, HelpCircle, Shield, Globe } from 'lucide-react';
import { Logo } from '../ui/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { capsFor, planLabel } from '../../lib/plans.js';
import { usd } from '../../lib/format.js';

// lockedCap: bu yetenek kullanıcının planında yoksa öğe tıklanamaz (kilitli) olur
const NAV = [
  { to: '/dashboard', labelKey: 'sidebar.links', icon: Link2, end: true },
  { to: '/dashboard/design', labelKey: 'sidebar.design', icon: Palette },
  { to: '/dashboard/seo', labelKey: 'sidebar.seo', icon: Search, lockedCap: 'seo' },
  { to: '/dashboard/analytics', labelKey: 'sidebar.analytics', icon: BarChart3 },
  { to: '/dashboard/btags', labelKey: 'sidebar.btags', icon: Tag, lockedCap: 'btag' },
  { to: '/dashboard/sub-accounts', labelKey: 'sidebar.subAccounts', icon: Users, ownerOnly: true, lockedCap: 'subAccounts' },
  { to: '/dashboard/domains', labelKey: 'sidebar.domains', icon: Globe, ownerOnly: true, lockedCap: 'brandedDomain' },
];

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    isActive ? 'bg-brand-violet/10 text-brand-violet' : 'text-ink-soft hover:bg-surface'
  }`;

// Bir yeteneğin kilitli olup olmadığı. Alt Hesaplar: Free hariç tüm planlar erişebilir
// (Basic ek hak satın alabilir, Pro/ProPlus varsayılan hakla gelir) → yalnız Free kilitli.
function isLocked(cap, caps, plan) {
  if (!cap) return false;
  return cap === 'subAccounts' ? plan === 'free' : !caps[cap];
}

export function Sidebar({ onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const caps = capsFor(user);
  const plan = user?.plan || 'free';
  const isOwner = user?.role === 'owner'; // bakiye/plan yalnızca ana hesapta

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-white">
      <div className="px-5 pb-2 pt-5">
        <Logo />
      </div>

      {isOwner && plan !== 'proplus' && (
        <div className="mx-4 mb-3 mt-2">
          <NavLink
            to="/dashboard/plans"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-xl bg-brand-gradient px-3 py-2.5 text-sm font-bold text-white shadow-card"
          >
            <Sparkles size={16} /> {t('sidebar.upgradePlan')}
          </NavLink>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.filter((n) => !n.ownerOnly || user?.role === 'owner').map(({ to, labelKey, icon: Icon, end, lockedCap }) => {
          const locked = isLocked(lockedCap, caps, plan);
          if (locked) {
            return (
              <div
                key={to}
                title={t('sidebar.lockedTooltip')}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted/60"
              >
                <Icon size={18} /> {t(labelKey)}
                <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase text-muted">
                  <Lock size={11} /> {lockedCap === 'subAccounts' ? 'Premium' : lockedCap === 'brandedDomain' ? 'Pro Plus' : 'Basic'}
                </span>
              </div>
            );
          }
          return (
            <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkCls}>
              <Icon size={18} /> {t(labelKey)}
            </NavLink>
          );
        })}

        {/* Cüzdan + yükleme sayfaları (yalnızca owner) */}
        {isOwner && (
          <>
            <NavLink to="/dashboard/billing" onClick={onNavigate} className={linkCls}>
              <Wallet size={18} /> {t('sidebar.wallet')}
              <span className="ml-auto chip bg-surface font-mono text-xs text-ink">{usd(user?.credits_micro)}</span>
            </NavLink>
            <NavLink to="/dashboard/top-up" onClick={onNavigate} className={linkCls}>
              <Coins size={18} /> {t('sidebar.topUp')}
            </NavLink>
            {user?.is_admin === 1 && (
              <NavLink to="/dashboard/demo-payment" onClick={onNavigate} className={linkCls}>
                <FlaskConical size={18} /> {t('sidebar.demoPayment')}
              </NavLink>
            )}
          </>
        )}
      </nav>

      {/* Premium bölümü (yalnızca owner) */}
      {isOwner && (
        <div className="border-t border-line px-3 py-3">
          <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wide text-muted">{t('sidebar.premiumSection')}</p>
          <NavLink to="/dashboard/plans" onClick={onNavigate} className={linkCls}>
            <Crown size={18} className="text-warning" /> {t('sidebar.plans')}
            <span className={`ml-auto chip ${plan === 'free' ? 'bg-surface text-muted' : 'bg-brand-gradient text-white'}`}>
              {planLabel(plan, t)}
            </span>
          </NavLink>
        </div>
      )}

      <div className="border-t border-line px-3 py-3">
        {user?.is_admin === 1 && (
          <NavLink to="/dashboard/admin" onClick={onNavigate} className={linkCls}>
            <Shield size={18} className="text-brand-violet" /> {t('sidebar.admin')}
          </NavLink>
        )}
        <NavLink to="/dashboard/help" onClick={onNavigate} className={linkCls}>
          <HelpCircle size={18} /> {t('sidebar.help')}
        </NavLink>
        <NavLink to="/dashboard/settings" onClick={onNavigate} className={linkCls}>
          <Settings size={18} /> {t('sidebar.settings')}
        </NavLink>
      </div>
    </aside>
  );
}
