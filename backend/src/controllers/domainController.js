import crypto from 'node:crypto';
import { domainModel, normalizeDomain } from '../models/domainModel.js';
import { verifyDomain } from '../services/domainVerify.js';
import { assertProfileAccess } from '../utils/authz.js';
import { profileModel } from '../models/profileModel.js';
import { userModel } from '../models/userModel.js';
import { applyExpiryIfNeeded, planCaps } from '../utils/plan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound, conflict } from '../utils/ApiError.js';
import { config } from '../config/env.js';

const MAX_DOMAINS_PER_ACCOUNT = 1; // A6 — hesap başına 1 (ileride genişletilebilir)

function loadOwnDomain(user, id) {
  const row = domainModel.findById(Number(id));
  if (!row || row.user_id !== user.id) throw notFound('Domain bulunamadı');
  return row;
}

// DNS talimatları statik config + satırın kendi `verify_token`'ından yeniden hesaplanabilir
// (gizli bir şey değil — zaten kullanıcının kendi DNS panelinde herkese açık olacak) → her
// listelemede/oluşturmada döner, sayfa yenilense de kaybolmaz.
//
// Tipe göre dallanır (tek gerçek kaynak — frontend "aptal" kalır):
//   apex      → A(@ → serverIp) + CNAME(www → cnameTarget) + TXT
//   subdomain → CNAME(tam-alt-alan → cnameTarget) + TXT; A kaydı YOK, www YOK
function withInstructions(row) {
  if (!row) return row;
  const kind = row.kind === 'subdomain' ? 'subdomain' : 'apex';
  return {
    ...row,
    kind,
    instructions: {
      kind,
      aRecord: kind === 'subdomain' ? null : (config.brandedDomain.serverIp || null),
      cnameHost: kind === 'subdomain' ? row.domain : 'www',
      cnameTarget: config.brandedDomain.cnameTarget,
      txtHost: `_beylink-verify.${row.domain}`,
      txtValue: row.verify_token,
    },
  };
}

export const listDomains = asyncHandler(async (req, res) => {
  res.json({ domains: domainModel.listByUser(req.user.id).map(withInstructions) });
});

export const createDomain = asyncHandler(async (req, res) => {
  if (domainModel.countByUser(req.user.id) >= MAX_DOMAINS_PER_ACCOUNT) {
    throw conflict('Hesap başına yalnız 1 özel alan adı eklenebilir');
  }

  const domain = normalizeDomain(req.body.domain);
  if (!domain) throw badRequest('Geçerli bir alan adı girin (ör. siteniz.com)', 'domain');

  // Tip kullanıcı tarafından açıkça seçilir (PSL bağımlılığı yok — A1); geçersiz/boş → 'apex'.
  const kind = req.body.kind === 'subdomain' ? 'subdomain' : 'apex';
  // Subdomain modunda girdi bir kök alan adına çökerse (etiket < 3, ör. `siteniz.com` ya da
  // normalize sonrası `www.x.com` → `x.com`) reddet — alt alan adı bir ad öneki gerektirir (A4).
  if (kind === 'subdomain' && domain.split('.').length < 3) {
    throw badRequest('Alt alan adı için kök alan adınızın önüne bir ad ekleyin (ör. links.siteniz.com)', 'domain');
  }

  if (domainModel.findByDomain(domain)) throw conflict('Bu alan adı zaten kayıtlı', 'domain');

  // Hedef profil: verilmişse erişim doğrulanır (owner kendi + alt hesap profillerine sahip
  // olabilir), verilmemişse kullanıcının kendi profiline varsayılan.
  let targetProfileId = null;
  if (req.body.target_profile_id != null) {
    const profile = assertProfileAccess(req.user, req.body.target_profile_id);
    targetProfileId = profile.id;
  } else {
    const own = profileModel.findByUserId(req.user.id);
    targetProfileId = own ? own.id : null;
  }

  const verifyToken = `beylink-verify-${crypto.randomBytes(12).toString('hex')}`;
  const row = domainModel.create({ userId: req.user.id, domain, targetProfileId, verifyToken, kind });
  res.status(201).json({ domain: withInstructions(row) });
});

export const removeDomain = asyncHandler(async (req, res) => {
  const row = loadOwnDomain(req.user, req.params.id);
  domainModel.remove(row.id);
  res.json({ ok: true });
});

export const verifyDomainNow = asyncHandler(async (req, res) => {
  const row = loadOwnDomain(req.user, req.params.id);
  const result = await verifyDomain(row.domain, { kind: row.kind, verifyToken: row.verify_token });
  const updated = domainModel.setVerifyResult(row.id, {
    status: result.ok ? 'active' : 'error',
    verifyMethod: result.method,
    lastError: result.error,
  });
  res.json({ domain: withInstructions(updated) });
});

// GET /api/domains/tls-check?domain= — Caddy on-demand TLS `ask` kapısı. Kimlik doğrulama YOK
// (Caddy TLS handshake sırasında çağırır). Yalnız aktif + sahibinin hâlâ brandedDomain cap'i
// olduğu domainlere 200 döner — plan düşerse (ör. proplus bitip Free'ye düşerse) sertifika
// yenilenmez/verilmez (A2 + A5 kesişimi: fail-closed).
export const tlsCheck = asyncHandler(async (req, res) => {
  const domain = normalizeDomain(req.query.domain);
  if (!domain) return res.status(403).end();

  const row = domainModel.findActiveByDomain(domain);
  if (!row) return res.status(403).end();

  const owner = applyExpiryIfNeeded(userModel.findById(row.user_id));
  if (!owner || !planCaps(owner).brandedDomain) return res.status(403).end();

  res.status(200).end();
});
