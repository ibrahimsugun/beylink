import { useState } from 'react';
import { MailWarning, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../api/client.js';

// Doğrulanmamış e-postalı hesaplarda gösterilen ince banner. İki yol:
//  1) E-postadaki bağlantıya tıkla (link → /verify-email sayfası).
//  2) E-postadaki 6 haneli kodu buraya gir (POST /auth/verify-email-code, oturumlu).
// Demo modda "Kod gönder" dönüşünde link + kod burada gösterilir (gerçek e-posta gitmez).
export function EmailVerifyBanner() {
  const { user, refresh } = useAuth();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const [demoLink, setDemoLink] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  if (!user?.email || user.email_verified === 1 || dismissed) return null;

  const resend = async () => {
    setBusy(true);
    setError('');
    try {
      const r = await api.post('/auth/resend-verification');
      setSent(true);
      if (r?.demo && r?.token) setDemoLink(`${window.location.origin}/verify-email?token=${r.token}`);
      if (r?.demo && r?.code) setDemoCode(r.code);
    } catch {
      /* sessiz geç */
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    if (verifying) return;
    setVerifying(true);
    setError('');
    try {
      await api.post('/auth/verify-email-code', { code });
      await refresh(); // email_verified=1 → banner kaybolur
    } catch (err) {
      setError(err.message || t('emailVerify.errorFallback'));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink-soft">
      <div className="flex items-start gap-2">
        <MailWarning size={16} className="mt-0.5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-ink">{t('emailVerify.bannerTitle')}</span>{' '}
          <span className="text-muted">
            {t('emailVerify.bodyIntro')}{' '}
            <b>{t('emailVerify.bodyBold')}</b> {t('emailVerify.bodyOutro')}
          </span>

          {/* Kod girişi */}
          <form onSubmit={submitCode} className="mt-2 flex flex-wrap items-center gap-2">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
              placeholder={t('emailVerify.codePlaceholder')}
              className="w-32 rounded-lg border border-line bg-white px-3 py-1.5 font-mono text-base font-semibold tracking-[0.3em] text-ink outline-none focus:border-brand-violet"
            />
            <button
              type="submit"
              disabled={code.length !== 6 || verifying}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-violet px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {verifying ? '...' : <><CheckCircle2 size={14} /> {t('emailVerify.verifyBtn')}</>}
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={busy}
              className="rounded-lg bg-warning/20 px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:bg-warning/30 disabled:opacity-50"
            >
              {busy ? '...' : sent ? t('emailVerify.resend') : t('emailVerify.send')}
            </button>
          </form>

          {error && <div className="mt-1.5 text-xs font-medium text-danger">{error}</div>}
          {sent && !demoCode && <div className="mt-1.5 text-xs font-medium text-success">{t('emailVerify.sentMsg')}</div>}

          {/* Demo modu — gerçek e-posta gitmez; kod + bağlantı burada */}
          {(demoCode || demoLink) && (
            <div className="mt-2 space-y-1 rounded-lg bg-white/70 p-2 text-xs">
              <div className="text-muted">{t('emailVerify.demoNote')}</div>
              {demoCode && (
                <div>{t('emailVerify.demoCodeLabel')} <span className="font-mono text-sm font-bold tracking-widest text-ink">{demoCode}</span></div>
              )}
              {demoLink && (
                <a href={demoLink} className="block break-all font-semibold text-brand-violet underline">{demoLink}</a>
              )}
            </div>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 text-muted transition hover:text-ink" title={t('common.close')}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
