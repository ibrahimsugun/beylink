import QRCode from 'qrcode';
import { userModel } from '../models/userModel.js';
import { profileModel } from '../models/profileModel.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signToken, signChallenge, verifyToken } from '../utils/jwt.js';
import { generateSecret, verifyTotp, totpUri } from '../utils/totp.js';
import { badRequest, conflict, unauthorized, tooManyRequests } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { normalizeSlug, isValidSlug, uniqueSlug } from '../utils/slug.js';
import { logActivity } from '../services/activityLog.js';
import { isBlocked, recordFailure, clearAttempts } from '../utils/rateLimit.js';
import { authTokenModel } from '../models/authTokenModel.js';
import { generateToken, hashToken, generateCode, hashCode } from '../utils/token.js';
import { sendMail, sendMailSafe, exposeDemoToken } from '../services/mailer.js';
import { verificationEmail, passwordResetEmail, welcomeEmail } from '../utils/emailTemplates.js';
import { config } from '../config/env.js';

const EMAIL_VERIFY_TTL_MIN = 15; // kod ve link 15 dk geçerli

const DEFAULT_THEME = {
  template: 'wave',
  background: 'gradient',
  colors: { primary: '#6D3BEA', accent: '#12C4B0' },
  buttonStyle: 'rounded',
  header_type: 'avatar',
  title_align: 'center',
  layout: 'single',
  header_icons: ['qr', 'share'],
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issue(user) {
  // tv = token_version → şifre değişince artar; requireAuth eski tokenları reddeder (oturum geçersizleştirme)
  const token = signToken({ sub: user.id, tv: user.token_version || 0 });
  const profile = profileModel.findByUserId(user.id);
  return { token, user, profile };
}

// E-posta doğrulama — link token'ı VE 6 haneli kod üret (tek satır), ikisi de 15 dk geçerli.
// Profesyonel e-posta gönderir (link + kod). Demo ifşa için ham token + kodu döndürür.
async function issueEmailVerification(user) {
  if (!user?.email) return null;
  authTokenModel.invalidateUserKind(user.id, 'email_verify');
  const { raw, hash } = generateToken();
  const code = generateCode();
  authTokenModel.create({
    userId: user.id,
    kind: 'email_verify',
    tokenHash: hash,
    codeHash: hashCode(code, user.id),
    ttlMinutes: EMAIL_VERIFY_TTL_MIN,
  });
  const link = `${config.appUrl}/verify-email?token=${raw}`;
  const { subject, text, html } = verificationEmail({ code, link, ttlMin: EMAIL_VERIFY_TTL_MIN });
  await sendMail({ to: user.email, subject, text, html });
  return { raw, code };
}

// E-posta onaylanınca "hoş geldin" bildirimi (best-effort — asla akışı bozmaz).
async function sendWelcome(userId) {
  const u = userModel.findById(userId);
  if (!u?.email) return;
  const profile = profileModel.findByUserId(userId);
  const mail = welcomeEmail({ name: profile?.display_name || null, dashboardUrl: `${config.appUrl}/dashboard` });
  await sendMailSafe({ to: u.email, ...mail });
}

export const register = asyncHandler(async (req, res) => {
  // Kötüye kullanım koruması — IP başına "kayıtlı mı?" çakışma (409) denemelerini sınırla.
  // Yalnız çakışma yolunda sayılır (benzersiz kayıt 201 SAYILMAZ) → gerçek kullanıcı engellenmez,
  // ama aynı IP'den e-posta/slug numaralandırması (enumeration) yaparak hesap taraması durur.
  const rlKey = `register:${req.ip}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla kayıt denemesi. Lütfen birkaç dakika sonra tekrar deneyin.');

  // E-postayı normalize et (küçük harf + trim) → saklanan kimlik = admin yetki kontrolündeki
  // (requireAdmin) canonical değer. Büyük/küçük harf farkıyla ikinci hesap açıp admin taklidi engellenir.
  const email = (req.body.email || '').trim().toLowerCase();
  const { password } = req.body;
  if (!email || !emailRe.test(email)) throw badRequest('Geçerli bir e-posta girin', 'email');
  if (!password || password.length < 6) throw badRequest('Şifre en az 6 karakter olmalı', 'password');
  if (userModel.emailExists(email)) { recordFailure(rlKey); throw conflict('Bu e-posta zaten kayıtlı', 'email'); }

  // Profil slug: verilmişse doğrula, yoksa e-postadan türet
  let slug = req.body.username ? normalizeSlug(req.body.username) : uniqueSlug(email.split('@')[0]);
  if (req.body.username && !isValidSlug(slug)) {
    throw badRequest('Kullanıcı adı 3-30 karakter olmalı (harf, rakam, . _ -)', 'username');
  }
  if (profileModel.usernameExists(slug)) { recordFailure(rlKey); throw conflict('Bu kullanıcı adı alınmış', 'username'); }

  const passwordHash = await hashPassword(password);
  const user = userModel.createOwner({ email, passwordHash });
  const profile = profileModel.create({
    userId: user.id,
    username: slug,
    displayName: email.split('@')[0],
    bio: '',
    theme: DEFAULT_THEME,
  });
  // Yeni hesap e-postası doğrulanana kadar profil YAYINDA DEĞİL — kullanıcı sayfasını hazırlar,
  // e-postasını onayladıktan sonra kendisi aktif eder (Yayın Durumu toggle'ı). Onaysız yayınlanamaz.
  profileModel.update(profile.id, { is_published: false });

  logActivity({ userId: user.id, action: 'auth.register', detail: { email, username: slug }, ip: req.ip });
  await issueEmailVerification(user).catch(() => {}); // doğrulama e-postası (demo: konsol); login'i engellemez
  res.status(201).json(issue(user));
});

export const login = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier || req.body.email || req.body.username;
  const { password } = req.body;
  if (!identifier || !password) throw badRequest('Kullanıcı adı/e-posta ve şifre gerekli');

  // Brute-force koruması — IP başına hatalı giriş denemelerini sınırla (parola doğrulanınca sıfırlanır)
  const rlKey = `login:${req.ip}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla hatalı giriş denemesi. Lütfen birkaç dakika sonra tekrar deneyin.');

  const isEmail = emailRe.test(identifier);
  let record;
  if (isEmail) {
    record = userModel.findByEmailWithHash(identifier);
  } else {
    record =
      userModel.findByUsernameWithHash(identifier) || // alt hesap (users.username)
      userModel.findByProfileUsernameWithHash(identifier); // owner (profil slug)
  }

  if (!record) {
    recordFailure(rlKey);
    // Anonim log — kimliği doğrulayamadığımız için userId null; identifier'ı ifşa etmeyiz (yalnız reason).
    logActivity({ userId: null, action: 'auth.login_failed', detail: { reason: 'unknown_email', via: isEmail ? 'email' : 'username' }, ip: req.ip });
    throw unauthorized('Giriş bilgileri hatalı');
  }
  const ok = await verifyPassword(password, record.password_hash);
  if (!ok) {
    recordFailure(rlKey);
    // userId biliyoruz (kimlik var, parola yanlış) — hesabın peşine düşen atağı görmek için değerli.
    logActivity({ userId: record.id, action: 'auth.login_failed', detail: { reason: 'password_wrong', via: isEmail ? 'email' : 'username' }, ip: req.ip });
    throw unauthorized('Giriş bilgileri hatalı');
  }
  if (record.is_active === 0) {
    logActivity({ userId: record.id, action: 'auth.login_failed', detail: { reason: 'inactive' }, ip: req.ip });
    throw unauthorized('Hesabınız pasif durumda. Lütfen yöneticinize başvurun.');
  }

  clearAttempts(rlKey); // parola doğru → sayaç sıfırla

  // 2FA etkinse: oturum tokenı verilmez; kısa ömürlü challenge tokenı ile 2. adıma geçilir.
  if (record.totp_enabled === 1 && record.totp_secret) {
    logActivity({ userId: record.id, action: 'auth.2fa_challenge', detail: { via: isEmail ? 'email' : 'username' }, ip: req.ip });
    return res.json({ requires_2fa: true, challenge: signChallenge({ sub: record.id }) });
  }

  const user = userModel.findById(record.id);
  logActivity({ userId: user.id, action: 'auth.login', detail: { via: isEmail ? 'email' : 'username' }, ip: req.ip });
  res.json(issue(user));
});

// 2FA giriş 2. adımı — login'den dönen challenge tokenı + TOTP kodu ile oturum verilir.
// Auth GEREKMEZ (henüz oturum yok); güven challenge tokenının pending_2fa imzasından gelir.
export const verify2fa = asyncHandler(async (req, res) => {
  const { challenge, code } = req.body;
  if (!challenge || !code) throw badRequest('Doğrulama kodu gerekli', 'code');

  // 'challenge_invalid' kodu istemciye "challenge artık kullanılamaz → 1. adıma dön" der
  // (yanlış koddan ayırt edilir; yanlış kod kullanıcıyı kod ekranında tutar).
  let payload;
  try {
    payload = verifyToken(challenge);
  } catch {
    throw unauthorized('Oturum süresi doldu, tekrar giriş yapın', 'challenge_invalid');
  }
  if (!payload?.pending_2fa || !payload.sub) throw unauthorized('Geçersiz doğrulama isteği', 'challenge_invalid');

  const record = userModel.findByIdWithHash(payload.sub);
  if (!record || record.totp_enabled !== 1 || !record.totp_secret) throw unauthorized('Geçersiz doğrulama isteği', 'challenge_invalid');
  if (record.is_active === 0) throw unauthorized('Hesabınız pasif durumda. Lütfen yöneticinize başvurun.');

  // Brute-force koruması: kullanıcı başına başarısız 2FA denemelerini sınırla.
  // 2FA parolası ele geçmiş bir hesabı korur → doğrulama adımı throttle edilmezse anlamını yitirir.
  const rlKey = `2fa:${record.id}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla hatalı deneme. Lütfen birkaç dakika sonra tekrar deneyin.');
  if (!verifyTotp(record.totp_secret, code)) {
    recordFailure(rlKey);
    logActivity({ userId: record.id, action: 'auth.login_failed', detail: { reason: '2fa_wrong' }, ip: req.ip });
    throw unauthorized('Doğrulama kodu hatalı');
  }
  clearAttempts(rlKey);

  const user = userModel.findById(record.id);
  logActivity({ userId: user.id, action: 'auth.login', detail: { via: '2fa' }, ip: req.ip });
  res.json(issue(user));
});

// 2FA kurulum — secret üret (henüz etkin değil), otpauth URI + QR dataURL döndür.
export const setup2fa = asyncHandler(async (req, res) => {
  const record = userModel.findByIdWithHash(req.user.id);
  if (record?.totp_enabled === 1) throw badRequest('İki adımlı doğrulama zaten etkin');

  const secret = generateSecret();
  userModel.setTotpSecret(req.user.id, secret);

  const label = req.user.email || req.user.username || `user-${req.user.id}`;
  const uri = totpUri(secret, label);
  const qr = await QRCode.toDataURL(uri, { width: 240, margin: 1, color: { dark: '#1B2340', light: '#FFFFFF' } });
  res.json({ secret, otpauth_uri: uri, qr });
});

// 2FA etkinleştir — kurulumdaki secret'a karşı kodu doğrula → totp_enabled = 1.
export const enable2fa = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw badRequest('Doğrulama kodu gerekli', 'code');

  // Brute-force koruması — kurulum kodu (TOTP) deneme-yanılma ile bulunamasın.
  const rlKey = `2fa_enable:${req.user.id}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla hatalı deneme. Lütfen birkaç dakika sonra tekrar deneyin.');

  const record = userModel.findByIdWithHash(req.user.id);
  if (!record?.totp_secret) throw badRequest('Önce 2FA kurulumunu başlatın');
  if (record.totp_enabled === 1) throw badRequest('İki adımlı doğrulama zaten etkin');
  if (!verifyTotp(record.totp_secret, code)) { recordFailure(rlKey); throw unauthorized('Doğrulama kodu hatalı'); }
  clearAttempts(rlKey);

  userModel.enableTotp(req.user.id);
  logActivity({ userId: req.user.id, action: 'auth.2fa_enable', ip: req.ip });
  res.json({ ok: true, totp_enabled: 1 });
});

// 2FA devre dışı bırak — şifre VEYA güncel TOTP kodu ile doğrula → secret temizle.
export const disable2fa = asyncHandler(async (req, res) => {
  const { password, code } = req.body;
  if (!password && !code) throw badRequest('Şifre veya doğrulama kodu gerekli');

  // Brute-force koruması — ele geçmiş oturumda şifre/TOTP deneyerek 2FA sökülemesin
  // (2FA'nın tüm amacı: oturum ele geçse bile ikinci faktör olmadan hesap teslim edilmesin).
  const rlKey = `2fa_disable:${req.user.id}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla hatalı deneme. Lütfen birkaç dakika sonra tekrar deneyin.');

  const record = userModel.findByIdWithHash(req.user.id);
  if (!record || record.totp_enabled !== 1) throw badRequest('İki adımlı doğrulama zaten kapalı');

  let ok = false;
  if (password) ok = await verifyPassword(password, record.password_hash);
  if (!ok && code) ok = verifyTotp(record.totp_secret, code);
  if (!ok) { recordFailure(rlKey); throw unauthorized('Şifre veya doğrulama kodu hatalı'); }
  clearAttempts(rlKey);

  userModel.disableTotp(req.user.id);
  logActivity({ userId: req.user.id, action: 'auth.2fa_disable', ip: req.ip });
  res.json({ ok: true, totp_enabled: 0 });
});

export const me = asyncHandler(async (req, res) => {
  const profile = profileModel.findByUserId(req.user.id);
  res.json({ user: req.user, profile });
});

// Şifre güncelle — mevcut şifreyi doğrular, yeni şifreyi hash'ler
export const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) throw badRequest('Mevcut ve yeni şifre gerekli');
  if (new_password.length < 6) throw badRequest('Yeni şifre en az 6 karakter olmalı', 'new_password');

  // Brute-force koruması — ele geçmiş/açık kalmış oturumda mevcut şifre deneme-yanılma ile bulunamasın.
  const rlKey = `pwchange:${req.user.id}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla hatalı deneme. Lütfen birkaç dakika sonra tekrar deneyin.');

  const record = userModel.findByIdWithHash(req.user.id);
  if (!record) throw unauthorized('Kullanıcı bulunamadı');
  const ok = await verifyPassword(current_password, record.password_hash);
  if (!ok) { recordFailure(rlKey); throw unauthorized('Mevcut şifre hatalı'); }
  clearAttempts(rlKey);

  const passwordHash = await hashPassword(new_password);
  const updated = userModel.updatePassword(req.user.id, passwordHash);
  logActivity({ userId: req.user.id, action: 'auth.password_change', ip: req.ip });
  // token_version arttı → diğer oturumlar geçersiz; kullanıcının KENDİ oturumu düşmesin diye taze token ver
  const token = signToken({ sub: updated.id, tv: updated.token_version || 0 });
  res.json({ ok: true, token });
});

// JWT stateless — logout istemci tarafında token silinerek yapılır
// Logout — client oturumu kendi tarafında düşürür; sunucu tarafında yalnız log yazılır (auditing).
// requireAuth ile korunur → çalınmış tokenlarla sahte logout kaydı oluşturulamaz. userId taşınır.
export const logout = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    logActivity({ userId: req.user.id, action: 'auth.logout', ip: req.ip });
  }
  res.json({ ok: true });
});

