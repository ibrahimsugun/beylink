import { useState } from 'react';
import { Wallet, Bitcoin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { PaymentInvoice } from './PaymentInvoice.jsx';
import { api } from '../../api/client.js';
import { usd } from '../../lib/format.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * Satın alma akışı — kullanıcıya "bakiyeden mi, USDT ile mi" diye sorar.
 * endpoint: '/billing/plan' | '/billing/subpack' · payload: { plan } | {}
 * warning: doluysa ödeme öncesi "Emin misin?" onay adımı gösterilir (plan değişiklikleri için).
 */
export function PurchaseModal({ open, onClose, title, description, priceMicro, balanceMicro, wallet, endpoint, payload = {}, onSuccess, warning = null, successText = null }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState(warning ? 'confirm' : 'choose'); // confirm | choose | invoice | done
  const [invoice, setInvoice] = useState(null);
  const [invoiceDone, setInvoiceDone] = useState(false); // ödendi ya da süresi doldu → koruma kalkar
  const [doneInfo, setDoneInfo] = useState(null); // başarı yanıtı (order_ref vb.)
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const enough = (balanceMicro || 0) >= priceMicro;

  const close = () => {
    setMode(warning ? 'confirm' : 'choose'); setInvoice(null); setInvoiceDone(false); setDoneInfo(null); setError(''); setBusy('');
    onClose();
  };

  // Yalnızca AKTİF (bekleyen) fatura sahnesinde koru: backdrop atıl, Esc/X onay ister.
  // Ödeme gelince ya da süre dolunca koruma kalkar → normal kapanır.
  const guardClose = mode === 'invoice' && !!invoice && !invoiceDone;
  const requestClose = () => {
    if (guardClose && !window.confirm(t('purchase.closeConfirm'))) return;
    close();
  };

  const payBalance = async () => {
    setBusy('balance'); setError('');
    try {
      const data = await api.post(endpoint, { ...payload, method: 'balance' });
      setDoneInfo(data);
      await onSuccess?.();
      setMode('done');
    } catch (e) {
      setError(e.message || t('purchase.errors.failed'));
    } finally {
      setBusy('');
    }
  };

  const payUsdt = async () => {
    setBusy('usdt'); setError('');
    try {
      const data = await api.post(endpoint, { ...payload, method: 'usdt' });
      if (data.settled) {
        setDoneInfo(data);
        await onSuccess?.();
        setMode('done');
      } else if (data.invoice) {
        setInvoice(data.invoice);
        setMode('invoice');
      }
    } catch (e) {
      setError(e.message || t('purchase.errors.failed'));
    } finally {
      setBusy('');
    }
  };

  return (
    <Modal open={open} onClose={requestClose} onEsc={requestClose} closeOnBackdrop={!guardClose} title={title} maxWidth="max-w-md">
      {mode === 'confirm' ? (
        <div>
          <div className="mb-4 flex gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-sm text-ink-soft">{warning}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={close} className="btn-ghost flex-1">{t('common.cancel')}</button>
            <button onClick={() => setMode('choose')} className="btn-brand flex-1">{t('purchase.confirmBtn')}</button>
          </div>
        </div>
      ) : mode === 'done' ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto text-success" size={44} />
          <p className="mt-2 text-lg font-bold text-ink">{t('purchase.doneTitle')}</p>
          <p className="mt-1 text-sm text-muted">{successText || t('purchase.doneDefaultText', { title })}</p>
          {doneInfo?.order_ref && (
            <p className="mt-2 font-mono text-xs text-muted">{t('purchase.orderRefLabel')} <span className="text-ink-soft">{doneInfo.order_ref}</span></p>
          )}
          <button onClick={close} className="btn-brand mt-4">{t('purchase.okBtn')}</button>
        </div>
      ) : mode === 'invoice' && invoice ? (
        <PaymentInvoice
          invoice={invoice}
          wallet={wallet}
          onPaid={async () => { setInvoiceDone(true); await onSuccess?.(); }}
          onExpire={() => setInvoiceDone(true)}
          onCancel={close}
        />
      ) : (
        <>
          {description && <p className="mb-3 text-sm text-muted">{description}</p>}
          <div className="mb-4 flex items-baseline justify-between rounded-xl bg-surface px-4 py-3">
            <span className="text-sm text-muted">{t('purchase.amountLabel')}</span>
            <span className="font-mono text-2xl font-extrabold text-ink">{usd(priceMicro)}</span>
          </div>

          {error && <div className="mb-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}

          <div className="space-y-2">
            <button
              onClick={payBalance}
              disabled={!enough || busy}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left transition hover:border-brand-violet disabled:opacity-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-violet/10 text-brand-violet"><Wallet size={18} /></span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-ink">{t('purchase.payBalance.title')}</span>
                <span className="block text-xs text-muted">{t(enough ? 'purchase.payBalance.balance' : 'purchase.payBalance.insufficient', { balance: usd(balanceMicro) })}</span>
              </span>
              {busy === 'balance' && <span className="text-xs text-muted">…</span>}
            </button>

            <button
              onClick={payUsdt}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left transition hover:border-brand-teal disabled:opacity-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal"><Bitcoin size={18} /></span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-ink">{t('purchase.payUsdt.title')}</span>
                <span className="block text-xs text-muted">{t('purchase.payUsdt.desc')}</span>
              </span>
              {busy === 'usdt' && <span className="text-xs text-muted">…</span>}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
