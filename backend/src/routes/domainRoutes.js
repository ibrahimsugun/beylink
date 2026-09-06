import { Router } from 'express';
import { listDomains, createDomain, removeDomain, verifyDomainNow, tlsCheck } from '../controllers/domainController.js';
import { requireAuth, requireOwner, requirePlanCap, guardSuspended } from '../middleware/auth.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import { normalizeDomain } from '../models/domainModel.js';

const router = Router();

// Domain-başı anahtar: aynı Caddy IP'sinden farklı domainler AYRI sayılır → legit çok-domain
// Caddy boğulmaz; yalnız tek kötü domain sınırlanır. auth YOK → anahtar req.ip'e düşmez.
const tlsLimiter = createRateLimiter({
  keyFn: (req) => `tls:${normalizeDomain(req.query.domain) || `ip:${req.ip}`}`,
  max: 30,
  windowMs: 60 * 1000,
  blockMs: 60 * 1000,
  message: 'Çok fazla TLS doğrulama isteği. Lütfen bir dakika sonra tekrar deneyin.',
});

// Caddy on-demand TLS `ask` kapısı — kimlik doğrulama YOK, herkese açık (edge sertifika taşkınını önler).
router.get('/tls-check', tlsLimiter, tlsCheck);

router.use(requireAuth, requireOwner, requirePlanCap('brandedDomain'), guardSuspended);
router.get('/', listDomains);
router.post('/', createDomain);
router.delete('/:id', removeDomain);
router.post('/:id/verify', verifyDomainNow);

export default router;
