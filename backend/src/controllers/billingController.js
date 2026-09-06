import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound, forbidden } from '../utils/ApiError.js';
import { walletModel } from '../models/walletModel.js';
import { paymentModel } from '../models/paymentModel.js';
import { userModel } from '../models/userModel.js';
import { buyPlan, buySubPack, assertUpgradeAllowed } from '../services/purchases.js';
import {
  createInvoice, demoSettle, cancelInvoice, getActiveInvoice, walletInfo, walletConfigured, demoWallets, walletOrderRef,
} from '../services/payments.js';
import { PLANS, SUBACCOUNT_PACKS, packsForPlan, planSubAccountMax, planOf } from '../config/plans.js';
import { subAccountLimit, purchasedSubRights } from '../utils/plan.js';
import { config } from '../config/env.js';
import { logActivity } from '../services/activityLog.js';
import { sendMailSafe } from '../services/mailer.js';
import { purchaseSuccessEmail } from '../utils/emailTemplates.js';

const MICRO = 1_000_000;
const usdToMicro = (usd) => Math.round(Number(usd) * MICRO);

// Bakiyeden (kredi) yapılan plan/paket alımında "satın alımın tamamlandı" e-postası (best-effort).
function notifyBalancePurchase(user, itemLabel, orderRef, priceMicro) {
  if (!user?.email) return;
  const mail = purchaseSuccessEmail({
    itemLabel,
    orderRef,
    amountUsd: (Number(priceMicro || 0) / MICRO).toFixed(2).replace(/\.00$/, ''),
    methodLabel: 'Bakiye (kredi)',
    dashboardUrl: `${config.appUrl}/dashboard`,
  });
  sendMailSafe({ to: user.email, ...mail });
}

// Public fatura görünümü
function publicInvoice(p) {
  if (!p) return null;
  return {
    order_ref: p.order_ref,
    intent_kind: p.intent_kind,
    intent_target: p.intent_target,
    network: p.network,
    address: p.address,
    expected_amount_micro: p.expected_amount_micro,
    received_amount_micro: p.received_amount_micro,
    status: p.status,
    txid: p.txid,
    expires_at: p.expires_at,
    created_at: p.created_at,
    paid_at: p.paid_at,
  };
}

// Alt hesap hakları özeti — plana özel paket kataloğu (tekrar alınabilir) + limit + askı sayısı.
function subaccountInfo(u) {
  const baseRights = planOf(u.plan).subAccounts || 0;
  const extraRights = purchasedSubRights(u);
  const packs = packsForPlan(u.plan).map((p) => ({
    key: p.key,
    rights: p.rights,
    price_micro: p.priceMicro,
  }));
  return {
    plan: u.plan,
    limit: subAccountLimit(u),
    default_rights: baseRights,
    extra_rights: extraRights,
    max_rights: planSubAccountMax(u.plan),
    packs,
    suspended_sub_count: u.role === 'owner' ? userModel.countSuspendedSubs(u.id) : 0,
  };
}

export const getWallet = asyncHandler(async (req, res) => {
  const u = userModel.findById(req.user.id);
  res.json({
    balance_micro: u.credits_micro,
    plan: u.plan,
    plan_expires_at: u.plan_expires_at,
    extra_subaccount_packs: u.extra_subaccount_packs,
    sub_limit: subAccountLimit(u),
    subaccount: subaccountInfo(u),
    wallet: await walletInfo(),
    active_invoice: publicInvoice(getActiveInvoice(req.user.id)),
  });
});

export const getLedger = asyncHandler(async (req, res) => {
  res.json({
    txns: walletModel.ledger(req.user.id, 50),
    payments: paymentModel.listByUser(req.user.id, 20).map(publicInvoice),
  });
});

// Demo sayfası için kozmetik cüzdan/QR listesi (gerçek zincir kontrolü yok)
export const getDemoWallets = asyncHandler(async (req, res) => {
  res.json({ demo: config.trc20.demoPayments, wallets: await demoWallets() });
});

// USDT ile ödeme başlat: cüzdan varsa gerçek fatura, yoksa demo anında tahsil
function payViaUsdt(userId, priceMicro, intent) {
  if (walletConfigured()) {
    return { invoice: publicInvoice(createInvoice(userId, priceMicro, intent)) };
  }
  if (config.trc20.demoPayments) {
    const p = demoSettle(userId, priceMicro, intent);
    return { settled: true, invoice: publicInvoice(p), user: userModel.findById(userId) };
  }
  throw badRequest('Ödeme yöntemi kullanılamıyor');
}

