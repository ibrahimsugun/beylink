// Plan kategorisi — süre hesabı, yetersiz bakiye, expiry-lazy-downgrade, subpack, subaccount limit.
import db from '../db/connection.js';
import { userModel } from '../models/userModel.js';
import { walletModel } from '../models/walletModel.js';
import { buyPlan, buySubPack } from '../services/purchases.js';
import { applyExpiryIfNeeded, subAccountLimit } from '../utils/plan.js';
import { planSubAccountMax } from '../config/plans.js';
import { apiFetch, createTestOwner, tokenFor, sqlNow } from './helpers.js';

const MICRO = 1_000_000;
const daysUntil = (iso) => (iso ? Math.round((new Date(iso + 'Z').getTime() - Date.now()) / 86400000) : null);

export const planTests = [
  {
    id: 'plan.same-plan-extend',
    name: 'Aynı plan satın alınca süre kümüle olur',
    category: 'Plan',
    description: 'Basic aktif kullanıcı tekrar basic satın alınca kalan süre + 30 gün.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { balance_micro: 20 * MICRO });
      buyPlan(u.id, 'basic');
      const days1 = Math.round((new Date(userModel.findById(u.id).plan_expires_at + 'Z').getTime() - Date.now()) / 86400000);
      ctx.assert(days1 >= 29 && days1 <= 30, `ilk basic ~30 gün (got ${days1})`);
      buyPlan(u.id, 'basic');
      const days2 = Math.round((new Date(userModel.findById(u.id).plan_expires_at + 'Z').getTime() - Date.now()) / 86400000);
      ctx.assert(days2 >= 59 && days2 <= 60, `ikinci basic ~60 gün (got ${days2})`);
    },
  },
  {
    id: 'plan.upgrade-stacks-lower-plan',
    name: 'Yükseltmede alt plan saklanır (stacking)',
    category: 'Plan',
    description: 'Basic (15 gün kalan) → Pro: Pro 30 gün aktif; Basic deferred, bitiş 45 gün (kalan korunur).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'basic', balance_micro: 20 * MICRO, expiresAt: sqlNow(15 * 86400000) });
      buyPlan(u.id, 'pro');
      const after = userModel.findById(u.id);
      ctx.equal(after.plan, 'pro', 'aktif plan Pro');
      ctx.assert(daysUntil(after.plan_expires_at) === 30, `Pro 30 gün aktif (got ${daysUntil(after.plan_expires_at)})`);
      ctx.equal(after.deferred_plan, 'basic', 'alt plan Basic saklanmalı');
      ctx.assert(daysUntil(after.deferred_expires_at) === 45, `Basic deferred bitiş 45 gün = 15 kalan + 30 pro (got ${daysUntil(after.deferred_expires_at)})`);
    },
  },
  {
    id: 'plan.upgrade-resumes-after-expiry',
    name: 'Üst plan bitince saklanan alt plandan devam edilir',
    category: 'Plan',
    description: 'Pro süresi dolunca deferred Basic geçerliyse ona düşer + plan.resumed logu; deferred temizlenir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'basic', balance_micro: 20 * MICRO, expiresAt: sqlNow(20 * 86400000) });
      buyPlan(u.id, 'pro'); // pro 30d, deferred basic 50d
      // Pro'yu süresi geçmiş yap, deferred Basic'i koru
      const st = userModel.findById(u.id);
      userModel.setPlanState(u.id, { plan: 'pro', expiresAt: sqlNow(-1000), deferredPlan: 'basic', deferredExpiresAt: st.deferred_expires_at });
      const resumed = applyExpiryIfNeeded(userModel.findById(u.id));
      ctx.equal(resumed.plan, 'basic', 'Basic\'e dönmeli');
      ctx.equal(resumed.deferred_plan, null, 'deferred temizlenmeli');
      ctx.assert(daysUntil(resumed.plan_expires_at) >= 49 && daysUntil(resumed.plan_expires_at) <= 50, `Basic kalan süre korunur ~50 gün (got ${daysUntil(resumed.plan_expires_at)})`);
      const log = db.prepare(`SELECT detail FROM activity_logs WHERE action = 'plan.resumed' AND user_id = ? ORDER BY id DESC LIMIT 1`).get(u.id);
      ctx.assert(!!log, 'plan.resumed logu yazılmalı');
    },
  },
  {
    id: 'plan.downgrade-blocked',
    name: 'Daha düşük plana geçiş reddedilir (upgrade-only)',
    category: 'Plan',
    description: 'Pro kullanıcı Basic satın almaya çalışır → hata (403 forbidden), plan değişmez, ücret alınmaz.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'pro', balance_micro: 20 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      const balBefore = walletModel.balance(u.id);
      let threw = false;
      try { buyPlan(u.id, 'basic'); } catch (e) { threw = /düşük/i.test(e.message); }
      ctx.assert(threw, 'downgrade reddedilmeli');
      ctx.equal(userModel.findById(u.id).plan, 'pro', 'plan Pro kalmalı');
      ctx.equal(walletModel.balance(u.id), balBefore, 'bakiye değişmemeli (ücret alınmaz)');
    },
  },
  {
    id: 'plan.downgrade-endpoint-403',
    name: 'POST /billing/plan downgrade 403 döner',
    category: 'Plan',
    description: 'Pro kullanıcı endpoint üzerinden Basic almaya çalışır → 403 (USDT faturası bile yaratılmaz).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'pro', balance_micro: 20 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      const r = await apiFetch('/billing/plan', { method: 'POST', token: tokenFor(u), body: { plan: 'basic', method: 'balance' } });
      ctx.equal(r.status, 403, 'downgrade endpoint 403 olmalı');
    },
  },
  {
    id: 'plan.extend-shifts-deferred',
    name: 'Aynı plan uzatma saklanan alt planı da ileri kaydırır',
    category: 'Plan',
    description: 'Pro+deferred Basic iken Pro uzatılınca Pro +30 ve deferred Basic bitişi de +30 kayar (üstte kalır).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'basic', balance_micro: 40 * MICRO, expiresAt: sqlNow(20 * 86400000) });
      buyPlan(u.id, 'pro'); // pro 30, deferred basic 50
      const before = userModel.findById(u.id);
      buyPlan(u.id, 'pro'); // extend pro → 60, deferred basic → 80
      const after = userModel.findById(u.id);
      ctx.assert(daysUntil(after.plan_expires_at) === 60, `Pro uzatma 60 gün (got ${daysUntil(after.plan_expires_at)})`);
      ctx.equal(daysUntil(after.deferred_expires_at), daysUntil(before.deferred_expires_at) + 30, 'deferred Basic +30 kaymalı');
    },
  },
  {
    id: 'plan.free-to-pro-no-deferred',
    name: 'Free → Pro: deferred yok, süre dolunca Free',
    category: 'Plan',
    description: 'Free kullanıcı Pro alınca deferred boş; Pro bitince plan.resumed değil plan.expired → Free.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { balance_micro: 20 * MICRO });
      buyPlan(u.id, 'pro');
      const a = userModel.findById(u.id);
      ctx.equal(a.deferred_plan, null, 'deferred boş olmalı');
      userModel.setPlanState(u.id, { plan: 'pro', expiresAt: sqlNow(-1000) });
      const r = applyExpiryIfNeeded(userModel.findById(u.id));
      ctx.equal(r.plan, 'free', 'Pro bitince Free');
      ctx.equal(r.plan_expires_at, null);
    },
  },
  {
    id: 'plan.credit-topup-independent',
    name: 'Kredi yükleme planı değiştirmez',
    category: 'Plan',
    description: 'Demo kredi yükleme bakiyeyi artırır ama plan/expires/deferred aynı kalır (krediler plandan bağımsız).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'basic', balance_micro: 0, expiresAt: sqlNow(20 * 86400000) });
      db.prepare(`UPDATE users SET is_admin = 1 WHERE id = ?`).run(u.id); // DEMOÖDEME admin-only
      const before = userModel.findById(u.id);
      const r = await apiFetch('/billing/topup/demo', { method: 'POST', token: tokenFor(u), body: { amount_usd: 10 } });
      ctx.assert(r.status === 200 || r.status === 201, `demo topup 2xx (got ${r.status})`);
      const after = userModel.findById(u.id);
      ctx.equal(after.plan, before.plan, 'plan değişmemeli');
      ctx.equal(after.plan_expires_at, before.plan_expires_at, 'expires değişmemeli');
      ctx.assert(after.credits_micro > before.credits_micro, 'bakiye artmalı');
    },
  },
  {
    id: 'plan.insufficient-balance-rejected',
    name: 'Yetersiz bakiye plan satın almayı reddeder',
    category: 'Plan',
    description: 'Bakiye=0 iken buyPlan → hata; plan değişmez, ledger\'a plan satırı yazılmaz.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { balance_micro: 0 });
      let threw = false;
      try { buyPlan(u.id, 'basic'); } catch (e) { threw = true; ctx.contains(e.message, 'Yetersiz'); }
      ctx.assert(threw);
      ctx.equal(userModel.findById(u.id).plan, 'free');
      const rows = walletModel.ledger(u.id, 10).filter((r) => r.reason?.startsWith('plan:'));
      ctx.equal(rows.length, 0, 'plan ledger satırı olmamalı');
    },
  },
  {
    id: 'plan.expired-lazy-downgrade',
    name: 'Süresi geçmiş plan Free\'ye düşer + plan.expired logu yazılır',
    category: 'Plan',
    description: 'applyExpiryIfNeeded plan\'ı free\'ye çeker + expires NULL + activity_logs\'a plan.expired eklenir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(-2 * 86400000) });
      const after = applyExpiryIfNeeded(u);
      ctx.equal(after.plan, 'free');
      ctx.equal(after.plan_expires_at, null);
      const log = db.prepare(`SELECT action, detail FROM activity_logs WHERE action = 'plan.expired' AND user_id = ? ORDER BY id DESC LIMIT 1`).get(u.id);
      ctx.assert(!!log, 'plan.expired logu yazılmalı');
      const detail = JSON.parse(log.detail);
      ctx.equal(detail.from, 'pro', 'detail.from = pro');
    },
  },
  {
    id: 'plan.user-downgrade-endpoint-logs',
    name: 'PATCH /auth/plan (Free\'ye) plan.user_downgrade logu yazar',
    category: 'Plan',
    description: 'Aktif planlı kullanıcı elle Free\'ye geçtiğinde plan.user_downgrade satırı yazılır (from/to detay).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const r = await apiFetch('/auth/plan', { method: 'PATCH', token: tokenFor(u), body: { plan: 'free' } });
      ctx.equal(r.status, 200);
      const log = db.prepare(`SELECT detail FROM activity_logs WHERE action = 'plan.user_downgrade' AND user_id = ? ORDER BY id DESC LIMIT 1`).get(u.id);
      ctx.assert(!!log);
      const detail = JSON.parse(log.detail);
      ctx.equal(detail.to, 'free');
    },
  },
  {
    id: 'plan.subpack-plan-match',
    name: 'Ek alt hesap paketi yalnızca kendi planında alınır',
    category: 'Plan',
    description: 'Pro kullanıcı basic_1 alamaz (plan uyuşmaz); pro_6 alır → +6 hak, limit 3+6=9.',
    run: async (ctx) => {
      const pro = await createTestOwner(ctx, { plan: 'pro', balance_micro: 100 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      let threw = false;
      try { buySubPack(pro.id, 'basic_1'); } catch { threw = true; }
      ctx.assert(threw, 'Pro, basic_1 alamamalı (plan uyuşmaz)');
      buySubPack(pro.id, 'pro_6');
      ctx.equal(subAccountLimit(userModel.findById(pro.id)), 9, 'Pro 3 + pro_6 (6) = 9');
    },
  },
  {
    id: 'plan.subpack-repeatable',
    name: 'Aynı paket plan tavanına kadar tekrar alınabilir',
    category: 'Plan',
    description: 'pro_1 iki kez alınır → ikisi de başarılı, limit 3+1+1=5, bakiye iki kez ($10+$10) düşer.',
    run: async (ctx) => {
      const pro = await createTestOwner(ctx, { plan: 'pro', balance_micro: 100 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      const bal0 = userModel.findById(pro.id).credits_micro;
      buySubPack(pro.id, 'pro_1');
      buySubPack(pro.id, 'pro_1');
      ctx.equal(subAccountLimit(userModel.findById(pro.id)), 5, 'Pro 3 + pro_1 x2 = 5 (tekrar alınabilir)');
      ctx.equal(userModel.findById(pro.id).credits_micro, bal0 - 20 * MICRO, 'bakiye iki kez düşmeli ($20)');
    },
  },
  {
    id: 'plan.subpack-max-40',
    name: 'ProPlus tekrar-alımla tam 40 alt hesaba ulaşır, üstü engellenir',
    category: 'Plan',
    description: 'ProPlus 15 + proplus_15 + proplus_10 = 40; sonra proplus_1 → tavan (41>40) 403.',
    run: async (ctx) => {
      const pp = await createTestOwner(ctx, { plan: 'proplus', balance_micro: 1000 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      buySubPack(pp.id, 'proplus_15'); // 30
      buySubPack(pp.id, 'proplus_10'); // 40
      ctx.equal(subAccountLimit(userModel.findById(pp.id)), 40, 'ProPlus 15 + 15 + 10 = 40 (tam tavan)');
      let threw = false;
      try { buySubPack(pp.id, 'proplus_1'); } catch { threw = true; } // 41 > 40
      ctx.assert(threw, '40 üstü (proplus_1) tavan nedeniyle reddedilmeli');
      ctx.equal(subAccountLimit(userModel.findById(pp.id)), 40, 'tavan aşımı sonrası limit yine 40');
    },
  },
  {
    id: 'plan.subpack-cap-blocks',
    name: 'Plan tavanına ulaşınca ek paket alınamaz',
    category: 'Plan',
    description: 'Pro (cap 10): pro_6 + pro_1 → 10; sonraki pro_1 → 403 (11 > 10), bakiye düşmez.',
    run: async (ctx) => {
      const pro = await createTestOwner(ctx, { plan: 'pro', balance_micro: 200 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      buySubPack(pro.id, 'pro_6'); // 9
      buySubPack(pro.id, 'pro_1'); // 10
      ctx.equal(subAccountLimit(userModel.findById(pro.id)), 10, 'Pro 3 + 6 + 1 = 10 (tavan)');
      const balAt10 = userModel.findById(pro.id).credits_micro;
      let threw = false;
      try { buySubPack(pro.id, 'pro_1'); } catch { threw = true; } // 11 > 10
      ctx.assert(threw, 'tavan aşan pro_1 reddedilmeli');
      ctx.equal(userModel.findById(pro.id).credits_micro, balAt10, 'reddedilen alımda bakiye düşmemeli');
    },
  },
  {
    id: 'plan.subpack-usdt-over-cap-precheck',
    name: 'Tavandaki kullanıcı USDT paket faturası açamaz (ödeme-öncesi cap)',
    category: 'Plan',
    description: 'Pro cap 10 doluyken POST /billing/subpack usdt → 403; fatura/payment OLUŞMAZ (sonsuz-retry para-hapsi tuzağı önlenir).',
    run: async (ctx) => {
      const pro = await createTestOwner(ctx, { plan: 'pro', balance_micro: 300 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      buySubPack(pro.id, 'pro_6'); // 9
      buySubPack(pro.id, 'pro_1'); // 10 (tavan)
      const r = await apiFetch('/billing/subpack', { method: 'POST', token: tokenFor(pro), body: { pack: 'pro_1', method: 'usdt' } });
      ctx.equal(r.status, 403, 'tavan aşan USDT paket alımı ödeme-öncesi 403');
      const pay = db.prepare(`SELECT COUNT(*) c FROM payments WHERE user_id = ?`).get(pro.id).c;
      ctx.equal(pay, 0, 'ödeme-öncesi red → fatura/payment oluşmamalı');
    },
  },
  {
    id: 'plan.subaccount-max-per-plan',
    name: 'Plan-bazlı alt hesap tavanı doğru',
    category: 'Plan',
    description: 'planSubAccountMax açık tavandan gelir (tekrar-alımla ulaşılır): free 0, basic 1, pro 10, proplus 40.',
    run: async (ctx) => {
      ctx.equal(planSubAccountMax('free'), 0, 'Free 0');
      ctx.equal(planSubAccountMax('basic'), 1, 'Basic 1');
      ctx.equal(planSubAccountMax('pro'), 10, 'Pro 10');
      ctx.equal(planSubAccountMax('proplus'), 40, 'ProPlus 40');
    },
  },
  {
    id: 'plan.subaccount-limit-tiers',
    name: 'Alt hesap limiti plana göre doğru hesaplanır',
    category: 'Plan',
    description: 'Free 0, Basic 0, Pro 3, ProPlus 15; Basic + basic_1 = 1; Basic ikinci hak alamaz (cap 1).',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const basic = await createTestOwner(ctx, { plan: 'basic', balance_micro: 50 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      const pro = await createTestOwner(ctx, { plan: 'pro' });
      const pp = await createTestOwner(ctx, { plan: 'proplus' });
      ctx.equal(subAccountLimit(userModel.findById(free.id)), 0, 'Free 0');
      ctx.equal(subAccountLimit(userModel.findById(basic.id)), 0, 'Basic 0');
      ctx.equal(subAccountLimit(userModel.findById(pro.id)), 3, 'Pro 3');
      ctx.equal(subAccountLimit(userModel.findById(pp.id)), 15, 'ProPlus 15');
      buySubPack(basic.id, 'basic_1');
      ctx.equal(subAccountLimit(userModel.findById(basic.id)), 1, 'Basic + basic_1 = 1');
      let threw = false;
      try { buySubPack(basic.id, 'basic_1'); } catch { threw = true; } // 2 > 1
      ctx.assert(threw, 'Basic ikinci basic_1 alamaz (cap 1)');
    },
  },
  {
    id: 'plan.subrights-persist-through-expiry',
    name: 'Satın alınan haklar premium bitince pasifleşir, silinmez',
    category: 'Plan',
    description: 'Pro + pro_6 → expiry Free → limit 0 (haklar pasif); paket satırı DB\'de durur (kalıcı).',
    run: async (ctx) => {
      const pro = await createTestOwner(ctx, { plan: 'pro', balance_micro: 100 * MICRO, expiresAt: sqlNow(30 * 86400000) });
      buySubPack(pro.id, 'pro_6');
      // Süreyi geçmişe çek → applyExpiryIfNeeded Free'ye düşürür
      db.prepare(`UPDATE users SET plan_expires_at = ? WHERE id = ?`).run(sqlNow(-86400000), pro.id);
      const resolved = applyExpiryIfNeeded(userModel.findById(pro.id));
      ctx.equal(resolved.plan, 'free', 'süre dolunca Free');
      ctx.equal(subAccountLimit(resolved), 0, 'Free planda haklar pasif → limit 0');
      const packRows = db.prepare(`SELECT COUNT(*) c FROM subaccount_packs WHERE user_id = ?`).get(pro.id).c;
      ctx.equal(packRows, 1, 'paket satırı silinmez (kalıcı)');
    },
  },
  {
    id: 'plan.purchase-requires-verified-email',
    name: 'E-posta onaysız satın alım engellenir (okuma serbest)',
    category: 'Plan',
    description: 'Doğrulanmamış owner POST /billing/topup → 403 email_unverified; GET /billing/wallet → 200.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'free', email_verified: 0 });
      const buy = await apiFetch('/billing/topup', { method: 'POST', token: tokenFor(u), body: { amount_usd: 10 } });
      ctx.equal(buy.status, 403, 'satın alım/yükleme 403');
      ctx.equal(buy.body?.code, 'email_unverified', 'code email_unverified');
      const wallet = await apiFetch('/billing/wallet', { token: tokenFor(u) });
      ctx.equal(wallet.status, 200, 'GET wallet serbest (okuma engellenmez)');
    },
  },
];
