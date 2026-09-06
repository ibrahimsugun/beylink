import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Uç nokta bulunamadı' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }
  // SQLite benzersizlik ihlali
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Bu kayıt zaten mevcut' });
  }
  console.error('[error]', err);
  res.status(500).json({ error: 'Sunucu hatası' });
}
