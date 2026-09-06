import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, Crown, Coins, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../api/client.js';
import { Spinner } from '../components/ui/Spinner.jsx';
import { PLANS } from '../lib/plans.js';
import { usd, shortDate } from '../lib/format.js';

function reasonLabel(reason, t) {
  const REASON_LABELS = {
    'plan:basic': t('billing.reason.planBasic'), 'plan:pro': t('billing.reason.planPro'), subpack: t('billing.reason.subpack'),
  };
  if (REASON_LABELS[reason]) return REASON_LABELS[reason];
  if (reason?.startsWith('topup')) return t('billing.reason.topup');
  return reason;
}

export default function BillingPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState({ txns: [], payments: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, l] = await Promise.all([api.get('/billing/wallet'), api.get('/billing/ledger')]);
      setWallet(w);
      setLedger(l);
    } catch { /* */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-20 text-brand-violet"><Spinner size={28} /></div>;

  const plan = PLANS[user?.plan || 'free'];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Wallet size={22} className="text-brand-violet" />
        <h1 className="text-2xl font-extrabold text-ink">{t('billing.title')}</h1>
      </div>

      {/* Bakiye + plan durumu */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card bg-ink p-5 text-white">
          <div className="text-sm text-white/60">{t('billing.balanceLabel')}</div>
          <div className="mt-1 font-mono text-4xl font-extrabold">{usd(wallet?.balance_micro)}</div>
          <div className="mt-1 text-xs text-white/50">USDT · TRC-20</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm text-muted"><Crown size={15} className="text-warning" /> {t('billing.planLabel')}</div>
          <div className="mt-1 text-2xl font-extrabold text-ink">{plan.label}</div>
          {user?.plan !== 'free' && user?.plan_expires_at && (
            <div className="mt-1 text-xs text-muted">{t('billing.expiresInfo', { date: shortDate(user.plan_expires_at) })}</div>
          )}
          {wallet?.sub_limit > 0 && <div className="mt-1 text-xs text-muted">{t('billing.subLimitInfo', { limit: wallet.sub_limit })}</div>}
        </div>
      </div>

      {/* Yükleme yolları */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/dashboard/top-up" className="card flex items-center gap-3 p-4 transition hover:border-brand-violet/40 hover:shadow-card">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-violet/10 text-brand-violet"><Coins size={20} /></span>
          <div>
            <div className="text-sm font-bold text-ink">{t('billing.topupLink.title')}</div>
            <div className="text-xs text-muted">{t('billing.topupLink.desc')}</div>
          </div>
        </Link>
        {user?.is_admin === 1 && (
          <Link to="/dashboard/demo-payment" className="card flex items-center gap-3 p-4 transition hover:border-warning/40 hover:shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning"><FlaskConical size={20} /></span>
            <div>
              <div className="text-sm font-bold text-ink">{t('billing.demoLink.title')}</div>
              <div className="text-xs text-muted">{t('billing.demoLink.desc')}</div>
            </div>
          </Link>
        )}
      </div>

      {/* Hareket geçmişi */}
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-bold text-ink">{t('billing.historyTitle')}</h2>
        {ledger.txns.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{t('billing.historyEmpty')}</p>
        ) : (
          <div className="space-y-1.5">
            {ledger.txns.map((tx) => {
              const credit = tx.amount_micro >= 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${credit ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {credit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{reasonLabel(tx.reason, t)}</div>
                    <div className="text-[11px] text-muted">{shortDate(tx.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm font-bold ${credit ? 'text-success' : 'text-danger'}`}>{credit ? '+' : '−'}{usd(Math.abs(tx.amount_micro))}</div>
                    <div className="font-mono text-[11px] text-muted">{usd(tx.balance_after_micro)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
