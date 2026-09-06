// Links kategorisi — URL normalize, tehlikeli scheme reddi, reorder, delete cascade.
import db from '../db/connection.js';
import { profileModel } from '../models/profileModel.js';
import { linkModel } from '../models/linkModel.js';
import { toHttpTarget, toSafeLinkTarget } from '../utils/url.js';
import { apiFetch, createTestOwner, createLinkFor, tokenFor } from './helpers.js';

export const linksTests = [
  {
    id: 'links.url-normalize-https',
    name: 'URL şemasız girildiğinde https:// ile normalize edilir',
    category: 'Linkler',
    description: 'toHttpTarget("example.com") → "https://example.com".',
    run: async (ctx) => {
      ctx.equal(toHttpTarget('example.com'), 'https://example.com');
      ctx.equal(toHttpTarget('https://x.com/y'), 'https://x.com/y');
      ctx.equal(toHttpTarget('http://x.com'), 'http://x.com');
    },
  },
  {
    id: 'links.reject-javascript-scheme',
    name: 'javascript:/data: şemaları reddedilir',
    category: 'Linkler',
    description: 'toHttpTarget bu şemalarda null döner → controller 400 üretir.',
    run: async (ctx) => {
      ctx.equal(toHttpTarget('javascript:alert(1)'), null);
      ctx.equal(toHttpTarget('data:text/html,<script>'), null);
      ctx.equal(toHttpTarget('file:///etc/passwd'), null);
    },
  },
  {
    id: 'links.create-endpoint-normalizes-url',
    name: 'POST /links şemasız URL\'yi kaydederken normalize eder',
    category: 'Linkler',
    description: 'POST body\'de "example.com" → DB\'de "https://example.com".',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const r = await apiFetch(`/links`, { method: 'POST', token: tokenFor(u), body: { profile_id: p.id, type: 'link', title: 'X', url: 'example.com' } });
      ctx.equal(r.status, 201);
      ctx.equal(r.body?.link?.url, 'https://example.com');
    },
  },
  {
    id: 'links.allows-mailto-tel',
    name: 'mailto: ve tel: bağlantıları kabul edilir (iletişim şemaları)',
    category: 'Linkler',
    description: 'toSafeLinkTarget mailto/tel korur, javascript reddeder; POST /links mailto ile 201.',
    run: async (ctx) => {
      ctx.equal(toSafeLinkTarget('mailto:ad@ornek.com'), 'mailto:ad@ornek.com', 'mailto korunur');
      ctx.equal(toSafeLinkTarget('tel:+905550000000'), 'tel:+905550000000', 'tel korunur');
      ctx.equal(toSafeLinkTarget('ornek.com'), 'https://ornek.com', 'şemasız https');
      ctx.equal(toSafeLinkTarget('javascript:alert(1)'), null, 'javascript reddedilir');
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const r = await apiFetch(`/links`, { method: 'POST', token: tokenFor(u), body: { profile_id: p.id, type: 'social', title: 'E-posta', url: 'mailto:ad@ornek.com', icon_name: 'mail' } });
      ctx.equal(r.status, 201, 'mailto social link 201');
      ctx.equal(r.body?.link?.url, 'mailto:ad@ornek.com', 'mailto DB\'ye aynen yazılır');
    },
  },
  {
    id: 'links.config-sanitizes-gallery-contact',
    name: 'Galeri görsel linki + iletişim website config\'i sunucuda güvene alınır',
    category: 'Linkler',
    description: 'M33: gallery images[].link ve contact website javascript:/data: içeriyorsa boşaltılır; http(s)/mailto korunur.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const tok = tokenFor(u);
      // Galeri: bir görsel geçerli http link, biri javascript: (XSS) — ikincisi boşaltılmalı, url (upload) dokunulmaz
      const gal = await apiFetch(`/links`, {
        method: 'POST', token: tok,
        body: { profile_id: p.id, type: 'gallery', title: 'Galeri', config: { columns: 2, images: [
          { url: '/uploads/a.jpg', link: 'ornek.com' },
          { url: '/uploads/b.jpg', link: 'javascript:alert(1)' },
        ] } },
      });
      ctx.equal(gal.status, 201, 'gallery 201');
      const imgs = gal.body?.link?.config?.images || [];
      ctx.equal(imgs[0]?.link, 'https://ornek.com', 'geçerli link https ile normalize edilir');
      ctx.equal(imgs[0]?.url, '/uploads/a.jpg', 'görsel upload yolu dokunulmaz');
      ctx.equal(imgs[1]?.link, '', 'javascript: link boşaltılır');
      // İletişim: website javascript: → boşaltılır
      const con = await apiFetch(`/links`, {
        method: 'POST', token: tok,
        body: { profile_id: p.id, type: 'contact', title: 'Kart', config: { fullName: 'Ali', website: 'javascript:alert(2)', phone: 'tel:+90555' } },
      });
      ctx.equal(con.status, 201, 'contact 201');
      ctx.equal(con.body?.link?.config?.website, '', 'contact website javascript: boşaltılır');
      // Güncelleme yolu da sanitize etmeli
      const upd = await apiFetch(`/links/${con.body.link.id}`, {
        method: 'PATCH', token: tok, body: { config: { fullName: 'Ali', website: 'https://ali.dev' } },
      });
      ctx.equal(upd.status, 200, 'contact update 200');
      ctx.equal(upd.body?.link?.config?.website, 'https://ali.dev', 'geçerli website korunur (update)');
    },
  },
  {
    id: 'links.reorder-preserves-order',
    name: 'PATCH /links/reorder sıra günceller',
    category: 'Linkler',
    description: '3 link A/B/C oluştur, sırayı C/A/B\'ye çevir; DB sort_order karşılıklı yansır.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const l1 = createLinkFor(p.id, { title: 'A', sort_order: 0 });
      const l2 = createLinkFor(p.id, { title: 'B', sort_order: 1 });
      const l3 = createLinkFor(p.id, { title: 'C', sort_order: 2 });
      const r = await apiFetch(`/links/reorder`, { method: 'PATCH', token: tokenFor(u), body: { profile_id: p.id, order: [l3.id, l1.id, l2.id] } });
      ctx.equal(r.status, 200);
      const rows = db.prepare(`SELECT id, sort_order FROM links WHERE profile_id = ? ORDER BY sort_order ASC`).all(p.id);
      ctx.equal(rows[0].id, l3.id, 'ilk sırada C');
      ctx.equal(rows[1].id, l1.id, 'ikinci sırada A');
      ctx.equal(rows[2].id, l2.id, 'üçüncü sırada B');
    },
  },
  {
    id: 'links.delete-cascades-analytics',
    name: 'Link silinince ilgili analytics satırları CASCADE\'lenir',
    category: 'Linkler',
    description: 'Foreign key ON DELETE CASCADE ile link\'e bağlı click analytics kayıtları da silinir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const link = createLinkFor(p.id);
      db.prepare(`INSERT INTO analytics (profile_id, link_id, event_type, visitor) VALUES (?, ?, 'click', ?)`).run(p.id, link.id, 'v-x');
      const before = db.prepare(`SELECT COUNT(*) c FROM analytics WHERE link_id = ?`).get(link.id).c;
      ctx.equal(before, 1);
      linkModel.remove(link.id);
      const after = db.prepare(`SELECT COUNT(*) c FROM analytics WHERE link_id = ?`).get(link.id).c;
      ctx.equal(after, 0, 'analytics cascade silinmeli');
    },
  },
];
