// utils/totp.js — Saf Node TOTP (RFC 6238), harici bağımlılık yok.
// Google Authenticator / Authy / Microsoft Authenticator ile uyumlu (SHA1, 6 hane, 30 sn).
import crypto from 'node:crypto';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Base32 kodlama (secret üretimi için)
function base32encode(buf) {
  let bits = 0;
  let val = 0;
  let out = '';
  for (const b of buf) {
    val = (val << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}

// Base32 çözme
function base32decode(str) {
  const clean = String(str).replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  let bits = 0;
  let val = 0;
  const out = [];
  for (const c of clean) {
    const idx = B32.indexOf(c);
    if (idx < 0) continue;
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((val >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

// Yeni gizli anahtar üret (20 byte → 32 karakterlik base32)
export function generateSecret(len = 20) {
  return base32encode(crypto.randomBytes(len));
}

// HOTP (sayaç tabanlı tek seferlik kod)
function hotp(secret, counter) {
  const key = base32decode(secret);
  const buf = Buffer.alloc(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const off = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[off] & 0x7f) << 24) |
    ((hmac[off + 1] & 0xff) << 16) |
    ((hmac[off + 2] & 0xff) << 8) |
    (hmac[off + 3] & 0xff);
  return (code % 1000000).toString().padStart(6, '0');
}

// TOTP doğrulama (±window adım tolerans, 30 sn periyot). Sabit-zamanlı karşılaştırma.
export function verifyTotp(secret, token, window = 1) {
  if (!secret || !token) return false;
  const t = String(token).trim();
  if (!/^\d{6}$/.test(t)) return false;
  const counter = Math.floor(Date.now() / 1000 / 30);
  const expected = Buffer.from(t);
  for (let w = -window; w <= window; w++) {
    const candidate = Buffer.from(hotp(secret, counter + w));
    if (candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)) return true;
  }
  return false;
}

// otpauth:// URI (authenticator uygulamasında QR ile okunur)
export function totpUri(secret, label, issuer = 'BeyLink') {
  return (
    `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}` +
    `?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
  );
}
