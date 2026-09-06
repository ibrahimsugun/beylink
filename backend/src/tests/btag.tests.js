// BTAG kategorisi — CRUD, unique per profile, IDOR koruma, two-hop redirect motoru.
import db from '../db/connection.js';
import { profileModel } from '../models/profileModel.js';
import { config } from '../config/env.js';
import { apiFetch, createTestOwner, createLinkFor, tokenFor, sqlNow } from './helpers.js';

export const btagTests = [
  {
    id: 'btag.crud-basic-plan',
    name: 'BTAG oluştur/güncelle/sil akışı (Basic)',
    category: 'BTAG',
    description: 'POST → PATCH → DELETE tüm adımlar 2xx. Kayıt DB\'de doğrulanır.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const p = profileModel.findByUserId(u.id);
      const token = tokenFor(u);
      const create = await apiFetch(`/btags/${p.id}`, { method: 'POST', token, body: { value: 'src1', label: 'Instagram' } });
      ctx.equal(create.status, 201, 'oluştur 201');
      const btagId = create.body?.btag?.id;
      ctx.assert(!!btagId, `btag id gelmeli, body: ${JSON.stringify(create.body).slice(0,100)}`);
      const upd = await apiFetch(`/btags/${p.id}/${btagId}`, { method: 'PATCH', token, body: { label: 'IG bio' } });
      ctx.equal(upd.status, 200);
      const del = await apiFetch(`/btags/${p.id}/${btagId}`, { method: 'DELETE', token });
      ctx.equal(del.status, 200);
      const row = db.prepare(`SELECT * FROM btags WHERE id = ?`).get(btagId);
      ctx.equal(row, undefined, 'silinen kayıt DB\'de yok');
    },
  },
  {
    id: 'btag.unique-per-profile',
    name: 'Aynı profilde aynı value ile ikinci BTAG 409',
    category: 'BTAG',
    description: 'İkinci INSERT UNIQUE(profile_id, value) ihlalinde 409 döner.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const p = profileModel.findByUserId(u.id);
      const token = tokenFor(u);
      const first = await apiFetch(`/btags/${p.id}`, { method: 'POST', token, body: { value: 'dup', label: 'a' } });
      ctx.equal(first.status, 201);
      const second = await apiFetch(`/btags/${p.id}`, { method: 'POST', token, body: { value: 'dup', label: 'b' } });
      ctx.equal(second.status, 409);
    },
  },
  {
    id: 'btag.idor-other-profile-blocked',
    name: 'Başkasının profilinde BTAG işlem 404 (IDOR koruma)',
    category: 'BTAG',
    description: 'A kullanıcısı B\'nin profile_id\'sini kullanarak POST/GET denemez.',
    run: async (ctx) => {
      const a = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const b = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const bp = profileModel.findByUserId(b.id);
      const r = await apiFetch(`/btags/${bp.id}`, { token: tokenFor(a) });
      ctx.assert(r.status === 404 || r.status === 403, `IDOR 403/404 beklenir (got ${r.status})`);
    },
  },
  {
    id: 'btag.redirect-two-hop-single-click',
    name: 'Link-gömülü BTAG two-hop\'ta tek tıklama sayılır',
    category: 'BTAG',
    description: '/api/go/:linkId → hop-1 kendine yönlendirir (log yok) → hop-2 hedefe + 1 tıklama satırı.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const p = profileModel.findByUserId(u.id);
      const link = createLinkFor(p.id, { type: 'link', title: 'Ext', url: 'https://example.com/final', btag: 'ig' });
      // İki tıklama farklı ziyaretçilerden — dedup nedeniyle 2 satır olmalı
      const c1 = new Map(); const c2 = new Map();
      const opts = { redirect: 'manual' };
      // Fetch redirect manual → İlk çağrı 302 (hop-1 → aynı URL, cookie set) → izleyicimiz ikinci çağrıyı manuel yapmalı
      // Basitlik için: 2 kez /api/go çağır ve DB'de analytics count'a bak.
      const base = `http://127.0.0.1:${config.port}`;
      const res1 = await fetch(`${base}/api/go/${link.id}`, { ...opts, headers: { cookie: 'beylink_vid=v-two-hop-1' } });
      // Hop-2 için Location header'ını takip et
      const loc1 = res1.headers.get('location');
      if (loc1 && loc1.includes('/api/go/')) {
        await fetch(loc1.startsWith('http') ? loc1 : `${base}${loc1}`, { ...opts, headers: { cookie: 'beylink_vid=v-two-hop-1' } });
      }
      const clicks = db.prepare(`SELECT COUNT(*) c FROM analytics WHERE profile_id = ? AND event_type = 'click'`).get(p.id).c;
      ctx.equal(clicks, 1, 'aynı visitor tek tıklama sayılmalı (dedup)');
    },
  },
];
