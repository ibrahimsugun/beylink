import { Router } from 'express';
import {
  getMyProfile,
  getProfile,
  updateProfile,
  applyTemplate,
  uploadAvatar,
  uploadCover,
  uploadGalleryImage,
} from '../controllers/profileController.js';
import { requireAuth, guardSuspended } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertProfileEditable } from '../utils/authz.js';
import { createRateLimiter } from '../utils/rateLimit.js';

const router = Router();

// Yetki multer'dan ÖNCE — yetkisiz istekte dosya diske yazılmaz (yetim dosya/DoS önlenir)
const canEdit = (req, _res, next) => {
  try {
    assertProfileEditable(req.user, req.params.id);
    next();
  } catch (e) {
    next(e);
  }
};

// 5MB boyut limiti VAR ama sayı/hız limiti YOK → disk/bant suistimali. Multer'dan ÖNCE
// çalışır: limit aşımında dosya diske yazılmadan 429.
const uploadLimiter = createRateLimiter({
  keyFn: (req) => (req.user ? `upload:${req.user.id}` : null),
  max: 20,
  windowMs: 60 * 1000,
  blockMs: 60 * 1000,
  message: 'Çok fazla yükleme isteği. Lütfen bir dakika sonra tekrar deneyin.',
});

router.use(requireAuth, guardSuspended); // askıdaki alt hesap profil mutasyonu yapamaz (GET serbest)
router.get('/me', getMyProfile);
router.get('/:id', getProfile);
router.patch('/:id', updateProfile);
router.post('/:id/apply-template', applyTemplate);
router.post('/:id/avatar', uploadLimiter, canEdit, upload.single('image'), uploadAvatar);
router.post('/:id/cover', uploadLimiter, canEdit, upload.single('image'), uploadCover);
router.post('/:id/gallery-image', uploadLimiter, canEdit, upload.single('image'), uploadGalleryImage);

export default router;
