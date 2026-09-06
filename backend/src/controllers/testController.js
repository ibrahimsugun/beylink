// Admin test endpoint'leri — yalnızca requireAdmin altında monte edilir (routes'ta).
import { asyncHandler } from '../utils/asyncHandler.js';
import { notFound } from '../utils/ApiError.js';
import { TESTS, CATEGORIES, findTest } from '../tests/registry.js';
import { testModel } from '../models/testModel.js';
import { startTest, startAllTests, isRunning } from '../services/testRunner.js';

// Tüm testleri son çalıştırma özetiyle döner — UI listesi bunu render eder.
export const listTests = asyncHandler(async (_req, res) => {
  const rows = TESTS.map((t) => {
    const latest = testModel.latestByTest(t.id);
    return {
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      running: isRunning(t.id),
      last_run: latest
        ? {
            id: latest.id,
            status: latest.status,
            ok: latest.ok,
            summary: latest.summary,
            started_at: latest.started_at,
            finished_at: latest.finished_at,
            // UI'da elapsed süresini göstermek için — logs/error dahil değil (detay endpoint'inden gelir).
            details: latest.details && Number.isFinite(latest.details.elapsed_ms)
              ? { elapsed_ms: latest.details.elapsed_ms }
              : null,
          }
        : null,
    };
  });
  res.json({ tests: rows, categories: CATEGORIES });
});

// Tek testi tetikle — 200 { run_id } döner (arka planda çalışır); zaten çalışıyorsa 409.
export const runTest = asyncHandler(async (req, res) => {
  const spec = findTest(req.params.id);
  if (!spec) throw notFound('Test bulunamadı');
  const { runId, error } = startTest(spec.id, { triggeredBy: req.user.id });
  if (!runId) return res.status(409).json({ error: error || 'Test başlatılamadı' });
  res.json({ run_id: runId });
});

// Tüm testleri seri kuyruğa ekler — worker tek tek işler (cleanup race'i önler).
export const runAllTests = asyncHandler(async (req, res) => {
  const { started, skipped } = startAllTests({ triggeredBy: req.user.id });
  res.json({ started, skipped });
});

// Tek çalıştırmanın detayı (loglar + hata + elapsed) — detay modalı için.
export const getRun = asyncHandler(async (req, res) => {
  const run = testModel.findById(Number(req.params.runId));
  if (!run) throw notFound('Test çalıştırması bulunamadı');
  res.json({ run });
});
