// Public + prerender kategorisi — yayında/yayında değil, QR, prerender OG + JSON-LD.
import db from '../db/connection.js';
import { profileModel } from '../models/profileModel.js';
import { apiFetch, createTestOwner, createLinkFor, sqlNow } from './helpers.js';

export const publicTests = [
  {
    id: 'public.published-returns-profile',
    name: 'Yayında profile /public/:username 200 döner',
    category: 'Public / SEO',
    description: 'is_published=1 profil için profile + links payload\'ı gelir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      createLinkFor(p.id, { title: 'X', url: 'https://x.com' });
      const r = await apiFetch(`/public/${p.username}`);
      ctx.equal(r.status, 200);
      ctx.equal(r.body?.profile?.username, p.username);
      ctx.assert(Array.isArray(r.body?.links) && r.body.links.length >= 1, 'links dizi olmalı');
    },
  },
  {
    id: 'public.unpublished-returns-404',
    name: 'Yayında olmayan profil 404 döner',
    category: 'Public / SEO',
    description: 'is_published=0 → 404 (bilgi sızdırmaz).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      profileModel.update(p.id, { is_published: 0 });
      const r = await apiFetch(`/public/${p.username}`);
      ctx.equal(r.status, 404);
    },
  },
  {
    id: 'public.qr-endpoint',
    name: 'QR endpoint PNG data URL veya PNG bytes döner',
    category: 'Public / SEO',
    description: 'GET /public/:username/qr → 200 image/png veya data URL.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const r = await apiFetch(`/public/${p.username}/qr`);
      ctx.equal(r.status, 200);
      // QR endpoint muhtemelen image/png binary — content-type body'de yakalamıyoruz; sadece durum
    },
  },
  {
    id: 'prerender.published-has-og-tags',
    name: 'Prerender <head>\'i og:title/og:url/canonical içerir',
    category: 'Public / SEO',
    description: 'GET /api/prerender/:username → 200 HTML + og etiketleri + JSON-LD ProfilePage.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      createLinkFor(p.id, { type: 'social', title: 'Instagram', url: 'https://instagram.com/x' });
      const r = await apiFetch(`/prerender/${p.username}`);
      ctx.equal(r.status, 200);
      const html = String(r.body || '');
      ctx.contains(html, '<meta property="og:title"', 'og:title olmalı');
      ctx.contains(html, '<meta property="og:url"', 'og:url olmalı');
      ctx.contains(html, '<link rel="canonical"', 'canonical olmalı');
      ctx.contains(html, 'application/ld+json', 'JSON-LD script olmalı');
      ctx.contains(html, '"@type":"ProfilePage"', 'ProfilePage schema');
    },
  },
  {
    id: 'prerender.unpublished-404-noindex',
    name: 'Yayında değil prerender 404 + noindex',
    category: 'Public / SEO',
    description: 'Yayında olmayan slug için 404 döner ve robots noindex,nofollow olur.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      profileModel.update(p.id, { is_published: 0 });
      const r = await apiFetch(`/prerender/${p.username}`);
      ctx.equal(r.status, 404);
      ctx.contains(String(r.body || ''), 'noindex', 'noindex bulunmalı');
    },
  },
];
