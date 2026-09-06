// Analitik kategorisi — view/click dedup, UA browser/os, ziyaretçi IP-hash yedeği, BTAG dedup.
import db from '../db/connection.js';
import { profileModel } from '../models/profileModel.js';
import { analyticsModel } from '../models/analyticsModel.js';
import { parseBrowser, parseOs, parseDevice } from '../utils/ua.js';
import { resolveVisitor } from '../utils/visitor.js';
import { resolveCountry } from '../utils/geoip.js';
import { apiFetch, createTestOwner, createLinkFor } from './helpers.js';

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export const analyticsTests = [
  {
    id: 'analytics.view-dedup-same-day',
    name: 'Aynı ziyaretçi aynı gün 1 görüntülenme sayılır',
    category: 'Analitik',
    description: '5 kez view (aynı visitor, aynı gün) → tek satır (recordDedup).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const visitor = 'v-' + ctx.uniq('vis');
      for (let i = 0; i < 5; i++) analyticsModel.recordDedup({ profileId: p.id, eventType: 'view', visitor, linkId: null });
      const c = db.prepare(`SELECT COUNT(*) c FROM analytics WHERE profile_id = ? AND event_type = 'view'`).get(p.id).c;
      ctx.equal(c, 1, '5 view → 1 satır');
    },
  },
  {
    id: 'analytics.click-dedup-per-link',
    name: 'Aynı ziyaretçi aynı link + gün 1 tıklama sayılır',
    category: 'Analitik',
    description: '5 kez click (aynı visitor+link+gün) → 1 satır; farklı link ayrı sayılır.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const l1 = createLinkFor(p.id, { title: 'L1', url: 'https://a.com' });
      const l2 = createLinkFor(p.id, { title: 'L2', url: 'https://b.com' });
      const visitor = 'v-' + ctx.uniq('vis');
      for (let i = 0; i < 5; i++) analyticsModel.recordDedup({ profileId: p.id, eventType: 'click', visitor, linkId: l1.id });
      analyticsModel.recordDedup({ profileId: p.id, eventType: 'click', visitor, linkId: l2.id });
      const rows = db.prepare(`SELECT link_id, COUNT(*) c FROM analytics WHERE profile_id = ? AND event_type = 'click' GROUP BY link_id`).all(p.id);
      ctx.equal(rows.length, 2);
      ctx.equal(rows.find((r) => r.link_id === l1.id)?.c, 1);
    },
  },
  {
    id: 'analytics.ua-parses-browser-os',
    name: 'UA metninden tarayıcı + OS doğru çıkarılır',
    category: 'Analitik',
    description: 'parseBrowser/parseOs Chrome+Mac + iPhone+iOS ayrımını yapar.',
    run: async (ctx) => {
      ctx.equal(parseBrowser(CHROME_UA), 'Chrome');
      ctx.equal(parseOs(CHROME_UA), 'macOS');
      ctx.equal(parseBrowser(IPHONE_UA), 'Safari');
      ctx.equal(parseOs(IPHONE_UA), 'iOS');
      ctx.equal(parseDevice(IPHONE_UA), 'mobile');
      ctx.equal(parseDevice(CHROME_UA), 'desktop');
    },
  },
  {
    id: 'analytics.visitor-ip-hash-fallback',
    name: 'Visitor yoksa IP-hash yedeği kullanılır',
    category: 'Analitik',
    description: 'resolveVisitor: tarayıcı visitor\'ı yoksa "ip-<hash>" yedeği döner (ham IP saklanmaz).',
    run: async (ctx) => {
      const v = resolveVisitor({ ip: '127.0.0.1' }, null);
      ctx.assert(String(v).startsWith('ip-'), 'IP-hash "ip-" ile başlamalı');
      const same = resolveVisitor({ ip: '127.0.0.1' }, null);
      ctx.equal(v, same, 'aynı IP → aynı hash');
      const diff = resolveVisitor({ ip: '10.0.0.5' }, null);
      ctx.assert(v !== diff, 'farklı IP → farklı hash');
    },
  },
  {
    id: 'analytics.track-endpoint-dedup',
    name: 'POST /public/track aynı ziyaretçiden ikinci view\'i saymaz',
    category: 'Analitik',
    description: 'Aynı profile+visitor için iki POST → DB\'de tek view satırı.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const visitor = 'v-' + ctx.uniq('trk');
      for (let i = 0; i < 3; i++) {
        await apiFetch('/public/track', { method: 'POST', body: { profile_id: p.id, event_type: 'view', visitor } });
      }
      const c = db.prepare(`SELECT COUNT(*) c FROM analytics WHERE profile_id = ? AND event_type = 'view'`).get(p.id).c;
      ctx.equal(c, 1);
    },
  },
  {
    id: 'analytics.click-dedup-btag-distinct',
    name: 'Aynı link farklı BTAG atıfı korunur, aynı BTAG tekrarı teklenir',
    category: 'Analitik',
    description: 'Aynı visitor+link+gün: banner_A + banner_B → 2 satır (atıf korunur); banner_A tekrarı → dedup.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const l = createLinkFor(p.id, { title: 'L', url: 'https://a.com' });
      const visitor = 'v-' + ctx.uniq('bt');
      analyticsModel.recordDedup({ profileId: p.id, eventType: 'click', visitor, linkId: l.id, btag: 'banner_A' });
      analyticsModel.recordDedup({ profileId: p.id, eventType: 'click', visitor, linkId: l.id, btag: 'banner_B' });
      analyticsModel.recordDedup({ profileId: p.id, eventType: 'click', visitor, linkId: l.id, btag: 'banner_A' }); // tekrar → dedup
      const rows = db.prepare(`SELECT btag, COUNT(*) c FROM analytics WHERE profile_id = ? AND event_type = 'click' GROUP BY btag ORDER BY btag`).all(p.id);
      ctx.equal(rows.length, 2, 'iki farklı banner → iki satır');
      ctx.equal(rows.find((r) => r.btag === 'banner_A')?.c, 1, 'banner_A tekrar teklendi');
      ctx.equal(rows.find((r) => r.btag === 'banner_B')?.c, 1, 'banner_B ayrı sayıldı');
    },
  },
  {
    id: 'analytics.geoip-resolve-country',
    name: 'GeoIP (geoip-lite) IP→ülke çözer',
    category: 'Analitik',
    description: 'geoip-lite bundled datası: 8.8.8.8→US, ::ffff:8.8.8.8→US (mapped), loopback/geçersiz→null.',
    run: async (ctx) => {
      ctx.equal(resolveCountry('8.8.8.8'), 'US', 'Google DNS (8.8.8.8) → US');
      ctx.equal(resolveCountry('::ffff:8.8.8.8'), 'US', 'IPv4-mapped IPv6 → US');
      const cc = resolveCountry('81.213.1.1');
      ctx.assert(/^[A-Z]{2}$/.test(cc || ''), `gerçek IP 2 harfli ülke kodu döndürmeli (got ${cc})`);
      ctx.equal(resolveCountry('127.0.0.1'), null, 'loopback → null');
      ctx.equal(resolveCountry('not-an-ip'), null, 'geçersiz → null');
    },
  },
  {
    id: 'analytics.geoip-stamps-country-on-track',
    name: 'GeoIP ülke /public/track kaydına damgalanır (wiring)',
    category: 'Analitik',
    description: 'M34 uçtan uca: X-Forwarded-For 8.8.8.8 ile track → analytics.country=US (trust proxy → req.ip). Loopback → null.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      db.prepare(`UPDATE profiles SET is_published = 1 WHERE id = ?`).run(p.id);
      // X-Forwarded-For ile ABD IP'si → country=US olmalı (app.set('trust proxy',1) → req.ip = XFF)
      const r = await apiFetch(`/public/track`, {
        method: 'POST',
        headers: { 'X-Forwarded-For': '8.8.8.8' },
        body: { profile_id: p.id, event_type: 'view', visitor: 'geo-v-us' },
      });
      ctx.equal(r.status, 200, 'track 200');
      const row = db.prepare(`SELECT country FROM analytics WHERE profile_id = ? AND visitor = 'geo-v-us'`).get(p.id);
      ctx.equal(row?.country, 'US', 'ABD IP → ülke US damgalanmalı');
      // Loopback (XFF yok) → null (Bilinmiyor); farklı visitor+gün dedup'a takılmaz
      const r2 = await apiFetch(`/public/track`, {
        method: 'POST',
        body: { profile_id: p.id, event_type: 'view', visitor: 'geo-v-local' },
      });
      ctx.equal(r2.status, 200, 'loopback track 200');
      const row2 = db.prepare(`SELECT country FROM analytics WHERE profile_id = ? AND visitor = 'geo-v-local'`).get(p.id);
      ctx.equal(row2?.country ?? null, null, 'loopback → country null');
    },
  },
];