// Plan iptali — yalnızca Free'ye düşürme. Yükseltmeler /api/billing üzerinden (ödeme) yapılır.
export const updatePlan = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (plan !== 'free') throw badRequest('Plan yükseltmeleri Cüzdan/Planlar bölümünden yapılır', 'plan');
  const from = req.user?.plan;
  const user = userModel.updatePlan(req.user.id, 'free', null);
  logActivity({ userId: req.user.id, action: 'plan.user_downgrade', detail: { from, to: 'free' }, ip: req.ip });
  res.json({ user });
});

// --- Şifre sıfırlama & e-posta doğrulama (demo: e-posta yerine token yanıtta döner) ---

// "Şifremi unuttum" — DAİMA generic yanıt (hesap varlığı ifşa edilmez). Demo modda token da döner.
export const forgotPassword = asyncHandler(async (req, res) => {
  const identifier = (req.body.identifier || req.body.email || '').trim();
  if (!identifier) throw badRequest('E-posta veya kullanıcı adı gerekli');

  // Kötüye kullanım koruması — IP + hedef kimlik başına istek sınırı (e-posta bombalama/spam'ı önler).
  // Her istekte kaydedilir (hesap var/yok fark etmez → rate-limit üzerinden enumeration de sızmaz).
  const ipKey = `forgot:ip:${req.ip}`;
  const idKey = `forgot:id:${identifier.toLowerCase()}`;
  if (isBlocked(ipKey) || isBlocked(idKey)) throw tooManyRequests('Çok fazla istek. Lütfen birkaç dakika sonra tekrar deneyin.');
  recordFailure(ipKey, { max: 8, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 });
  recordFailure(idKey, { max: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 });

  const isEmail = emailRe.test(identifier);
  const record = isEmail
    ? userModel.findByEmailWithHash(identifier)
    : userModel.findByUsernameWithHash(identifier) || userModel.findByProfileUsernameWithHash(identifier);

  let demoToken = null;
  if (record && record.email) {
    authTokenModel.invalidateUserKind(record.id, 'password_reset');
    const { raw, hash } = generateToken();
    authTokenModel.create({ userId: record.id, kind: 'password_reset', tokenHash: hash, ttlMinutes: 30 });
    const link = `${config.appUrl}/reset-password?token=${raw}`;
    const mail = passwordResetEmail({ link, ttlMin: 30 });
    await sendMailSafe({ to: record.email, ...mail }); // mail hatası generic yanıtı bozmasın
    logActivity({ userId: record.id, action: 'auth.password_reset_request', ip: req.ip });
    demoToken = raw;
  }

  const resp = { ok: true, message: 'Eğer bu hesap kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' };
  if (exposeDemoToken() && demoToken) { resp.demo = true; resp.token = demoToken; }
  res.json(resp);
});

