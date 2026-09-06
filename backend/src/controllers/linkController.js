import { linkModel } from '../models/linkModel.js';
import { assertProfileAccess, assertProfileEditable } from '../utils/authz.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound } from '../utils/ApiError.js';
import { toSafeLinkTarget } from '../utils/url.js';

const VALID_TYPES = ['link', 'social', 'divider', 'contact', 'gallery'];
const URL_REQUIRED = ['link', 'social'];
const BTAG_RE = /^[A-Za-z0-9_.-]{1,64}$/;

// Linke gomulu BTAG: bos -> null (temizle); doluysa formati dogrula
function normalizeBtag(raw) {
  const v = (raw ?? '').trim();
  if (!v) return null;
  if (!BTAG_RE.test(v)) throw badRequest('Geçersiz BTAG (harf, rakam, _ . - · en çok 64)', 'btag');
  return v;
}

// Galeri/iletişim bloklarının config'inde kullanıcı-verili href alanlarını sunucuda da güvene al
// (savunma-derinliği: link/social gibi bu alt-linkler de yalnız http/https/mailto/tel olsun; javascript:/data: düşer).
// Görsel `url` (upload yolu) ve tel:/mailto: prefixli phone/email dokunulmaz.
function sanitizeLinkConfig(type, config) {
  if (!config || typeof config !== 'object') return config;
  if (type === 'gallery' && Array.isArray(config.images)) {
    return { ...config, images: config.images.map((im) => (im && im.link ? { ...im, link: toSafeLinkTarget(im.link) || '' } : im)) };
  }
  if (type === 'contact' && config.website) {
    return { ...config, website: toSafeLinkTarget(config.website) || '' };
  }
  return config;
}

function loadLinkWithAccess(user, linkId) {
  const link = linkModel.findById(Number(linkId));
  if (!link) throw notFound('Blok bulunamadı');
  assertProfileEditable(user, link.profile_id);
  return link;
}

export const listLinks = asyncHandler(async (req, res) => {
  const profileId = req.query.profileId || req.params.profileId;
  if (!profileId) throw badRequest('profileId gerekli');
  assertProfileAccess(req.user, profileId);
  res.json({ links: linkModel.listByProfile(Number(profileId)) });
});

export const createLink = asyncHandler(async (req, res) => {
  const profileId = req.body.profile_id || req.params.profileId;
  if (!profileId) throw badRequest('profile_id gerekli');
  assertProfileEditable(req.user, profileId);

  const type = req.body.type || 'link';
  if (!VALID_TYPES.includes(type)) throw badRequest('Geçersiz blok tipi', 'type');

  // URL'yi normalize et: şemasızsa https:// ekle; http/https/mailto/tel koru; diğer şema reddet
  let url = req.body.url ?? null;
  if (URL_REQUIRED.includes(type)) {
    if (!url) throw badRequest('URL gerekli', 'url');
    url = toSafeLinkTarget(url);
    if (!url) throw badRequest('Yalnızca http/https, e-posta (mailto:) veya telefon (tel:) bağlantılarına izin verilir', 'url');
  }

  const link = linkModel.create({
    profileId: Number(profileId),
    type,
    title: req.body.title ?? null,
    url,
    iconName: req.body.icon_name ?? null,
    config: sanitizeLinkConfig(type, req.body.config ?? {}),
    btag: req.body.btag !== undefined ? normalizeBtag(req.body.btag) : null,
  });
  res.status(201).json({ link });
});

export const updateLink = asyncHandler(async (req, res) => {
  const link = loadLinkWithAccess(req.user, req.params.id);
  const patch = {};
  for (const key of ['type', 'title', 'url', 'icon_name', 'is_active', 'sort_order']) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }
  if (patch.type && !VALID_TYPES.includes(patch.type)) throw badRequest('Geçersiz blok tipi', 'type');
  if (req.body.config !== undefined) patch.config = sanitizeLinkConfig(patch.type ?? link.type, req.body.config);
  if (req.body.btag !== undefined) patch.btag = normalizeBtag(req.body.btag);

  // Tip URL gerektiren bir tipe dönüyorsa URL boş kalamaz + normalize (https:// ekle; mailto/tel korunur)
  const effectiveType = patch.type ?? link.type;
  if (URL_REQUIRED.includes(effectiveType)) {
    const effectiveUrl = patch.url !== undefined ? patch.url : link.url;
    if (!effectiveUrl) throw badRequest('URL gerekli', 'url');
    const normalized = toSafeLinkTarget(effectiveUrl);
    if (!normalized) throw badRequest('Yalnızca http/https, e-posta (mailto:) veya telefon (tel:) bağlantılarına izin verilir', 'url');
    if (patch.url !== undefined) patch.url = normalized; // yalnızca gerçekten değişiyorsa yaz
  }

  res.json({ link: linkModel.update(link.id, patch) });
});

export const deleteLink = asyncHandler(async (req, res) => {
  const link = loadLinkWithAccess(req.user, req.params.id);
  linkModel.remove(link.id);
  res.json({ ok: true });
});

export const reorderLinks = asyncHandler(async (req, res) => {
  const { profile_id, order } = req.body;
  if (!profile_id || !Array.isArray(order)) throw badRequest('profile_id ve order[] gerekli');
  assertProfileEditable(req.user, profile_id);
  const links = linkModel.reorder(Number(profile_id), order.map(Number));
  res.json({ links });
});
