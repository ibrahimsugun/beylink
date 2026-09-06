import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Spinner, FullScreenLoader } from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Register() {
  const { t } = useLanguage();
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Zaten oturum açıksa register sayfası anlamsız → dashboard'a yönlendir.
  if (authLoading) return <FullScreenLoader />;
  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ email: form.email.trim(), username: form.username.trim() || undefined, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('auth.register.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t('auth.register.emailLabel')}</label>
          <input type="email" className="input" value={form.email} onChange={set('email')} placeholder={t('auth.register.emailPlaceholder')} autoFocus />
        </div>
        <div>
          <label className="label">{t('auth.register.usernameLabel')} <span className="font-normal text-muted">{t('auth.register.usernameHint')}</span></label>
          <div className="flex items-center rounded-xl border border-line bg-surface focus-within:border-brand-violet focus-within:ring-2 focus-within:ring-brand-violet/20">
            <span className="pl-4 text-sm text-muted">beylink.org/</span>
            <input
              className="w-full bg-transparent px-1 py-2.5 text-sm focus:outline-none"
              value={form.username}
              onChange={set('username')}
              placeholder={t('auth.register.usernamePlaceholder')}
            />
          </div>
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
            <Lock size={13} className="mt-0.5 shrink-0 text-warning" />
            <span>{t('auth.register.usernameLockPre')}<strong className="text-ink-soft">{t('auth.register.usernameLockBold')}</strong>{t('auth.register.usernameLockPost')}</span>
          </p>
        </div>
        <div>
          <label className="label">{t('auth.register.passwordLabel')}</label>
          <input type="password" className="input" value={form.password} onChange={set('password')} placeholder={t('auth.register.passwordPlaceholder')} />
        </div>

        {error && <div className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</div>}

        <button type="submit" className="btn-brand w-full" disabled={loading}>
          {loading ? <Spinner size={16} /> : t('auth.register.submit')}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-brand-violet hover:underline">
          {t('auth.register.loginLink')}
        </Link>
      </p>
    </AuthShell>
  );
}
