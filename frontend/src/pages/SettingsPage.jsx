// Profil & Ayarlar — profil bilgileri (plan + kalan gün + kredi), kilitli kullanıcı adı,
// yayın durumu, şifre güncelleme ve 2FA (yakında). Kullanıcı adı kayıttan sonra değiştirilemez.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, Check, Crown, Coins, KeyRound, ShieldCheck, ArrowUpRight, ArrowDownLeft, User, ShieldOff,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { emailUnverified, promptEmailVerify } from '../lib/emailGate.js';
import { api, tokenStore } from '../api/client.js';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Toggle } from '../components/ui/Toggle.jsx';
import { planLabel } from '../lib/plans.js';
import { usd, daysLeft, shortDate } from '../lib/format.js';

function reasonLabel(reason, t) {
  if (reason === 'plan:basic') return t('settings.reason.basicPlan');
  if (reason === 'plan:pro') return t('settings.reason.proPlan');
  if (reason === 'subpack') return t('settings.reason.subpack');
  if (reason?.startsWith('topup')) return t('settings.reason.topup');
  return reason;
}

function PasswordCard() {
  const { t } = useLanguage();
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok' | 'err', text }

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (nw.length < 6) return setMsg({ type: 'err', text: t('settings.password.tooShort') });
    if (nw !== confirm) return setMsg({ type: 'err', text: t('settings.password.mismatch') });
    setBusy(true);
    try {
      const d = await api.post('/auth/change-password', { current_password: cur, new_password: nw });
      if (d?.token) tokenStore.set(d.token); // sunucu token_version'ı artırdı → taze token'ı sakla (kendi oturumumuz düşmesin)
      setMsg({ type: 'ok', text: t('settings.password.success') });
      setCur(''); setNw(''); setConfirm('');
    } catch (err) {
      setMsg({ type: 'err', text: err.message || t('settings.password.genericError') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
        <KeyRound size={15} className="text-brand-violet" /> {t('settings.password.title')}
      </h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">{t('settings.password.current')}</label>
          <input type="password" className="input" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
        </div>
        <div>
          <label className="label">{t('settings.password.new')}</label>
          <input type="password" className="input" value={nw} onChange={(e) => setNw(e.target.value)} placeholder={t('settings.password.newPlaceholder')} autoComplete="new-password" />
        </div>
        <div>
          <label className="label">{t('settings.password.confirm')}</label>
          <input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        {msg && (
          <div className={`rounded-xl px-3 py-2 text-sm font-medium ${msg.type === 'ok' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {msg.text}
          </div>
        )}
        <button type="submit" className="btn-brand w-full" disabled={busy || !cur || !nw}>
          {busy ? <Spinner size={16} /> : t('settings.password.submit')}
        </button>
      </form>
    </div>
  );
}

function TwoFactorCard() {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const enabled = !!user?.totp_enabled;
  const [mode, setMode] = useState('idle'); // 'idle' | 'setup' | 'disable'
  const [setupData, setSetupData] = useState(null); // { secret, otpauth_uri, qr }
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok' | 'err', text }

  const reset = () => { setMode('idle'); setSetupData(null); setCode(''); setPwd(''); setMsg(null); };
  const onCode = (v) => setCode(v.replace(/\D/g, '').slice(0, 6));

  const startSetup = async () => {
    setMsg(null); setBusy(true);
    try {
      const d = await api.post('/auth/2fa/setup');
      setSetupData(d); setCode(''); setMode('setup');
    } catch (err) {
      setMsg({ type: 'err', text: err.message || t('settings.twofa.setupError') });
    } finally { setBusy(false); }
  };

  // enable/disable yanıtı yetkili totp_enabled değerini döndürür → onu doğrudan uygula
  // (ekstra /me round-trip'ine ve onun sessiz yutulan hatalarına bağlı kalma; desync olmaz).
  const applyEnabled = (v) => setUser((u) => (u ? { ...u, totp_enabled: v } : u));

  const confirmEnable = async (e) => {
    e.preventDefault(); setMsg(null); setBusy(true);
    try {
      const d = await api.post('/auth/2fa/enable', { code });
      applyEnabled(d.totp_enabled);
      reset();
    } catch (err) {
      setMsg({ type: 'err', text: err.message || t('settings.twofa.codeError') });
    } finally { setBusy(false); }
  };

  const confirmDisable = async (e) => {
    e.preventDefault(); setMsg(null); setBusy(true);
    try {
      const d = await api.post('/auth/2fa/disable', { password: pwd || undefined, code: code || undefined });
      applyEnabled(d.totp_enabled);
      reset();
    } catch (err) {
      setMsg({ type: 'err', text: err.message || t('settings.twofa.disableError') });
    } finally { setBusy(false); }
  };

  const errorBox = msg && (
    <div className={`rounded-xl px-3 py-2 text-sm font-medium ${msg.type === 'ok' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
      {msg.text}
    </div>
  );

  return (
    <div className="card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
          <ShieldCheck size={15} className="text-brand-violet" /> {t('settings.twofa.title')}
        </h2>
        {enabled ? (
          <span className="chip flex items-center gap-1 bg-success/10 text-[11px] font-bold uppercase text-success">
            <Check size={12} /> {t('settings.twofa.enabledBadge')}
          </span>
        ) : (
          <span className="chip bg-surface text-[11px] font-bold uppercase text-muted">{t('settings.twofa.disabledBadge')}</span>
        )}
      </div>

      {/* IDLE — durum + ana aksiyon */}
      {mode === 'idle' && (
        <>
          <p className="text-sm text-muted">
            {enabled ? t('settings.twofa.enabledDesc') : t('settings.twofa.disabledDesc')}
          </p>
          {errorBox && <div className="mt-3">{errorBox}</div>}
          {enabled ? (
            <button onClick={() => { setMsg(null); setMode('disable'); }} className="btn-ghost mt-4 flex w-full items-center justify-center gap-1.5 border border-danger/30 text-danger hover:bg-danger/10">
              <ShieldOff size={16} /> {t('settings.twofa.disableBtn')}
            </button>
          ) : (
            <button onClick={startSetup} disabled={busy} className="btn-brand mt-4 w-full">
              {busy ? <Spinner size={16} /> : t('settings.twofa.enableBtn')}
            </button>
          )}
        </>
      )}

      {/* SETUP — QR + kod */}
      {mode === 'setup' && setupData && (
        <form onSubmit={confirmEnable} className="space-y-3">
          <p className="text-sm text-muted">
            {t('settings.twofa.setupInstructions')}
          </p>
          <div className="flex justify-center">
            <img src={setupData.qr} alt={t('settings.twofa.qrAlt')} className="h-44 w-44 rounded-xl border border-line" />
          </div>
          <div>
            <label className="label">{t('settings.twofa.codeLabel')}</label>
            <input
              className="input text-center font-mono text-lg tracking-[0.3em]"
              value={code}
              onChange={(e) => onCode(e.target.value)}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
          {errorBox}
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="btn-ghost flex-1">{t('common.cancel')}</button>
            <button type="submit" className="btn-brand flex-1" disabled={busy || code.length !== 6}>
              {busy ? <Spinner size={16} /> : t('settings.twofa.confirmEnable')}
            </button>
          </div>
        </form>
      )}

      {/* DISABLE — şifre veya kod ile */}
      {mode === 'disable' && (
        <form onSubmit={confirmDisable} className="space-y-3">
          <p className="text-sm text-muted">
            {t('settings.twofa.disableInstructions')}
          </p>
          <div>
            <label className="label">{t('settings.twofa.accountPassword')}</label>
            <input type="password" className="input" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">{t('settings.twofa.orCode')}</label>
            <input
              className="input text-center font-mono text-lg tracking-[0.3em]"
              value={code}
              onChange={(e) => onCode(e.target.value)}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>
          {errorBox}
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="btn-ghost flex-1">{t('common.cancel')}</button>
            <button type="submit" className="btn-ghost flex-1 border border-danger/30 text-danger hover:bg-danger/10" disabled={busy || (!pwd && code.length !== 6)}>
              {busy ? <Spinner size={16} /> : t('settings.twofa.disableBtn')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { profile, saveProfile } = useProfile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isOwner = user?.role === 'owner';
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    if (!isOwner) return;
    api.get('/billing/ledger').then((d) => setLedger(d.txns || [])).catch(() => {});
  }, [isOwner]);

  if (!profile) return null;

  const dl = daysLeft(user?.plan_expires_at);
  const displayName = profile.display_name || (user?.email ? user.email.split('@')[0] : user?.username) || t('settings.fallbackUserName');
  const initial = displayName.trim().charAt(0).toUpperCase() || 'B';

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-2">
        <User size={22} className="text-brand-violet" />
        <h1 className="text-2xl font-extrabold text-ink">{t('settings.title')}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* SOL — profil bilgileri + kullanıcı adı + yayın durumu */}
        <div className="space-y-5">
          {/* Profil bilgileri */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{t('settings.profileInfoTitle')}</h2>
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-xl font-extrabold text-white">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-bold text-ink">{displayName}</div>
                <div className="truncate text-sm text-muted">{user?.email || `@${user?.username}`}</div>
              </div>
            </div>

            {isOwner && (
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted"><Crown size={14} className="text-warning" /> {t('settings.currentPlanLabel')}</span>
                  <span className="font-semibold text-ink">
                    {planLabel(user?.plan)}
                    {user?.plan !== 'free' && dl != null && <span className="ml-1 font-normal text-muted">· {t.plural('plan.daysLeft', dl)}</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted"><Coins size={14} className="text-brand-violet" /> {t('settings.creditsLabel')}</span>
                  <span className="font-mono font-semibold text-ink">{usd(user?.credits_micro)}</span>
                </div>
                <Link to="/dashboard/top-up" className="btn-brand mt-2 flex w-full items-center justify-center gap-1.5">
                  <Coins size={16} /> {t('sidebar.topUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Kullanıcı adı — kilitli (kayıttan sonra değiştirilemez) */}
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
              <Lock size={14} /> {t('settings.usernameTitle')}
            </h2>
            <div className="flex items-center rounded-xl border border-line bg-surface px-3 py-2.5">
              <span className="text-sm text-muted">{window.location.host}/</span>
              <span className="ml-0.5 text-sm font-semibold text-ink">{profile.username}</span>
              <Lock size={14} className="ml-auto text-muted" />
            </div>
            <p className="mt-2 text-xs text-muted">
              {t('settings.usernameNote')}
            </p>
          </div>

          {/* Yayın durumu (KORUNUR) */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{t('settings.publishTitle')}</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-ink">{t('settings.publishLabel')}</div>
                <div className="text-sm text-muted">{t('settings.publishDesc')}</div>
                {emailUnverified(user) && <div className="mt-1 text-xs font-medium text-warning">{t('settings.publishVerifyNeeded')}</div>}
              </div>
              <Toggle checked={!!profile.is_published} onChange={(v) => { if (v && emailUnverified(user)) return promptEmailVerify(); saveProfile({ is_published: v }); }} />
            </div>
          </div>
        </div>

        {/* SAĞ — şifre + 2FA */}
        <div className="space-y-5">
          <PasswordCard />
          <TwoFactorCard />
        </div>
      </div>

      {/* İşlem geçmişi (owner) */}
      {isOwner && (
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">{t('settings.historyTitle')}</h2>
          {ledger.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">{t('settings.historyEmpty')}</p>
          ) : (
            <div className="space-y-1.5">
              {ledger.map((tx) => {
                const credit = tx.amount_micro >= 0;
                return (
                  <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${credit ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      {credit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">{reasonLabel(tx.reason, t)}</div>
                      <div className="text-[11px] text-muted">{shortDate(tx.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm font-bold ${credit ? 'text-success' : 'text-danger'}`}>{credit ? '+' : '−'}{usd(Math.abs(tx.amount_micro))}</div>
                      <div className="font-mono text-[11px] text-muted">{usd(tx.balance_after_micro)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
