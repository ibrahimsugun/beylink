import { Router } from 'express';
import { getStats, getUsers, changeUserPlan, adjustUserCredits, getLogs, resetUser2fa } from '../controllers/adminController.js';
import { listTests, runTest, runAllTests, getRun } from '../controllers/testController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Tüm admin rotaları: önce kimlik doğrula, sonra admin yetkisi ara
router.use(requireAuth, requireAdmin);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/plan', changeUserPlan);
router.put('/users/:id/credits', adjustUserCredits);
router.post('/users/:id/reset-2fa', resetUser2fa);
router.get('/logs', getLogs);

// Sistem testleri (in-house test runner) — yalnız admin
router.get('/tests', listTests);
router.post('/tests/run-all', runAllTests);
router.post('/tests/:id/run', runTest);
router.get('/tests/runs/:runId', getRun);

export default router;
