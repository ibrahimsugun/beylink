import QRCode from 'qrcode';
import db from '../db/connection.js';
import { config } from '../config/env.js';
import { paymentModel } from '../models/paymentModel.js';
import { walletModel } from '../models/walletModel.js';
import { userModel } from '../models/userModel.js';
import { buyPlan, buySubPack } from './purchases.js';
import { badRequest, ApiError } from '../utils/ApiError.js';
import { logActivity } from './activityLog.js';
import { sendMailSafe } from './mailer.js';
import { paymentSuccessEmail, paymentFailedEmail, purchaseSuccessEmail } from '../utils/emailTemplates.js';
import { PLANS, SUBACCOUNT_PACKS } from '../config/plans.js';

const T = config.trc20;
const MICRO = 1_000_000;

export function walletConfigured() {
  return !!T.walletAddress;
}

// ---- Sipariş no + benzersiz tutar --------------------------------------------
function pad(n) { return String(n).padStart(2, '0'); }
function orderRefCandidate() {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  let rnd = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 6; i++) rnd += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `BL-${ymd}-${rnd}`;
}
function uniqueOrderRef() {
  for (let i = 0; i < 12; i++) {
    const ref = orderRefCandidate();
    if (!paymentModel.findByRef(ref)) return ref;
  }
  throw new Error('order_ref üretilemedi');
}

// Bakiyeden (wallet) ödemeler için sipariş no — payments VE balance_txns.ref'e karşı benzersiz.
// Balance alımları payments tablosuna satır yazmaz; sipariş no yalnız ledger'da (ref) izlenir.
export function walletOrderRef() {
  for (let i = 0; i < 12; i++) {
    const ref = orderRefCandidate();
    const inLedger = db.prepare(`SELECT 1 FROM balance_txns WHERE ref = ? LIMIT 1`).get(ref);
    if (!paymentModel.findByRef(ref) && !inLedger) return ref;
  }
  throw new Error('order_ref üretilemedi');
}

// Aktif pending faturalar arasında tutarı tekilleştir (skill: benzersiz-tutar tuzu).
// Böylece gelen bir ödeme tek bir faturaya birebir eşleşir.
function uniqueExpectedMicro(baseMicro) {
  for (let i = 0; i < 10000; i++) {
    const salt = Math.floor(Math.random() * 10000); // 0..9999 micro (≤ 0.01 USDT)
    const amt = baseMicro + salt;
    if (!paymentModel.amountInUse(amt)) return amt;
  }
  throw new Error('Benzersiz tutar üretilemedi');
}

// ---- Fatura oluşturma --------------------------------------------------------
export function createInvoice(userId, baseAmountMicro, intent = { kind: 'topup', target: null }) {
  const base = Math.trunc(Number(baseAmountMicro) || 0);
  if (base < T.minUsd * MICRO) throw badRequest(`En az ${T.minUsd} USDT yüklenebilir`);
  if (base > T.maxUsd * MICRO) throw badRequest(`En fazla ${T.maxUsd} USDT yüklenebilir`);
  if (!walletConfigured()) {
    throw new ApiError(503, 'Gerçek USDT ödemesi şu an yapılandırılmadı (cüzdan adresi yok).');
  }
  const expected = uniqueExpectedMicro(base);
  const payment = paymentModel.create({
    userId,
    orderRef: uniqueOrderRef(),
    intentKind: intent.kind || 'topup',
    intentTarget: intent.target || null,
    address: T.walletAddress,
    expectedMicro: expected,
    ttlMinutes: T.ttlMinutes,
  });
  return payment;
}

// ---- E-posta bildirimleri (best-effort — sendMailSafe asla throw etmez, akışı bozmaz) --------
const usdStr = (micro) => (Number(micro || 0) / MICRO).toFixed(2).replace(/\.00$/, '');
const dashUrl = () => `${config.appUrl}/dashboard`;
const isDemoPayment = (p) => p?.address === 'DEMO' || String(p?.txid || '').startsWith('DEMO-');

