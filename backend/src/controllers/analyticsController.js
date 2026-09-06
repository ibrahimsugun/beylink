import { analyticsModel } from '../models/analyticsModel.js';
import { assertProfileAccess } from '../utils/authz.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/ApiError.js';
import { planCaps, assertPlanCap } from '../utils/plan.js';
import { FREE_ANALYTICS_RANGES } from '../config/plans.js';

const fmt = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

/**
 * Aralık anahtarını { since, bucket } çözer.
 * since: UTC alt sınır (null = tümü) · bucket: zaman serisi granülerliği
 */
export function resolveRange(range) {
  const now = new Date();
  const ago = (ms) => fmt(new Date(now.getTime() - ms));
  const H = 3600 * 1000;
  const D = 24 * H;

  switch (range) {
    case 'all':
      return { since: null, bucket: 'day' };
    case '1h':
      return { since: ago(H), bucket: 'hour' };
    case 'today': {
      const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      return { since: fmt(midnight), bucket: 'hour' };
    }
    case '24h':
      return { since: ago(24 * H), bucket: 'hour' };
    case '7d':
      return { since: ago(7 * D), bucket: 'day' };
    case '30d':
      return { since: ago(30 * D), bucket: 'day' };
    case '90d':
      return { since: ago(90 * D), bucket: 'day' };
    default:
      return { since: ago(30 * D), bucket: 'day' };
  }
}

export const getSummary = asyncHandler(async (req, res) => {
  assertProfileAccess(req.user, req.params.profileId);
  const advanced = planCaps(req.user).analyticsAdvanced;

  // Free: yalnızca temel aralıklar; gelişmiş aralık istenirse 30 güne indir
  let range = req.query.range || '30d';
  if (!advanced && !FREE_ANALYTICS_RANGES.includes(range)) range = '30d';

  const { since, bucket } = resolveRange(range);
  const summary = analyticsModel.summary(Number(req.params.profileId), since, bucket);

  // Free: kırılım kartları (cihaz/tarayıcı/platform/ülke/referrer) kilitli
  if (!advanced) {
    summary.by_device = [];
    summary.by_country = [];
    summary.by_referrer = [];
    summary.by_browser = [];
    summary.by_os = [];
  }
  res.json({ range, bucket, advanced, ...summary });
});

export const exportCsv = asyncHandler(async (req, res) => {
  assertProfileAccess(req.user, req.params.profileId);
  assertPlanCap(req.user, 'csv'); // CSV yalnızca Pro
  const range = req.query.range || '30d';
  const { since } = resolveRange(range);
  const rows = analyticsModel.exportRows(Number(req.params.profileId), since);

  const header = ['tarih', 'olay', 'link', 'url', 'cihaz', 'tarayici', 'platform', 'ulke', 'referrer'];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([r.click_time, r.event_type, r.link_title, r.url, r.device, r.browser, r.os, r.country, r.referrer].map(esc).join(','));
  }
  const csv = '﻿' + lines.join('\n'); // BOM → Excel'de Türkçe karakterler

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="beylink-analitik-${range}.csv"`);
  res.send(csv);
});
