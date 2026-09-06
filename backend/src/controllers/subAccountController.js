import { userModel } from '../models/userModel.js';
import { profileModel } from '../models/profileModel.js';
import { hashPassword } from '../utils/hash.js';
import { badRequest, conflict, notFound, forbidden } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { normalizeSlug, isValidSlug, uniqueSlug } from '../utils/slug.js';
import { subAccountLimit } from '../utils/plan.js';

const DEFAULT_THEME = {
  template: 'wave',
  colors: { primary: '#6D3BEA', accent: '#12C4B0' },
  buttonStyle: 'rounded',
  header_type: 'avatar',
  title_align: 'center',
  layout: 'single',
  header_icons: ['qr', 'share'],
};

// Owner'a ait olduğunu doğrula
function assertOwnedSub(ownerId, subId) {
  const sub = userModel.findById(Number(subId));
  if (!sub || sub.role !== 'sub') throw notFound('Alt hesap bulunamadı');
  if (sub.parent_user_id !== ownerId) throw forbidden('Bu alt hesap size ait değil');
  return sub;
}

export const listSubAccounts = asyncHandler(async (req, res) => {
  const subs = userModel.listSubAccounts(req.user.id).map((s) => ({
    ...s,
    profile: profileModel.findByUserId(s.id),
  }));
  res.json({ subAccounts: subs });
});

export const createSubAccount = asyncHandler(async (req, res) => {
  // Alt hesap limiti = plan tabanı + satın alınan (kalıcı) haklar; Free'de 0.
  const limit = subAccountLimit(req.user);
  if (limit <= 0) throw forbidden('Alt hesap hakkınız yok. Planınızı yükseltin veya ek alt hesap hakkı satın alın.');
  if (userModel.countSubAccounts(req.user.id) >= limit) {
    throw forbidden(`Alt hesap limitiniz dolu (${limit}). Ek hak paketi alarak artırabilirsiniz.`);
  }

  const { username, password, display_name } = req.body;
  if (!username) throw badRequest('Kullanıcı adı gerekli', 'username');
  if (!password || password.length < 6) throw badRequest('Şifre en az 6 karakter olmalı', 'password');

  const login = normalizeSlug(username);
  if (!isValidSlug(login)) throw badRequest('Kullanıcı adı 3-30 karakter olmalı (harf, rakam, . _ -)', 'username');
  if (userModel.usernameExists(login)) throw conflict('Bu kullanıcı adı alınmış', 'username');

  // Profil slug: login ile aynı olmaya çalış, çakışırsa benzersizleştir
  const profileSlug = profileModel.usernameExists(login) ? uniqueSlug(login) : login;

  const passwordHash = await hashPassword(password);
  const sub = userModel.createSub({ username: login, passwordHash, parentUserId: req.user.id });
  const profile = profileModel.create({
    userId: sub.id,
    username: profileSlug,
    displayName: display_name || login,
    bio: '',
    theme: DEFAULT_THEME,
  });

  res.status(201).json({ subAccount: { ...sub, profile } });
});

export const updateSubAccount = asyncHandler(async (req, res) => {
  const sub = assertOwnedSub(req.user.id, req.params.id);
  const patch = {};

  if (req.body.username !== undefined) {
    const login = normalizeSlug(req.body.username);
    if (!isValidSlug(login)) throw badRequest('Geçersiz kullanıcı adı', 'username');
    if (login !== sub.username && userModel.usernameExists(login)) throw conflict('Bu kullanıcı adı alınmış', 'username');
    patch.username = login;
  }
  if (req.body.password !== undefined && req.body.password !== '') {
    if (req.body.password.length < 6) throw badRequest('Şifre en az 6 karakter olmalı', 'password');
    patch.passwordHash = await hashPassword(req.body.password);
  }
  if (req.body.is_active !== undefined) patch.isActive = !!req.body.is_active;
  if (req.body.can_edit_profile !== undefined) patch.canEditProfile = !!req.body.can_edit_profile;

  const updated = userModel.updateSubCredentials(sub.id, patch);
  res.json({ subAccount: { ...updated, profile: profileModel.findByUserId(sub.id) } });
});

export const deleteSubAccount = asyncHandler(async (req, res) => {
  const sub = assertOwnedSub(req.user.id, req.params.id);
  userModel.remove(sub.id); // profiller/linkler CASCADE ile silinir
  res.json({ ok: true });
});

// Premium yenilendikten sonra — kullanıcı onayıyla TÜM askıdaki alt hesapları tekrar aktifleştir.
// Owner premium değilse (Free) reaktivasyon anlamsız → 403 (bir sonraki istekte tekrar askıya alınırdı).
export const reactivateAllSubs = asyncHandler(async (req, res) => {
  if (req.user.plan === 'free') {
    throw forbidden('Alt hesapları aktifleştirmek için önce premium bir plan almanız gerekir.');
  }
  const count = userModel.reactivateSubs(req.user.id);
  res.json({ ok: true, reactivated: count });
});
