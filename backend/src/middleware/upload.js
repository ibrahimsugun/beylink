import multer from 'multer';
import fs from 'node:fs';
import { config } from '../config/env.js';
import { badRequest } from '../utils/ApiError.js';

fs.mkdirSync(config.uploadsDir, { recursive: true });

// Uzantı, saldırgan kontrollü originalname'den DEĞİL doğrulanmış mimetype'tan türetilir
const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (_req, file, cb) => {
    const ext = MIME_EXT[file.mimetype] || '.img';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

// SVG kasıtlı olarak hariç — <script> içerebilir (stored XSS riski)
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(badRequest('Yalnızca görsel dosyaları (jpg, png, webp, gif)'));
    }
    cb(null, true);
  },
});