// Bakiye yükleme
export const createTopup = asyncHandler(async (req, res) => {
  const micro = usdToMicro(req.body.amount_usd);
  if (!micro || micro <= 0) throw badRequest('Geçerli bir tutar girin', 'amount_usd');
  res.status(201).json({ invoice: publicInvoice(createInvoice(req.user.id, micro, { kind: 'topup' })) });
});

export const demoTopup = asyncHandler(async (req, res) => {
  const micro = usdToMicro(req.body.amount_usd);
  if (!micro || micro <= 0) throw badRequest('Geçerli bir tutar girin', 'amount_usd');
  const p = demoSettle(req.user.id, micro, { kind: 'topup' });
  logActivity({ userId: req.user.id, action: 'credit.demo_load', detail: { amount_micro: micro }, ip: req.ip });
  res.status(201).json({ invoice: publicInvoice(p), user: userModel.findById(req.user.id) });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const p = paymentModel.findByRef(req.params.ref);
  if (!p || p.user_id !== req.user.id) throw notFound('Fatura bulunamadı');
  res.json({ invoice: publicInvoice(p) });
});

export const cancelInvoiceCtrl = asyncHandler(async (req, res) => {
  const ok = cancelInvoice(req.params.ref, req.user.id);
  if (!ok) throw notFound('İptal edilecek aktif fatura bulunamadı');
  res.json({ ok: true });
});

// Plan satın al — method: 'balance' | 'usdt'
export const purchasePlan = asyncHandler(async (req, res) => {
  const plan = req.body.plan;
  const method = req.body.method || 'balance';
  if (!PLANS[plan] || plan === 'free') throw badRequest('Geçersiz plan', 'plan');

  // Düşürme (downgrade) her iki ödeme yolunda da ÖDEMEDEN ÖNCE reddedilir → USDT'de "öde ama
  // uygulanamaz" durumu oluşmaz. assertUpgradeAllowed süresi dolmuş planı da hesaba katar.
  assertUpgradeAllowed(userModel.findById(req.user.id), plan);

  if (method === 'balance') {
    const orderRef = walletOrderRef(); // bakiyeden ödemeye de gerçek sipariş no
    const { user } = buyPlan(req.user.id, plan, { ref: orderRef });
    logActivity({ userId: req.user.id, action: 'plan.purchase', detail: { plan, method: 'balance', order_ref: orderRef, price_micro: PLANS[plan].priceMicro }, ip: req.ip });
    notifyBalancePurchase(user, `${PLANS[plan].label} planı`, orderRef, PLANS[plan].priceMicro);
    return res.json({ user, order_ref: orderRef });
  }
  return res.status(201).json(payViaUsdt(req.user.id, PLANS[plan].priceMicro, { kind: 'plan', target: plan }));
});

// Ek alt hesap hakkı paketi — packKey plana bağlı, plan tavanına kadar TEKRAR alınabilir; method: 'balance' | 'usdt'
export const purchaseSubPack = asyncHandler(async (req, res) => {
  const method = req.body.method || 'balance';
  const packKey = req.body.pack;
  const pack = SUBACCOUNT_PACKS[packKey];
  if (!pack) throw badRequest('Geçersiz paket', 'pack');
  // Plan-eşleşme + tavan kuralları buySubPack içinde de zorlanır. Burada ÖDEME-ÖNCESİ erken kontrol
  // (purchasePlan'daki assertUpgradeAllowed ile simetrik): USDT yolunda "öde ama uygulanamaz" durumunu
  // önler → tavandaki kullanıcı boşa fatura açıp ödemez, niyet sonsuz retry'a takılmaz.
  if (req.user.plan !== pack.plan) throw forbidden(`Bu paket yalnızca ${PLANS[pack.plan].label} planında satın alınabilir.`);
  const cap = planSubAccountMax(req.user.plan);
  if ((planOf(req.user.plan).subAccounts || 0) + purchasedSubRights(req.user) + pack.rights > cap) {
    throw forbidden(`Bu paket ${cap} alt hesap tavanınızı aşıyor.`);
  }

  if (method === 'balance') {
    const orderRef = walletOrderRef();
    const { user } = buySubPack(req.user.id, packKey, { ref: orderRef });
    logActivity({ userId: req.user.id, action: 'subpack.purchase', detail: { method: 'balance', pack: packKey, rights: pack.rights, order_ref: orderRef, price_micro: pack.priceMicro }, ip: req.ip });
    notifyBalancePurchase(user, `+${pack.rights} alt hesap hakkı`, orderRef, pack.priceMicro);
    return res.json({ user, order_ref: orderRef });
  }
  return res.status(201).json(payViaUsdt(req.user.id, pack.priceMicro, { kind: 'subpack', target: packKey }));
});
