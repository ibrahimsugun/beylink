import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Bitcoin, CreditCard, Wallet, AlertTriangle, Copy, Check, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../api/client.js';
import { Spinner } from '../components/ui/Spinner.jsx';
import { usd } from '../lib/format.js';

const QUICK = [5, 10, 25, 50];

export default function DemoOdemePage() {
  const { user, refresh } = useAuth();
  const { t } = useLanguage();
  const [wallets, setWallets] = useState([]);
  const [demoOn, setDemoOn] = useState(true);
  const [balance, setBalance] = useState(0);
  const [coinIdx, setCoinIdx] = useState(0);
  const [amount, setAmount] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, dw] = await Promise.all([api.get('/billing/wallet'), api.get('/billing/demo-wallets')]);
      setBalance(w.balance_micro);
      setDemoOn(dw.demo);
      setWallets(dw.wallets || []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const amt = Number(amount) || 0;
  const coin = wallets[coinIdx];

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* pano yok */ }
  };

  const confirmDemo = async () => {
    if (amt <= 0) { setError(t('demopay.errors.invalidAmount')); return; }
    setBusy(true); setError('');
    try {
      await api.post('/billing/topup/demo', { amount_usd: amt });
      await refresh();
      setSuccess(true);
    } catch (e) {
      setError(e.message || t('demopay.errors.failed'));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => { setSuccess(false); await load(); };

  // DEMOÖDEME yalnızca admin — admin olmayan doğrudan URL'ye gelse de yönlendirilir (backend de 403 verir).
  if (user && !user.is_admin) return <Navigate to="/dashboard" replace />;

  if (loading) return <div className="flex justify-center py-20 text-brand-violet"><Spinner size={28} /></div>;

  if (success) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
          <Wallet size={40} />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-ink">{t('demopay.success.title')}</h2>
        <p className="mt-2 text-muted">{t('demopay.success.desc', { amount: usd(Math.round(amt * 1_000_000)) })}</p>
        <div className="mt-4 rounded-xl border border-line bg-white px-5 py-3 text-center">
          <p className="text-xs text-muted">{t('demopay.success.newBalanceLabel')}</p>
          <p className="font-mono text-xl font-bold text-ink">{usd(user?.credits_micro)}</p>
        </div>
        <button onClick={reset} className="btn-ghost mt-5"><RefreshCw size={15} /> {t('demopay.success.newPaymentBtn')}</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <Link to="/dashboard/billing" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft size={14} /> {t('demopay.backLink')}</Link>
        <h1 className="text-2xl font-extrabold text-ink">{t('demopay.title')}</h1>
        <p className="mt-0.5 text-sm text-muted">{t('demopay.subtitle')}</p>
      </div>

      {/* Yöntem sekmeleri */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-card">
          <Bitcoin size={16} /> {t('demopay.tabs.crypto')}
        </button>
        <button disabled className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted/60">
          <CreditCard size={16} /> {t('demopay.tabs.card')} <span className="chip bg-surface text-[10px] text-muted">{t('demopay.comingSoon')}</span>
        </button>
      </div>

      {!demoOn ? (
        <div className="card flex items-start gap-2 p-5 text-sm text-warning">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{t('demopay.disabledNotice')}</span>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          {/* SOL — form */}
          <div className="space-y-4 lg:col-span-3">
            <div className="card p-5">
              <h2 className="text-sm font-bold text-ink">{t('demopay.form.title')}</h2>
              <p className="mt-1 text-xs text-muted">{t('demopay.form.desc')}</p>

              {/* Tutar */}
              <div className="mt-4">
                <label className="label">{t('demopay.amountLabel')}</label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {QUICK.map((q) => (
                    <button key={q} onClick={() => setAmount(q)}
                      className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${Number(amount) === q ? 'border-brand-violet bg-brand-violet/10 text-brand-violet' : 'border-line bg-white text-ink-soft hover:bg-surface'}`}>
                      ${q}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Wallet size={16} /></span>
                  <input type="number" min="1" max="10000" step="1" className="input pl-9" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50" />
                </div>
              </div>

              {/* Coin seçici */}
              <div className="mt-3 flex flex-wrap gap-2">
                {wallets.map((w, i) => (
                  <button key={w.coin} onClick={() => setCoinIdx(i)}
                    className={`flex flex-col items-start rounded-lg border px-3 py-1.5 text-left transition ${i === coinIdx ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-line text-ink-soft hover:bg-surface'}`}>
                    <span className="text-sm font-semibold">{w.coin}</span>
                    <span className="text-[11px] font-medium opacity-70">{t('demopay.networkSuffix', { network: w.network })}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <p>{t('demopay.networkWarning', { network: coin?.network })}</p>
              </div>

              {/* QR + adres */}
              {coin && (
                <div className="mt-4 flex flex-col gap-4 rounded-xl bg-surface p-4 sm:flex-row sm:items-center">
                  <img src={coin.qrDataUrl} alt={t('demopay.qr.alt', { coin: coin.coin })} className="h-40 w-40 shrink-0 rounded-lg border border-line bg-white p-1" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t('demopay.qr.label', { coin: coin.coin, network: coin.network })}</div>
                    <div className="mt-1 break-all font-mono text-xs text-ink">{coin.address}</div>
                    <button onClick={() => copy(coin.address)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface">
                      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />} {t('demopay.copyAddress')}
                    </button>
                  </div>
                </div>
              )}

              {error && <div className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}

              <button onClick={confirmDemo} disabled={busy}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-warning px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-warning/90 disabled:opacity-60">
                {busy ? <Spinner size={16} /> : <><ShieldCheck size={16} /> {t('demopay.confirmBtn')}</>}
              </button>
              <p className="mt-2 text-center text-xs text-muted">{t('demopay.demoModeNote')}</p>
            </div>
          </div>

          {/* SAĞ — sipariş özeti */}
          <div className="lg:col-span-2">
            <div className="card p-5">
              <h3 className="mb-4 text-sm font-bold text-ink">{t('demopay.summary.title')}</h3>
              <div className="mb-2 flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                <span className="flex items-center gap-1.5 text-muted"><Wallet size={14} /> {t('demopay.summary.currentBalance')}</span>
                <span className="font-mono font-bold text-ink">{usd(balance)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                <span className="text-muted">{t('demopay.summary.creditLoad')}</span>
                <span className="font-mono font-bold text-ink">{usd(Math.round(amt * 1_000_000))}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="font-semibold text-ink">{t('demopay.summary.total')}</span>
                <span className="font-mono text-xl font-extrabold text-brand-violet">{usd(Math.round(amt * 1_000_000))}</span>
              </div>
              <p className="mt-4 rounded-lg bg-surface p-3 text-xs text-muted">{t('demopay.summary.note')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