// Token + yeni şifre → şifre güncelle. Token tek kullanımlık + süreli (yalnız hash ile doğrulanır).
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, new_password } = req.body;
  if (!token) throw badRequest('Geçersiz bağlantı', 'token');
  if (!new_password || new_password.length < 6) throw badRequest('Yeni şifre en az 6 karakter olmalı', 'new_password');

  const row = authTokenModel.findValid(hashToken(token), 'password_reset');
  if (!row) throw badRequest('Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama isteyin.', 'token');

  const passwordHash = await hashPassword(new_password);
  userModel.updatePassword(row.user_id, passwordHash);
  authTokenModel.markUsed(row.id);
  authTokenModel.invalidateUserKind(row.user_id, 'password_reset'); // kalan reset tokenlarını da kapat
  logActivity({ userId: row.user_id, action: 'auth.password_reset', ip: req.ip });
  res.json({ ok: true });
});

// E-posta doğrulama linkindeki token → email_verified = 1 (PUBLIC — link farklı cihaz/tarayıcıda açılabilir).
// Güven, tahmin edilemez uzun token'dan gelir (auth gerekmez).
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw badRequest('Geçersiz doğrulama bağlantısı', 'token');

  const row = authTokenModel.findValid(hashToken(token), 'email_verify');
  if (!row) throw badRequest('Doğrulama bağlantısı geçersiz veya süresi dolmuş.', 'token');

  userModel.setEmailVerified(row.user_id);
  authTokenModel.markUsed(row.id);
  logActivity({ userId: row.user_id, action: 'auth.email_verify', detail: { via: 'link' }, ip: req.ip });
  await sendWelcome(row.user_id); // e-posta onaylandı + hoş geldin
  res.json({ ok: true });
});

