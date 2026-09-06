import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [demoLink, setDemoLink] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.post('/auth/forgot-password', { identifier: identifier.trim() }, { auth: false });
      setDone(true);
      if (r?.demo && r?.token) setDemoLink(`${window.location.origin}/reset-password?token=${r.token}`);
    } catch (err) {
      setError(err.message || t('auth.forgotPassword.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthShell title={t('auth.forgotPassword.doneTitle')} subtitle={t('auth.forgotPassword.doneSubtitle')}>
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-ink-soft">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
            {t('auth.forgotPassword.doneMessage')}
          </div>
          {demoLink && (
            <div className="rounded-xl border border-line bg-surface p-3 text-xs">
              <p className="mb-1 font-semibold text-ink">{t('auth.forgotPassword.demoModeTitle')}</p>
              <p className="mb-2 text-muted">{t('auth.forgotPassword.demoModeNote')}</p>
              <a href={demoLink} className="font-semibold text-brand-violet underline break-all">{demoLink}</a>
            </div>
          )}
          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
            <ArrowLeft size={15} /> {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t('auth.forgotPassword.emailLabel')}</label>
          <input
            className="input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            autoFocus
          />
        </div>
        {error && <div className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</div>}
        <button type="submit" className="btn-brand w-full" disabled={loading || !identifier.trim()}>
          {loading ? <Spinner size={16} /> : t('auth.forgotPassword.submit')}
        </button>
      </form>
      <p className="mt-6 text-sm">
        <Link to="/login" className="flex items-center gap-1.5 font-semibold text-muted hover:text-ink">
          <ArrowLeft size={15} /> {t('auth.forgotPassword.backToLogin')}
        </Link>
      </p>
    </AuthShell>
  );
}
