import { Router } from 'express';
import {
  listLinks,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
} from '../controllers/linkController.js';
import { requireAuth, guardSuspended } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, guardSuspended); // askıdaki alt hesap link mutasyonu yapamaz (GET serbest)
router.get('/', listLinks);
router.post('/', createLink);
router.patch('/reorder', reorderLinks);
router.patch('/:id', updateLink);
router.delete('/:id', deleteLink);

export default router;
