import crypto from 'node:crypto';
import { config } from '../config/env.js';

// Şifre sıfırlama / e-posta doğrulama token'ları. HAM token yalnız kullanıcıya (link) gider;
// DB'ye SHA-256 HASH'i yazılır → DB sızsa bile token kullanılamaz (parola-reset güvenliği).

export function hashToken(raw) {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
}

export function generateToken() {
  const raw = crypto.randomBytes(32).toString('base64url'); // ~43 karakter, URL-güvenli
  return { raw, hash: hashToken(raw) };
}

// --- 6 haneli doğrulama kodu (link'e alternatif) ---
// Kod kısa (1M olasılık) olduğundan yalnız kullanıcıya-scope'lu + rate-limit'li endpointte doğrulanır.
// hashCode PEPPER'lıdır (jwtSecret + userId): DB sızsa bile 6 hane rainbow-table ile çözülemez,
// ve pepper kullanıcıya bağlı olduğundan aynı kod farklı kullanıcıda farklı hash üretir.
export function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0'); // 000000..999999, sapmasız
}

export function hashCode(code, userId) {
  return crypto
    .createHash('sha256')
    .update(`${config.jwtSecret}:${userId}:${String(code)}`)
    .digest('hex');
}
