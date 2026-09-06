import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound } from '../utils/ApiError.js';
import { designTemplateModel } from '../models/designTemplateModel.js';
import { profileModel } from '../models/profileModel.js';
import { assertProfileAccess, assertProfileEditable } from '../utils/authz.js';
import { assertPlanCap } from '../utils/plan.js';
import { assertThemeGate } from '../utils/themeGate.js';
import { sanitizeThemeSettings, encodeTemplateCode, decodeTemplateCode } from '../utils/designTemplate.js';
import { config } from '../config/env.js';

const MAX_TEMPLATES = 50; // hesap başına makul üst sınır
const MAX_NAME = 60;

function ownTemplate(userId, id) {
  const t = designTemplateModel.findById(Number(id));
  if (!t || t.user_id !== userId) throw notFound('Şablon bulunamadı');
  return t;
}

function cleanName(raw, fallback) {
  const n = String(raw == null ? '' : raw).trim().slice(0, MAX_NAME);
  return n || fallback;
}

// Şablonu aktif/alt hesap profiline uygula (tek yol) — tema gate + düzenleme yetkisi + askı guard.
function applyThemeToProfile(user, profileId, themeSettings) {
  const profile = assertProfileEditable(user, profileId); // kendi profili veya sahip olunan alt hesap
  assertThemeGate(user, themeSettings, profile.theme_settings); // Pro-tema kapısı
  return profileModel.update(profile.id, { theme_settings: sanitizeThemeSettings(themeSettings) });
}

export const listTemplates = asyncHandler(async (req, res) => {
  res.json({ templates: designTemplateModel.listByUser(req.user.id) });
});

// Mevcut bir profilin tasarımını şablon olarak kaydet (sunucu anlık görüntü alır → istemci tampering yok)
export const createTemplate = asyncHandler(async (req, res) => {
  const { name, profile_id } = req.body;
  if (!profile_id) throw badRequest('profile_id gerekli', 'profile_id');
  if (designTemplateModel.countByUser(req.user.id) >= MAX_TEMPLATES) {
    throw badRequest(`En fazla ${MAX_TEMPLATES} şablon kaydedebilirsiniz.`);
  }
  const profile = assertProfileAccess(req.user, profile_id);
  const themeSettings = sanitizeThemeSettings(profile.theme_settings);
  const template = designTemplateModel.create(req.user.id, { name: cleanName(name, 'Şablonum'), themeSettings });
  res.status(201).json({ template });
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  ownTemplate(req.user.id, req.params.id);
  designTemplateModel.remove(Number(req.params.id));
  res.json({ ok: true });
});

// Şablonu bir profile uygula (kendi aktif profili VEYA bir alt hesap profili)
export const applyTemplateToProfile = asyncHandler(async (req, res) => {
  const t = ownTemplate(req.user.id, req.params.id);
  const { profile_id } = req.body;
  if (!profile_id) throw badRequest('profile_id gerekli', 'profile_id');
  const updated = applyThemeToProfile(req.user, profile_id, t.theme_settings);
  res.json({ profile: updated });
});

// Dışa aktar — taşınabilir kod + paylaşım linki
export const exportTemplate = asyncHandler(async (req, res) => {
  const t = ownTemplate(req.user.id, req.params.id);
  const code = encodeTemplateCode(t.theme_settings);
  const link = `${config.appUrl}/dashboard/design?import=${encodeURIComponent(code)}`;
  res.json({ code, link, name: t.name });
});

// İçe aktar — kodu doğrula/sanitize → Şablonlarım'a ekle
export const importTemplate = asyncHandler(async (req, res) => {
  if (designTemplateModel.countByUser(req.user.id) >= MAX_TEMPLATES) {
    throw badRequest(`En fazla ${MAX_TEMPLATES} şablon kaydedebilirsiniz.`);
  }
  const themeSettings = decodeTemplateCode(req.body.code); // bozuk kod → 400
  const template = designTemplateModel.create(req.user.id, {
    name: cleanName(req.body.name, 'İçe aktarılan şablon'),
    themeSettings,
  });
  res.status(201).json({ template });
});

// Toplu uygula — YALNIZCA Pro Plus. Yalnız kullanıcının kendi alt hesaplarına (IDOR guard, per-item).
export const applyTemplateBulk = asyncHandler(async (req, res) => {
  assertPlanCap(req.user, 'bulkTemplateApply'); // Pro Plus (backend zorlaması)
  const t = ownTemplate(req.user.id, req.params.id);
  const ids = Array.isArray(req.body.profile_ids) ? req.body.profile_ids : [];
  if (!ids.length) throw badRequest('En az bir alt hesap seçin', 'profile_ids');

  const applied = [];
  const failed = [];
  for (const pid of ids) {
    try {
      applyThemeToProfile(req.user, pid, t.theme_settings); // assertProfileEditable → yabancı/askıda olan reddedilir
      applied.push(pid);
    } catch (e) {
      failed.push({ profile_id: pid, error: e.message });
    }
  }
  res.json({ applied, failed });
});
