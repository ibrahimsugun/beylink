// Plan yeteneği (cap) gating — SEO/CSV/richText/analyticsAdvanced/btag'ın plana göre kilitlenmesi.
import db from '../db/connection.js';
import { profileModel } from '../models/profileModel.js';
import { apiFetch, createTestOwner, createLinkFor, tokenFor, sqlNow } from './helpers.js';

const MICRO = 1_000_000;

export const capsTests = [
  {
    id: 'caps.free-blocks-seo',
    name: 'Free planda gelişmiş SEO endpoint\'i 403',
    category: 'Yetenek Kilitleri',
    description: 'PATCH /profiles/:id { seo_settings: {...} } Free için 403; Basic\'te 200.',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const p = profileModel.findByUserId(free.id);
      const rFree = await apiFetch(`/profiles/${p.id}`, { method: 'PATCH', token: tokenFor(free), body: { seo_settings: { robots: 'noindex' } } });
      ctx.equal(rFree.status, 403, 'Free SEO 403');
      const basic = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const bp = profileModel.findByUserId(basic.id);
      const rBasic = await apiFetch(`/profiles/${bp.id}`, { method: 'PATCH', token: tokenFor(basic), body: { seo_settings: { robots: 'noindex' } } });
      ctx.equal(rBasic.status, 200, 'Basic SEO 200');
    },
  },
  {
    id: 'caps.csv-export-pro-only',
    name: 'CSV dışa aktarma yalnız Pro planında (403 aksi)',
    category: 'Yetenek Kilitleri',
    description: 'GET /analytics/:id/export — Free/Basic\'te 403, Pro\'da 200 text/csv.',
    run: async (ctx) => {
      const basic = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const bp = profileModel.findByUserId(basic.id);
      const rBasic = await apiFetch(`/analytics/${bp.id}/export`, { token: tokenFor(basic) });
      ctx.equal(rBasic.status, 403, 'Basic CSV 403');
      const pro = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const pp = profileModel.findByUserId(pro.id);
      const rPro = await apiFetch(`/analytics/${pp.id}/export`, { token: tokenFor(pro) });
      ctx.equal(rPro.status, 200, 'Pro CSV 200');
    },
  },
  {
    id: 'caps.rich-text-bio-pro-only',
    name: 'Zengin metin bio yalnız Pro planında',
    category: 'Yetenek Kilitleri',
    description: 'PATCH /profiles/:id { bio_html: "<b>x</b>" } Free/Basic\'te 403, Pro\'da 200 + sanitize edilir.',
    run: async (ctx) => {
      const basic = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const bp = profileModel.findByUserId(basic.id);
      const rBasic = await apiFetch(`/profiles/${bp.id}`, { method: 'PATCH', token: tokenFor(basic), body: { bio_html: '<b>x</b>' } });
      ctx.equal(rBasic.status, 403, 'Basic rich-text 403');
      const pro = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const pp = profileModel.findByUserId(pro.id);
      const rPro = await apiFetch(`/profiles/${pp.id}`, { method: 'PATCH', token: tokenFor(pro), body: { bio_html: '<b>ok</b><script>bad</script>' } });
      ctx.equal(rPro.status, 200, 'Pro rich-text 200');
      const saved = profileModel.findById(pp.id);
      ctx.assert(!(saved.bio_html || '').includes('<script'), 'script kaldırılmalı');
    },
  },
  {
    id: 'caps.btag-free-blocked',
    name: 'BTAG API Free için 403, Basic+ için 200',
    category: 'Yetenek Kilitleri',
    description: 'GET /btags/:profileId Free\'de 403; Basic\'te 200.',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const fp = profileModel.findByUserId(free.id);
      const rFree = await apiFetch(`/btags/${fp.id}`, { token: tokenFor(free) });
      ctx.equal(rFree.status, 403, 'Free BTAG 403');
      const basic = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const bp = profileModel.findByUserId(basic.id);
      const rBasic = await apiFetch(`/btags/${bp.id}`, { token: tokenFor(basic) });
      ctx.equal(rBasic.status, 200, 'Basic BTAG 200');
    },
  },
  {
    id: 'caps.preset-theme-basic-plus',
    name: 'Hazır (preset) tema Basic ve Pro planlarında uygulanır',
    category: 'Yetenek Kilitleri',
    description: 'PATCH theme_settings.template=preset → Free\'de 403; Basic ve Pro\'da 200 + kaydedilir.',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const fp = profileModel.findByUserId(free.id);
      const rFree = await apiFetch(`/profiles/${fp.id}`, { method: 'PATCH', token: tokenFor(free), body: { theme_settings: { template: 'corporate' } } });
      ctx.equal(rFree.status, 403, 'Free preset 403');
      const basic = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const bp = profileModel.findByUserId(basic.id);
      const rBasic = await apiFetch(`/profiles/${bp.id}`, { method: 'PATCH', token: tokenFor(basic), body: { theme_settings: { template: 'finance' } } });
      ctx.equal(rBasic.status, 200, 'Basic preset 200');
      ctx.equal(profileModel.findById(bp.id).theme_settings.template, 'finance', 'Basic preset kaydedilmeli');
      const pro = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const pp = profileModel.findByUserId(pro.id);
      const rPro = await apiFetch(`/profiles/${pp.id}`, { method: 'PATCH', token: tokenFor(pro), body: { theme_settings: { template: 'legal' } } });
      ctx.equal(rPro.status, 200, 'Pro preset 200');
    },
  },
  {
    id: 'caps.free-template-any-plan',
    name: 'Serbest (temel) tema her planda uygulanır',
    category: 'Yetenek Kilitleri',
    description: 'Free kullanıcı serbest bir şablon (midnight) uygular → 200; gating serbest şablonları engellemez.',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const fp = profileModel.findByUserId(free.id);
      const r = await apiFetch(`/profiles/${fp.id}`, { method: 'PATCH', token: tokenFor(free), body: { theme_settings: { template: 'midnight', title_align: 'left' } } });
      ctx.equal(r.status, 200, 'Free serbest tema 200');
      ctx.equal(profileModel.findById(fp.id).theme_settings.template, 'midnight');
    },
  },
  {
    id: 'caps.preset-theme-unknown-failclosed',
    name: 'Bilinmeyen template Free\'de reddedilir (fail-closed)',
    category: 'Yetenek Kilitleri',
    description: 'Serbest allowlist dışındaki her değer (çöp/gelecek preset) Pro ister → non-Pro 403.',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const fp = profileModel.findByUserId(free.id);
      const r = await apiFetch(`/profiles/${fp.id}`, { method: 'PATCH', token: tokenFor(free), body: { theme_settings: { template: '__hacker_theme__' } } });
      ctx.equal(r.status, 403, 'bilinmeyen template non-Pro\'da 403');
    },
  },
  {
    id: 'caps.preset-theme-grandfathered-edit',
    name: 'Preset temalı kullanıcı plandan düşse de diğer ayarları düzenleyebilir',
    category: 'Yetenek Kilitleri',
    description: 'template zaten preset (grandfathered), non-Pro sadece title_align değiştirir → 200 (brick yok, template değişmiyor).',
    run: async (ctx) => {
      // Pro değil ama profilinde zaten bir preset kayıtlı (ör. eskiden Pro'ydu)
      const u = await createTestOwner(ctx, { plan: 'free' });
      const p = profileModel.findByUserId(u.id);
      profileModel.update(p.id, { theme_settings: { template: 'corporate', title_align: 'center' } });
      // Aynı preset template ile başka bir alanı değiştir → izin verilmeli
      const r = await apiFetch(`/profiles/${p.id}`, { method: 'PATCH', token: tokenFor(u), body: { theme_settings: { template: 'corporate', title_align: 'left' } } });
      ctx.equal(r.status, 200, 'template değişmiyorsa 200 olmalı');
      ctx.equal(profileModel.findById(p.id).theme_settings.title_align, 'left', 'diğer ayar güncellenmeli');
    },
  },
  {
    id: 'caps.template-basic-plus',
    name: 'Komple şablon (template) Basic ve Pro planlarında uygulanır',
    category: 'Yetenek Kilitleri',
    description: 'PATCH theme_settings.template=tpl_* → Free 403; Basic ve Pro 200 + bundle kaydedilir (fail-closed allowlist).',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const fp = profileModel.findByUserId(free.id);
      const rFree = await apiFetch(`/profiles/${fp.id}`, { method: 'PATCH', token: tokenFor(free), body: { theme_settings: { template: 'tpl_executive', buttonStyle: 'sharp', title_align: 'left' } } });
      ctx.equal(rFree.status, 403, 'Free template 403');
      const basic = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const bp = profileModel.findByUserId(basic.id);
      const rBasic = await apiFetch(`/profiles/${bp.id}`, { method: 'PATCH', token: tokenFor(basic), body: { theme_settings: { template: 'tpl_musician', buttonStyle: 'pill' } } });
      ctx.equal(rBasic.status, 200, 'Basic template 200');
      ctx.equal(profileModel.findById(bp.id).theme_settings.template, 'tpl_musician', 'Basic template kaydedilmeli');
      const pro = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const pp = profileModel.findByUserId(pro.id);
      const rPro = await apiFetch(`/profiles/${pp.id}`, { method: 'PATCH', token: tokenFor(pro), body: { theme_settings: { template: 'tpl_agency', buttonStyle: 'rounded', title_align: 'center', header_type: 'avatar' } } });
      ctx.equal(rPro.status, 200, 'Pro template 200');
      const saved = profileModel.findById(pp.id).theme_settings;
      ctx.equal(saved.template, 'tpl_agency', 'template kaydedilmeli');
      ctx.equal(saved.buttonStyle, 'rounded', 'buttonStyle bundle kaydedilmeli');
    },
  },
  {
    id: 'caps.button-shape-free-any-plan',
    name: 'Buton şekli (buttonStyle) her planda serbest',
    category: 'Yetenek Kilitleri',
    description: 'Free kullanıcı buton şeklini (pill) template değiştirmeden ayarlar → 200; şekil ücretsiz.',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const fp = profileModel.findByUserId(free.id);
      // Serbest tema + pill şekli (template serbest allowlist'te → gate yok)
      const r = await apiFetch(`/profiles/${fp.id}`, { method: 'PATCH', token: tokenFor(free), body: { theme_settings: { template: 'midnight', buttonStyle: 'pill' } } });
      ctx.equal(r.status, 200, 'Free buton şekli 200');
      ctx.equal(profileModel.findById(fp.id).theme_settings.buttonStyle, 'pill', 'buttonStyle kaydedilmeli');
    },
  },
  {
    id: 'caps.analytics-range-free-clamped',
    name: 'Free planda kısa aralık talebi 30d\'ye kilitlenir',
    category: 'Yetenek Kilitleri',
    description: 'range=1h Free için kabul edilmez → yanıtta range=30d + advanced=false. Basic\'te 1h + advanced=true.',
    run: async (ctx) => {
      const free = await createTestOwner(ctx, { plan: 'free' });
      const fp = profileModel.findByUserId(free.id);
      const rFree = await apiFetch(`/analytics/${fp.id}?range=1h`, { token: tokenFor(free) });
      ctx.equal(rFree.status, 200);
      ctx.equal(rFree.body?.range, '30d', 'Free 1h → 30d\'ye kilitli');
      ctx.equal(rFree.body?.advanced, false, 'advanced=false');
      const basic = await createTestOwner(ctx, { plan: 'basic', expiresAt: sqlNow(30 * 86400000) });
      const bp = profileModel.findByUserId(basic.id);
      const rBasic = await apiFetch(`/analytics/${bp.id}?range=1h`, { token: tokenFor(basic) });
      ctx.equal(rBasic.body?.range, '1h', 'Basic 1h\'te kalır');
      ctx.equal(rBasic.body?.advanced, true, 'advanced=true');
    },
  },
];
