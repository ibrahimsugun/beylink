import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ResetPassword() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (pw.length < 6) return setError(t('auth.resetPassword.pwTooShort'));
    if (pw !== pw2) return setError(t('auth.resetPassword.pwMismatch'));
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: pw }, { auth: false });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || t('auth.resetPassword.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title={t('auth.resetPassword.invalidTitle')} subtitle={t('auth.resetPassword.invalidSubtitle')}>
        <Link to="/forgot-password" className="btn-brand w-full">{t('auth.resetPassword.requestNewLink')}</Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title={t('auth.resetPassword.doneTitle')} subtitle={t('auth.resetPassword.doneSubtitle')}>
        <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-ink-soft">
          <CheckCircle2 size={18} className="text-success" /> {t('auth.resetPassword.redirecting')}
        </div>
        <Link to="/login" className="btn-brand mt-4 w-full">{t('auth.resetPassword.goToLogin')}</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('auth.resetPassword.title')} subtitle={t('auth.resetPassword.subtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t('auth.resetPassword.newPasswordLabel')}</label>
          <input type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" autoFocus />
        </div>
        <div>
          <label className="label">{t('auth.resetPassword.confirmPasswordLabel')}</label>
          <input type="password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <div className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</div>}
        <button type="submit" className="btn-brand w-full" disabled={loading}>
          {loading ? <Spinner size={16} /> : t('auth.resetPassword.submit')}
        </button>
      </form>
    </AuthShell>
  );
}
