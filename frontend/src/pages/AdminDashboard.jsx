// Admin dashboard — yalnızca is_admin kullanıcılar erişebilir.
// Metrik kartları + kullanıcı yönetimi (arama, plan düzenle) + aktivite logları + canlı saat.
import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users, Link2, MousePointerClick, Crown, Search, ScrollText, Shield, Clock, Loader2, Wallet, AlertTriangle, FlaskConical,
  LogIn, LogOut, ShieldAlert, UserPlus, Key, KeyRound, Mail, ShieldCheck, ShieldOff, MailCheck, MailX, ArrowUp, ArrowDown, Package, TimerReset, PlusCircle, MinusCircle,
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { AdminTestsPanel } from '../components/dashboard/AdminTestsPanel.jsx';
import { planLabel, PLAN_ORDER } from '../lib/plans.js';
import { usd, daysLeft } from '../lib/format.js';

const badgeCls = (plan) => (plan === 'free' ? 'bg-surface text-muted' : 'bg-brand-gradient text-white');

function LiveClock() {
  const { locale } = useLanguage();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 font-mono text-sm font-semibold text-ink">
      <Clock size={15} className="text-brand-violet" />
      {now.toLocaleTimeString(locale)}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted">
        <Icon size={15} className="text-brand-violet" /> {label}
      </div>
      <p className="text-2xl font-extrabold text-ink">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

function SubTabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        active ? 'border-brand-violet bg-brand-violet text-white' : 'border-line bg-white text-ink-soft hover:border-brand-violet'
      }`}
    >
      {children}
    </button>
  );
}

// Aktivite (kimlik/güvenlik) log haritası — action → { icon, labelKey, tone }
const ACTIVITY_META = {
  'auth.login':                  { icon: LogIn,       labelKey: 'admin.activity.meta.login',                 tone: 'text-success' },
  'auth.logout':                 { icon: LogOut,      labelKey: 'admin.activity.meta.logout',                tone: 'text-muted' },
  'auth.login_failed':           { icon: ShieldAlert, labelKey: 'admin.activity.meta.loginFailed',           tone: 'text-danger' },
  'auth.register':               { icon: UserPlus,    labelKey: 'admin.activity.meta.register',              tone: 'text-brand-violet' },
  'auth.password_change':        { icon: Key,         labelKey: 'admin.activity.meta.passwordChange',        tone: 'text-warning' },
  'auth.password_reset_request': { icon: Mail,        labelKey: 'admin.activity.meta.passwordResetRequest',  tone: 'text-muted' },
  'auth.password_reset':         { icon: Key,         labelKey: 'admin.activity.meta.passwordReset',         tone: 'text-warning' },
  'auth.email_verify':           { icon: Mail,        labelKey: 'admin.activity.meta.emailVerify',           tone: 'text-success' },
  'auth.2fa_enable':             { icon: ShieldCheck, labelKey: 'admin.activity.meta.twofaEnable',           tone: 'text-success' },
  'auth.2fa_disable':            { icon: ShieldAlert, labelKey: 'admin.activity.meta.twofaDisable',          tone: 'text-warning' },
  'auth.2fa_challenge':          { icon: ShieldCheck, labelKey: 'admin.activity.meta.twofaChallenge',        tone: 'text-brand-violet' },
};

// Login-failed reason haritası — detail.reason değerini kullanıcıya okunur hale getirir.
const FAIL_REASON = {
  password_wrong: 'admin.activity.failReason.passwordWrong',
  unknown_email:  'admin.activity.failReason.unknownEmail',
  '2fa_wrong':    'admin.activity.failReason.twofaWrong',
  inactive:       'admin.activity.failReason.inactive',
};

// Kredi (para/plan) log haritası — action → { icon, labelKey, sign, tone }
const CREDIT_META = {
  'credit.topup':         { icon: PlusCircle,  labelKey: 'admin.credit.meta.topup',            sign: +1, tone: 'text-success' },
  'credit.demo_load':     { icon: PlusCircle,  labelKey: 'admin.credit.meta.demoLoad',          sign: +1, tone: 'text-brand-violet' },
  'plan.purchase':        { icon: Package,     labelKey: 'admin.credit.meta.planPurchase',      sign: -1, tone: 'text-danger' },
  'subpack.purchase':     { icon: Package,     labelKey: 'admin.credit.meta.subpackPurchase',   sign: -1, tone: 'text-danger' },
  'plan.expired':         { icon: TimerReset,  labelKey: 'admin.credit.meta.planExpired',       sign:  0, tone: 'text-warning' },
  'plan.resumed':         { icon: ArrowDown,   labelKey: 'admin.credit.meta.planResumed',       sign:  0, tone: 'text-brand-teal' },
  'plan.user_downgrade':  { icon: ArrowDown,   labelKey: 'admin.credit.meta.userDowngrade',     sign: 0, tone: 'text-muted' },
  'admin.plan_change':    { icon: Shield,      labelKey: 'admin.credit.meta.adminPlanChange',   sign: 0, tone: 'text-brand-violet' },
  'admin.credit_adjust':  { icon: MinusCircle, labelKey: 'admin.credit.meta.adminCreditAdjust', sign: 0, tone: 'text-brand-violet' },
};

function amountFromDetail(action, detail) {
  if (!detail) return null;
  // Öncelik: delta_micro (admin adjust), amount_micro (topup/demo), price_micro (purchase — henüz set edilmiyorsa null)
  if (action === 'admin.credit_adjust' && Number.isFinite(detail.delta_micro)) return detail.delta_micro;
  if (Number.isFinite(detail.amount_micro)) return detail.amount_micro;
  if (Number.isFinite(detail.price_micro)) return -Math.abs(detail.price_micro); // satın alma borç
  return null;
}

function ActivityLogsTable({ logs, t }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('admin.activity.table.time')}</th>
              <th className="px-4 py-3 font-semibold">{t('admin.activity.table.user')}</th>
              <th className="px-4 py-3 font-semibold">{t('admin.activity.table.event')}</th>
              <th className="px-4 py-3 font-semibold">{t('admin.activity.table.detail')}</th>
              <th className="px-4 py-3 font-semibold">{t('admin.activity.table.ip')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((l) => {
              const meta = ACTIVITY_META[l.action] || { icon: ScrollText, labelKey: null, tone: 'text-muted' };
              const Icon = meta.icon;
              const label = meta.labelKey ? t(meta.labelKey) : l.action;
              const reasonKey = l.action === 'auth.login_failed' && l.detail?.reason ? FAIL_REASON[l.detail.reason] : null;
              const reasonText = reasonKey ? t(reasonKey) : (l.action === 'auth.login_failed' ? l.detail?.reason : null);
              return (
                <tr key={l.id} className="hover:bg-surface/60">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">{l.created_at}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-soft">{l.user_email || (l.user_id ? `#${l.user_id}` : t('admin.activity.anonymous'))}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${meta.tone}`}>
                      <Icon size={14} /> {label}
                    </span>
                    {reasonText && <div className="text-[11px] text-danger">↳ {reasonText}</div>}
                  </td>
                  <td className="max-w-[280px] truncate px-4 py-2.5 font-mono text-[11px] text-muted" title={l.detail ? JSON.stringify(l.detail) : ''}>
                    {l.detail ? JSON.stringify(l.detail) : '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{l.ip || '—'}</td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">{t('admin.activity.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreditLogsTable({ logs, t }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('admin.activity.table.time')}</th>
              <th className="px-4 py-3 font-semibold">{t('admin.activity.table.user')}</th>
              <th className="px-4 py-3 font-semibold">{t('admin.credit.table.action')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('admin.credit.table.amount')}</th>
              <th className="px-4 py-3 font-semibold">{t('admin.credit.table.note')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((l) => {
              const meta = CREDIT_META[l.action] || { icon: ScrollText, labelKey: null, sign: 0, tone: 'text-muted' };
              const Icon = meta.icon;
              const label = meta.labelKey ? t(meta.labelKey) : l.action;
              const amt = amountFromDetail(l.action, l.detail);
              const target = l.detail?.targetEmail || (l.detail?.targetUserId ? `#${l.detail.targetUserId}` : null);
              const planChange = l.action === 'admin.plan_change' && l.detail?.from && l.detail?.to
                ? `${planLabel(l.detail.from, t)} → ${planLabel(l.detail.to, t)}`
                : null;
              return (
                <tr key={l.id} className="hover:bg-surface/60">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">{l.created_at}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-soft">
                    {l.user_email || (l.user_id ? `#${l.user_id}` : t('admin.credit.system'))}
                    {target && <div className="text-[11px] text-muted">{t('admin.credit.targetPrefix', { target })}</div>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${meta.tone}`}>
                      <Icon size={14} /> {label}
                    </span>
                    {planChange && <div className="text-[11px] text-ink-soft">{planChange}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {amt != null ? (
                      <span className={`font-mono text-sm font-semibold ${amt > 0 ? 'text-success' : amt < 0 ? 'text-danger' : 'text-muted'}`}>
                        {amt > 0 ? '+' : ''}{usd(amt)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-xs text-muted" title={l.detail?.note || ''}>
                    {l.detail?.note || (l.detail?.order_ref ? t('admin.credit.orderPrefix', { ref: l.detail.order_ref }) : '—')}
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">{t('admin.credit.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-brand-violet text-white shadow-card' : 'bg-white text-ink-soft hover:bg-surface'
      }`}
    >
      <Icon size={15} /> {children}
    </button>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [tab, setTab] = useState('users');
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [creditEdit, setCreditEdit] = useState(null); // {user, value, note, confirm, busy, error}
  const [planConfirm, setPlanConfirm] = useState(null); // { user, newPlan, oldPlan }
  const [reset2fa, setReset2fa] = useState(null); // { user, value, busy, error }
  const [logCategory, setLogCategory] = useState('activity'); // 'activity' | 'credit'

  const loadUsers = useCallback(async (query = '') => {
    const r = await api.get(`/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    setUsers(r.users);
  }, []);

  const refreshStats = useCallback(async () => {
    try { setStats(await api.get('/admin/stats')); } catch { /* sessiz */ }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s] = await Promise.all([api.get('/admin/stats'), loadUsers('')]);
      setStats(s);
    } catch { /* 403/ağ → guard yönlendirir */ } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Yalnızca admin için tetikle (admin olmayana gereksiz 403 atma)
  useEffect(() => { if (user?.is_admin) loadAll(); }, [loadAll, user?.is_admin]);

  const loadLogs = useCallback(async (category = logCategory) => {
    try {
      const r = await api.get(`/admin/logs?category=${encodeURIComponent(category)}&limit=200`);
      setLogs(r.logs);
      setLogsLoaded(true);
    } catch { /* sessiz */ }
  }, [logCategory]);
  useEffect(() => { if (tab === 'logs') loadLogs(logCategory); }, [tab, logCategory, loadLogs]);

  // Plan onay modalı — select değişince direkt gitmez, modal açar. Onaylanınca gerçek PUT.
  // Cancel: select "controlled" olduğu için otomatik eski değere döner (planConfirm null → value=u.plan).
  const requestPlanChange = (u, newPlan) => {
    if (newPlan === u.plan) return;
    setPlanConfirm({ user: u, newPlan, oldPlan: u.plan });
  };
  const commitPlanChange = async () => {
    if (!planConfirm) return;
    const { user: u, newPlan } = planConfirm;
    setSavingId(u.id);
    setPlanConfirm(null);
    try {
      await api.put(`/admin/users/${u.id}/plan`, { plan: newPlan });
      await loadUsers(q);
      refreshStats();
    } catch (err) {
      alert(err.message || t('admin.planConfirm.error'));
    } finally {
      setSavingId(null);
    }
  };

  // Kredi düzenleme akışı — mutlak yeni bakiye + onay + submit
  const openCreditEdit = (u) => {
    const current = (u.credits_micro || 0) / 1_000_000;
    setCreditEdit({ user: u, value: current.toFixed(2), note: '', confirm: false, busy: false, error: '' });
  };
  const submitCreditEdit = async () => {
    if (!creditEdit) return;
    const n = Number(creditEdit.value);
    if (!Number.isFinite(n) || n < 0) {
      setCreditEdit((s) => ({ ...s, error: t('admin.creditEdit.invalid') }));
      return;
    }
    setCreditEdit((s) => ({ ...s, busy: true, error: '' }));
    try {
      await api.put(`/admin/users/${creditEdit.user.id}/credits`, { new_balance_usdt: n, note: creditEdit.note });
      await loadUsers(q);
      refreshStats();
      setCreditEdit(null);
    } catch (err) {
      setCreditEdit((s) => ({ ...s, busy: false, error: err.message || t('admin.creditEdit.error') }));
    }
  };

  // 2FA sıfırlama akışı (özel durum) — yazarak-teyitli onay. Teyit değeri: email || username.
  const open2faReset = (u) => setReset2fa({ user: u, value: '', busy: false, error: '' });
  const submit2faReset = async () => {
    if (!reset2fa) return;
    const identifier = reset2fa.user.email || reset2fa.user.username || '';
    if (reset2fa.value.trim() !== identifier) return; // buton zaten disabled; ekstra guard
    setReset2fa((s) => ({ ...s, busy: true, error: '' }));
    try {
      await api.post(`/admin/users/${reset2fa.user.id}/reset-2fa`);
      await loadUsers(q);
      setReset2fa(null);
    } catch (err) {
      setReset2fa((s) => ({ ...s, busy: false, error: err.message || t('admin.twofaReset.error') }));
    }
  };

  // Admin değilse erişimi engelle (backend zaten 403 döner; UI de yönlendirir)
  if (user && !user.is_admin) return <Navigate to="/dashboard" replace />;

  if (loading) return <div className="flex justify-center py-24 text-brand-violet"><Spinner size={28} /></div>;

  return (
    <div className="space-y-6">
      {/* Başlık + canlı saat */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield size={22} className="text-brand-violet" />
          <div>
            <h1 className="text-2xl font-extrabold text-ink">Admin Dashboard</h1>
            <p className="text-sm text-muted">{t('admin.subtitle')}</p>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* Metrik kartları */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label={t('admin.stats.users')} value={stats?.totalUsers ?? 0} sub={t('admin.stats.usersPaid', { count: stats?.paidUsers ?? 0 })} />
        <StatCard
          icon={Crown}
          label={t('admin.stats.planDistribution')}
          value={t('admin.stats.planBreakdown', { pro: stats?.byPlan?.pro ?? 0, proplus: stats?.byPlan?.proplus ?? 0 })}
          sub={t('admin.stats.planBreakdownSub', { basic: stats?.byPlan?.basic ?? 0, free: stats?.byPlan?.free ?? 0 })}
        />
        <StatCard icon={Link2} label={t('admin.stats.totalLinks')} value={stats?.totalLinks ?? 0} sub={t('admin.stats.active')} />
        <StatCard icon={MousePointerClick} label={t('admin.stats.totalClicks')} value={stats?.totalClicks ?? 0} />
      </div>

      {/* Sekmeler */}
      <div className="flex flex-wrap gap-2">
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')} icon={Users}>{t('admin.tabs.users')}</TabBtn>
        <TabBtn active={tab === 'logs'} onClick={() => setTab('logs')} icon={ScrollText}>{t('admin.tabs.logs')}</TabBtn>
        <TabBtn active={tab === 'tests'} onClick={() => setTab('tests')} icon={FlaskConical}>{t('admin.tabs.tests')}</TabBtn>
      </div>

      {tab === 'tests' ? (
        <AdminTestsPanel />
      ) : tab === 'users' ? (
        <div className="card overflow-hidden p-0">
          {/* Arama */}
          <div className="flex items-center gap-2 border-b border-line p-3">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers(q)}
                placeholder={t('admin.users.searchPlaceholder')}
                className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-brand-violet"
              />
            </div>
            <button onClick={() => loadUsers(q)} className="btn-brand shrink-0">{t('admin.users.searchBtn')}</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('admin.users.table.user')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.users.table.plan')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.users.table.activeLinks')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.users.table.totalClicks')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.users.table.credit')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.users.table.twofa')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.users.table.email')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.users.table.editPlan')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => {
                  const dl = daysLeft(u.plan_expires_at);
                  return (
                    <tr key={u.id} className="hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-semibold text-ink">
                          {u.display_name || u.username || `#${u.id}`}
                          {!!u.is_admin && <Shield size={13} className="text-brand-violet" title="Admin" />}
                        </div>
                        <div className="text-xs text-muted">{u.email || `@${u.username}`}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip ${badgeCls(u.plan)}`}>{planLabel(u.plan, t)}</span>
                        {u.plan !== 'free' && dl != null && (
                          <div className="mt-0.5 text-[11px] text-muted">{t.plural('plan.daysLeft', dl)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{u.active_links}</td>
                      <td className="px-4 py-3 text-ink-soft">{u.total_clicks}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-ink-soft">{usd(u.credits_micro)}</span>
                          <button
                            onClick={() => openCreditEdit(u)}
                            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-brand-violet hover:border-brand-violet"
                            title={t('admin.users.editCreditTitle')}
                          >
                            {t('admin.users.editCreditBtn')}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.totp_enabled ? (
                          <div className="flex items-center gap-2">
                            <span className="chip bg-success/10 text-success"><ShieldCheck size={13} />{t('admin.users.twofaOn')}</span>
                            <button
                              onClick={() => open2faReset(u)}
                              className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-danger hover:border-danger"
                              title={t('admin.twofaReset.btn')}
                            >
                              <KeyRound size={13} />
                              {t('admin.twofaReset.btn')}
                            </button>
                          </div>
                        ) : (
                          <span className="chip bg-surface text-muted"><ShieldOff size={13} />{t('admin.users.twofaOff')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.email_verified ? (
                          <span className="chip bg-success/10 text-success"><MailCheck size={13} />{t('admin.users.emailVerified')}</span>
                        ) : (
                          <span className="chip bg-warning/10 text-warning"><MailX size={13} />{t('admin.users.emailUnverified')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.plan}
                            disabled={savingId === u.id}
                            onChange={(e) => requestPlanChange(u, e.target.value)}
                            className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-brand-violet disabled:opacity-50"
                          >
                            {PLAN_ORDER.map((p) => <option key={p} value={p}>{planLabel(p, t)}</option>)}
                          </select>
                          {savingId === u.id && <Loader2 size={15} className="animate-spin text-muted" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-muted">{t('admin.users.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Log alt sekmeleri */}
          <div className="flex flex-wrap gap-2">
            <SubTabBtn active={logCategory === 'activity'} onClick={() => setLogCategory('activity')}>{t('admin.logs.activity')}</SubTabBtn>
            <SubTabBtn active={logCategory === 'credit'} onClick={() => setLogCategory('credit')}>{t('admin.logs.credit')}</SubTabBtn>
          </div>
          {logCategory === 'credit' ? <CreditLogsTable logs={logs} t={t} /> : <ActivityLogsTable logs={logs} t={t} />}
        </div>
      )}

      {planConfirm && (
        <Modal
          open
          onClose={() => setPlanConfirm(null)}
          title={t('admin.planConfirm.title')}
          maxWidth="max-w-md"
        >
          <div className="mb-4 flex gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <div className="text-sm text-ink-soft">
              <p>
                {t('admin.planConfirm.body', {
                  user: (planConfirm.user.display_name || planConfirm.user.username || `#${planConfirm.user.id}`) + (planConfirm.user.email ? ` (${planConfirm.user.email})` : ''),
                  oldPlan: planLabel(planConfirm.oldPlan, t),
                  newPlan: planLabel(planConfirm.newPlan, t),
                })}
              </p>
              <p className="mt-1 text-[12px]">
                {planConfirm.newPlan === 'free'
                  ? t('admin.planConfirm.warnToFree')
                  : t('admin.planConfirm.warnExtend')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPlanConfirm(null)} className="btn-ghost flex-1">{t('admin.planConfirm.no')}</button>
            <button onClick={commitPlanChange} className="btn-brand flex-1">{t('admin.planConfirm.yes')}</button>
          </div>
        </Modal>
      )}

      {creditEdit && (
        <Modal open onClose={() => !creditEdit.busy && setCreditEdit(null)} title={t('admin.creditEdit.title')} maxWidth="max-w-md">
          {!creditEdit.confirm ? (
            <div>
              <div className="mb-3 rounded-xl bg-surface px-3 py-2 text-sm">
                <div className="text-muted">{t('admin.creditEdit.userLabel')}</div>
                <div className="font-semibold text-ink">{creditEdit.user.display_name || creditEdit.user.username || `#${creditEdit.user.id}`}</div>
                <div className="text-xs text-muted">{creditEdit.user.email || `@${creditEdit.user.username}`}</div>
                <div className="mt-1 text-xs text-muted">{t('admin.creditEdit.currentBalance', { value: usd(creditEdit.user.credits_micro) })}</div>
              </div>
              <label className="mb-1 block text-xs font-semibold text-muted">{t('admin.creditEdit.newBalanceLabel')}</label>
              <div className="relative">
                <Wallet size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-violet" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  autoFocus
                  value={creditEdit.value}
                  onChange={(e) => setCreditEdit((s) => ({ ...s, value: e.target.value, error: '' }))}
                  className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 font-mono text-sm text-ink outline-none focus:border-brand-violet"
                  placeholder="0.00"
                />
              </div>
              <label className="mb-1 mt-3 block text-xs font-semibold text-muted">{t('admin.creditEdit.noteLabel')}</label>
              <input
                type="text"
                maxLength={200}
                value={creditEdit.note}
                onChange={(e) => setCreditEdit((s) => ({ ...s, note: e.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-violet"
                placeholder={t('admin.creditEdit.notePlaceholder')}
              />
              {creditEdit.error && <div className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{creditEdit.error}</div>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setCreditEdit(null)} className="btn-ghost flex-1">{t('common.cancel')}</button>
                <button
                  onClick={() => setCreditEdit((s) => ({ ...s, confirm: true, error: '' }))}
                  disabled={!Number.isFinite(Number(creditEdit.value)) || Number(creditEdit.value) < 0}
                  className="btn-brand flex-1 disabled:opacity-50"
                >
                  {t('admin.creditEdit.continue')}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
                <div className="text-sm text-ink-soft">
                  <p className="mb-1 font-semibold text-ink">{t('admin.creditEdit.confirmTitle')}</p>
                  <p>
                    {t('admin.creditEdit.confirmBody', {
                      user: creditEdit.user.email || creditEdit.user.username || `#${creditEdit.user.id}`,
                      old: usd(creditEdit.user.credits_micro),
                      new: usd(Math.round(Number(creditEdit.value) * 1_000_000)),
                    })}
                  </p>
                </div>
              </div>
              {creditEdit.error && <div className="mb-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{creditEdit.error}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setCreditEdit((s) => ({ ...s, confirm: false }))}
                  disabled={creditEdit.busy}
                  className="btn-ghost flex-1"
                >
                  {t('common.back')}
                </button>
                <button
                  onClick={submitCreditEdit}
                  disabled={creditEdit.busy}
                  className="btn-brand flex-1 disabled:opacity-50"
                >
                  {creditEdit.busy ? <Loader2 size={16} className="animate-spin" /> : t('admin.creditEdit.confirmBtn')}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {reset2fa && (() => {
        const identifier = reset2fa.user.email || reset2fa.user.username || '';
        const matched = reset2fa.value.trim() === identifier;
        return (
          <Modal open onClose={() => !reset2fa.busy && setReset2fa(null)} title={t('admin.twofaReset.title')} maxWidth="max-w-md">
            <div className="mb-4 flex gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
              <div className="text-sm text-ink-soft">
                <p>{t('admin.twofaReset.body', { user: reset2fa.user.display_name || identifier || `#${reset2fa.user.id}` })}</p>
                <p className="mt-1 text-xs text-muted">{t('admin.twofaReset.onlyIfLost')}</p>
              </div>
            </div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t('admin.twofaReset.confirmLabel')}</label>
            <input
              type="text"
              autoFocus
              autoComplete="off"
              value={reset2fa.value}
              onChange={(e) => setReset2fa((s) => ({ ...s, value: e.target.value, error: '' }))}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-danger"
              placeholder={identifier}
            />
            {reset2fa.error && <div className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{reset2fa.error}</div>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setReset2fa(null)} disabled={reset2fa.busy} className="btn-ghost flex-1">{t('common.cancel')}</button>
              <button
                onClick={submit2faReset}
                disabled={reset2fa.busy || !matched}
                className="btn flex-1 bg-danger text-white hover:opacity-95 disabled:opacity-50"
              >
                {reset2fa.busy ? <Loader2 size={16} className="animate-spin" /> : t('admin.twofaReset.btn')}
              </button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
