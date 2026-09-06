import { Router } from 'express';
import {
  register, login, me, logout, updatePlan, changePassword,
  verify2fa, setup2fa, enable2fa, disable2fa,
  forgotPassword, resetPassword, verifyEmail, verifyEmailCode, resendVerification,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail); // link yolu — PUBLIC (uzun token)
router.post('/verify-email-code', requireAuth, verifyEmailCode); // kod yolu — AUTH + kullanıcıya scope'lu
router.post('/2fa/verify', verify2fa); // challenge tokenı ile — oturum gerekmez
router.post('/logout', requireAuth, logout); // audit için token gerektirir; anonim logout değersiz
router.get('/me', requireAuth, me);
router.patch('/plan', requireAuth, updatePlan);
router.post('/change-password', requireAuth, changePassword);
router.post('/resend-verification', requireAuth, resendVerification);
router.post('/2fa/setup', requireAuth, setup2fa);
router.post('/2fa/enable', requireAuth, enable2fa);
router.post('/2fa/disable', requireAuth, disable2fa);

export default router;
