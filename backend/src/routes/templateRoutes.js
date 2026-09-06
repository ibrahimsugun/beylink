import { Router } from 'express';
import {
  listTemplates,
  createTemplate,
  deleteTemplate,
  applyTemplateToProfile,
  exportTemplate,
  importTemplate,
  applyTemplateBulk,
} from '../controllers/designTemplateController.js';
import { requireAuth, guardSuspended } from '../middleware/auth.js';

const router = Router();

// guardSuspended: askıdaki alt hesap GET yapabilir ama şablon oluşturamaz/uygulayamaz (non-GET 403)
router.use(requireAuth, guardSuspended);
router.get('/', listTemplates);
router.post('/', createTemplate);
router.post('/import', importTemplate);            // dinamik :id'den ÖNCE
router.get('/:id/export', exportTemplate);
router.post('/:id/apply', applyTemplateToProfile);
router.post('/:id/apply-bulk', applyTemplateBulk); // Pro Plus (controller assertPlanCap)
router.delete('/:id', deleteTemplate);

export default router;
