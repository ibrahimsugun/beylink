import { verifyToken } from '../utils/jwt.js';
import { userModel } from '../models/userModel.js';
import { unauthorized, forbidden, emailUnverified } from '../utils/ApiError.js';
import { applyExpiryIfNeeded, assertPlanCap } from '../utils/plan.js';
import { config } from '../config/env.js';

/**
 * Bearer token doğrular, req.user'a kullanıcıyı yükler.
 */
export function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw unauthorized('Oturum bulunamadı');

    const payload = verifyToken(token);
    // 2FA ara-adım (challenge) tokenı normal oturum yerine geçemez → yalnızca /auth/2fa/verify kullanır.
    if (payload.pending_2fa) throw unauthorized('İki adımlı doğrulama tamamlanmadı');
    let user = userModel.findById(payload.sub);
    if (!user) throw unauthorized('Kullanıcı bulunamadı');
    if (user.is_active === 0) throw unauthorized('Hesabınız pasif durumda. Lütfen yöneticinize başvurun.');
    // Şifre değişince token_version artar → eski tokenlar geçersiz (geriye-uyumlu: tv yoksa 0 sayılır).
    if ((payload.tv ?? 0) !== (user.token_version ?? 0)) throw unauthorized('Oturumunuz sonlandırıldı, tekrar giriş yapın');

    user = applyExpiryIfNeeded(user); // süresi dolan plan → Free (lazy)
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(unauthorized('Geçersiz veya süresi dolmuş oturum'));
    }
    next(err);
  }
}

/**
 * Yalnızca ana hesaplar (owner) erişebilir.
 */
export function requireOwner(req, _res, next) {
  if (req.user?.role !== 'owner') return next(forbidden('Yalnızca ana hesaplar için'));
  next();
}

/**
 * Yalnızca admin kullanıcılar erişebilir (requireAuth sonrası). Yetki iki kaynaktan gelir:
 *  1) users.is_admin bayrağı (DB — migrate açılışta config.adminEmails için işaretler)
 *  2) config.adminEmails allowlist (son açılıştan sonra kaydolan admin de anında erişir)
 * is_admin token'a GÖMÜLMEZ → yetki her istekte taze okunur (alma/verme login gerektirmez).
 */
export function requireAdmin(req, _res, next) {
  const email = (req.user?.email || '').toLowerCase();
  const isAdmin = req.user?.is_admin === 1 || (email && config.adminEmails.includes(email));
  if (!isAdmin) return next(forbidden('Bu alana erişim yetkiniz yok.'));
  next();
}

/**
 * Askıdaki (is_suspended=1) alt hesaplar GİRİŞ yapabilir ve okuma (GET) yapabilir ama
 * HİÇBİR mutasyon (POST/PATCH/PUT/DELETE) gerçekleştiremez. Ana hesabın premium'u bitince
 * tüm alt hesaplar askıya alınır; premium yenilenince ana hesap tarafından tekrar aktifleştirilir.
 * requireAuth SONRASI, mutasyon içeren router'lara (profil/link vb.) uygulanır.
 */
export function guardSuspended(req, _res, next) {
  if (req.user?.is_suspended === 1 && req.method !== 'GET') {
    return next(forbidden('Ana hesabın premium üyeliği sona erdiği için işlem yapamazsınız. Yeniden aktifleştirme için ana hesabın premium alması gerekir.'));
  }
  next();
}

/**
 * E-postalı ama doğrulanmamış hesaplar HİÇBİR mutasyon (POST/PATCH/PUT/DELETE) yapamaz — okuma (GET) serbest.
 * Alt hesaplar e-postasız olduğu için MUAF (username+şifre ile girerler; doğrulanacak e-posta yok).
 * Kayıtta e-posta doğrulama gönderilir; kullanıcı sayfasını oluşturabilir ama yayınlayamaz/satın alamaz.
 * requireAuth SONRASI, satın alma gibi kritik mutasyon router'larına uygulanır.
 */
export function requireVerifiedEmail(req, _res, next) {
  if (req.method !== 'GET' && req.user?.email && req.user.email_verified !== 1) {
    return next(emailUnverified());
  }
  next();
}

/**
 * Belirli bir plan yeteneği (cap) kullanıcının planında yoksa 403. requireAuth SONRASI kullanılır.
 * Ör. router.use(requireAuth, requirePlanCap('btag')) → tüm route'lar Basic+ ister.
 */
export function requirePlanCap(cap) {
  return (req, _res, next) => {
    try {
      assertPlanCap(req.user, cap);
      next();
    } catch (err) {
      next(err);
    }
  };
}
