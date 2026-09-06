// Şablonlarım kategorisi — tasarım şablonu CRUD, export↔import round-trip, sanitize, uygula (kendi+sub),
// tema-gate, toplu uygula (Pro Plus), IDOR, askı guard.
import db from '../db/connection.js';
import { profileModel } from '../models/profileModel.js';
import { designTemplateModel } from '../models/designTemplateModel.js';
import { sanitizeThemeSettings, encodeTemplateCode, decodeTemplateCode } from '../utils/designTemplate.js';
import { apiFetch, createTestOwner, createTestSub, tokenFor, sqlNow } from './helpers.js';

const setTheme = (profileId, theme) => profileModel.update(profileId, { theme_settings: theme });

export const designTemplateTests = [
  {
    id: 'template.save-list-delete',
    name: 'Tasarım şablonu kaydet/listele/sil',
    category: 'Şablonlarım',
    description: 'POST /templates (profil anlık görüntüsü) → GET listede → DELETE ile kalkar.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const prof = profileModel.findByUserId(owner.id);
      setTheme(prof.id, { template: 'brand', buttonStyle: 'pill', title_align: 'left' });
      const token = tokenFor(owner);

      const c = await apiFetch('/templates', { method: 'POST', token, body: { name: 'Mavi', profile_id: prof.id } });
      ctx.equal(c.status, 201, 'kayıt 201');
      const id = c.body?.template?.id;
      ctx.equal(c.body?.template?.theme_settings?.template, 'brand', 'anlık görüntü tema doğru');

      const l = await apiFetch('/templates', { token });
      ctx.assert(l.body.templates.some((t) => t.id === id), 'listede görünmeli');

      const d = await apiFetch(`/templates/${id}`, { method: 'DELETE', token });
      ctx.equal(d.status, 200, 'sil 200');
      const l2 = await apiFetch('/templates', { token });
      ctx.assert(!l2.body.templates.some((t) => t.id === id), 'silindikten sonra listede yok');
    },
  },
  {
    id: 'template.export-import-roundtrip',
    name: 'Export kodu içe aktarınca aynı temayı verir',
    category: 'Şablonlarım',
    description: 'GET /export → kod → POST /import → yeni şablonun teması birebir aynı.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const prof = profileModel.findByUserId(owner.id);
      setTheme(prof.id, { template: 'midnight', buttonStyle: 'soft', layout: 'double' });
      const token = tokenFor(owner);
      const c = await apiFetch('/templates', { method: 'POST', token, body: { name: 'Gece', profile_id: prof.id } });
      const ex = await apiFetch(`/templates/${c.body.template.id}/export`, { token });
      ctx.assert(/^BLT1\./.test(ex.body.code), 'kod BLT1. ile başlar');
      ctx.contains(ex.body.link, 'import=', 'paylaşım linki import param içerir');

      const im = await apiFetch('/templates/import', { method: 'POST', token, body: { code: ex.body.code, name: 'Kopya' } });
      ctx.equal(im.status, 201, 'import 201');
      ctx.equal(im.body.template.theme_settings.template, 'midnight', 'tema key aynı');
      ctx.equal(im.body.template.theme_settings.buttonStyle, 'soft', 'buttonStyle aynı');
      ctx.equal(im.body.template.theme_settings.layout, 'double', 'layout aynı');
    },
  },
  {
    id: 'template.import-garbage-rejected',
    name: 'Bozuk/geçersiz şablon kodu reddedilir',
    category: 'Şablonlarım',
    description: 'Tanınmayan kod ve bozuk crc → 400.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const token = tokenFor(owner);
      const r1 = await apiFetch('/templates/import', { method: 'POST', token, body: { code: 'not-a-code' } });
      ctx.equal(r1.status, 400, 'çöp kod 400');
      const r2 = await apiFetch('/templates/import', { method: 'POST', token, body: { code: 'BLT1.zzzz.00000000' } });
      ctx.equal(r2.status, 400, 'bozuk crc 400');
    },
  },
  {
    id: 'template.sanitize-drops-junk',
    name: 'Şablon sanitize bilinmeyen/geçersiz alanları düşürür',
    category: 'Şablonlarım',
    description: 'sanitizeThemeSettings + roundtrip: junk/geçersiz enum düşer, geçerli değerler kalır.',
    run: async (ctx) => {
      const dirty = { template: 'tpl_agency', buttonStyle: 'evil', title_align: 'left', junk: 'DROP TABLE', header_icons: ['qr', 'x'], colors: { primary: '#fff', accent: 'javascript:' } };
      const clean = sanitizeThemeSettings(dirty);
      ctx.assert(!('junk' in clean), 'junk düşer');
      ctx.assert(!('buttonStyle' in clean), 'geçersiz enum (evil) düşer');
      ctx.equal(clean.title_align, 'left', 'geçerli enum kalır');
      ctx.equal(JSON.stringify(clean.header_icons), JSON.stringify(['qr']), 'geçersiz ikon düşer');
      ctx.equal(clean.colors.primary, '#fff', 'geçerli hex kalır');
      ctx.assert(!clean.colors.accent, 'geçersiz renk (javascript:) düşer');
      // decode de sanitize eder (bağımsız güvence)
      const back = decodeTemplateCode(encodeTemplateCode(dirty));
      ctx.assert(!('junk' in back), 'decode sonrası junk yok');
    },
  },
  {
    id: 'template.apply-to-own',
    name: 'Şablon aktif profile uygulanır (tema değişir)',
    category: 'Şablonlarım',
    description: 'Tema A ile şablon kaydet, profili B yap, uygula → profil teması A olur.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const prof = profileModel.findByUserId(owner.id);
      setTheme(prof.id, { template: 'forest', buttonStyle: 'rounded' });
      const token = tokenFor(owner);
      const c = await apiFetch('/templates', { method: 'POST', token, body: { name: 'Orman', profile_id: prof.id } });
      setTheme(prof.id, { template: 'minimal' }); // profili değiştir
      const a = await apiFetch(`/templates/${c.body.template.id}/apply`, { method: 'POST', token, body: { profile_id: prof.id } });
      ctx.equal(a.status, 200, 'uygula 200');
      ctx.equal(a.body.profile.theme_settings.template, 'forest', 'tema şablona döndü');
    },
  },
  {
    id: 'template.apply-to-sub',
    name: 'Owner şablonu alt hesap profiline uygular',
    category: 'Şablonlarım',
    description: 'Owner şablonu → sub profile apply → sub teması güncellenir.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const oProf = profileModel.findByUserId(owner.id);
      setTheme(oProf.id, { template: 'sunset', buttonStyle: 'pill' });
      const token = tokenFor(owner);
      const c = await apiFetch('/templates', { method: 'POST', token, body: { name: 'Gün batımı', profile_id: oProf.id } });
      const sub = await createTestSub(ctx, owner);
      const sProf = profileModel.findByUserId(sub.id);
      const a = await apiFetch(`/templates/${c.body.template.id}/apply`, { method: 'POST', token, body: { profile_id: sProf.id } });
      ctx.equal(a.status, 200, 'sub apply 200');
      ctx.equal(profileModel.findById(sProf.id).theme_settings.template, 'sunset', 'sub teması güncellendi');
    },
  },
  {
    id: 'template.apply-gated-theme-blocked',
    name: 'Pro-tema içeren şablon Pro olmayana uygulanamaz',
    category: 'Şablonlarım',
    description: 'Free owner tpl_agency kodunu içe aktarır (serbest) ama uygulayınca 403 (tema gate).',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'free' });
      const prof = profileModel.findByUserId(owner.id);
      setTheme(prof.id, { template: 'wave' });
      const token = tokenFor(owner);
      const code = encodeTemplateCode({ template: 'tpl_agency', buttonStyle: 'sharp' });
      const im = await apiFetch('/templates/import', { method: 'POST', token, body: { code } });
      ctx.equal(im.status, 201, 'import serbest (gate yok)');
      const a = await apiFetch(`/templates/${im.body.template.id}/apply`, { method: 'POST', token, body: { profile_id: prof.id } });
      ctx.equal(a.status, 403, 'Pro-tema uygulaması Free\'de 403');
    },
  },
  {
    id: 'template.bulk-proplus-only',
    name: 'Toplu uygula yalnızca Pro Plus',
    category: 'Şablonlarım',
    description: 'Pro owner apply-bulk 403; Pro Plus owner seçili alt hesaplara uygular.',
    run: async (ctx) => {
      // Pro → 403
      const pro = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const pProf = profileModel.findByUserId(pro.id);
      setTheme(pProf.id, { template: 'blush' });
      const pTok = tokenFor(pro);
      const pt = await apiFetch('/templates', { method: 'POST', token: pTok, body: { name: 'T', profile_id: pProf.id } });
      const sub0 = await createTestSub(ctx, pro);
      const s0Prof = profileModel.findByUserId(sub0.id);
      const blocked = await apiFetch(`/templates/${pt.body.template.id}/apply-bulk`, { method: 'POST', token: pTok, body: { profile_ids: [s0Prof.id] } });
      ctx.equal(blocked.status, 403, 'Pro toplu uygula 403');

      // Pro Plus → uygular
      const pp = await createTestOwner(ctx, { plan: 'proplus', expiresAt: sqlNow(30 * 86400000) });
      const ppProf = profileModel.findByUserId(pp.id);
      setTheme(ppProf.id, { template: 'mono' });
      const ppTok = tokenFor(pp);
      const ppt = await apiFetch('/templates', { method: 'POST', token: ppTok, body: { name: 'Ekip', profile_id: ppProf.id } });
      const s1 = await createTestSub(ctx, pp);
      const s2 = await createTestSub(ctx, pp);
      const p1 = profileModel.findByUserId(s1.id);
      const p2 = profileModel.findByUserId(s2.id);
      const ok = await apiFetch(`/templates/${ppt.body.template.id}/apply-bulk`, { method: 'POST', token: ppTok, body: { profile_ids: [p1.id, p2.id] } });
      ctx.equal(ok.status, 200, 'ProPlus toplu uygula 200');
      ctx.equal(ok.body.applied.length, 2, '2 alt hesaba uygulandı');
      ctx.equal(profileModel.findById(p1.id).theme_settings.template, 'mono', 'sub1 teması güncellendi');
    },
  },
  {
    id: 'template.bulk-idor-skips-foreign',
    name: 'Toplu uygula yabancı profili atlar (IDOR guard)',
    category: 'Şablonlarım',
    description: 'ProPlus bulk içine başka owner\'ın profili konursa failed listesine düşer, uygulanmaz.',
    run: async (ctx) => {
      const pp = await createTestOwner(ctx, { plan: 'proplus', expiresAt: sqlNow(30 * 86400000) });
      const ppProf = profileModel.findByUserId(pp.id);
      setTheme(ppProf.id, { template: 'brand' });
      const ppTok = tokenFor(pp);
      const t = await apiFetch('/templates', { method: 'POST', token: ppTok, body: { name: 'X', profile_id: ppProf.id } });
      const mySub = await createTestSub(ctx, pp);
      const mine = profileModel.findByUserId(mySub.id);
      // yabancı owner + profili
      const other = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const foreign = profileModel.findByUserId(other.id);
      const before = profileModel.findById(foreign.id).theme_settings.template;
      const r = await apiFetch(`/templates/${t.body.template.id}/apply-bulk`, { method: 'POST', token: ppTok, body: { profile_ids: [mine.id, foreign.id] } });
      ctx.equal(r.status, 200);
      ctx.equal(r.body.applied.length, 1, 'yalnız kendi alt hesabına uygulandı');
      ctx.equal(r.body.failed.length, 1, 'yabancı profil failed');
      ctx.equal(profileModel.findById(foreign.id).theme_settings.template, before, 'yabancı profil DEĞİŞMEDİ');
    },
  },
  {
    id: 'template.suspended-cannot-create',
    name: 'Askıdaki alt hesap şablon oluşturamaz',
    category: 'Şablonlarım',
    description: 'is_suspended=1 sub → POST /templates 403 (guardSuspended); GET liste 200.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const sub = await createTestSub(ctx, owner);
      db.prepare(`UPDATE users SET is_suspended = 1 WHERE id = ?`).run(sub.id);
      const sProf = profileModel.findByUserId(sub.id);
      const token = tokenFor(sub);
      const list = await apiFetch('/templates', { token });
      ctx.equal(list.status, 200, 'askıda GET serbest');
      const create = await apiFetch('/templates', { method: 'POST', token, body: { name: 'X', profile_id: sProf.id } });
      ctx.equal(create.status, 403, 'askıda oluşturma 403');
    },
  },
];
