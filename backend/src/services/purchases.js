import db from '../db/connection.js';
import { walletModel } from '../models/walletModel.js';
import { userModel } from '../models/userModel.js';
import { subaccountPackModel } from '../models/subaccountPackModel.js';
import { PLANS, SUBACCOUNT_PACKS, PLAN_DURATION_DAYS, planTier, planOf, planSubAccountMax } from '../config/plans.js';
import { applyExpiryIfNeeded, parseSqlUtc, purchasedSubRights } from '../utils/plan.js';
import { badRequest, forbidden } from '../utils/ApiError.js';

const DURATION_MS = PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000;

// SQLite datetime formatı (UTC): 'YYYY-MM-DD HH:MM:SS'
function fmtUtc(ms) {
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Yükseltme izinli mi? Düşürme (target < current) YASAK. Aynı/yüksek serbest.
 * Hem satın alma öncesi (USDT fatura yaratmadan) hem buyPlan içinde savunma amaçlı çağrılır.
 */
export function assertUpgradeAllowed(user, planKey) {
  const cur = applyExpiryIfNeeded(user); // gerçek "current"i baz al (süresi dolmuş plan düşmüş olabilir)
  if (planTier(planKey) < planTier(cur.plan)) {
    throw forbidden('Daha düşük bir plana geçiş yapılamaz. Zaten daha yüksek bir planınız var.');
  }
  return cur;
}

/**
 * Plan satın al — bakiyeden düş (atomik) + planı aktive et. UPGRADE-ONLY, stacking modeli:
 *  - Düşürme (target < current): reddedilir (403).
 *  - Aynı plan (extend): süreye +30 gün; saklanan alt plan varsa o da +30 gün ileri kayar (üstte kalır).
 *  - Yükseltme (target > current): yeni plan 30 gün aktif; mevcut alt plan **saklanır** (deferred) ve
 *    kalan süresi yeni planın süresi kadar ileri itilir → yüksek plan bitince alt plandan otomatik devam.
 * Yetersiz bakiyede walletModel.apply throw eder → tüm işlem geri alınır.
 */
export function buyPlan(userId, planKey, { ref = null } = {}) {
  const plan = PLANS[planKey];
  if (!plan || planKey === 'free') throw badRequest('Geçersiz plan', 'plan');

  const tx = db.transaction(() => {
    let user = userModel.findById(userId);
    if (!user) throw badRequest('Kullanıcı bulunamadı');
    // Süresi dolmuş üst planı önce çöz (düş/resume) → doğru "current" üzerinden karar ver.
    user = assertUpgradeAllowed(user, planKey);

    walletModel.apply(userId, -plan.priceMicro, `plan:${planKey}`, ref);

    const now = Date.now();
    const curTier = planTier(user.plan);
    const tgtTier = planTier(planKey);

    if (tgtTier === curTier) {
      // EXTEND (aynı plan): kalan süreye +30 gün. Saklanan alt plan varsa o da +30 gün ileri kayar.
      const curExp = parseSqlUtc(user.plan_expires_at);
      const base = curExp && curExp.getTime() > now ? curExp.getTime() : now;
      let deferredPlan = user.deferred_plan || null;
      let deferredExpiresAt = null;
      if (deferredPlan) {
        const d = parseSqlUtc(user.deferred_expires_at);
        deferredExpiresAt = d ? fmtUtc(d.getTime() + DURATION_MS) : null;
        if (!deferredExpiresAt) deferredPlan = null;
      }
      return userModel.setPlanState(userId, {
        plan: planKey,
        expiresAt: fmtUtc(base + DURATION_MS),
        deferredPlan,
        deferredExpiresAt,
      });
    }

    // UPGRADE (target > current): yeni plan şimdiden 30 gün. Mevcut ücretli plan varsa SAKLA.
    // Not: yükseltme yalnız Free/Basic'ten olur (Pro'nun üstü yok) → mevcutta zaten deferred bulunmaz.
    let deferredPlan = null;
    let deferredExpiresAt = null;
    if (user.plan !== 'free') {
      const curExp = parseSqlUtc(user.plan_expires_at);
      if (curExp && curExp.getTime() > now) {
        // Alt planın kalan süresi, yeni planın süresi kadar ileri itilir → yüksek plan bitince devam eder.
        deferredPlan = user.plan;
        deferredExpiresAt = fmtUtc(curExp.getTime() + DURATION_MS);
      }
    }
    return userModel.setPlanState(userId, {
      plan: planKey,
      expiresAt: fmtUtc(now + DURATION_MS),
      deferredPlan,
      deferredExpiresAt,
    });
  });
  const user = tx();
  return { user, balance_micro: user.credits_micro };
}

/**
 * Ek alt hesap hakkı paketi satın al — HESABA KALICI, hesap başına 1 KEZ.
 * Kurallar:
 *  - Paket geçerli olmalı.
 *  - Paket, kullanıcının AKTİF planına ait olmalı (ör. pro_6 yalnız Pro'da alınır).
 *  - Daha önce alınmamış olmalı (UNIQUE(user, pack_key)).
 *  - Toplam hak (plan tabanı + satın alınanlar) 40'ı aşmamalı.
 * Bakiyeden atomik düşülür; yetersizse walletModel.apply throw eder → işlem geri alınır.
 */
export function buySubPack(userId, packKey, { ref = null } = {}) {
  const pack = SUBACCOUNT_PACKS[packKey];
  if (!pack) throw badRequest('Geçersiz paket', 'pack');

  const tx = db.transaction(() => {
    let user = userModel.findById(userId);
    if (!user) throw badRequest('Kullanıcı bulunamadı');
    user = applyExpiryIfNeeded(user); // gerçek "current" plan (süresi dolmuş olabilir)

    if (user.plan !== pack.plan) {
      throw forbidden(`Bu paket yalnızca ${planOf(pack.plan).label} planında satın alınabilir.`);
    }
    // Paketler plan tavanına kadar TEKRAR alınabilir; yalnızca tavan aşımı engellenir.
    const cap = planSubAccountMax(user.plan);
    const baseRights = planOf(user.plan).subAccounts || 0;
    if (baseRights + purchasedSubRights(user) + pack.rights > cap) {
      throw forbidden(`Bu paket ${cap} alt hesap tavanınızı aşıyor.`);
    }

    walletModel.apply(userId, -pack.priceMicro, `subpack:${packKey}`, ref);
    subaccountPackModel.add(userId, { packKey, rights: pack.rights, priceMicro: pack.priceMicro });
    return userModel.findById(userId);
  });
  const user = tx();
  return { user, balance_micro: user.credits_micro, pack };
}
