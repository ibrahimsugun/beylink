// Profil kategorisi — username kilidi, seo sanitize, FB pixel doğrulama, bio_html sanitize, hazır sayfa şablonu.
import db from '../db/connection.js';
import { profileModel } from '../models/profileModel.js';
import { linkModel } from '../models/linkModel.js';
import { sanitizeSeoSettings } from '../utils/seo.js';
import { sanitizeBioHtml, htmlToText } from '../utils/sanitizeHtml.js';
import { apiFetch, createTestOwner, createTestSub, tokenFor, createLinkFor, sqlNow } from './helpers.js';

export const profileTests = [
  {
    id: 'profile.apply-template-replaces-blocks',
    name: 'Hazır sayfa şablonu blokları değiştirir + profil günceller',
    category: 'Profil',
    description: 'POST /:id/apply-template → mevcut bloklar silinir, şablon blokları + ad/bio/tema yazılır.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      createLinkFor(p.id, { title: 'eski 1' });
      createLinkFor(p.id, { title: 'eski 2' });
      ctx.equal(linkModel.listByProfile(p.id).length, 2, 'başta 2 blok');
      const body = {
        theme_settings: { template: 'sunset', buttonStyle: 'pill', title_align: 'center', header_type: 'avatar' },
        display_name: 'Yeni Ad', bio: 'yeni açıklama',
        blocks: [
          { type: 'link', title: 'Web', url: 'ornek.com' },
          { type: 'divider', title: 'Sosyal' },
          { type: 'social', title: 'Instagram', url: 'https://instagram.com/x', icon_name: 'instagram' },
        ],
      };
      const r = await apiFetch(`/profiles/${p.id}/apply-template`, { method: 'POST', token: tokenFor(u), body });
      ctx.equal(r.status, 200, 'apply-template 200');
      const links = linkModel.listByProfile(p.id);
      ctx.equal(links.length, 3, 'eski bloklar silinip 3 yeni blok gelmeli');
      ctx.equal(links[0].url, 'https://ornek.com', 'URL normalize edilmeli (https://)');
      const after = profileModel.findById(p.id);
      ctx.equal(after.display_name, 'Yeni Ad', 'ad güncellenmeli');
      ctx.equal(after.bio, 'yeni açıklama', 'bio güncellenmeli');
      ctx.equal(after.theme_settings.template, 'sunset', 'tema güncellenmeli');
    },
  },
  {
    id: 'profile.apply-template-free-theme-any-plan',
    name: 'İçerik şablonu (serbest tema) her planda uygulanır',
    category: 'Profil',
    description: 'Free kullanıcı serbest temalı şablon uygular → 200 (içerik şablonları herkese açık).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'free' });
      const p = profileModel.findByUserId(u.id);
      const r = await apiFetch(`/profiles/${p.id}/apply-template`, {
        method: 'POST', token: tokenFor(u),
        body: { theme_settings: { template: 'forest', buttonStyle: 'soft' }, display_name: 'X', bio: 'y', blocks: [{ type: 'link', title: 'A', url: 'https://a.com' }] },
      });
      ctx.equal(r.status, 200, 'Free serbest tema şablonu 200');
    },
  },
  {
    id: 'profile.apply-template-pro-theme-backdoor-blocked',
    name: 'apply-template Pro-tema backdoor\'u kapatır',
    category: 'Profil',
    description: 'Free kullanıcı apply-template ile Pro tema (tpl_/preset) taşırsa → 403 (updateProfile ile aynı gate).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'free' });
      const p = profileModel.findByUserId(u.id);
      const r = await apiFetch(`/profiles/${p.id}/apply-template`, {
        method: 'POST', token: tokenFor(u),
        body: { theme_settings: { template: 'tpl_agency' }, blocks: [{ type: 'link', title: 'A', url: 'https://a.com' }] },
      });
      ctx.equal(r.status, 403, 'Free Pro-tema backdoor 403');
    },
  },
  {
    id: 'profile.apply-template-validates-blocks',
    name: 'apply-template geçersiz blok/URL reddeder',
    category: 'Profil',
    description: 'Geçersiz blok tipi → 400; URL gerektiren blokta boş URL → 400; javascript: şeması → 400.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const t = tokenFor(u);
      const bad1 = await apiFetch(`/profiles/${p.id}/apply-template`, { method: 'POST', token: t, body: { blocks: [{ type: 'bomb', title: 'x' }] } });
      ctx.equal(bad1.status, 400, 'geçersiz tip 400');
      const bad2 = await apiFetch(`/profiles/${p.id}/apply-template`, { method: 'POST', token: t, body: { blocks: [{ type: 'link', title: 'x' }] } });
      ctx.equal(bad2.status, 400, 'URL\'siz link 400');
      const bad3 = await apiFetch(`/profiles/${p.id}/apply-template`, { method: 'POST', token: t, body: { blocks: [{ type: 'link', title: 'x', url: 'javascript:alert(1)' }] } });
      ctx.equal(bad3.status, 400, 'javascript: şeması 400');
      // Bloklar reddedildi → mevcut profil bloğu değişmedi (transaction atomik)
      ctx.equal(linkModel.listByProfile(p.id).length, 0, 'başarısız uygulamada blok yazılmamalı');
    },
  },
  {
    id: 'profile.apply-template-requires-editable',
    name: 'apply-template düzenleme yetkisi ister (IDOR koruması)',
    category: 'Profil',
    description: 'Başka owner\'ın profiline apply-template → 403; sub can_edit_profile kapalıysa 403.',
    run: async (ctx) => {
      const owner1 = await createTestOwner(ctx);
      const owner2 = await createTestOwner(ctx);
      const p2 = profileModel.findByUserId(owner2.id);
      const r = await apiFetch(`/profiles/${p2.id}/apply-template`, {
        method: 'POST', token: tokenFor(owner1),
        body: { blocks: [{ type: 'link', title: 'A', url: 'https://a.com' }] },
      });
      ctx.assert(r.status === 403 || r.status === 404, `başka profile apply 403/404 (got ${r.status})`);
      ctx.equal(linkModel.listByProfile(p2.id).length, 0, 'kurban profilinin blokları değişmemeli');
    },
  },
  {
    id: 'profile.username-locked-after-signup',
    name: 'Kullanıcı adı kayıttan sonra değiştirilemez',
    category: 'Profil',
    description: 'PATCH /profiles/:id { username: "yeni" } → yok sayılır; DB\'de eski slug korunur.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      const before = p.username;
      const r = await apiFetch(`/profiles/${p.id}`, { method: 'PATCH', token: tokenFor(u), body: { username: 'brand-new-slug' } });
      ctx.equal(r.status, 200);
      const after = profileModel.findById(p.id);
      ctx.equal(after.username, before, 'slug değişmemeli');
    },
  },
  {
    id: 'profile.seo-sanitize-robots',
    name: 'sanitizeSeoSettings robots enum dışı değeri temizler',
    category: 'Profil',
    description: 'robots: "delete-google" gibi ihaneli değer düşürülür; index/noindex tutulur.',
    run: async (ctx) => {
      const good = sanitizeSeoSettings({ robots: 'noindex' });
      ctx.equal(good.robots, 'noindex');
      const bad = sanitizeSeoSettings({ robots: 'delete-google' });
      ctx.equal(bad.robots, 'index', 'geçersiz robots → varsayılan "index"');
    },
  },
  {
    id: 'profile.seo-fb-pixel-only-digits',
    name: 'FB Pixel ID yalnız rakama zorlanır',
    category: 'Profil',
    description: 'sanitizeSeoSettings pixel ID\'sinden harfleri atar, tam rakam bırakır (5-20 hane).',
    run: async (ctx) => {
      const r = sanitizeSeoSettings({ fbPixelId: '12ab34567890' });
      ctx.equal(r.fbPixelId, '1234567890', 'harfler atılmalı');
      const short = sanitizeSeoSettings({ fbPixelId: '12' });
      ctx.equal(short.fbPixelId, '', 'çok kısa → boş string');
    },
  },
  {
    id: 'profile.seo-canonical-https-forced',
    name: 'canonical URL http-only ise düşürülür veya http/https\'e zorlanır',
    category: 'Profil',
    description: 'javascript: gibi tehlikeli şema atılır; http/https geçerli.',
    run: async (ctx) => {
      const ok = sanitizeSeoSettings({ canonical: 'https://ok.com' });
      ctx.equal(ok.canonical, 'https://ok.com');
      const bad = sanitizeSeoSettings({ canonical: 'javascript:alert(1)' });
      ctx.equal(bad.canonical, '', 'tehlikeli şema → boş string');
    },
  },
  {
    id: 'profile.bio-html-sanitizer-xss',
    name: 'sanitizeBioHtml script + javascript: + on-handler kaldırır',
    category: 'Profil',
    description: 'Kirli HTML → temiz whitelist. Data URI, event handler, script bloğu atılır.',
    run: async (ctx) => {
      const dirty = '<script>alert(1)</script><b onclick="bad()">ok</b><a href="javascript:1">x</a><img src="data:image/png;base64,x">';
      const clean = sanitizeBioHtml(dirty);
      ctx.assert(!clean.includes('<script'), 'script kalmamalı');
      ctx.assert(!/on\w+\s*=/i.test(clean), 'event handler kalmamalı');
      ctx.assert(!clean.toLowerCase().includes('javascript:'), 'javascript: kalmamalı');
      ctx.assert(!clean.includes('<img'), '<img> whitelist dışı');
      ctx.contains(clean, '<b>ok</b>', '<b> korunmalı');
    },
  },
  {
    id: 'profile.bio-html-to-text',
    name: 'htmlToText tag\'ları atıp düz metin döndürür',
    category: 'Profil',
    description: 'Rich text bio\'dan düz metin türetilir → plain `bio` alanı senkron tutulur.',
    run: async (ctx) => {
      const t = htmlToText('<p>Merhaba <b>dünya</b></p>');
      ctx.contains(t, 'Merhaba', 'kelime kalmalı');
      ctx.contains(t, 'dünya', 'kelime kalmalı');
      ctx.assert(!t.includes('<'), 'tag olmamalı');
    },
  },
  {
    id: 'profile.publish-requires-verified-email',
    name: 'E-posta onaysız profil yayınlanamaz',
    category: 'Profil',
    description: 'Doğrulanmamış owner is_published=1 → 403 email_unverified; is_published=0 serbest; doğrulanınca yayınlanır.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { email_verified: 0 });
      const p = profileModel.findByUserId(u.id);
      db.prepare(`UPDATE profiles SET is_published = 0 WHERE id = ?`).run(p.id); // register onaysız → yayınsız başlar
      const pub = await apiFetch(`/profiles/${p.id}`, { method: 'PATCH', token: tokenFor(u), body: { is_published: true } });
      ctx.equal(pub.status, 403, 'yayınlama 403');
      ctx.equal(pub.body?.code, 'email_unverified', 'code email_unverified');
      ctx.equal(!!profileModel.findById(p.id).is_published, false, 'yayınlanmadı');
      // Yayından kaldırma (is_published=0) serbest olmalı
      const unpub = await apiFetch(`/profiles/${p.id}`, { method: 'PATCH', token: tokenFor(u), body: { is_published: false } });
      ctx.assert(unpub.status >= 200 && unpub.status < 300, 'yayından kaldırma serbest');
      // Doğrulanınca yayınlanabilir
      db.prepare(`UPDATE users SET email_verified = 1 WHERE id = ?`).run(u.id);
      const pub2 = await apiFetch(`/profiles/${p.id}`, { method: 'PATCH', token: tokenFor(u), body: { is_published: true } });
      ctx.assert(pub2.status >= 200 && pub2.status < 300, 'doğrulanınca yayınlanır');
      ctx.equal(!!profileModel.findById(p.id).is_published, true, 'yayında');
    },
  },
  {
    id: 'profile.publish-gate-exempts-subaccount',
    name: 'Alt hesap (e-postasız) e-posta onay gating\'inden muaf → yayınlayabilir',
    category: 'Profil',
    description: 'M35: sub kullanıcı e-postasız olduğundan e-posta gating uygulanmaz; email_verified=0 olsa da kendi profilini yayınlayabilir.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro' });
      const sub = await createTestSub(ctx, owner, { can_edit_profile: 1 });
      const sp = profileModel.findByUserId(sub.id);
      ctx.equal(sub.email ?? null, null, 'sub e-postasız');
      db.prepare(`UPDATE profiles SET is_published = 0 WHERE id = ?`).run(sp.id);
      const r = await apiFetch(`/profiles/${sp.id}`, { method: 'PATCH', token: tokenFor(sub), body: { is_published: true } });
      ctx.assert(r.status >= 200 && r.status < 300, `sub yayınlayabilmeli (got ${r.status})`);
      ctx.equal(!!profileModel.findById(sp.id).is_published, true, 'sub profili yayında');
    },
  },
];
