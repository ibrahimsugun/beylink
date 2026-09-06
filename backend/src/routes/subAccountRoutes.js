import { Router } from 'express';
import {
  listSubAccounts,
  createSubAccount,
  updateSubAccount,
  deleteSubAccount,
  reactivateAllSubs,
} from '../controllers/subAccountController.js';
import { requireAuth, requireOwner, guardSuspended } from '../middleware/auth.js';

const router = Router();

// guardSuspended savunma-derinliği (askıdaki hesap mutasyon yapamaz; GET serbest).
router.use(requireAuth, requireOwner, guardSuspended);
router.get('/', listSubAccounts);
router.post('/', createSubAccount);
router.post('/reactivate-all', reactivateAllSubs); // premium yenilenince tümünü aktifleştir
router.patch('/:id', updateSubAccount);
router.delete('/:id', deleteSubAccount);

export default router;