function intentLabel(payment) {
  if (payment.intent_kind === 'plan') return `${PLANS[payment.intent_target]?.label || payment.intent_target} planı`;
  if (payment.intent_kind === 'subpack') {
    const pack = SUBACCOUNT_PACKS[payment.intent_target];
    return pack ? `+${pack.rights} alt hesap hakkı` : String(payment.intent_target || '');
  }
  return String(payment.intent_target || '');
}

// Kredi yükleme (topup) tahsil edildi → "ödemen tamamlandı"
function notifyTopupSettled(payment, receivedMicro) {
  if (isDemoPayment(payment)) return; // demo (admin test) → bildirim yok
  const u = userModel.findById(payment.user_id);
  if (!u?.email) return;
  const mail = paymentSuccessEmail({
    amountUsd: usdStr(receivedMicro),
    orderRef: payment.order_ref,
    balanceUsd: usdStr(u.credits_micro),
    dashboardUrl: dashUrl(),
  });
  sendMailSafe({ to: u.email, ...mail });
}

// Plan/paket niyeti uygulandı → "satın alımın tamamlandı"
function notifyPurchaseApplied(payment) {
  if (isDemoPayment(payment)) return;
  const u = userModel.findById(payment.user_id);
  if (!u?.email) return;
  const mail = purchaseSuccessEmail({
    itemLabel: intentLabel(payment),
    orderRef: payment.order_ref,
    amountUsd: usdStr(payment.expected_amount_micro),
    methodLabel: 'USDT (TRC-20)',
    dashboardUrl: dashUrl(),
  });
  sendMailSafe({ to: u.email, ...mail });
}

// Fatura süresi doldu (TTL) → "ödemen tamamlanamadı". Kullanıcı iptali TETİKLEMEZ (kasıtlı).
function notifyPaymentExpired(payment) {
  const u = userModel.findById(payment.user_id);
  if (!u?.email) return;
  const mail = paymentFailedEmail({
    orderRef: payment.order_ref,
    amountUsd: usdStr(payment.expected_amount_micro),
    dashboardUrl: dashUrl(),
  });
  sendMailSafe({ to: u.email, ...mail });
}

// Niyet (plan/paket) uygula — best-effort. Kredi zaten yazıldığı için hata parayı
// silmez; başarısızsa intent_applied=0 kalır ve poller retryIntents ile tekrar dener.
function applyIntent(payment) {
  if (payment.intent_kind !== 'plan' && payment.intent_kind !== 'subpack') return;
  try {
    if (payment.intent_kind === 'plan') buyPlan(payment.user_id, payment.intent_target, { ref: payment.order_ref });
    else buySubPack(payment.user_id, payment.intent_target, { ref: payment.order_ref }); // intent_target = packKey
    paymentModel.markIntentApplied(payment.id);
    // USDT ile alınan plan/paketi de aktivite loguna yaz (balance yolu controller'da loglanır;
    // eskiden USDT'de yalnız credit.topup vardı → plan.purchase/subpack.purchase eksikti).
    logActivity({
      userId: payment.user_id,
      action: payment.intent_kind === 'plan' ? 'plan.purchase' : 'subpack.purchase',
      detail: { method: 'usdt', target: payment.intent_target, order_ref: payment.order_ref },
      ip: null,
    });
    notifyPurchaseApplied(payment); // "satın alımın tamamlandı" e-postası
  } catch (e) {
    // KALICI hata (cap aşımı / downgrade / plan-eşleşme → 403/400): niyet asla uygulanamaz.
    // intent_applied'ı işaretleyip retry'ı DURDUR — kredi bakiyede kalır (settlePayment zaten credit.topup
    // logladı; kullanıcı bakiyeyi başka şeye harcar), sonsuz sessiz retry + "para hapsi" tuzağı olmaz.
    // GEÇİCİ hatada (DB kilidi vb.) intent_applied=0 kalır → poller tekrar dener.
    if (e.status === 403 || e.status === 400) {
      paymentModel.markIntentApplied(payment.id);
      console.error('intent-abandoned', payment.order_ref, e.message);
    } else {
      console.error('intent-apply', payment.order_ref, e.message);
    }
  }
}

