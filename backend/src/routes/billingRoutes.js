import { Router } from 'express';
import {
  getWallet, getLedger, createTopup, demoTopup, getInvoice, cancelInvoiceCtrl,
  purchasePlan, purchaseSubPack, getDemoWallets,
} from '../controllers/billingController.js';
import { requireAuth, requireOwner, guardSuspended, requireVerifiedEmail, requireAdmin } from '../middleware/auth.js';
import { createRateLimiter } from '../utils/rateLimit.js';

const router = Router();

// Ödeme-intent / order_ref / DB satırı spam'ini sınırlar — requireAuth'tan SONRA çalışır (req.user dolu).
const billingLimiter = createRateLimiter({
  keyFn: (req) => (req.user ? `billing:${req.user.id}` : null),
  max: 10,
  windowMs: 60 * 1000,
  blockMs: 60 * 1000,
  message: 'Çok fazla ödeme isteği. Lütfen bir dakika sonra tekrar deneyin.',
});

// Bakiye/plan/ödeme yalnızca ana hesaplara (owner) aittir — alt hesaplar erişemez.
// guardSuspended: askıdaki hesap mutasyon yapamaz. requireVerifiedEmail: e-postası onaylanmamış
// hesap satın alım/yükleme yapamaz (GET wallet/ledger serbest → bakiye görüntülenebilir).
router.use(requireAuth, requireOwner, guardSuspended, requireVerifiedEmail);
router.get('/wallet', getWallet);
router.get('/ledger', getLedger);
router.get('/demo-wallets', getDemoWallets);
router.post('/topup', billingLimiter, createTopup);
router.post('/topup/demo', requireAdmin, demoTopup); // DEMOÖDEME yalnızca admin (test amaçlı anlık kredi)
router.get('/invoice/:ref', getInvoice);
router.post('/invoice/:ref/cancel', cancelInvoiceCtrl);
router.post('/plan', billingLimiter, purchasePlan);
router.post('/subpack', purchaseSubPack);

export default router;
