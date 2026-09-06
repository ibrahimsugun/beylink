// Auth kategorisi — kayıt, giriş, e-posta case-insensitive, alt hesap login, şifre güncelleme.
import db from '../db/connection.js';
import { userModel } from '../models/userModel.js';
import { CREDIT_ACTIONS, ACTIVITY_ACTIONS } from '../services/activityLog.js';
import { apiFetch, createTestOwner, createTestSub, tokenFor, TEST_PASSWORD } from './helpers.js';

export const authTests = [
  {
    id: 'auth.register-login',
    name: 'Kayıt + giriş temel akışı',
    category: 'Auth',
    description: 'Kayıt sonrası aynı kimlikle POST /auth/login → 200 + token döner.',
    run: async (ctx) => {
      const email = ctx.uniq('reg') + '@example.com';
      await ctx.step('Register endpoint', async () => {
        const r = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
        ctx.equal(r.status, 201, 'kayıt 201 dönmeli');
        ctx.assert(!!r.body?.token, 'token dönmeli');
      });
      await ctx.step('Login endpoint', async () => {
        const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: email, password: TEST_PASSWORD } });
        ctx.equal(r.status, 200, 'giriş 200 olmalı');
        ctx.assert(!!r.body?.token, 'giriş token dönmeli');
      });
    },
  },
  {
    id: 'auth.register-creates-unpublished-profile',
    name: 'Kayıt profili YAYINSIZ oluşturur (e-posta onayına kadar)',
    category: 'Auth',
    description: 'M35: POST /auth/register → profil is_published=0. Kullanıcı sayfasını hazırlar ama onaylamadan yayınlayamaz.',
    run: async (ctx) => {
      const email = ctx.uniq('regpub') + '@example.com';
      const r = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      ctx.equal(r.status, 201, 'kayıt 201');
      ctx.equal(!!r.body?.profile?.is_published, false, 'yanıttaki profil yayınsız olmalı');
      const row = db.prepare(`SELECT is_published, email_verified FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = ?`).get(r.body.user.id);
      ctx.equal(!!row.is_published, false, 'DB\'de profil is_published=0');
      ctx.equal(row.email_verified, 0, 'yeni hesap e-posta doğrulanmamış (0)');
    },
  },
  {
    id: 'auth.wrong-password',
    name: 'Yanlış şifre 401 döner',
    category: 'Auth',
    description: 'Doğru kimlik + yanlış şifre → 401. Kullanıcı numaralandırılamaz.',
    run: async (ctx) => {
      const email = ctx.uniq('wp') + '@example.com';
      await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: email, password: 'wrong-pass' } });
      ctx.equal(r.status, 401, 'yanlış şifre 401 olmalı');
    },
  },
  {
    id: 'auth.unknown-user',
    name: 'Var olmayan kimlik 401 döner',
    category: 'Auth',
    description: 'Kayıtlı olmayan e-posta ile giriş denemesi → 401 (aynı mesaj: enumeration bilgi sızdırmaz).',
    run: async (ctx) => {
      const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: `${ctx.uniq('missing')}@example.com`, password: TEST_PASSWORD } });
      ctx.equal(r.status, 401, 'var olmayan kimlik 401 olmalı');
    },
  },
  {
    id: 'auth.email-case-insensitive',
    name: 'E-posta büyük/küçük harf duyarsız login',
    category: 'Auth',
    description: 'foo@x.com kayıt, FOO@X.COM ile giriş → 200 aynı kullanıcı (admin-taklidi düzeltmesi).',
    run: async (ctx) => {
      const email = ctx.uniq('case') + '@example.com';
      await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
      const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: email.toUpperCase(), password: TEST_PASSWORD } });
      ctx.equal(r.status, 200, 'uppercase login 200 olmalı');
      ctx.equal(r.body?.user?.email, email.toLowerCase(), 'aynı canonical e-posta döner');
    },
  },
  {
    id: 'auth.weak-password-rejected',
    name: 'Kısa şifre reddedilir',
    category: 'Auth',
    description: '<6 karakter şifre ile kayıt → 400 (parola politikası).',
    run: async (ctx) => {
      const r = await apiFetch('/auth/register', { method: 'POST', body: { email: ctx.uniq('short') + '@example.com', password: '12345' } });
      ctx.equal(r.status, 400, 'zayıf şifre 400 olmalı');
    },
  },
  {
    id: 'auth.invalid-email-rejected',
    name: 'Geçersiz e-posta formatı reddedilir',
    category: 'Auth',
    description: '"not-an-email" gibi bir string kayıtta 400.',
    run: async (ctx) => {
      const r = await apiFetch('/auth/register', { method: 'POST', body: { email: 'not-an-email', password: TEST_PASSWORD } });
      ctx.equal(r.status, 400, 'geçersiz e-posta 400 olmalı');
    },
  },
  {
    id: 'auth.inactive-user-blocked',
    name: 'Pasif kullanıcı giriş yapamaz',
    category: 'Auth',
    description: 'is_active=0 iken login → 401 (owner admin tarafından devre dışı bırakıldı).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { is_active: 0 });
      const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      ctx.equal(r.status, 401, 'pasif hesap 401 olmalı');
    },
  },
  {
    id: 'auth.owner-login-via-slug',
    name: 'Owner profil slug\'ı ile giriş yapabilir',
    category: 'Auth',
    description: 'Owner e-posta yerine kayıtlı profil slug\'ı ile de giriş yapabilir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.profile_slug, password: TEST_PASSWORD } });
      ctx.equal(r.status, 200, 'slug login 200 olmalı');
      ctx.equal(r.body?.user?.id, u.id, 'aynı kullanıcı döner');
    },
  },
  {
    id: 'auth.sub-login-username',
    name: 'Alt hesap kullanıcı adı ile giriş yapar',
    category: 'Auth',
    description: 'Sub yalnızca username+parola ile login olur; e-posta yok.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro' });
      const sub = await createTestSub(ctx, owner);
      const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: sub.username, password: TEST_PASSWORD } });
      ctx.equal(r.status, 200, 'sub login 200 olmalı');
      ctx.equal(r.body?.user?.role, 'sub', 'role sub olmalı');
    },
  },
  {
    id: 'auth.password-change-flow',
    name: 'Şifre değiştirme + yeni şifre ile giriş',
    category: 'Auth',
    description: 'change-password başarılı → yeni şifre ile login 200, eski şifre 401.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const chg = await apiFetch('/auth/change-password', { method: 'POST', token, body: { current_password: TEST_PASSWORD, new_password: 'newpass12' } });
      ctx.equal(chg.status, 200, 'change-password 200');
      const oldLogin = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      ctx.equal(oldLogin.status, 401, 'eski şifre 401');
      const newLogin = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: 'newpass12' } });
      ctx.equal(newLogin.status, 200, 'yeni şifre 200');
    },
  },
  {
    id: 'auth.logout-writes-audit-log',
    name: 'Çıkış audit logu yazar (auth.logout)',
    category: 'Auth',
    description: 'POST /auth/logout token ile → 200 ve activity_logs\'a auth.logout satırı.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const r = await apiFetch('/auth/logout', { method: 'POST', token });
      ctx.equal(r.status, 200, 'logout 200');
      const row = db.prepare(`SELECT id, action, user_id FROM activity_logs WHERE action = 'auth.logout' AND user_id = ? ORDER BY id DESC LIMIT 1`).get(u.id);
      ctx.assert(!!row, 'auth.logout logu yazılmalı');
    },
  },
  {
    id: 'auth.logout-requires-auth',
    name: 'Token\'sız çıkış 401 döner (anonim logout audit\'e sızmaz)',
    category: 'Auth',
    description: 'Çalınmış olmayan boş istek log yazmaz — sahte trafik audit\'i kirletmez.',
    run: async (ctx) => {
      const before = db.prepare(`SELECT COUNT(*) c FROM activity_logs WHERE action = 'auth.logout'`).get().c;
      const r = await apiFetch('/auth/logout', { method: 'POST' });
      ctx.equal(r.status, 401);
      const after = db.prepare(`SELECT COUNT(*) c FROM activity_logs WHERE action = 'auth.logout'`).get().c;
      ctx.equal(after, before, 'log sayısı değişmemeli');
    },
  },
  {
    id: 'auth.login-failed-unknown-email-logged',
    name: 'Bilinmeyen kimlik ile giriş denemesi log yazar (user_id=null)',
    category: 'Auth',
    description: 'Var olmayan e-posta → auth.login_failed reason=unknown_email + user_id NULL (anonim).',
    run: async (ctx) => {
      const email = ctx.uniq('nope') + '@example.com';
      const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: email, password: 'testtest123' } });
      ctx.equal(r.status, 401);
      const row = db.prepare(`SELECT action, user_id, detail FROM activity_logs WHERE action = 'auth.login_failed' ORDER BY id DESC LIMIT 1`).get();
      ctx.assert(!!row);
      ctx.equal(row.user_id, null, 'user_id NULL olmalı (anonim)');
      const detail = JSON.parse(row.detail);
      ctx.equal(detail.reason, 'unknown_email');
    },
  },
  {
    id: 'auth.login-failed-password-wrong-logged',
    name: 'Yanlış şifrede log detail.reason=password_wrong + user_id dolu',
    category: 'Auth',
    description: 'Var olan hesaba yanlış şifre → user_id kaydedilir (hesabın peşine düşen atağı görmek için).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: 'wrong-pass' } });
      const row = db.prepare(`SELECT user_id, detail FROM activity_logs WHERE action = 'auth.login_failed' AND user_id = ? ORDER BY id DESC LIMIT 1`).get(u.id);
      ctx.assert(!!row);
      const detail = JSON.parse(row.detail);
      ctx.equal(detail.reason, 'password_wrong');
    },
  },
  {
    id: 'auth.change-password-wrong-current',
    name: 'Şifre değiştirmede yanlış mevcut şifre reddedilir',
    category: 'Auth',
    description: 'current_password yanlış → 400/401, şifre değişmez.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const r = await apiFetch('/auth/change-password', { method: 'POST', token, body: { current_password: 'wrong', new_password: 'newpass12' } });
      ctx.assert(r.status === 400 || r.status === 401, `4xx bekleniyordu, ${r.status} geldi`);
      // Eski şifre hala geçerli
      const login = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
      ctx.equal(login.status, 200, 'eski şifre hala geçerli olmalı');
    },
  },
];
