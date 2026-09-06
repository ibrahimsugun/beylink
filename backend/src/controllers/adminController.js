import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound } from '../utils/ApiError.js';
import { adminModel } from '../models/adminModel.js';
import { userModel } from '../models/userModel.js';
import { walletModel } from '../models/walletModel.js';
import { logActivity } from '../services/activityLog.js';
import { PLANS, PLAN_DURATION_DAYS, MICRO } from '../config/plans.js';

// SQLite datetime formatı (UTC): 'YYYY-MM-DD HH:MM:SS'
function fmtUtc(ms) {
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

export const getStats = asyncHandler(async (_req, res) => {
  res.json(adminModel.stats());
});

export const getUsers = asyncHandler(async (req, res) => {
  res.json({ users: adminModel.listUsers(req.query.q || ''), plans: Object.keys(PLANS) });
});

// Kullanıcının planını düzenle (admin). Süreyi de yaz: ücretli → now+30 gün, Free → NULL.
export const changeUserPlan = asyncHandler(async (req, res) => {
  const target = adminModel.findUser(Number(req.params.id));
  if (!target) throw notFound('Kullanıcı bulunamadı');
  const plan = req.body.plan;
  if (!PLANS[plan]) throw badRequest('Geçersiz plan', 'plan');

  const expiresAt = plan === 'free' ? null : fmtUtc(Date.now() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const user = userModel.updatePlan(target.id, plan, expiresAt);
  logActivity({
    userId: req.user.id,
    action: 'admin.plan_change',
    detail: { targetUserId: target.id, targetEmail: target.email, from: target.plan, to: plan },
    ip: req.ip,
  });
  res.json({ user });
});

/**
 * Kullanıcının 2FA'sını (TOTP) sıfırlar (admin). Yalnız özel durumlar için (kullanıcı
 * authenticator erişimini kaybederse). `disableTotp` secret'ı NULL'lar + totp_enabled=0 yapar;
 * dönen user PUBLIC_COLS olduğu için totp_secret ASLA response'a girmez.
 */
export const resetUser2fa = asyncHandler(async (req, res) => {
  const target = adminModel.findUser(Number(req.params.id));
  if (!target) throw notFound('Kullanıcı bulunamadı');

  const user = userModel.disableTotp(target.id);
  logActivity({
    userId: req.user.id,
    action: 'admin.totp_reset',
    detail: { targetUserId: target.id, targetEmail: target.email },
    ip: req.ip,
  });

  res.json({ user });
});

export const getLogs = asyncHandler(async (req, res) => {
  res.json({
    logs: adminModel.logs({
      limit: req.query.limit,
      action: req.query.action || '',
      category: req.query.category || '', // '', 'activity', 'credit'
    }),
  });
});

/**
 * Kullanıcı kredisini MUTLAK olarak set eder (admin). Body: { new_balance_usdt: number|string }.
 * Fark walletModel.apply ile uygulanır → ledger'a `admin.credit_adjust` satırı yazılır (atomik + izlenebilir).
 * Negatif değer + Number olmayan reddedilir; fark 0 ise 400.
 */
export const adjustUserCredits = asyncHandler(async (req, res) => {
  const target = adminModel.findUserFull(Number(req.params.id));
  if (!target) throw notFound('Kullanıcı bulunamadı');

  const raw = req.body?.new_balance_usdt;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) throw badRequest('Geçersiz bakiye', 'new_balance_usdt');

  // USDT (ondalıklı) → mikro (tam sayı). Float sapmalarına karşı yuvarlanır.
  const newMicro = Math.round(n * MICRO);
  const delta = newMicro - target.credits_micro;
  if (delta === 0) throw badRequest('Bakiye zaten bu değerde', 'new_balance_usdt');

  const { balance_after_micro } = walletModel.apply(
    target.id,
    delta,
    'admin.credit_adjust',
    `admin:${req.user.id}`,
  );

  logActivity({
    userId: req.user.id,
    action: 'admin.credit_adjust',
    detail: {
      targetUserId: target.id,
      targetEmail: target.email,
      from_micro: target.credits_micro,
      to_micro: balance_after_micro,
      delta_micro: delta,
      note: (req.body?.note || '').toString().slice(0, 200) || null,
    },
    ip: req.ip,
  });

  res.json({ user_id: target.id, balance_micro: balance_after_micro });
});
