import { PLANS, planOf, PLAN_DURATION_DAYS, MAX_SUBACCOUNT_RIGHTS, LEGACY_SUBACCOUNT_PACK_SIZE } from '../config/plans.js';
import { userModel } from '../models/userModel.js';
import { subaccountPackModel } from '../models/subaccountPackModel.js';
import { logActivity } from '../services/activityLog.js';
import { forbidden } from './ApiError.js';

// Kullanıcının planına ait yetenek seti
export function planCaps(user) {
  return planOf(user?.plan);
}

// Belirli bir yetenek yoksa 403
export function assertPlanCap(user, key) {
  if (!planCaps(user)[key]) {
    throw forbidden('Bu özellik planınızda kapalı. Yükseltmek için Cüzdan/Planlar bölümüne bakın.');
  }
}

// Satın alınmış (hesaba kalıcı) ek alt hesap hakları — plandan bağımsız, premium bitse de kaybolmaz.
// (paket tablosu + eski +5'lik sayaç geriye-uyum)
export function purchasedSubRights(user) {
  if (!user?.id) return 0;
  const packs = subaccountPackModel.totalRights(user.id);
  const legacy = (user.extra_subaccount_packs || 0) * LEGACY_SUBACCOUNT_PACK_SIZE;
  return packs + legacy;
}

// Kullanılabilir alt hesap limiti = plan tabanı + satın alınan haklar (max 40).
// Free planda 0 → premium bitince ek haklar PASİFLEŞİR (silinmez); premium yenilenince tekrar sayılır.
export function subAccountLimit(user) {
  if (!user || user.plan === 'free') return 0;
  const base = planCaps(user).subAccounts || 0;
  return Math.min(MAX_SUBACCOUNT_RIGHTS, base + purchasedSubRights(user));
}

// SQLite datetime('now') ('YYYY-MM-DD HH:MM:SS', UTC) → Date
function parseSqlUtc(s) {
  if (!s) return null;
  const d = new Date(String(s).replace(' ', 'T') + 'Z');
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isExpired(user) {
  if (!user || user.plan === 'free' || !user.plan_expires_at) return false;
  const exp = parseSqlUtc(user.plan_expires_at);
  return exp ? exp.getTime() <= Date.now() : false;
}

// Süresi dolan (üst) plan → saklanan alt plana düş; alt plan da yoksa/dolmuşsa Free'ye. Lazy.
// requireAuth her istekte çağırır; yalnız gerçekten süre dolduğunda yazma yapar (idempotent).
//   - Pro (dolmuş) + geçerli deferred Basic  → Basic'e devam (plan.resumed)
//   - Pro/Basic (dolmuş) + deferred yok/dolmuş → Free (plan.expired)
export function applyExpiryIfNeeded(user) {
  if (!isExpired(user)) return user;

  // Saklanan alt plan hâlâ geçerliyse ona devam et (yüksek plan bitince otomatik alt plan).
  const defExp = parseSqlUtc(user.deferred_expires_at);
  if (user.deferred_plan && defExp && defExp.getTime() > Date.now()) {
    // updatePlan plan'ı set eder + deferred alanlarını temizler → tam olarak "resume" davranışı.
    const resumed = userModel.updatePlan(user.id, user.deferred_plan, user.deferred_expires_at);
    logActivity({
      userId: user.id,
      action: 'plan.resumed',
      detail: { from: user.plan, to: user.deferred_plan, until: user.deferred_expires_at },
    });
    return resumed;
  }

  const updated = userModel.updatePlan(user.id, 'free', null);
  // Premium bitti → ana hesabın tüm alt hesapları askıya alınır (silinmez; giriş var, işlem yok).
  // Yalnız owner'lar alt hesaba sahip olur; sub'ta no-op (WHERE role='sub' AND parent=user.id).
  const suspended = user.role === 'owner' ? userModel.suspendSubs(user.id) : 0;
  logActivity({ userId: user.id, action: 'plan.expired', detail: { from: user.plan, expired_at: user.plan_expires_at, suspended_subs: suspended } });
  return updated;
}

// Yeni bir planın bitiş tarihini üret (şimdi + süre) — SQLite ile hesaplat
export { PLANS, PLAN_DURATION_DAYS, parseSqlUtc };
