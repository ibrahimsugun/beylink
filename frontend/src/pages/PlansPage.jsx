import { useCallback, useEffect, useState } from 'react';
import { Check, Crown, Lock, ArrowUpCircle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../api/client.js';
import { PLANS, PLAN_ORDER, planTier } from '../lib/plans.js';
import { emailUnverified, promptEmailVerify } from '../lib/emailGate.js';
import { usd, shortDate, daysLeft } from '../lib/format.js';
import { PurchaseModal } from '../components/billing/PurchaseModal.jsx';
import { PermanentRightsNote } from '../components/billing/PermanentRightsNote.jsx';

// Pro / Pro Plus kartlarında öne çıkan "Takım Yönetimi" bloğu — asıl satılan değer.
function TeamBlock({ dark, t }) {
  return (
    <div className={`mt-5 rounded-xl border p-3 ${dark ? 'border-white/15 bg-white/10' : 'border-brand-violet/20 bg-brand-violet/5'}`}>
      <div className="flex items-center gap-2 font-bold">
        <Users size={16} className={dark ? 'text-brand-teal' : 'text-brand-violet'} />
        <span className={dark ? 'text-white' : 'text-ink'}>{t('plans.teamBlock.title')}</span>
      </div>
      <p className={`mt-1 text-xs ${dark ? 'text-white/70' : 'text-muted'}`}>
        {t('plans.teamBlock.desc')}
      </p>
      <ul className={`mt-2 space-y-1 text-xs ${dark ? 'text-white/80' : 'text-ink-soft'}`}>
        <li className="flex items-center gap-1.5"><Check size={13} className={dark ? 'text-brand-teal' : 'text-success'} /> {t('plans.teamBlock.item1')}</li>
        <li className="flex items-center gap-1.5"><Check size={13} className={dark ? 'text-brand-teal' : 'text-success'} /> {t('plans.teamBlock.item2')}</li>
        <li className="flex items-center gap-1.5"><Check size={13} className={dark ? 'text-brand-teal' : 'text-success'} /> {t('plans.teamBlock.item3')}</li>
      </ul>
    </div>
  );
}

export default function PlansPage() {
  const { user, refresh } = useAuth();
  const { t } = useLanguage();
  const [wallet, setWallet] = useState(null); // { balance_micro, wallet }
  const [buy, setBuy] = useState(null); // seçilen plan key

  const loadWallet = useCallback(async () => {
    try { setWallet(await api.get('/billing/wallet')); } catch { /* */ }
  }, []);
  useEffect(() => { loadWallet(); }, [loadWallet]);

  const current = user?.plan || 'free';
  const curTier = planTier(current);
  const dl = daysLeft(user?.plan_expires_at);

  // Saklanan (yükseltmede alta konan) plan bilgisi — kullanıcı ne olacağını görsün
  const deferredPlan = user?.deferred_plan || null;
  const deferredDl = daysLeft(user?.deferred_expires_at);

  // Satın alma uyarı metni — yükseltme (stacking) / uzatma / free→paket
  const buyWarning = buy
    ? (current === 'free'
        ? t('plans.buyWarning.new', { plan: PLANS[buy].label, price: usd(PLANS[buy].priceMicro) })
        : current === buy
          ? (dl != null
              ? t('plans.buyWarning.extendWithDays', { plan: PLANS[buy].label, daysLeft: t.plural('plan.daysLeft', dl), price: usd(PLANS[buy].priceMicro), totalDays: t.plural('common.days', (dl || 0) + 30) })
              : t('plans.buyWarning.extendNoDays', { plan: PLANS[buy].label, price: usd(PLANS[buy].priceMicro), totalDays: t.plural('common.days', (dl || 0) + 30) }))
          // Yükseltme (düşük plandan yükseğe): stacking — alt plan saklanır
          : t('plans.buyWarning.upgrade', {
              currentPlan: PLANS[current].label,
              newPlan: PLANS[buy].label,
              days: t.plural('common.days', dl || 0),
              totalDays: t.plural('common.days', (dl || 0) + 30),
              price: usd(PLANS[buy].priceMicro),
            }))
    : null;

  const onSuccess = async () => {
    await refresh();
    const w = await api.get('/billing/wallet').catch(() => null);
    if (w) setWallet(w);
    // Premium yenilendiyse ve askıdaki alt hesap varsa: kullanıcıya sor, onaylarsa hepsini aktifleştir.
    const suspended = w?.subaccount?.suspended_sub_count || 0;
    if (suspended > 0 && w?.plan !== 'free') {
      if (window.confirm(t('plans.reactivateConfirm', { count: suspended }))) {
        await api.post('/subaccounts/reactivate-all').catch(() => {});
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-ink">{t('plans.title')}</h1>
        <p className="mt-1 text-muted">
          {t('plans.balanceLabel')} <b className="font-mono text-ink">{usd(wallet?.balance_micro)}</b>
          {current !== 'free' && user?.plan_expires_at && <> · {t('plans.expiresInfo', { plan: PLANS[current].label, date: shortDate(user.plan_expires_at) })}</>}
        </p>
        {deferredPlan && (
          <p className="mt-1 text-sm text-brand-teal">
            {t('plans.deferred.text', { currentPlan: PLANS[current].label, deferredPlan: PLANS[deferredPlan].label })}
            {deferredDl != null && <> ({t('plans.deferred.daysLeft', { days: Math.max(0, deferredDl - (dl || 0)), deferredPlan: PLANS[deferredPlan].label })})</>}
          </p>
        )}
        <p className="mx-auto mt-2 max-w-xl text-xs text-muted">
          {t('plans.upgradeOnlyNote')}
        </p>
      </div>

      <PermanentRightsNote className="mx-auto mb-6 max-w-2xl" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((key) => {
          const p = PLANS[key];
          const tier = planTier(key);
          const isCurrent = current === key;
          const isDark = key === 'proplus';   // en üst tier → koyu flagship kart
          const isPopular = key === 'pro';    // popüler plan → açık kart + aksan
          const isLower = tier < curTier;    // düşük plan → tıklanamaz (downgrade yok)
          const isUpgrade = tier > curTier;  // yüksek plan → yükselt

          let button;
          if (isCurrent && key === 'free') {
            button = (
              <button disabled className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold ${isDark ? 'bg-white/15 text-white' : 'bg-surface text-muted'}`}>
                {t('plans.currentPlanBtn')}
              </button>
            );
          } else if (isCurrent) {
            // Aynı plan → süre uzatma
            button = (
              <button
                onClick={() => { if (emailUnverified(user)) return promptEmailVerify(); setBuy(key); }}
                className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold ${isDark ? 'bg-white/15 text-white ring-2 ring-brand-teal' : 'bg-brand-violet/10 text-brand-violet ring-2 ring-brand-violet'}`}
                title={t('plans.extendTitle')}
              >
                {t('plans.extendBtn')}
              </button>
            );
          } else if (isLower) {
            // Düşük plan → downgrade yasak, tıklanamaz
            button = (
              <button
                disabled
                title={t('plans.lowerTitle')}
                className={`mt-5 flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold ${isDark ? 'bg-white/10 text-white/50' : 'bg-surface text-muted'}`}
              >
                <Lock size={14} /> {t('plans.blockedBtn')}
              </button>
            );
          } else {
            // Yüksek plan → yükselt
            button = (
              <button
                onClick={() => { if (emailUnverified(user)) return promptEmailVerify(); setBuy(key); }}
                className={`mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold ${isDark ? 'bg-brand-gradient text-white' : 'btn-brand'}`}
              >
                <ArrowUpCircle size={16} /> {t('plans.upgradeBtn', { plan: p.label, price: usd(p.priceMicro) })}
              </button>
            );
          }

          return (
            <div
              key={key}
              className={`card flex flex-col p-6 ${isDark ? 'bg-ink text-white border-transparent' : ''} ${
                isCurrent
                  ? `ring-2 ${isDark ? 'ring-brand-teal' : 'ring-brand-violet'}`
                  : isPopular ? 'ring-2 ring-brand-violet/50' : ''
              } ${isLower ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold">{p.label}</h2>
                {isPopular && <span className="chip bg-brand-gradient text-white">{t('plans.popularChip')}</span>}
                {isCurrent && <Crown size={16} className={isDark ? 'text-brand-teal' : 'text-brand-violet'} />}
                {deferredPlan === key && <span className="chip bg-brand-teal/15 text-brand-teal">{t('plans.nextChip')}</span>}
              </div>
              <div className="mt-4">
                <span className="font-display text-4xl font-extrabold">{key === 'free' ? t('plans.freeLabel') : usd(p.priceMicro)}</span>
                {key !== 'free' && <span className={isDark ? 'text-white/60' : 'text-muted'}> {t('plans.perMonth')}</span>}
              </div>

              {button}

              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${isDark ? 'text-white/90' : 'text-ink-soft'}`}>
                    <Check size={16} className={isDark ? 'text-brand-teal' : 'text-success'} /> {t(f)}
                  </li>
                ))}
              </ul>

              {p.team && <TeamBlock dark={isDark} t={t} />}
            </div>
          );
        })}
      </div>

      {buy && (
        <PurchaseModal
          open
          onClose={() => setBuy(null)}
          title={current === buy ? t('plans.modal.extendTitle', { plan: PLANS[buy].label }) : t('plans.modal.upgradeTitle', { plan: PLANS[buy].label })}
          description={
            current === 'free'
              ? t('plans.modal.descNew', { plan: PLANS[buy].label })
              : current === buy
                ? t('plans.modal.descExtend', { totalDays: t.plural('common.days', (dl || 0) + 30), plan: PLANS[buy].label })
                : t('plans.modal.descUpgrade', { newPlan: PLANS[buy].label, currentPlan: PLANS[current].label, days: t.plural('common.days', dl || 0) })
          }
          priceMicro={PLANS[buy].priceMicro}
          balanceMicro={wallet?.balance_micro}
          wallet={wallet?.wallet}
          endpoint="/billing/plan"
          payload={{ plan: buy }}
          warning={buyWarning}
          successText={current === buy ? t('plans.modal.successExtend', { plan: PLANS[buy].label }) : t('plans.modal.successUpgrade', { plan: PLANS[buy].label })}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
