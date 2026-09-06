import { Router } from 'express';
import { getPublicProfile, getPublicRootProfile, track, getQr } from '../controllers/publicController.js';

const router = Router();

// Kimlik doğrulama YOK — herkese açık
router.post('/track', track);
router.get('/', getPublicRootProfile); // yalnız özel domain kökü — bkz. resolveHost middleware
router.get('/:username', getPublicProfile);
router.get('/:username/qr', getQr);

export default router;
