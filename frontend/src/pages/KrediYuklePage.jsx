import { useCallback, useEffect, useState } from 'react';
import { Bitcoin, CreditCard, Wallet, AlertTriangle, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../api/client.js';
import { Spinner } from '../components/ui/Spinner.jsx';
import { PaymentInvoice } from '../components/billing/PaymentInvoice.jsx';
import { usd, usdtAmount } from '../lib/format.js';
import { emailUnverified, promptEmailVerify } from '../lib/emailGate.js';

const QUICK = [5, 10, 25, 50];

export default function KrediYuklePage() {
  const { user, refresh } = useAuth();
  const { t } = useLanguage();
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(10);
  const [invoice, setInvoice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const w = await api.get('/billing/wallet');
      setWallet(w.wallet);
      setBalance(w.balance_micro);
      if (w.active_invoice && w.active_invoice.status === 'pending') setInvoice(w.active_invoice);
    } catch { /* */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const configured = wallet?.configured;
  const amt = Number(amount) || 0;

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? '' : c)), 1500);
    } catch { /* pano yok */ }
  };

  const createInvoice = async () => {
    if (emailUnverified(user)) { promptEmailVerify(); return; }
    if (amt <= 0) { setError(t('topup.errors.invalidAmount')); return; }
    setBusy(true); setError('');
    try {
      const { invoice: inv } = await api.post('/billing/topup', { amount_usd: amt });
      setInvoice(inv);
    } catch (e) {
      setError(e.message || t('topup.errors.invoiceFailed'));
    } finally {
      setBusy(false);
    }
  };

  const onPaid = async () => { await refresh(); await load(); };
  const onCancel = () => { setInvoice(null); load(); };

  if (loading) return <div className="flex justify-center py-20 text-brand-violet"><Spinner size={28} /></div>;

  // Sağ kolonda gösterilecek "gönderilecek tutar" — fatura varsa tuzlu tam tutar
  const sendMicro = invoice ? invoice.expected_amount_micro : Math.round(amt * 1_000_000);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{t('topup.title')}</h1>
        <p className="mt-0.5 text-sm text-muted">{t('topup.subtitle')}</p>
      </div>

      {/* Yöntem sekmeleri */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-card">
          <Bitcoin size={16} /> {t('topup.tabs.crypto')}
        </button>
        <button disabled className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted/60">
          <CreditCard size={16} /> {t('topup.tabs.card')} <span className="chip bg-surface text-[10px] text-muted">{t('topup.comingSoon')}</span>
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* SOL — form / fatura */}
        <div className="space-y-4 lg:col-span-3">
          <div className="card p-5">
            <h2 className="text-sm font-bold text-ink">{t('topup.form.title')}</h2>
            <p className="mt-1 text-xs text-muted">
              {t('topup.form.desc')}
            </p>

            {!configured ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{t('topup.notConfigured')}</span>
              </div>
            ) : invoice ? (
              <div className="mt-4">
                <PaymentInvoice invoice={invoice} wallet={wallet} onPaid={onPaid} onCancel={onCancel} />
              </div>
            ) : (
              <>
                <div className="mt-3 inline-flex flex-col items-start rounded-lg border border-brand-violet/40 bg-brand-violet/5 px-3 py-1.5">
                  <span className="text-sm font-bold text-brand-violet">USDT</span>
                  <span className="text-[11px] font-medium text-brand-violet/70">{t('topup.networkLabel')}</span>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>
                    {t('topup.trc20Warning')}
                  </p>
                </div>

                {/* Statik cüzdan QR + adres */}
                <div className="mt-4 flex flex-col gap-4 rounded-xl bg-surface p-4 sm:flex-row sm:items-center">
                  {wallet?.qrDataUrl && (
                    <img src={wallet.qrDataUrl} alt={t('topup.qr.alt')} className="h-40 w-40 shrink-0 rounded-lg border border-line bg-white p-1" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t('topup.qr.label')}</div>
                    <div className="mt-1 break-all font-mono text-xs text-ink">{wallet?.address}</div>
                    <div className="mt-2 flex items-center gap-3">
                      <button onClick={() => copy(wallet?.address, 'addr')} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface">
                        {copied === 'addr' ? <Check size={13} className="text-success" /> : <Copy size={13} />} {t('topup.copyAddress')}
                      </button>
                      <a href={`https://tronscan.org/#/address/${wallet?.address}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-violet hover:underline">
                        Tronscan <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tutar */}
                <div className="mt-4">
                  <label className="label">{t('topup.amountLabel')}</label>
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
                    <input type="number" min="1" max="10000" step="1" className="input pl-9" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10" />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{t('topup.amountHint')}</p>
                </div>

                {error && <div className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}

                <button onClick={createInvoice} disabled={busy} className="btn-brand mt-4 w-full">
                  {busy ? <Spinner size={16} /> : <><Wallet size={16} /> {t('topup.createInvoiceBtn')}</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* SAĞ — sipariş özeti */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-bold text-ink">{t('topup.summary.title')}</h3>
            <div className="mb-2 flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
              <span className="flex items-center gap-1.5 text-muted"><Wallet size={14} /> {t('topup.summary.currentBalance')}</span>
              <span className="font-mono font-bold text-ink">{usd(balance)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
              <span className="text-muted">{t('topup.summary.creditToLoad')}</span>
              <span className="font-mono font-bold text-ink">{usd(Math.round(amt * 1_000_000))}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="font-semibold text-ink">{t('topup.summary.amountLabel')}</span>
              <span className="font-mono text-xl font-extrabold text-brand-violet">{usdtAmount(sendMicro)} <span className="text-sm font-bold text-muted">USDT</span></span>
            </div>
            <p className="mt-4 rounded-lg bg-surface p-3 text-xs text-muted">
              {invoice ? (
                t('topup.summary.noteWithInvoice', { sendAmount: usdtAmount(sendMicro), creditAmount: usd(invoice.expected_amount_micro) })
              ) : (
                <span className="flex items-start gap-1.5"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-brand-teal" /> {t('topup.summary.noteNoInvoice')}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
