import { btagModel } from '../models/btagModel.js';
import { assertProfileAccess, assertProfileEditable } from '../utils/authz.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound, conflict } from '../utils/ApiError.js';

const VALUE_RE = /^[A-Za-z0-9_.-]{1,64}$/;

// Kayitli BTAG'lere sahip profilin BTAG'i mi? (yatay yetki sizmasini onle)
function loadOwnBtag(profileId, btagId) {
  const btag = btagModel.findById(Number(btagId));
  if (!btag || btag.profile_id !== Number(profileId)) throw notFound('BTAG bulunamadı');
  return btag;
}

export const listBtags = asyncHandler(async (req, res) => {
  assertProfileAccess(req.user, req.params.profileId);
  const profileId = Number(req.params.profileId);

  const registered = btagModel.listByProfile(profileId);
  const stats = new Map(
    btagModel.clickCounts(profileId).map((r) => [r.value, { visitors: r.visitors || 0, clicks: r.clicks || 0 }])
  );

  const btags = registered.map((b) => ({
    ...b,
    visitors: stats.get(b.value)?.visitors || 0,
    clicks: stats.get(b.value)?.clicks || 0,
  }));

  // Kesfedilen = trafikte gorulup kayitli olmayan BTAG'ler (tekil ziyaretciye gore azalan)
  const registeredValues = new Set(registered.map((b) => b.value));
  const discovered = [...stats.entries()]
    .filter(([value]) => !registeredValues.has(value))
    .map(([value, s]) => ({ value, visitors: s.visitors, clicks: s.clicks }))
    .sort((a, b) => b.visitors - a.visitors || b.clicks - a.clicks);

  res.json({ btags, discovered });
});

export const createBtag = asyncHandler(async (req, res) => {
  assertProfileEditable(req.user, req.params.profileId);
  const profileId = Number(req.params.profileId);

  const value = (req.body.value ?? '').trim();
  if (!VALUE_RE.test(value)) {
    throw badRequest('BTAG değeri 1-64 karakter olmalı (harf, rakam, _ . -)', 'value');
  }
  const label = req.body.label != null ? String(req.body.label).trim().slice(0, 80) : null;

  if (btagModel.valueExists(profileId, value)) throw conflict('Bu BTAG zaten kayıtlı', 'value');

  const btag = btagModel.create({ profileId, value, label: label || null });
  res.status(201).json({ btag: { ...btag, visitors: 0, clicks: 0 } });
});

export const updateBtag = asyncHandler(async (req, res) => {
  assertProfileEditable(req.user, req.params.profileId);
  loadOwnBtag(req.params.profileId, req.params.btagId);

  const patch = {};
  if (req.body.label !== undefined) patch.label = req.body.label != null ? String(req.body.label).trim().slice(0, 80) : null;
  if (req.body.is_active !== undefined) patch.is_active = req.body.is_active;

  const btag = btagModel.update(Number(req.params.btagId), patch);
  res.json({ btag });
});

export const deleteBtag = asyncHandler(async (req, res) => {
  assertProfileEditable(req.user, req.params.profileId);
  loadOwnBtag(req.params.profileId, req.params.btagId);
  btagModel.remove(Number(req.params.btagId));
  res.json({ ok: true });
});
