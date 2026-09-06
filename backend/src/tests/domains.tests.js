// Özel Alan Adı (branded domain) kategorisi — plan kapısı, CRUD/IDOR, tls-check fail-closed,
// Host-farkında yönlendirme (resolveHost), doğrulama durum geçişleri (gerçek + sahte DNS resolver).
import db from '../db/connection.js';
import { domainModel, normalizeDomain } from '../models/domainModel.js';
import { verifyDomain } from '../services/domainVerify.js';
import { profileModel } from '../models/profileModel.js';
import { config } from '../config/env.js';
import { apiFetch, hostFetch, createTestOwner, tokenFor, sqlNow } from './helpers.js';

const PROPLUS = { plan: 'proplus', expiresAt: sqlNow(30 * 86400000) };

// ctx.uniq() alt çizgi (_) üretir ama hostname'ler alt çizgi kabul etmez (normalizeDomain regex'i
// yalnız [a-z0-9-] izin verir) — testler için alt çizgisiz benzersiz bir domain üretir.
const uniqDomain = (ctx, tag, tld = 'example') => `${ctx.uniq(tag).toLowerCase().replace(/_/g, '-')}.${tld}`;

export const domainsTests = [
  // --- Gate (A5: yalnız Pro Plus) ---
  {
    id: 'domains.gate-non-proplus-403',
    name: 'Pro planında /api/domains 403 (brandedDomain kapalı)',
    category: 'Özel Alan Adı',
    description: 'requirePlanCap(\'brandedDomain\') yalnız proplus\'ta açık; pro dahil diğerleri 403.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const r = await apiFetch('/domains', { token: tokenFor(u) });
      ctx.equal(r.status, 403, 'pro planda 403 beklenir');
    },
  },
  {
    id: 'domains.gate-proplus-allowed',
    name: 'Pro Plus planında /api/domains erişilebilir',
    category: 'Özel Alan Adı',
    description: 'GET /api/domains proplus\'ta 200 + domains dizisi döner.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const r = await apiFetch('/domains', { token: tokenFor(u) });
      ctx.equal(r.status, 200);
      ctx.assert(Array.isArray(r.body?.domains), 'domains dizisi dönmeli');
    },
  },

  // --- CRUD + A6 (hesap başına 1) + doğrulama ---
  {
    id: 'domains.create-then-max-one-409',
    name: 'Domain ekleme 201; ikinci domain 409 (hesap başına 1)',
    category: 'Özel Alan Adı',
    description: 'A6: hesap başına yalnız 1 özel domain. instructions (aRecord/cnameTarget/txtHost/txtValue) döner.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const token = tokenFor(u);
      const domain = uniqDomain(ctx, 'dom');
      const first = await apiFetch('/domains', { method: 'POST', token, body: { domain } });
      ctx.equal(first.status, 201, 'ilk domain 201');
      ctx.equal(first.body?.domain?.status, 'pending', 'başlangıç durumu pending');
      ctx.assert(!!first.body?.domain?.instructions?.cnameTarget, 'instructions.cnameTarget dönmeli');
      ctx.assert(!!first.body?.domain?.instructions?.txtValue, 'instructions.txtValue dönmeli');

      const second = await apiFetch('/domains', { method: 'POST', token, body: { domain: `another-${domain}` } });
      ctx.equal(second.status, 409, 'ikinci domain eklemeye 409 dönmeli');
    },
  },
  {
    id: 'domains.create-invalid-domain-400',
    name: 'Geçersiz alan adı girişi 400 döner',
    category: 'Özel Alan Adı',
    description: 'normalizeDomain nokta/TLD içermeyen girdiyi reddeder.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const r = await apiFetch('/domains', { method: 'POST', token: tokenFor(u), body: { domain: 'not a domain' } });
      ctx.equal(r.status, 400);
    },
  },
  {
    id: 'domains.duplicate-domain-across-accounts-409',
    name: 'Başka hesapta kayıtlı domain tekrar eklenemez (409)',
    category: 'Özel Alan Adı',
    description: 'custom_domains.domain UNIQUE — iki farklı hesap aynı domaini ekleyemez.',
    run: async (ctx) => {
      const a = await createTestOwner(ctx, PROPLUS);
      const b = await createTestOwner(ctx, PROPLUS);
      const domain = uniqDomain(ctx, 'dup');
      const first = await apiFetch('/domains', { method: 'POST', token: tokenFor(a), body: { domain } });
      ctx.equal(first.status, 201);
      const second = await apiFetch('/domains', { method: 'POST', token: tokenFor(b), body: { domain } });
      ctx.equal(second.status, 409, 'başka hesapta kayıtlı domain 409 dönmeli');
    },
  },
  {
    id: 'domains.idor-cross-account-blocked',
    name: 'Başkasının domainini silme/doğrulama 404 (IDOR koruma)',
    category: 'Özel Alan Adı',
    description: 'A kullanıcısı B\'nin domain id\'siyle DELETE/verify deneyemez.',
    run: async (ctx) => {
      const a = await createTestOwner(ctx, PROPLUS);
      const b = await createTestOwner(ctx, PROPLUS);
      const domain = uniqDomain(ctx, 'idor');
      const created = await apiFetch('/domains', { method: 'POST', token: tokenFor(a), body: { domain } });
      const domainId = created.body?.domain?.id;
      ctx.assert(!!domainId, 'domain id gelmeli');

      const del = await apiFetch(`/domains/${domainId}`, { method: 'DELETE', token: tokenFor(b) });
      ctx.equal(del.status, 404, 'başkasının domainini silmeye 404 dönmeli');

      const verify = await apiFetch(`/domains/${domainId}/verify`, { method: 'POST', token: tokenFor(b) });
      ctx.equal(verify.status, 404, 'başkasının domainini doğrulamaya 404 dönmeli');
    },
  },
  {
    id: 'domains.remove-then-can-add-again',
    name: 'Domain silinince aynı hesap yeni domain ekleyebilir',
    category: 'Özel Alan Adı',
    description: 'DELETE sonrası A6 sayacı düşer; yeni POST 201 döner.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const token = tokenFor(u);
      const domain1 = uniqDomain(ctx, 'rm1');
      const created = await apiFetch('/domains', { method: 'POST', token, body: { domain: domain1 } });
      const domainId = created.body?.domain?.id;
      const del = await apiFetch(`/domains/${domainId}`, { method: 'DELETE', token });
      ctx.equal(del.status, 200);
      const domain2 = uniqDomain(ctx, 'rm2');
      const created2 = await apiFetch('/domains', { method: 'POST', token, body: { domain: domain2 } });
      ctx.equal(created2.status, 201, 'silme sonrası yeni domain eklenebilmeli');
    },
  },

  // --- tls-check (Caddy `ask` kapısı) — fail-closed ---
  {
    id: 'domains.tls-check-unknown-domain-403',
    name: 'tls-check: kayıtsız domain 403',
    category: 'Özel Alan Adı',
    description: 'Hiç eklenmemiş bir domain için Caddy ask kapısı 403 döner.',
    run: async (ctx) => {
      const r = await apiFetch(`/domains/tls-check?domain=${uniqDomain(ctx, 'nope')}`);
      ctx.equal(r.status, 403);
    },
  },
  {
    id: 'domains.tls-check-pending-403-then-active-200-then-downgrade-403',
    name: 'tls-check: pending 403 → active 200 → plan düşünce fail-closed 403',
    category: 'Özel Alan Adı',
    description: 'A2/A5 kesişimi: yalnız active + sahibinin GÜNCEL planı brandedDomain cap\'ine sahipse 200.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const domain = uniqDomain(ctx, 'tls');
      const created = await apiFetch('/domains', { method: 'POST', token: tokenFor(u), body: { domain } });
      const domainId = created.body?.domain?.id;

      const pendingCheck = await apiFetch(`/domains/tls-check?domain=${domain}`);
      ctx.equal(pendingCheck.status, 403, 'pending durumda 403');

      db.prepare(`UPDATE custom_domains SET status='active', verified_at=datetime('now') WHERE id=?`).run(domainId);
      const activeCheck = await apiFetch(`/domains/tls-check?domain=${domain}`);
      ctx.equal(activeCheck.status, 200, 'active durumda 200');

      db.prepare(`UPDATE users SET plan='free' WHERE id=?`).run(u.id);
      const downgradedCheck = await apiFetch(`/domains/tls-check?domain=${domain}`);
      ctx.equal(downgradedCheck.status, 403, 'plan düşünce (fail-closed) tekrar 403 olmalı');
    },
  },

  // --- Host-farkında yönlendirme (resolveHost + publicController) ---
  {
    id: 'domains.host-routing-root-serves-target-profile',
    name: 'Host: özel domain kökü (/) hedef profili döndürür',
    category: 'Özel Alan Adı',
    description: 'resolveHost + getPublicRootProfile: aktif domainin Host başlığıyla / → target_profile_id.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const p = profileModel.findByUserId(u.id);
      profileModel.update(p.id, { is_published: 1 });
      const domain = uniqDomain(ctx, 'root');
      const row = domainModel.create({ userId: u.id, domain, targetProfileId: p.id, verifyToken: 'tok' });
      domainModel.setVerifyResult(row.id, { status: 'active', verifyMethod: 'dns_a' });

      const r = await hostFetch('/public/', domain);
      ctx.equal(r.status, 200);
      ctx.equal(r.body?.profile?.username, p.username, 'kök profil doğru kullanıcıyı döndürmeli');
    },
  },
  {
    id: 'domains.host-routing-own-slug-ok-cross-owner-404',
    name: 'Host: sahibinin kendi slug\'ı 200; başka sahibin slug\'ı 404',
    category: 'Özel Alan Adı',
    description: 'A4: özel domain altında yalnız sahibinin profilleri görünür; başkasının slug\'ı 404.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, PROPLUS);
      const other = await createTestOwner(ctx, { plan: 'free' });
      const ownerProfile = profileModel.findByUserId(owner.id);
      const otherProfile = profileModel.findByUserId(other.id);
      profileModel.update(ownerProfile.id, { is_published: 1 });
      profileModel.update(otherProfile.id, { is_published: 1 });

      const domain = uniqDomain(ctx, 'cross');
      const row = domainModel.create({ userId: owner.id, domain, targetProfileId: ownerProfile.id, verifyToken: 'tok' });
      domainModel.setVerifyResult(row.id, { status: 'active', verifyMethod: 'dns_a' });

      const ownSlug = await hostFetch(`/public/${ownerProfile.username}`, domain);
      ctx.equal(ownSlug.status, 200, 'sahibinin kendi slug\'ı 200 olmalı');

      const crossSlug = await hostFetch(`/public/${otherProfile.username}`, domain);
      ctx.equal(crossSlug.status, 404, 'başka sahibin slug\'ı 404 olmalı (gizlilik)');
    },
  },
  {
    id: 'domains.host-routing-main-domain-unaffected',
    name: 'Ana BeyLink domaininde (Host eşleşmiyor) normal davranış korunur',
    category: 'Özel Alan Adı',
    description: 'resolveHost bilinmeyen/kayıtlı-olmayan Host\'ta no-op — /api/public/:username her zamanki gibi çalışır.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = profileModel.findByUserId(u.id);
      profileModel.update(p.id, { is_published: 1 });
      // apiFetch varsayılan Host (127.0.0.1) kullanır — appHostnames listesinde olmasa bile
      // custom_domains'te eşleşen bir satır olmadığından req.customDomain hiç set edilmez.
      const r = await apiFetch(`/public/${p.username}`);
      ctx.equal(r.status, 200);
      ctx.equal(r.body?.profile?.username, p.username);
    },
  },

  // --- Doğrulama akışı: durum geçişleri (gerçek DNS başarısızlığı + sahte resolver) ---
  {
    id: 'domains.verify-real-dns-failure-sets-error',
    name: 'Doğrulama: DNS işaret etmeyen domain → error + last_error',
    category: 'Özel Alan Adı',
    description: '.invalid (RFC 2606 ayrılmış, hiçbir zaman çözülmez) ile gerçek DNS akışı test edilir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const domain = uniqDomain(ctx, 'badns', 'invalid');
      const created = await apiFetch('/domains', { method: 'POST', token: tokenFor(u), body: { domain } });
      const domainId = created.body?.domain?.id;

      const verify = await apiFetch(`/domains/${domainId}/verify`, { method: 'POST', token: tokenFor(u) });
      ctx.equal(verify.status, 200, 'verify endpoint\'i kendisi 200 döner (sonuç gövdede)');
      ctx.equal(verify.body?.domain?.status, 'error', '.invalid asla çözülmediği için error olmalı');
      ctx.assert(!!verify.body?.domain?.last_error, 'last_error dolu olmalı');
      ctx.assert(!verify.body?.domain?.verified_at, 'verified_at set edilmemeli');
    },
  },
  {
    id: 'domains.verify-service-mock-resolver-a-record-match',
    name: 'verifyDomain(): sahte resolver A kaydı eşleşince ok:true/dns_a',
    category: 'Özel Alan Adı',
    description: 'Servis seviyesinde enjekte edilen resolver ile A kaydı eşleşme senaryosu (gerçek ağ yok).',
    run: async (ctx) => {
      const fakeResolver = {
        resolve4: async () => ['203.0.113.10'],
        resolveCname: async () => { throw new Error('no cname'); },
        resolveTxt: async () => { throw new Error('no txt'); },
      };
      const result = await verifyDomain('sahte-a-kaydi.example', { resolver: fakeResolver, serverIp: '203.0.113.10' });
      ctx.assert(result.ok, 'A kaydı eşleşince ok:true olmalı');
      ctx.equal(result.method, 'dns_a');
    },
  },
  {
    id: 'domains.verify-service-mock-resolver-cname-match',
    name: 'verifyDomain(): sahte resolver CNAME eşleşince ok:true/dns_cname',
    category: 'Özel Alan Adı',
    description: 'A kaydı yok/çözülmüyor ama CNAME cname.beylink.org\'a işaret ediyor.',
    run: async (ctx) => {
      const fakeResolver = {
        resolve4: async () => { throw new Error('no a record'); },
        resolveCname: async () => ['cname.beylink.org'],
        resolveTxt: async () => { throw new Error('no txt'); },
      };
      const result = await verifyDomain('sahte-cname.example', { resolver: fakeResolver });
      ctx.assert(result.ok, 'CNAME eşleşince ok:true olmalı');
      ctx.equal(result.method, 'dns_cname');
    },
  },
  {
    id: 'domains.verify-service-mock-resolver-txt-mismatch-fails',
    name: 'verifyDomain(): A eşleşse bile yanlış TXT ok:false döner',
    category: 'Özel Alan Adı',
    description: 'verifyToken verilmişse TXT de eşleşmeli — A/CNAME tek başına yetmez (katı doğrulama).',
    run: async (ctx) => {
      const fakeResolver = {
        resolve4: async () => ['203.0.113.10'],
        resolveCname: async () => { throw new Error('no cname'); },
        resolveTxt: async () => [['yanlis-token']],
      };
      const result = await verifyDomain('sahte-txt-mismatch.example', {
        verifyToken: 'beklenen-token',
        resolver: fakeResolver,
        serverIp: '203.0.113.10',
      });
      ctx.assert(!result.ok, 'TXT eşleşmeyince ok:false olmalı');
      ctx.equal(result.method, 'dns_a', 'method A eşleşmesini yansıtmalı (ama ok:false)');
    },
  },
  {
    id: 'domains.verify-service-mock-resolver-no-match-fails',
    name: 'verifyDomain(): ne A ne CNAME eşleşmeyince ok:false/method:null',
    category: 'Özel Alan Adı',
    description: 'Sunucuya hiç işaret etmeyen bir domain için beklenen başarısızlık şekli.',
    run: async (ctx) => {
      const fakeResolver = {
        resolve4: async () => { throw new Error('no a'); },
        resolveCname: async () => { throw new Error('no cname'); },
        resolveTxt: async () => { throw new Error('no txt'); },
      };
      const result = await verifyDomain('hic-eslesmeyen.example', { resolver: fakeResolver });
      ctx.assert(!result.ok, 'eşleşme yoksa ok:false olmalı');
      ctx.equal(result.method, null);
      ctx.assert(!!result.error, 'error mesajı dolu olmalı');
    },
  },

  // --- domainModel durum geçişi (DB seviyesi, HTTP/DNS'siz) ---
  {
    id: 'domains.model-set-verify-result-transitions',
    name: 'domainModel.setVerifyResult(): pending→active ve pending→error alanları doğru yazar',
    category: 'Özel Alan Adı',
    description: 'status/last_error/verified_at/last_checked_at alanlarının durum geçişlerinde doğru güncellendiği.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const p = profileModel.findByUserId(u.id);
      const domain = uniqDomain(ctx, 'model');
      const row = domainModel.create({ userId: u.id, domain, targetProfileId: p.id, verifyToken: 'tok' });
      ctx.equal(row.status, 'pending');
      ctx.assert(!row.verified_at, 'başlangıçta verified_at boş olmalı');

      const activated = domainModel.setVerifyResult(row.id, { status: 'active', verifyMethod: 'dns_cname' });
      ctx.equal(activated.status, 'active');
      ctx.assert(!!activated.verified_at, 'active olunca verified_at dolmalı');
      ctx.equal(activated.verify_method, 'dns_cname');

      const failed = domainModel.setVerifyResult(row.id, { status: 'error', lastError: 'DNS eşleşmedi' });
      ctx.equal(failed.status, 'error');
      ctx.equal(failed.last_error, 'DNS eşleşmedi');
      ctx.assert(!!failed.verified_at, 'verified_at daha önce set edildiyse error\'a düşünce SIFIRLANMAZ (yalnız yeni active\'de güncellenir)');
    },
  },
  {
    id: 'domains.model-normalize-domain-strips-scheme-www-path',
    name: 'normalizeDomain(): şema/www/path/port temizlenir, subdomain korunur, geçersiz null',
    category: 'Özel Alan Adı',
    description: 'https://www.Example.com:443/path/ → example.com; subdomain korunur; www apex\'e çöker; "not a domain" → null.',
    run: async (ctx) => {
      ctx.equal(normalizeDomain('https://www.Example.com:443/path/'), 'example.com');
      ctx.equal(normalizeDomain('EXAMPLE.COM'), 'example.com');
      // Subdomain (www-DIŞI) verbatim korunur — apex'e çökmez.
      ctx.equal(normalizeDomain('links.example.com'), 'links.example.com', 'www-dışı subdomain korunmalı');
      ctx.equal(normalizeDomain('a.b.c.example.com'), 'a.b.c.example.com', 'çok etiketli subdomain korunmalı');
      // www hâlâ apex-kanonik (A4): www.x.com → x.com.
      ctx.equal(normalizeDomain('www.example.com'), 'example.com', 'lider www apex\'e çökmeli');
      ctx.equal(normalizeDomain('not a domain'), null);
      ctx.equal(normalizeDomain(''), null);
      ctx.equal(normalizeDomain('localhost'), null, 'nokta içermeyen hostname reddedilmeli');
    },
  },

  // --- Subdomain (kind='subdomain') tip-farkında talimat + doğrulama + routing + tls-check ---
  {
    id: 'domains.create-subdomain-instructions-cname-only',
    name: 'Subdomain create → CNAME(FQDN)+TXT talimatı, A kaydı YOK',
    category: 'Özel Alan Adı',
    description: 'kind:subdomain → instructions.kind=subdomain, aRecord:null, cnameHost=tam domain, txtValue var.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const domain = `links.${uniqDomain(ctx, 'sub')}`; // 3 etiket
      const r = await apiFetch('/domains', { method: 'POST', token: tokenFor(u), body: { domain, kind: 'subdomain' } });
      ctx.equal(r.status, 201, 'subdomain create 201');
      const inst = r.body?.domain?.instructions;
      ctx.equal(r.body?.domain?.kind, 'subdomain', 'satır kind subdomain olmalı');
      ctx.equal(inst?.kind, 'subdomain', 'instructions.kind subdomain');
      ctx.equal(inst?.aRecord, null, 'subdomain\'de A kaydı (aRecord) null olmalı');
      ctx.equal(inst?.cnameHost, domain, 'cnameHost tam alt alan adı (FQDN) olmalı');
      ctx.assert(!!inst?.cnameTarget, 'cnameTarget dönmeli');
      ctx.assert(!!inst?.txtValue, 'txtValue dönmeli');
    },
  },
  {
    id: 'domains.create-subdomain-needs-label-400',
    name: 'Subdomain modunda 2-etiketli girdi (kök alan adı) → 400',
    category: 'Özel Alan Adı',
    description: 'A4: subdomain modu bir alt alan öneki ister; kök alan adı (etiket<3) reddedilir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const rootDomain = uniqDomain(ctx, 'needlabel'); // 2 etiket (kök)
      const r = await apiFetch('/domains', { method: 'POST', token: tokenFor(u), body: { domain: rootDomain, kind: 'subdomain' } });
      ctx.equal(r.status, 400, 'subdomain modda kök alan adı 400 dönmeli');
    },
  },
  {
    id: 'domains.create-apex-instructions-regression',
    name: 'Apex create → CNAME(www)+TXT talimatı korunur (regresyon guard)',
    category: 'Özel Alan Adı',
    description: 'kind yok/apex → instructions.kind=apex, cnameHost=www, aRecord config\'e göre (serverIp||null).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const domain = uniqDomain(ctx, 'apexreg');
      const r = await apiFetch('/domains', { method: 'POST', token: tokenFor(u), body: { domain } }); // kind verilmez → apex
      ctx.equal(r.status, 201);
      const inst = r.body?.domain?.instructions;
      ctx.equal(r.body?.domain?.kind, 'apex', 'kind verilmeyince apex olmalı');
      ctx.equal(inst?.kind, 'apex', 'instructions.kind apex');
      ctx.equal(inst?.cnameHost, 'www', 'apex CNAME host www olmalı');
      ctx.equal(inst?.aRecord, config.brandedDomain.serverIp || null, 'aRecord config serverIp\'ye göre');
      ctx.assert(!!inst?.txtValue, 'txtValue dönmeli');
    },
  },
  {
    id: 'domains.verify-subdomain-cname-match',
    name: 'verifyDomain(kind:subdomain): CNAME eşleşince ok:true/dns_cname',
    category: 'Özel Alan Adı',
    description: 'Subdomain\'de CNAME birincil — cname.beylink.org\'a işaret eden alt alan dns_cname ile doğrulanır.',
    run: async (ctx) => {
      const fakeResolver = {
        resolve4: async () => { throw new Error('no a record'); },
        resolveCname: async () => ['cname.beylink.org'],
        resolveTxt: async () => { throw new Error('no txt'); },
      };
      const result = await verifyDomain('links.sahte-sub.example', { kind: 'subdomain', resolver: fakeResolver });
      ctx.assert(result.ok, 'subdomain CNAME eşleşince ok:true olmalı');
      ctx.equal(result.method, 'dns_cname');
    },
  },
  {
    id: 'domains.host-routing-subdomain-serves-target',
    name: 'Host: aktif subdomain kökü hedef profili döndürür; cross-owner slug 404',
    category: 'Özel Alan Adı',
    description: 'resolveHost subdomain host\'unu verbatim eşler → / target profil; own slug 200; başka sahip 404.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, PROPLUS);
      const other = await createTestOwner(ctx, { plan: 'free' });
      const ownerProfile = profileModel.findByUserId(owner.id);
      const otherProfile = profileModel.findByUserId(other.id);
      profileModel.update(ownerProfile.id, { is_published: 1 });
      profileModel.update(otherProfile.id, { is_published: 1 });

      const domain = `links.${uniqDomain(ctx, 'subhost')}`; // 3 etiket subdomain
      const row = domainModel.create({ userId: owner.id, domain, targetProfileId: ownerProfile.id, verifyToken: 'tok', kind: 'subdomain' });
      domainModel.setVerifyResult(row.id, { status: 'active', verifyMethod: 'dns_cname' });

      const root = await hostFetch('/public/', domain);
      ctx.equal(root.status, 200, 'subdomain kökü 200 olmalı');
      ctx.equal(root.body?.profile?.username, ownerProfile.username, 'kök hedef profili döndürmeli');

      const ownSlug = await hostFetch(`/public/${ownerProfile.username}`, domain);
      ctx.equal(ownSlug.status, 200, 'sahibinin kendi slug\'ı 200');

      const crossSlug = await hostFetch(`/public/${otherProfile.username}`, domain);
      ctx.equal(crossSlug.status, 404, 'başka sahibin slug\'ı 404 (gizlilik korunur)');
    },
  },
  {
    id: 'domains.tls-check-subdomain-active-200',
    name: 'tls-check(subdomain): pending 403 → active 200 → plan düşünce 403',
    category: 'Özel Alan Adı',
    description: 'Subdomain de fail-closed: yalnız active + sahibinin brandedDomain cap\'i varsa 200.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const domain = `links.${uniqDomain(ctx, 'subtls')}`;
      const created = await apiFetch('/domains', { method: 'POST', token: tokenFor(u), body: { domain, kind: 'subdomain' } });
      const domainId = created.body?.domain?.id;

      const pending = await apiFetch(`/domains/tls-check?domain=${domain}`);
      ctx.equal(pending.status, 403, 'pending subdomain 403');

      db.prepare(`UPDATE custom_domains SET status='active', verified_at=datetime('now') WHERE id=?`).run(domainId);
      const active = await apiFetch(`/domains/tls-check?domain=${domain}`);
      ctx.equal(active.status, 200, 'active subdomain 200');

      db.prepare(`UPDATE users SET plan='free' WHERE id=?`).run(u.id);
      const downgraded = await apiFetch(`/domains/tls-check?domain=${domain}`);
      ctx.equal(downgraded.status, 403, 'plan düşünce fail-closed 403');
    },
  },
  {
    id: 'domains.create-subdomain-www-input-collapses-to-apex-400',
    name: 'Subdomain modunda "www.siteniz.com" girdisi apex\'e çöker → 400',
    category: 'Özel Alan Adı',
    description: 'A4: normalize lider www\'yu atar; kalan 2-etiketli kök alan subdomain modunda reddedilir (kullanıcı www\'yu yanlışlıkla subdomain sanamaz).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const rootDomain = uniqDomain(ctx, 'wwwsub'); // 2 etiket
      const r = await apiFetch('/domains', {
        method: 'POST',
        token: tokenFor(u),
        body: { domain: `www.${rootDomain}`, kind: 'subdomain' },
      });
      ctx.equal(r.status, 400, 'www.<kök> subdomain modunda 400 dönmeli (apex\'e çöktü, etiket<3)');
    },
  },
  {
    id: 'domains.create-subdomain-strips-leading-www-stores-bare',
    name: 'Subdomain: "www.links.x.com" girdisi lider www\'suz saklanır (links.x.com)',
    category: 'Özel Alan Adı',
    description: 'normalize lider www\'yu subdomain girdisinden de atar; kalan 3-etiketli alt alan verbatim saklanır ve talimat FQDN\'i www\'suz üretilir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const bare = `links.${uniqDomain(ctx, 'wwwstrip')}`; // 3 etiket
      const r = await apiFetch('/domains', {
        method: 'POST',
        token: tokenFor(u),
        body: { domain: `www.${bare}`, kind: 'subdomain' },
      });
      ctx.equal(r.status, 201, 'www.<subdomain> kabul edilmeli (www atılır, 3 etiket kalır)');
      ctx.equal(r.body?.domain?.domain, bare, 'saklanan domain lider www içermemeli');
      ctx.equal(r.body?.domain?.instructions?.cnameHost, bare, 'CNAME host www\'suz FQDN olmalı');
    },
  },
  {
    id: 'domains.create-invalid-kind-falls-back-to-apex',
    name: 'Geçersiz kind değeri ("garbage") apex\'e düşer (fail-safe)',
    category: 'Özel Alan Adı',
    description: 'Controller yalnız \'subdomain\' değerini tanır; başka her değer apex sayılır → apex talimatları üretilir (kind sütununa çöp yazılamaz).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const domain = uniqDomain(ctx, 'badkind');
      const r = await apiFetch('/domains', {
        method: 'POST',
        token: tokenFor(u),
        body: { domain, kind: 'garbage' },
      });
      ctx.equal(r.status, 201);
      ctx.equal(r.body?.domain?.kind, 'apex', 'geçersiz kind apex\'e normalize edilmeli');
      ctx.equal(r.body?.domain?.instructions?.cnameHost, 'www', 'talimatlar apex-şekilli olmalı');
    },
  },
  {
    id: 'domains.list-returns-kind-and-instructions',
    name: 'GET /domains: kind + tip-farkında instructions kalıcı döner (sayfa yenileme yolu)',
    category: 'Özel Alan Adı',
    description: 'Panel yenilenince dnsRows() listeden okur — subdomain satırı create sonrasında da kind:subdomain + CNAME(FQDN) talimatıyla listelenmeli.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const token = tokenFor(u);
      const domain = `links.${uniqDomain(ctx, 'list')}`;
      await apiFetch('/domains', { method: 'POST', token, body: { domain, kind: 'subdomain' } });

      const list = await apiFetch('/domains', { token });
      ctx.equal(list.status, 200);
      const row = (list.body?.domains || []).find((d) => d.domain === domain);
      ctx.assert(!!row, 'eklenen subdomain listede olmalı');
      ctx.equal(row.kind, 'subdomain', 'listelenen satır kind taşımalı');
      ctx.equal(row.instructions?.kind, 'subdomain', 'instructions.kind subdomain olmalı');
      ctx.equal(row.instructions?.cnameHost, domain, 'listede de CNAME host FQDN olmalı');
      ctx.equal(row.instructions?.aRecord, null, 'listede de aRecord null olmalı');
    },
  },
  {
    id: 'domains.host-routing-www-prefixed-subdomain-host-matches',
    name: 'Host: "www.<subdomain>" başlığı da aynı subdomain satırını bulur (www-strip)',
    category: 'Özel Alan Adı',
    description: 'resolveHost lider www\'yu atar → www.links.x.com host\'u links.x.com satırıyla eşleşir (prod\'da Caddy 301 eder; backend seviyesinde davranış pinlenir).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, PROPLUS);
      const p = profileModel.findByUserId(u.id);
      profileModel.update(p.id, { is_published: 1 });

      const domain = `links.${uniqDomain(ctx, 'wwwhost')}`;
      const row = domainModel.create({ userId: u.id, domain, targetProfileId: p.id, verifyToken: 'tok', kind: 'subdomain' });
      domainModel.setVerifyResult(row.id, { status: 'active', verifyMethod: 'dns_cname' });

      const r = await hostFetch('/public/', `www.${domain}`);
      ctx.equal(r.status, 200, 'www önekli subdomain host 200 olmalı');
      ctx.equal(r.body?.profile?.username, p.username, 'hedef profil dönmeli');
    },
  },
];
