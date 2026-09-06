import { Router } from 'express';
import { goRedirect } from '../controllers/redirectController.js';

const router = Router();

// Herkese acik yonlendirme motoru — kimlik dogrulama YOK
router.get('/:linkId', goRedirect);

export default router;
