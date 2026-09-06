import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { api, tokenStore } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function VerifyEmail() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { refresh } = useAuth();
  const [state, setState] = useState('loading'); // loading | ok | error
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode çift-çalıştırma koruması (token tek kullanımlık)
    ran.current = true;
    if (!token) { setState('error'); return; }
    api.post('/auth/verify-email', { token }, { auth: false })
      .then(() => { setState('ok'); if (tokenStore.get()) refresh(); })
      .catch(() => setState('error'));
  }, [token, refresh]);

  return (
    <AuthShell title={t('auth.verifyEmail.title')} subtitle="">
      {state === 'loading' && <div className="flex justify-center py-6 text-brand-violet"><Spinner size={28} /></div>}
      {state === 'ok' && (
        <div className="space-y-4 text-center">
          <div className="flex justify-center"><CheckCircle2 size={40} className="text-success" /></div>
          <p className="font-semibold text-ink">{t('auth.verifyEmail.successMessage')}</p>
          <Link to="/dashboard" className="btn-brand w-full">{t('auth.verifyEmail.goToDashboard')}</Link>
        </div>
      )}
      {state === 'error' && (
        <div className="space-y-4 text-center">
          <div className="flex justify-center"><XCircle size={40} className="text-danger" /></div>
          <p className="font-semibold text-ink">{t('auth.verifyEmail.errorMessage')}</p>
          <p className="text-sm text-muted">{t('auth.verifyEmail.errorHelp')}</p>
          <Link to="/dashboard" className="btn-ghost w-full">{t('auth.verifyEmail.goToDashboard')}</Link>
        </div>
      )}
    </AuthShell>
  );
}
