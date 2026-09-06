import { Router } from 'express';
import { getSummary, exportCsv } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/:profileId/export', exportCsv);
router.get('/:profileId', getSummary);

export default router;
