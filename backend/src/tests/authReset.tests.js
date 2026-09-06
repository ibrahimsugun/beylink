// Şifre sıfırlama + e-posta doğrulama kategorisi (demo modda token API yanıtında sızar).
import db from '../db/connection.js';
import { apiFetch, createTestOwner, tokenFor, TEST_PASSWORD } from './helpers.js';

export const authResetTests = [
  {
    id: 'reset.forgot-generic-response',
    name: 'Şifre unuttum var olmayan hesapta bile generic 200',
    category: 'Şifre Reset',
    description: 'Hesap yoksa bile aynı yanıt — kullanıcı enumeration engellenir.',
    run: async (ctx) => {
      const r = await apiFetch('/auth/forgot-password', { method: 'POST', body: { email: ctx.uniq('missing') + '@example.com' } });
      ctx.equal(r.status, 200, 'generic 200');
    },
  },
  {
    id: 'reset.password-reset-flow',
    name: 'Şifre sıfırlama tokenı ile yeni parola belirlenir',
    category: 'Şifre Reset',
    description: 'forgot → token (demo) → reset → eski şifre 401, yeni şifre 200. tv artar (eski oturumlar düşer).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const oldTvToken = tokenFor(u);
      const forgot = await apiFetch('/auth/forgot-password', { method: 'POST', body: { email: u.email } });
      ctx.equal(forgot.status, 200);
      const token = forgot.body?.token; // demo modda API yanıtında var (production'da ASLA)
      ctx.assert(!!token, 'demo modda ham token yanıtta gelmeli');
      const reset = await apiFetch('/auth/reset-password', { method: 'POST', body: { token, new_password: 'brand-new-1' } });
      ctx.equal(reset.status, 200, 'reset 200');
      const oldLogin = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      ctx.equal(oldLogin.status, 401, 'eski şifre 401');
      const newLogin = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: 'brand-new-1' } });
      ctx.equal(newLogin.status, 200, 'yeni şifre 200');
      const me = await apiFetch('/auth/me', { token: oldTvToken });
      ctx.equal(me.status, 401, 'eski JWT tv artışıyla düşmeli');
    },
  },
  {
    id: 'reset.token-single-use',
    name: 'Şifre sıfırlama tokenı tek kullanımlıktır',
    category: 'Şifre Reset',
    description: 'Aynı token 2. kez kullanılınca 400.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const forgot = await apiFetch('/auth/forgot-password', { method: 'POST', body: { email: u.email } });
      const token = forgot.body.token;
      const first = await apiFetch('/auth/reset-password', { method: 'POST', body: { token, new_password: 'brand-new-2' } });
      ctx.equal(first.status, 200);
      const second = await apiFetch('/auth/reset-password', { method: 'POST', body: { token, new_password: 'brand-new-3' } });
      ctx.assert(second.status >= 400 && second.status < 500, `2. kullanım 4xx olmalı (got ${second.status})`);
    },
  },
  {
    id: 'reset.email-verify-flow',
    name: 'E-posta doğrulama tokenı email_verified=1 yapar',
    category: 'Şifre Reset',
    description: 'register sonrası ham token (demo) → /auth/verify-email → users.email_verified=1.',
    run: async (ctx) => {
      const email = ctx.uniq('ver') + '@example.com';
      const reg = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      const uid = reg.body?.user?.id;
      ctx.assert(!!uid, 'kullanıcı id gelmeli');
      // Register verify token'ı sızdırmaz → resend ile al (demo modda ham token yanıtta)
      const resend = await apiFetch('/auth/resend-verification', { method: 'POST', token: reg.body?.token });
      ctx.equal(resend.status, 200);
      const ver = resend.body?.token;
      if (!ver) { ctx.log('Demo token yanıtta gelmedi — testi atlıyorum'); return; }
      const r = await apiFetch('/auth/verify-email', { method: 'POST', body: { token: ver } });
      ctx.equal(r.status, 200, 'verify 200');
      const row = db.prepare(`SELECT email_verified FROM users WHERE id = ?`).get(uid);
      ctx.equal(row.email_verified, 1, 'email_verified=1');
    },
  },
  {
    id: 'reset.email-verify-code-works',
    name: '6 haneli kod ile e-posta doğrulanır (oturumlu)',
    category: 'Şifre Reset',
    description: 'resend → kod (demo) → /auth/verify-email-code (auth) → email_verified=1.',
    run: async (ctx) => {
      const email = ctx.uniq('vcode') + '@example.com';
      const reg = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      const session = reg.body?.token;
      const uid = reg.body?.user?.id;
      ctx.assert(!!session && !!uid, 'kayıt oturumu + id gelmeli');
      const resend = await apiFetch('/auth/resend-verification', { method: 'POST', token: session });
      const code = resend.body?.code;
      if (!code) { ctx.log('Demo kod yanıtta gelmedi — testi atlıyorum'); return; }
      ctx.assert(/^\d{6}$/.test(code), '6 haneli kod formatı');
      const r = await apiFetch('/auth/verify-email-code', { method: 'POST', token: session, body: { code } });
      ctx.equal(r.status, 200, 'kod doğrulama 200');
      const row = db.prepare(`SELECT email_verified FROM users WHERE id = ?`).get(uid);
      ctx.equal(row.email_verified, 1, 'email_verified=1');
    },
  },
  {
    id: 'reset.email-verify-code-wrong-rejected',
    name: 'Yanlış kod reddedilir, hesap doğrulanmaz',
    category: 'Şifre Reset',
    description: 'Geçerli kod varken yanlış kod gönderimi 4xx + email_verified=0 kalır.',
    run: async (ctx) => {
      const email = ctx.uniq('vwrong') + '@example.com';
      const reg = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      const session = reg.body?.token;
      const uid = reg.body?.user?.id;
      const resend = await apiFetch('/auth/resend-verification', { method: 'POST', token: session });
      const code = resend.body?.code;
      if (!code) { ctx.log('Demo kod gelmedi — atla'); return; }
      const wrong = code === '000000' ? '111111' : '000000';
      const r = await apiFetch('/auth/verify-email-code', { method: 'POST', token: session, body: { code: wrong } });
      ctx.assert(r.status >= 400 && r.status < 500, `yanlış kod 4xx olmalı (got ${r.status})`);
      const row = db.prepare(`SELECT email_verified FROM users WHERE id = ?`).get(uid);
      ctx.equal(row.email_verified, 0, 'email_verified 0 kalmalı');
    },
  },
  {
    id: 'reset.email-verify-code-requires-auth',
    name: 'Kod doğrulama oturum ister (401)',
    category: 'Şifre Reset',
    description: 'Token olmadan /auth/verify-email-code → 401 (kod daima kullanıcıya scope\'lu).',
    run: async (ctx) => {
      const r = await apiFetch('/auth/verify-email-code', { method: 'POST', body: { code: '123456' } });
      ctx.equal(r.status, 401, 'auth yok → 401');
    },
  },
  {
    id: 'reset.email-verify-code-invalidates-link',
    name: 'Kod ile doğrulama link tokenını da kapatır (tek satır)',
    category: 'Şifre Reset',
    description: 'resend → token + kod aynı satır. Kod ile doğrula → aynı link tokenı artık geçersiz (400).',
    run: async (ctx) => {
      const email = ctx.uniq('vshare') + '@example.com';
      const reg = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      const session = reg.body?.token;
      const resend = await apiFetch('/auth/resend-verification', { method: 'POST', token: session });
      const code = resend.body?.code;
      const link = resend.body?.token;
      if (!code || !link) { ctx.log('Demo kod/token gelmedi — atla'); return; }
      const byCode = await apiFetch('/auth/verify-email-code', { method: 'POST', token: session, body: { code } });
      ctx.equal(byCode.status, 200, 'kod doğrulama 200');
      const byLink = await apiFetch('/auth/verify-email', { method: 'POST', body: { token: link } });
      ctx.assert(byLink.status >= 400 && byLink.status < 500, `kullanılmış satırın linki 4xx olmalı (got ${byLink.status})`);
    },
  },
  {
    id: 'reset.email-verify-15min-ttl',
    name: 'E-posta doğrulama kod+link 15 dakika geçerli',
    category: 'Şifre Reset',
    description: 'auth_tokens satırında expires_at − created_at ≈ 15 dk ve code_hash dolu.',
    run: async (ctx) => {
      const email = ctx.uniq('vttl') + '@example.com';
      const reg = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      const session = reg.body?.token;
      const uid = reg.body?.user?.id;
      await apiFetch('/auth/resend-verification', { method: 'POST', token: session });
      const row = db
        .prepare(
          `SELECT token_hash, code_hash, (julianday(expires_at) - julianday(created_at)) * 24 * 60 AS mins
           FROM auth_tokens WHERE user_id = ? AND kind = 'email_verify' ORDER BY id DESC LIMIT 1`
        )
        .get(uid);
      ctx.assert(!!row, 'email_verify satırı olmalı');
      ctx.assert(Math.abs(row.mins - 15) < 1, `TTL ~15dk olmalı (got ${row.mins?.toFixed?.(2)})`);
      ctx.assert(!!row.token_hash, 'link token hash dolu');
      ctx.assert(!!row.code_hash, 'kod hash dolu');
    },
  },
];
