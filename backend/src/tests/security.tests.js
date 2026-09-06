// Güvenlik kategorisi — JWT tv, JWT bozuk/exp, admin taklidi, sanitizer, IDOR koruma.
import db from '../db/connection.js';
import jwt from 'jsonwebtoken';
import { profileModel } from '../models/profileModel.js';
import { config } from '../config/env.js';
import { sanitizeBioHtml } from '../utils/sanitizeHtml.js';
import { apiFetch, createTestOwner, createTestSub, tokenFor, TEST_PASSWORD } from './helpers.js';

export const securityTests = [
  {
    id: 'sec.jwt-tv-invalidates-old-tokens',
    name: 'Şifre değişimi eski JWT tokenları geçersiz kılar',
    category: 'Güvenlik',
    description: 'Token al → şifre değiştir → aynı token /me → 401 (token_version bump).',
    run: async (ctx) => {
      const email = ctx.uniq('tv') + '@example.com';
      const reg = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      const oldToken = reg.body.token;
      const me1 = await apiFetch('/auth/me', { token: oldToken });
      ctx.equal(me1.status, 200);
      const chg = await apiFetch('/auth/change-password', { method: 'POST', token: oldToken, body: { current_password: TEST_PASSWORD, new_password: 'newnew123' } });
      ctx.equal(chg.status, 200);
      const me2 = await apiFetch('/auth/me', { token: oldToken });
      ctx.equal(me2.status, 401, 'eski token 401 olmalı');
    },
  },
  {
    id: 'sec.uppercase-email-conflict',
    name: 'Büyük harf e-posta ile mükerrer kayıt reddedilir',
    category: 'Güvenlik',
    description: 'foo@x.com kayıt sonrası FOO@X.COM → 409 (case-insensitive uniqueness → admin taklidi kapatıldı).',
    run: async (ctx) => {
      const email = ctx.uniq('dup') + '@example.com';
      const r1 = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      ctx.equal(r1.status, 201);
      const r2 = await apiFetch('/auth/register', { method: 'POST', body: { email: email.toUpperCase(), password: TEST_PASSWORD } });
      ctx.equal(r2.status, 409);
    },
  },
  {
    id: 'sec.rich-text-html-sanitized',
    name: 'Rich text bio sanitize <script> tag\'ını kaldırır',
    category: 'Güvenlik',
    description: '<script>+event handler+javascript: girdisinde tehlikeli parça kaybolur, güvenli tag korunur.',
    run: async (ctx) => {
      const dirty = '<script>alert(1)</script><b>ok</b><a href="javascript:alert(1)">bad</a>';
      const clean = sanitizeBioHtml(dirty);
      ctx.assert(!clean.includes('<script'));
      ctx.assert(!clean.toLowerCase().includes('javascript:'));
      ctx.contains(clean, '<b>ok</b>');
    },
  },
  {
    id: 'sec.jwt-invalid-signature-rejected',
    name: 'Bozuk imzalı JWT 401 döner',
    category: 'Güvenlik',
    description: 'Manuel olarak farklı secret ile üretilmiş token requireAuth\'ta reddedilir.',
    run: async (ctx) => {
      const bogus = jwt.sign({ sub: 1 }, 'not-the-real-secret', { expiresIn: '7d' });
      const r = await apiFetch('/auth/me', { token: bogus });
      ctx.equal(r.status, 401);
    },
  },
  {
    id: 'sec.jwt-expired-rejected',
    name: 'Süresi geçmiş JWT 401 döner',
    category: 'Güvenlik',
    description: 'Doğru secret ama expiresIn -1s → 401.',
    run: async (ctx) => {
      const expired = jwt.sign({ sub: 1, tv: 0 }, config.jwtSecret, { expiresIn: -1 });
      const r = await apiFetch('/auth/me', { token: expired });
      ctx.equal(r.status, 401);
    },
  },
  {
    id: 'sec.assert-profile-access-idor',
    name: 'Başkasının profil analytics\'ine erişim 403/404',
    category: 'Güvenlik',
    description: 'A kullanıcısı B\'nin profil_id ile /analytics/:id → 403/404 (assertProfileAccess).',
    run: async (ctx) => {
      const a = await createTestOwner(ctx);
      const b = await createTestOwner(ctx);
      const bp = profileModel.findByUserId(b.id);
      const r = await apiFetch(`/analytics/${bp.id}?range=7d`, { token: tokenFor(a) });
      ctx.assert(r.status === 403 || r.status === 404, `IDOR 403/404 (got ${r.status})`);
    },
  },
  {
    id: 'sec.sub-cannot-touch-other-owner-links',
    name: 'Alt hesap başka owner\'ın linklerini düzenleyemez',
    category: 'Güvenlik',
    description: 'Sub yalnız kendi profilinin linkine erişebilir; başka owner linki → 403/404.',
    run: async (ctx) => {
      const ownerA = await createTestOwner(ctx, { plan: 'pro', expiresAt: '2099-01-01 00:00:00' });
      const subA = await createTestSub(ctx, ownerA);
      const ownerB = await createTestOwner(ctx);
      const bp = profileModel.findByUserId(ownerB.id);
      const link = db.prepare(`INSERT INTO links (profile_id, type, title, url, sort_order, is_active) VALUES (?, 'link', 'X', 'https://x.com', 0, 1)`).run(bp.id).lastInsertRowid;
      const r = await apiFetch(`/links/${link}`, { method: 'PATCH', token: tokenFor(subA), body: { title: 'hacked' } });
      ctx.assert(r.status === 403 || r.status === 404, `başka owner linki 403/404 (got ${r.status})`);
    },
  },
];
