import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, KeyRound, ExternalLink, Users, Pencil, Crown, PackagePlus, ShieldOff, RefreshCw, ArrowUpCircle, Palette } from 'lucide-react';
import { api } from '../api/client.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Toggle } from '../components/ui/Toggle.jsx';
import { useProfile } from '../context/ProfileContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { PurchaseModal } from '../components/billing/PurchaseModal.jsx';
import { PermanentRightsNote } from '../components/billing/PermanentRightsNote.jsx';
import { PickTemplateModal } from '../components/design/PickTemplateModal.jsx';
import { PLANS } from '../lib/plans.js';
import { emailUnverified, promptEmailVerify } from '../lib/emailGate.js';
import { usd } from '../lib/format.js';

// Bir sonraki plana yükseltme ipucu (Basic→Pro, Pro→Pro Plus)
const NEXT_PLAN = { basic: 'pro', pro: 'proplus' };

// Hacim indirimi: tek hak baz fiyatı $10; büyük pakette birim fiyat düşer.
const UNIT_MICRO = 10 * 1_000_000;
function packDiscount(rights, priceMicro) {
  if (!rights || rights <= 1) return 0;
  return Math.round((1 - (priceMicro / rights) / UNIT_MICRO) * 100);
}

export default function SubAccountsPage() {
  const [subs, setSubs] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [packBuy, setPackBuy] = useState(null); // satın alınacak paket {key, rights, price_micro}
  const [tplForSub, setTplForSub] = useState(null); // şablon uygulanacak alt hesap
  const [editing, setEditing] = useState(null);
  const [reactivating, setReactivating] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', display_name: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { setActiveId, refreshSubProfiles } = useProfile();
  const { user, refresh } = useAuth();
  const { t } = useLanguage();

  // silent: modal açıkken tam-sayfa spinner'ına düşme (modal unmount olmasın)
  const load = useCallback(({ silent } = {}) => {
    if (!silent) setLoading(true);
    return Promise.all([api.get('/subaccounts'), api.get('/billing/wallet')])
      .then(([d, w]) => { setSubs(d.subAccounts); setWallet(w); })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const patchSub = async (id, body) => {
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, ...body } : s)));
    try { await api.patch(`/subaccounts/${id}`, body); } catch { load(); }
  };

  const editProfile = (sub) => {
    if (!sub.profile) return;
    setActiveId(sub.profile.id);
    navigate('/dashboard');
  };

  const openCreate = () => { setForm({ username: '', password: '', display_name: '' }); setError(''); setCreateOpen(true); };
  const openEdit = (sub) => { setEditing(sub); setForm({ username: sub.username, password: '', display_name: sub.profile?.display_name || '' }); setError(''); };

  const create = async () => {
    setBusy(true); setError('');
    try {
      await api.post('/subaccounts', form);
      setCreateOpen(false); load(); refreshSubProfiles();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const saveEdit = async () => {
    setBusy(true); setError('');
    try {
      const patch = {};
      if (form.username && form.username !== editing.username) patch.username = form.username;
      if (form.password) patch.password = form.password;
      await api.patch(`/subaccounts/${editing.id}`, patch);
      setEditing(null); load(); refreshSubProfiles();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm(t('subaccounts.confirmRemove'))) return;
    await api.delete(`/subaccounts/${id}`);
    load();
    refreshSubProfiles();
  };

  const reactivateAll = async () => {
    setReactivating(true);
    try {
      await api.post('/subaccounts/reactivate-all');
      await refresh(); load(); refreshSubProfiles();
    } catch (e) { alert(e.message); } finally { setReactivating(false); }
  };

  // Sessiz yenile: modal açıkken (başarı ekranı) sayfa spinner'a düşüp modalı unmount etmesin.
  const onPackSuccess = async () => { await refresh(); await load({ silent: true }); };

  if (loading) return <div className="flex justify-center py-16 text-brand-violet"><Spinner size={26} /></div>;

  const plan = user?.plan || 'free';
  const info = wallet?.subaccount || {};
  const limit = wallet?.sub_limit || 0;
  const used = subs.length;
  const atLimit = used >= limit;
  const packs = info.packs || [];
  const curRights = (info.default_rights || 0) + (info.extra_rights || 0); // mevcut toplam hak
  const maxRights = info.max_rights || 0;                                   // plan-bazlı tavan
  const suspendedCount = info.suspended_sub_count || 0;
  const atMax = maxRights > 0 && curRights >= maxRights; // plan tavanına ulaşıldı
  const nextPlan = NEXT_PLAN[plan];

  // Free plan — alt hesaplar kapalı, yükseltme ekranı
  if (plan === 'free') {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-2xl font-extrabold text-ink">{t('subaccounts.title')}</h1>
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Crown size={26} /></span>
          <p className="text-lg font-bold text-ink">{t('subaccounts.freeGate.title')}</p>
          <p className="max-w-sm text-sm text-muted">
            {t('subaccounts.freeGate.desc')}
          </p>
          {suspendedCount > 0 && (
            <p className="text-xs text-warning">{t('subaccounts.freeGate.suspendedNote', { count: suspendedCount })}</p>
          )}
          <Link to="/dashboard/plans" className="btn-brand mt-1">{t('subaccounts.freeGate.viewPlansBtn')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{t('subaccounts.title')}</h1>
          <p className="text-mb text-muted">
            <b className="text-ink">{t('subaccounts.usage', { used, limit })}</b>
            <span className="text-mb bg-yellow-200"> · {t(info.extra_rights ? 'subaccounts.planInfo.withExtra' : 'subaccounts.planInfo.base', { plan: PLANS[plan].label, default: info.default_rights, extra: info.extra_rights })}</span>
          </p>
        </div>
        <button onClick={openCreate} disabled={atLimit} className="btn-brand disabled:opacity-50" title={atLimit ? t('subaccounts.atLimitTooltip') : t('subaccounts.newMemberTooltip')}>
          <Plus size={16} /> {t('subaccounts.newMemberBtn')}
        </button>
      </div>

      {/* Premium yenilendi → askıdaki alt hesapları aktifleştir */}
      {suspendedCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand-teal/30 bg-brand-teal/10 px-4 py-3 text-sm">
          <RefreshCw size={16} className="shrink-0 text-brand-teal" />
          <span className="flex-1 text-ink-soft">
            {t('subaccounts.reactivateBanner', { count: suspendedCount })}
          </span>
          <button onClick={reactivateAll} disabled={reactivating} className="btn-brand py-1.5 text-xs disabled:opacity-50">
            {reactivating ? '…' : t('subaccounts.reactivateBtn')}
          </button>
        </div>
      )}

      <PermanentRightsNote className="mb-4" />

      {/* Ek alt hesap hakkı paketleri (plana özel, plan limitine kadar tekrar alınabilir) */}
      <div className="card mb-5 p-5">
        <div className="mb-1 flex items-center gap-2">
          <PackagePlus size={16} className="text-brand-violet" />
          <h2 className="text-sm font-bold text-ink">{t('subaccounts.extraRights.title')}</h2>
        </div>
        <p className="mb-3 text-xs text-muted">
          {t('subaccounts.extraRights.desc')}
          {plan === 'proplus' && <> {t('subaccounts.extraRights.maxNote', { max: info.max_rights })}</>}
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {packs.map((p) => {
            const wouldExceed = curRights + p.rights > maxRights; // tavanı aşan paket alınamaz
            const disc = packDiscount(p.rights, p.price_micro);
            return (
              <div key={p.key} className={`flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 ${wouldExceed ? 'opacity-60' : ''}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-violet/10 text-sm font-bold text-brand-violet">+{p.rights}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-bold text-ink">+{t.plural('subpack.rights', p.rights)}</span>
                    {disc > 0 && <span className="chip bg-success/10 px-1.5 py-0 text-[10px] font-bold text-success">{t('subaccounts.pack.discountChip', { percent: disc })}</span>}
                  </div>
                  <div className="text-xs text-muted">{usd(p.price_micro)}</div>
                </div>
                {wouldExceed ? (
                  <span className="chip bg-surface text-muted" title={t('subaccounts.pack.notFitTitle', { max: maxRights })}>{t('subaccounts.pack.notFitChip')}</span>
                ) : (
                  <button onClick={() => { if (emailUnverified(user)) return promptEmailVerify(); setPackBuy(p); }} className="btn-soft py-1.5 text-xs">{t('subaccounts.pack.buyBtn')}</button>
                )}
              </div>
            );
          })}
        </div>

        {/* Tavana ulaşıldı → bir üst plana yükselt (Basic→Pro, Pro→Pro Plus) */}
        {atMax && nextPlan && (
          <Link to="/dashboard/plans" className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-brand-violet/5 px-4 py-2.5 text-sm font-bold text-brand-violet transition hover:bg-brand-violet/10">
            <ArrowUpCircle size={16} /> {t('subaccounts.upgradeNext', { plan: PLANS[nextPlan].label })}
          </Link>
        )}
      </div>

      {atLimit && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          <PackagePlus size={16} /> {t('subaccounts.atLimitBanner.base', { limit })} {nextPlan ? t('subaccounts.atLimitBanner.withNext', { plan: PLANS[nextPlan].label }) : t('subaccounts.atLimitBanner.maxed')}
        </div>
      )}

      {subs.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Users className="text-brand-violet" />
          <p className="font-semibold text-ink">{t('subaccounts.emptyState.title')}</p>
          <p className="text-sm text-muted">{t('subaccounts.emptyState.desc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((s) => (
            <div key={s.id} className={`card p-4 ${(!s.is_active || s.is_suspended) ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                  {(s.profile?.display_name || s.username).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold text-ink">{s.profile?.display_name || s.username}</span>
                    {s.is_suspended ? (
                      <span className="chip flex items-center gap-1 bg-warning/15 text-warning"><ShieldOff size={12} /> {t('subaccounts.member.suspendedChip')}</span>
                    ) : !s.is_active && <span className="chip bg-danger/10 text-danger">{t('subaccounts.member.inactiveChip')}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-mono">@{s.username}</span>
                    {s.profile && <span>· /{s.profile.username}</span>}
                  </div>
                </div>
                {s.profile && (
                  <button onClick={() => setTplForSub(s)} disabled={!!s.is_suspended} className="btn-ghost px-2.5 disabled:opacity-40" title={s.is_suspended ? t('subaccounts.member.applyTemplateSuspendedTitle') : t('subaccounts.member.applyTemplateTitle')}>
                    <Palette size={15} />
                  </button>
                )}
                {s.profile && (
                  <button onClick={() => editProfile(s)} disabled={!!s.is_suspended} className="btn-soft disabled:opacity-40" title={s.is_suspended ? t('subaccounts.member.editProfileSuspendedTitle') : t('subaccounts.member.editProfileTooltip')}>
                    <Pencil size={14} /> {t('subaccounts.member.editProfileBtn')}
                  </button>
                )}
                {s.profile && (
                  <a href={`/${s.profile.username}`} target="_blank" rel="noreferrer" className="btn-ghost px-2.5" title={t('subaccounts.member.viewPublicTitle')}><ExternalLink size={15} /></a>
                )}
                <button onClick={() => openEdit(s)} className="btn-ghost px-2.5" title={t('subaccounts.member.credentialsTitle')}><KeyRound size={15} /></button>
                <button onClick={() => remove(s.id)} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger" title={t('subaccounts.member.deleteTitle')}><Trash2 size={15} /></button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3">
                <label className={`flex items-center gap-2 text-sm text-ink-soft ${s.is_suspended ? 'opacity-50' : 'cursor-pointer'}`}>
                  <Toggle checked={!!s.is_active} onChange={(v) => patchSub(s.id, { is_active: v })} size="sm" disabled={!!s.is_suspended} />
                  {t('subaccounts.member.activeLabel')} <span className="text-xs text-muted">{t('subaccounts.member.activeHint')}</span>
                </label>
                <label className={`flex items-center gap-2 text-sm text-ink-soft ${s.is_suspended ? 'opacity-50' : 'cursor-pointer'}`}>
                  <Toggle checked={!!s.can_edit_profile} onChange={(v) => patchSub(s.id, { can_edit_profile: v })} size="sm" disabled={!!s.is_suspended} />
                  {t('subaccounts.member.canEditLabel')}
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alt hesaba şablondan tasarım uygula (tekil) */}
      {tplForSub?.profile && (
        <PickTemplateModal
          targetProfileId={tplForSub.profile.id}
          targetLabel={tplForSub.profile.display_name || tplForSub.username}
          onClose={() => setTplForSub(null)}
          onApplied={() => { setTplForSub(null); refreshSubProfiles(); }}
        />
      )}

      {/* Ek hak paketi satın alma */}
      {packBuy && (
        <PurchaseModal
          open
          onClose={() => setPackBuy(null)}
          title={t('subaccounts.purchaseModal.title')}
          description={t('subaccounts.purchaseModal.desc', { rights: packBuy.rights })}
          successText={t('subaccounts.purchaseModal.success', { rights: packBuy.rights })}
          priceMicro={packBuy.price_micro}
          balanceMicro={wallet?.balance_micro}
          wallet={wallet?.wallet}
          endpoint="/billing/subpack"
          payload={{ pack: packBuy.key }}
          onSuccess={onPackSuccess}
        />
      )}

      {/* Oluştur */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('subaccounts.modal.createTitle')}
        footer={<>
          <button onClick={() => setCreateOpen(false)} className="btn-ghost">{t('common.cancel')}</button>
          <button onClick={create} className="btn-brand" disabled={busy}>{busy ? <Spinner size={15} /> : t('subaccounts.modal.createSubmit')}</button>
        </>}
      >
        <div className="space-y-3">
          <div><label className="label">{t('subaccounts.modal.displayNameLabel')}</label><input className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder={t('subaccounts.modal.displayNamePlaceholder')} /></div>
          <div><label className="label">{t('subaccounts.modal.usernameLabel')}</label><input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder={t('subaccounts.modal.usernamePlaceholder')} /></div>
          <div><label className="label">{t('subaccounts.modal.passwordLabel')}</label><input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t('subaccounts.modal.passwordPlaceholder')} /></div>
          {error && <div className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
        </div>
      </Modal>

      {/* Düzenle */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={t('subaccounts.modal.editTitle')}
        footer={<>
          <button onClick={() => setEditing(null)} className="btn-ghost">{t('common.cancel')}</button>
          <button onClick={saveEdit} className="btn-brand" disabled={busy}>{busy ? <Spinner size={15} /> : t('common.save')}</button>
        </>}
      >
        <div className="space-y-3">
          <div><label className="label">{t('subaccounts.modal.editUsernameLabel')}</label><input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
          <div><label className="label">{t('subaccounts.modal.newPasswordLabel')} <span className="font-normal text-muted">{t('subaccounts.modal.newPasswordHint')}</span></label><input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t('subaccounts.modal.newPasswordPlaceholder')} /></div>
          {error && <div className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
        </div>
      </Modal>
    </div>
  );
}
