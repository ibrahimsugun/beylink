import { Router } from 'express';
import { prerenderProfile, prerenderRootProfile } from '../controllers/prerenderController.js';

const router = Router();

// Kimlik doğrulama YOK — crawler'lar (WhatsApp/Twitter/FB…) için sunucu-taraflı OG/meta.
// nginx bot User-Agent'larını buraya proxy'ler; insanlar SPA'ya (index.html) gider.
router.get('/', prerenderRootProfile); // yalnız özel domain kökü — bkz. resolveHost middleware
router.get('/:username', prerenderProfile);

export default router;
