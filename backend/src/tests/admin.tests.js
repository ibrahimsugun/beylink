// Admin kategorisi — yetki koruması, stats/users/logs, plan değişimi + log yazımı.
import db from '../db/connection.js';
import { userModel } from '../models/userModel.js';
import { CREDIT_ACTIONS, ACTIVITY_ACTIONS } from '../services/activityLog.js';
import { apiFetch, createTestOwner, tokenFor } from './helpers.js';

export const adminTests = [
  {
    id: 'admin.non-admin-blocked',
    name: 'Admin olmayan kullanıcı admin API için 403 alır',
    category: 'Admin',
    description: 'Normal kullanıcı token ile GET /admin/stats → 403.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const r = await apiFetch('/admin/stats', { token: tokenFor(u) });
      ctx.equal(r.status, 403);
    },
  },
  {
    id: 'admin.stats-endpoint-shape',
    name: 'GET /admin/stats sayısal metrikleri döner',
    category: 'Admin',
    description: 'totalUsers/paidUsers/totalLinks/totalClicks/byPlan alanları vardır.',
    run: async (ctx) => {
      const admin = await createTestOwner(ctx, { is_admin: 1 });
      const r = await apiFetch('/admin/stats', { token: tokenFor(admin) });
      ctx.equal(r.status, 200);
      for (const k of ['totalUsers', 'paidUsers', 'totalLinks', 'totalClicks', 'byPlan']) {
        ctx.assert(k in r.body, `alan ${k} olmalı`);
      }
      ctx.assert(typeof r.body.byPlan === 'object', 'byPlan obje');
    },
  },
  {
    id: 'admin.users-search',
    name: 'GET /admin/users?q= arama filtresi çalışır',
    category: 'Admin',
    description: 'Test kullanıcısı e-postasının başlangıcıyla ara → satır bulunur.',
    run: async (ctx) => {
      const admin = await createTestOwner(ctx, { is_admin: 1 });
      const target = await createTestOwner(ctx);
      const term = target.email.split('@')[0].slice(0, 20);
      const r = await apiFetch(`/admin/users?q=${encodeURIComponent(term)}`, { token: tokenFor(admin) });
      ctx.equal(r.status, 200);
      const found = (r.body?.users || []).some((u) => u.id === target.id);
      ctx.assert(found, 'aranan kullanıcı listede olmalı');
    },
  },
  {
    id: 'admin.plan-change-endpoint',
    name: 'Admin plan değişimi endpoint logu yazar',
    category: 'Admin',
    description: 'PUT /admin/users/:id/plan → hedef plan güncellenir + admin.plan_change logu yazılır.',
    run: async (ctx) => {
      const adminUser = await createTestOwner(ctx, { is_admin: 1 });
      const target = await createTestOwner(ctx);
      const r = await apiFetch(`/admin/users/${target.id}/plan`, { method: 'PUT', token: tokenFor(adminUser), body: { plan: 'pro' } });
      ctx.equal(r.status, 200);
      const after = userModel.findById(target.id);
      ctx.equal(after.plan, 'pro');
      const log = db.prepare(`SELECT id FROM activity_logs WHERE action = 'admin.plan_change' AND user_id = ? ORDER BY id DESC LIMIT 1`).get(adminUser.id);
      ctx.assert(!!log, 'admin.plan_change logu yazılmalı');
    },
  },
  {
    id: 'admin.log-categories-disjoint',
    name: 'CREDIT_ACTIONS ve ACTIVITY_ACTIONS setleri kesişmez',
    category: 'Admin',
    description: 'Sözleşme: bir aksiyon YALNIZ bir kategoride. Aksi halde /admin/logs?category=... güvenilmez.',
    run: async (ctx) => {
      const cross = [...CREDIT_ACTIONS].filter((a) => ACTIVITY_ACTIONS.has(a));
      ctx.equal(cross.length, 0, `kesişim boş olmalı, çakışan: ${cross.join(',')}`);
      ctx.assert(CREDIT_ACTIONS.size > 0, 'CREDIT_ACTIONS dolu');
      ctx.assert(ACTIVITY_ACTIONS.size > 0, 'ACTIVITY_ACTIONS dolu');
    },
  },
  {
    id: 'admin.logs-category-activity-filter',
    name: 'GET /admin/logs?category=activity yalnız aktivite döner',
    category: 'Admin',
    description: 'Filtrelenen tüm satırların action\'ı ACTIVITY_ACTIONS içinde olmalı.',
    run: async (ctx) => {
      const admin = await createTestOwner(ctx, { is_admin: 1 });
      // Bir aktivite (login) + bir kredi (admin.credit_adjust) üret
      await apiFetch('/auth/login', { method: 'POST', body: { identifier: admin.email, password: 'testtest123' } });
      const target = await createTestOwner(ctx, { balance_micro: 5_000_000 });
      await apiFetch(`/admin/users/${target.id}/credits`, { method: 'PUT', token: tokenFor(admin), body: { new_balance_usdt: 8 } });
      const r = await apiFetch('/admin/logs?category=activity&limit=100', { token: tokenFor(admin) });
      ctx.equal(r.status, 200);
      const rows = r.body?.logs || [];
      ctx.assert(rows.length > 0, 'aktivite satırları dönmeli');
      const leaks = rows.filter((l) => !ACTIVITY_ACTIONS.has(l.action));
      ctx.equal(leaks.length, 0, `sızıntı: ${leaks.map((x) => x.action).join(',')}`);
    },
  },
  {
    id: 'admin.logs-category-credit-filter',
    name: 'GET /admin/logs?category=credit yalnız kredi/plan döner',
    category: 'Admin',
    description: 'Filtrelenen tüm satırların action\'ı CREDIT_ACTIONS içinde olmalı; auth sızıntısı yok.',
    run: async (ctx) => {
      const admin = await createTestOwner(ctx, { is_admin: 1 });
      const target = await createTestOwner(ctx, { balance_micro: 3_000_000 });
      await apiFetch(`/admin/users/${target.id}/credits`, { method: 'PUT', token: tokenFor(admin), body: { new_balance_usdt: 6 } });
      const r = await apiFetch('/admin/logs?category=credit&limit=100', { token: tokenFor(admin) });
      ctx.equal(r.status, 200);
      const rows = r.body?.logs || [];
      const leaks = rows.filter((l) => !CREDIT_ACTIONS.has(l.action));
      ctx.equal(leaks.length, 0, `auth sızıntısı: ${leaks.map((x) => x.action).join(',')}`);
    },
  },
  {
    id: 'admin.logs-endpoint',
    name: 'GET /admin/logs son aktiviteyi listeler',
    category: 'Admin',
    description: 'plan değişimi sonrası logs sorgusu satırı içerir.',
    run: async (ctx) => {
      const admin = await createTestOwner(ctx, { is_admin: 1 });
      const target = await createTestOwner(ctx);
      await apiFetch(`/admin/users/${target.id}/plan`, { method: 'PUT', token: tokenFor(admin), body: { plan: 'basic' } });
      const r = await apiFetch('/admin/logs?action=admin.plan_change&limit=5', { token: tokenFor(admin) });
      ctx.equal(r.status, 200);
      const hasIt = (r.body?.logs || []).some((l) => l.detail?.targetUserId === target.id);
      ctx.assert(hasIt, 'ilgili log satırı bulunmalı');
    },
  },
];