// E-posta doğrulama 6 haneli KOD ile → email_verified = 1.
// AUTH GEREKİR (kayıt sonrası kullanıcı zaten girişli) → kod DAİMA req.user.id'ye scope'lu.
// Kullanıcı-başı rate-limit ile 6 hane brute-force'a karşı korunur.
export const verifyEmailCode = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim();
  if (!/^\d{6}$/.test(code)) throw badRequest('6 haneli kodu girin', 'code');

  const rlKey = `verify_email_code:${req.user.id}`;
  if (isBlocked(rlKey)) throw tooManyRequests('Çok fazla hatalı deneme. Lütfen birkaç dakika sonra tekrar deneyin.');

  const record = userModel.findByIdWithHash(req.user.id);
  if (!record?.email) throw badRequest('Bu hesapta e-posta yok');
  if (record.email_verified === 1) return res.json({ ok: true, already: true });

  const row = authTokenModel.findValidByCode(req.user.id, hashCode(code, req.user.id), 'email_verify');
  if (!row) {
    recordFailure(rlKey);
    throw badRequest('Kod geçersiz veya süresi dolmuş. Yeni bir kod isteyebilirsin.', 'code');
  }
  clearAttempts(rlKey);

  userModel.setEmailVerified(row.user_id);
  authTokenModel.markUsed(row.id); // aynı satır → link token'ı da kapanır (tek kullanımlık)
  logActivity({ userId: row.user_id, action: 'auth.email_verify', detail: { via: 'code' }, ip: req.ip });
  await sendWelcome(row.user_id); // e-posta onaylandı + hoş geldin
  res.json({ ok: true });
});

// Oturum açık kullanıcı için doğrulama e-postasını (link + kod) yeniden gönder
export const resendVerification = asyncHandler(async (req, res) => {
  const record = userModel.findByIdWithHash(req.user.id);
  if (!record?.email) throw badRequest('Bu hesapta e-posta yok');
  if (record.email_verified === 1) return res.json({ ok: true, already: true });

  const issued = await issueEmailVerification({ id: record.id, email: record.email });
  const resp = { ok: true };
  if (exposeDemoToken() && issued) { resp.demo = true; resp.token = issued.raw; resp.code = issued.code; }
  res.json(resp);
});
