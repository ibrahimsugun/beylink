import { Router } from 'express';
import { listBtags, createBtag, updateBtag, deleteBtag } from '../controllers/btagController.js';
import { requireAuth, requirePlanCap } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requirePlanCap('btag')); // BTAG yalnızca Basic+ — Free planda kapalı
router.get('/:profileId', listBtags);
router.post('/:profileId', createBtag);
router.patch('/:profileId/:btagId', updateBtag);
router.delete('/:profileId/:btagId', deleteBtag);

export default router;
