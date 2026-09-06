// TOTP 2FA kategorisi — setup gizli sızmaz, enable/verify akışı, disable, yanlış kod reddi, challenge oturum değil.
import { apiFetch, createTestOwner, tokenFor, TEST_PASSWORD } from './helpers.js';
import { generateSecret, totpUri } from '../utils/totp.js';
import crypto from 'node:crypto';

// RFC 6238 TOTP kodu (test için) — utils/totp.js verifyTotp ile aynı algoritma.
function totpCode(base32) {
  const key = base32Decode(base32);
  const counter = Math.floor(Date.now() / 30000);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', key).update(buf).digest();
  const off = h[h.length - 1] & 0x0f;
  const code = ((h[off] & 0x7f) << 24) | ((h[off + 1] & 0xff) << 16) | ((h[off + 2] & 0xff) << 8) | (h[off + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}
function base32Decode(str) {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = str.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = '';
  for (const c of clean) {
    const v = alpha.indexOf(c);
    if (v < 0) continue;
    bits += v.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export const twofaTests = [
  {
    id: '2fa.setup-secret-shape',
    name: '2FA setup base32 secret + QR data URL döner',
    category: '2FA',
    description: 'POST /auth/2fa/setup → { secret, uri, qr }. Secret /me\'de görünmez (PUBLIC_COLS dışı).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const r = await apiFetch('/auth/2fa/setup', { method: 'POST', token });
      ctx.equal(r.status, 200, 'setup 200 olmalı');
      ctx.assert(!!r.body?.secret && /^[A-Z2-7]+$/.test(r.body.secret), 'base32 secret dönmeli');
      ctx.assert(r.body?.qr?.startsWith('data:image'), 'QR data URL olmalı');
      const me = await apiFetch('/auth/me', { token });
      ctx.assert(!('totp_secret' in (me.body?.user || {})), 'me endpoint\'inde totp_secret sızmamalı');
    },
  },
  {
    id: '2fa.enable-then-login-challenge',
    name: '2FA açıksa login challenge döner',
    category: '2FA',
    description: 'enable sonrası login → { requires_2fa: true, challenge } (session tokenı verilmez).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const setup = await apiFetch('/auth/2fa/setup', { method: 'POST', token });
      const secret = setup.body.secret;
      const enable = await apiFetch('/auth/2fa/enable', { method: 'POST', token, body: { code: totpCode(secret) } });
      ctx.equal(enable.status, 200, 'enable 200');
      const login = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      ctx.equal(login.status, 200, 'login 200 ama challenge olmalı');
      ctx.equal(login.body?.requires_2fa, true, 'requires_2fa true');
      ctx.assert(!!login.body?.challenge, 'challenge token olmalı');
      ctx.assert(!login.body?.token, 'oturum tokenı verilmemeli');
    },
  },
  {
    id: '2fa.verify-completes-session',
    name: '2FA kodu doğrulanınca gerçek oturum tokenı gelir',
    category: '2FA',
    description: 'POST /auth/2fa/verify {challenge, code} → 200 + session token; /me erişilir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const setup = await apiFetch('/auth/2fa/setup', { method: 'POST', token });
      await apiFetch('/auth/2fa/enable', { method: 'POST', token, body: { code: totpCode(setup.body.secret) } });
      const login = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      const verify = await apiFetch('/auth/2fa/verify', { method: 'POST', body: { challenge: login.body.challenge, code: totpCode(setup.body.secret) } });
      ctx.equal(verify.status, 200, 'verify 200');
      ctx.assert(!!verify.body?.token, 'session token gelmeli');
      const me = await apiFetch('/auth/me', { token: verify.body.token });
      ctx.equal(me.status, 200, '/me 200');
    },
  },
  {
    id: '2fa.wrong-code-rejected',
    name: '2FA yanlış kod reddedilir',
    category: '2FA',
    description: 'verify aşamasında 000000 kodu → 401, session tokenı verilmez.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const setup = await apiFetch('/auth/2fa/setup', { method: 'POST', token });
      await apiFetch('/auth/2fa/enable', { method: 'POST', token, body: { code: totpCode(setup.body.secret) } });
      const login = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      const verify = await apiFetch('/auth/2fa/verify', { method: 'POST', body: { challenge: login.body.challenge, code: '000000' } });
      ctx.equal(verify.status, 401, 'yanlış kod 401');
    },
  },
  {
    id: '2fa.challenge-is-not-session',
    name: 'Challenge token oturum tokenı olarak kullanılamaz',
    category: '2FA',
    description: '/auth/me\'ye challenge tokenıyla erişim 401 (pending_2fa bayrağı reddedilir).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const setup = await apiFetch('/auth/2fa/setup', { method: 'POST', token });
      await apiFetch('/auth/2fa/enable', { method: 'POST', token, body: { code: totpCode(setup.body.secret) } });
      const login = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      const me = await apiFetch('/auth/me', { token: login.body.challenge });
      ctx.equal(me.status, 401, 'challenge ile /me 401 olmalı');
    },
  },
  {
    id: '2fa.disable-with-password',
    name: '2FA parola ile devre dışı bırakılır',
    category: '2FA',
    description: 'POST /auth/2fa/disable {password} → 200, sonraki login artık challenge istemez.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const setup = await apiFetch('/auth/2fa/setup', { method: 'POST', token });
      await apiFetch('/auth/2fa/enable', { method: 'POST', token, body: { code: totpCode(setup.body.secret) } });
      const disable = await apiFetch('/auth/2fa/disable', { method: 'POST', token, body: { password: TEST_PASSWORD } });
      ctx.equal(disable.status, 200, 'disable 200');
      const login = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      ctx.equal(login.status, 200);
      ctx.assert(!login.body?.requires_2fa, 'artık challenge yok');
      ctx.assert(!!login.body?.token, 'oturum tokenı direkt geldi');
    },
  },
];

// Referans için (test dosyasında dursun — üzerine yazılmaması için)
export const _totpHelpers = { totpCode, generateSecret, totpUri };