// Tahsil edilmiş ama niyeti uygulanmamış ödemeleri yeniden dener (orphan intent kurtarma)
function retryIntents() {
  for (const p of paymentModel.listUnappliedIntents()) applyIntent(p);
}

// ---- Ödemeyi tahsil et (idempotent) -----------------------------------------
// markPaid CAS krediyi tek sefere sabitler (para her zaman güvende); intent best-effort.
function settlePayment(payment, { txid, receivedMicro }) {
  const credited = db.transaction(() => {
    const ok = paymentModel.markPaid(payment.id, txid, receivedMicro);
    if (!ok) return false; // zaten tahsil edilmiş / iptal — çift kredi yok
    walletModel.apply(payment.user_id, receivedMicro, `topup:${payment.order_ref}`, payment.order_ref);
    return true;
  })();
  if (!credited) return false;
  // Gerçek zincir tahsilatını logla (sistem olayı, req yok → ip:null).
  // Demo, controller'da 'credit.demo_load' ile loglanır → burada çift saymayı önle.
  if (!String(txid).startsWith('DEMO-')) {
    logActivity({
      userId: payment.user_id,
      action: 'credit.topup',
      detail: { amount_micro: receivedMicro, order_ref: payment.order_ref, intent: payment.intent_kind, txid },
      ip: null,
    });
  }
  applyIntent(payment);
  // Kredi yükleme (topup) → "ödemen tamamlandı" e-postası. Plan/paket satın alımının bildirimi
  // applyIntent içinde (notifyPurchaseApplied) gönderilir → çift e-posta olmaz.
  if (payment.intent_kind === 'topup') notifyTopupSettled(payment, receivedMicro);
  return true;
}

// ---- Demo mod (anında kredi — istemciye güvenir, prototip) --------------------
export function demoSettle(userId, baseAmountMicro, intent = { kind: 'topup', target: null }) {
  if (!T.demoPayments) throw new ApiError(403, 'Demo ödeme kapalı');
  const base = Math.trunc(Number(baseAmountMicro) || 0);
  if (base < T.minUsd * MICRO) throw badRequest(`En az ${T.minUsd} USDT yüklenebilir`);
  if (base > T.maxUsd * MICRO) throw badRequest(`En fazla ${T.maxUsd} USDT yüklenebilir`);
  const payment = paymentModel.create({
    userId,
    orderRef: uniqueOrderRef(),
    intentKind: intent.kind || 'topup',
    intentTarget: intent.target || null,
    address: 'DEMO',
    expectedMicro: base,
    ttlMinutes: T.ttlMinutes,
  });
  settlePayment(payment, { txid: `DEMO-${payment.order_ref}`, receivedMicro: base });
  return paymentModel.findById(payment.id);
}

// ---- TronGrid okuma ----------------------------------------------------------
async function fetchTrc20Transfers(minTimestampMs) {
  const url = new URL(`https://api.trongrid.io/v1/accounts/${T.walletAddress}/transactions/trc20`);
  url.searchParams.set('only_to', 'true');
  url.searchParams.set('only_confirmed', 'true'); // FINALITY GATE — per-tx `confirmed` alanı YOK
  url.searchParams.set('limit', '50');
  url.searchParams.set('order_by', 'block_timestamp,asc');
  if (minTimestampMs > 0) url.searchParams.set('min_timestamp', String(minTimestampMs));
  const headers = { accept: 'application/json' };
  if (T.trongridApiKey) headers['TRON-PRO-API-KEY'] = T.trongridApiKey;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`TronGrid ${res.status}`); // hata → pollTron yakalar, lastMinTs ilerlemez (retry)
  const body = await res.json();
  return Array.isArray(body?.data) ? body.data : [];
}

// Güvenlik sırası önemli: kontrat whitelist → alıcı → tutar eşleşme → idempotent kredi
function processTransfer(tx) {
  if (!tx || tx.token_info?.address !== T.usdtContract) return; // sahte-token saldırısını öldürür
  if (tx.to !== T.walletAddress) return;
  const value = Number(tx.value);
  if (!Number.isFinite(value) || value <= 0) return;
  const payment = paymentModel.findPendingByAmount(value);
  if (!payment) return;
  settlePayment(payment, { txid: tx.transaction_id, receivedMicro: value });
}

