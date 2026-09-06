import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Spinner, FullScreenLoader } from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Login() {
  const { t } = useLanguage();
  const { user, loading: authLoading, login, verify2fa } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA ara-adımı: login requires_2fa dönerse challenge tokenıyla kod istenir.
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');

  // Zaten oturum açıksa login sayfası anlamsız → dashboard'a yönlendir.
  // authLoading bitene kadar bekle (AuthContext ilk /auth/me isteğini atarken user henüz null olabilir).
  if (authLoading) return <FullScreenLoader />;
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(identifier.trim(), password);
      if (data.requires_2fa) {
        setChallenge(data.challenge);
        setCode('');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || t('auth.login.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verify2fa(challenge, code.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('auth.login.twoFactor.errorDefault'));
      // Challenge süresi dolmuş/geçersizse (yanlış kod DEĞİL) 1. adıma dön — aksi halde
      // kullanıcı, hiçbir kodun çalışmayacağı kod ekranında kilitli kalır. Hata mesajı korunur.
      if (err.code === 'challenge_invalid') {
        setChallenge(null);
        setCode('');
      }
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    setChallenge(null);
    setCode('');
    setError('');
  };

  // 2. adım — TOTP kodu
  if (challenge) {
    return (
      <AuthShell title={t('auth.login.twoFactor.title')} subtitle={t('auth.login.twoFactor.subtitle')}>
        <form onSubmit={submitCode} className="space-y-4">
          <div className="flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-violet/10 text-brand-violet">
              <ShieldCheck size={24} />
            </span>
          </div>
          <div>
            <label className="label">{t('auth.login.twoFactor.codeLabel')}</label>
            <input
              className="input text-center text-lg font-mono tracking-[0.3em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          {error && <div className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</div>}

          <button type="submit" className="btn-brand w-full" disabled={loading || code.length !== 6}>
            {loading ? <Spinner size={16} /> : t('auth.login.twoFactor.submit')}
          </button>
          <button type="button" onClick={backToLogin} className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
            <ArrowLeft size={15} /> {t('auth.login.twoFactor.back')}
          </button>
        </form>
      </AuthShell>
    );
  }

  // 1. adım — kimlik + şifre
  return (
    <AuthShell title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t('auth.login.identifierLabel')}</label>
          <input
            className="input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t('auth.login.identifierPlaceholder')}
            autoFocus
          />
        </div>
        <div>
          <label className="label">{t('auth.login.passwordLabel')}</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <div className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</div>}

        <button type="submit" className="btn-brand w-full" disabled={loading}>
          {loading ? <Spinner size={16} /> : t('auth.login.submit')}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link to="/forgot-password" className="font-semibold text-muted hover:text-ink">{t('auth.login.forgotLink')}</Link>
      </p>

      <p className="mt-3 text-sm text-muted">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-brand-violet hover:underline">
          {t('auth.login.registerLink')}
        </Link>
      </p>
      <p className="mt-2 text-xs text-muted/70">
        {t('auth.login.demoLabel')} <span className="font-mono">demo@beylink.com</span> / <span className="font-mono">Passw0rd!</span>
      </p>
    </AuthShell>
  );
}
