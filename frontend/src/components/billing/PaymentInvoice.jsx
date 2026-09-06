import { useEffect, useRef, useState } from 'react';
import { Copy, Check, AlertTriangle, Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client.js';
import { usdtAmount } from '../../lib/format.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function useCountdown(expiresAt) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!expiresAt) return undefined;
    const end = new Date(String(expiresAt).replace(' ', 'T') + 'Z').getTime();
    const tick = () => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return left;
}

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function PaymentInvoice({ invoice: initial, wallet, onPaid, onCancel, onExpire }) {
  const { t } = useLanguage();
  const [invoice, setInvoice] = useState(initial);
  const [copied, setCopied] = useState('');
  const [busy, setBusy] = useState(false);
  const paidFired = useRef(false);
  const expiredFired = useRef(false);
  const left = useCountdown(invoice?.expires_at);

  const refresh = async () => {
    try {
      const { invoice: fresh } = await api.get(`/billing/invoice/${invoice.order_ref}`);
      setInvoice(fresh);
      if (fresh.status === 'paid' && !paidFired.current) {
        paidFired.current = true;
        onPaid && onPaid(fresh);
      }
      if (fresh.status === 'expired' && !expiredFired.current) {
        expiredFired.current = true;
        onExpire && onExpire(fresh);
      }
      return fresh;
    } catch {
      return null;
    }
  };

  // pending iken 8sn'de bir yokla
  useEffect(() => {
    if (invoice?.status !== 'pending') return undefined;
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.status, invoice?.order_ref]);

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? '' : c)), 1500);
    } catch { /* pano yok */ }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      await api.post(`/billing/invoice/${invoice.order_ref}/cancel`);
      onCancel && onCancel();
    } finally {
      setBusy(false);
    }
  };

  if (!invoice) return null;

  if (invoice.status === 'paid') {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-5 text-center">
        <CheckCircle2 className="mx-auto text-success" size={40} />
        <p className="mt-2 text-lg font-bold text-ink">{t('invoice.paid.title')}</p>
        <p className="mt-1 font-mono text-sm text-ink-soft">{t('invoice.paid.amount', { amount: usdtAmount(invoice.received_amount_micro || invoice.expected_amount_micro) })}</p>
        {invoice.txid && <p className="mt-1 break-all text-[11px] text-muted">{t('invoice.paid.txid', { txid: invoice.txid })}</p>}
        <div className="mt-3 text-xs text-muted">{t('invoice.paid.orderRef', { orderRef: invoice.order_ref })}</div>
      </div>
    );
  }

  if (invoice.status === 'expired') {
    return (
      <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5 text-center">
        <XCircle className="mx-auto text-warning" size={36} />
        <p className="mt-2 font-bold text-ink">{t('invoice.expired.title')}</p>
        <p className="mt-1 text-sm text-muted">{t('invoice.expired.desc')}</p>
        {onCancel && <button onClick={onCancel} className="btn-ghost mt-3">{t('common.close')}</button>}
      </div>
    );
  }

  // pending
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
        <AlertTriangle size={16} className="shrink-0" />
        <span>{t('invoice.trc20Warning')}</span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="chip bg-ink text-white">USDT · TRC-20</span>
      </div>

      {wallet?.qrDataUrl && (
        <div className="flex justify-center">
          <img src={wallet.qrDataUrl} alt={t('invoice.qrAlt')} className="h-40 w-40 rounded-xl border border-line" />
        </div>
      )}

      {/* Gönderilecek TAM tutar (tuzlu — bu sayede ödeme otomatik eşleşir) */}
      <div className="rounded-2xl border border-line bg-surface p-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t('invoice.sendExactLabel')}</div>
        <button onClick={() => copy(usdtAmount(invoice.expected_amount_micro), 'amt')} className="mt-1 inline-flex items-center gap-2">
          <span className="font-mono text-2xl font-extrabold text-ink">{usdtAmount(invoice.expected_amount_micro)}</span>
          <span className="text-sm text-muted">USDT</span>
          {copied === 'amt' ? <Check size={16} className="text-success" /> : <Copy size={16} className="text-muted" />}
        </button>
        <div className="mt-1 text-[11px] text-muted">{t('invoice.sendExactHint')}</div>
      </div>

      {/* Adres */}
      <div>
        <label className="label">{t('invoice.addressLabel')}</label>
        <button
          onClick={() => copy(invoice.address, 'addr')}
          className="flex w-full items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-left"
        >
          <span className="min-w-0 flex-1 break-all font-mono text-xs text-ink">{invoice.address}</span>
          {copied === 'addr' ? <Check size={16} className="shrink-0 text-success" /> : <Copy size={16} className="shrink-0 text-muted" />}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm">
        <span className="flex items-center gap-2 text-muted"><Loader2 size={14} className="animate-spin" /> {t('invoice.waiting')}</span>
        <span className="font-mono font-bold text-ink">{mmss(left)}</span>
      </div>

      <div className="flex justify-between gap-2">
        <button onClick={cancel} disabled={busy} className="btn-ghost text-danger">{t('invoice.cancelBtn')}</button>
        <button onClick={refresh} className="btn-ghost">{t('invoice.checkNowBtn')}</button>
      </div>
      <div className="flex items-start gap-1.5 rounded-xl bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted">
        <ShieldCheck size={13} className="mt-0.5 shrink-0 text-brand-teal" />
        <span>{t('invoice.bgNote')}</span>
      </div>
      <div className="text-center text-[11px] text-muted">{t('invoice.orderRefPending', { orderRef: invoice.order_ref })}</div>
    </div>
  );
}