// ---- Poller ------------------------------------------------------------------
let lastMinTs = 0;
let pollerStarted = false;

async function pollTron() {
  // Aktif (pending + süresi dolmamış) fatura yoksa TronGrid'i HİÇ arama → boş taramalar kesilir,
  // API kotası korunur. Fatura açılınca en geç bir sonraki tick'te (≤30 sn) taramaya başlar.
  // Not: expireStale() bu fonksiyondan ÖNCE çalışır → süresi dolan fatura aynı tick'te aktiflikten düşer.
  if (!paymentModel.hasActivePending()) return;
  const rows = await fetchTrc20Transfers(lastMinTs);
  for (const tx of rows) {
    try {
      processTransfer(tx);
    } catch (e) {
      console.error('processTransfer', e.message);
    }
    const bt = Number(tx.block_timestamp);
    if (Number.isFinite(bt) && bt > lastMinTs) lastMinTs = bt; // geçmişi yeniden taramamak için ilerlet
  }
}

export function startPoller() {
  if (pollerStarted) return;
  if (!walletConfigured()) {
    console.log('ℹ️  USDT poller kapalı (TRC20_WALLET_ADDRESS yok). Demo mod aktif.');
    return;
  }
  pollerStarted = true;
  lastMinTs = Date.now() - 2 * T.ttlMinutes * 60 * 1000; // yeni ödemeleri yakalamak için pencere
  const tick = async () => {
    try {
      // Süresi dolan faturaları expired'a çevir + sahiplerine "ödemen tamamlanamadı" bildir.
      for (const p of paymentModel.expireStaleReturning()) notifyPaymentExpired(p);
      await pollTron();
      retryIntents(); // tahsil edilmiş ama uygulanmamış plan/paket niyetlerini kurtar
    } catch (e) {
      console.error('poller', e.message);
    } finally {
      setTimeout(tick, T.pollIntervalSeconds * 1000); // setInterval değil — hatalar birikmesin
    }
  };
  console.log(`✓ USDT (TRC20) poller çalışıyor → ${T.walletAddress}`);
  setTimeout(tick, 2000);
}

// ---- Yardımcılar (controller kullanır) --------------------------------------
export function cancelInvoice(orderRef, userId) {
  return paymentModel.cancel(orderRef, userId);
}

export function getActiveInvoice(userId) {
  return paymentModel.getActivePending(userId);
}

export async function walletInfo() {
  const address = T.walletAddress || null;
  let qrDataUrl = null;
  if (address) {
    qrDataUrl = await QRCode.toDataURL(address, { width: 320, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } });
  }
  return {
    configured: walletConfigured(),
    demo: T.demoPayments,
    address,
    network: 'TRC20',
    usdtContract: T.usdtContract,
    ttlMinutes: T.ttlMinutes,
    qrDataUrl,
  };
}

// ---- Demo cüzdanlar (yalnızca DEMOÖDEME sayfası görseli için — kozmetik) ------
// Gerçek zincir kontrolü yok; adres/QR sadece arayüz için. Demo ileride kaldırılacak.
const DEMO_WALLETS = [
  { coin: 'BTC', network: 'Bitcoin', address: 'bc1qbeylinkdemo0xqf9z7k3v5n8m2p4w6r0demo' },
  { coin: 'ETH', network: 'ERC-20', address: '0xBeyLinkDemo000000000000000000000000DEMO' },
  { coin: 'USDT', network: 'TRC-20', address: T.walletAddress || 'TBeyLinkDemoUSDT0000000000000000000DEMO' },
];

export async function demoWallets() {
  return Promise.all(
    DEMO_WALLETS.map(async (w) => ({
      ...w,
      qrDataUrl: await QRCode.toDataURL(w.address, { width: 320, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } }),
    }))
  );
}
