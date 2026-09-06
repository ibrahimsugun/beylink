// Test orkestrasyonu — TÜM testler tek bir global kuyruk üzerinden SIRA ile çalıştırılır.
// Sebep: her testin finally cleanup'ı `bltest_z_%` kullanıcılarını topluca siler; paralel
// çalıştırma başka testin verisini vaktinden önce siler (race). Seri işleyiş bu race'i kapatır.
// Kullanıcı iki testi hızlıca tetiklese bile ikincisi kuyruğa alınır ve öncekinin bitmesini bekler.
import { testModel } from '../models/testModel.js';
import { cleanupTestUsers, makeContext } from '../tests/framework.js';
import { findTest, TESTS } from '../tests/registry.js';

const inFlight = new Set();   // hangi test id'leri kuyrukta / çalışıyor
const queue = [];              // { testId, runId }
let workerRunning = false;

async function runOne(testId, runId) {
  const spec = findTest(testId);
  const startedAt = Date.now();
  const ctx = makeContext();
  let status = 'passed';
  let ok = true;
  let summary = null;
  let error = null;
  try {
    if (!spec) throw new Error(`Test bulunamadı: ${testId}`);
    await spec.run(ctx);
    summary = 'geçti';
  } catch (e) {
    status = 'failed';
    ok = false;
    summary = e.message || 'başarısız';
    error = { message: e.message, stack: String(e.stack || '').split('\n').slice(0, 8).join('\n') };
  } finally {
    try { cleanupTestUsers(); } catch { /* sessizce yut */ }
    inFlight.delete(testId);
    testModel.finish({
      runId,
      status,
      ok,
      summary,
      details: {
        logs: ctx.logs,
        error,
        elapsed_ms: Date.now() - startedAt,
      },
    });
  }
}

async function worker() {
  // Reentry guard: startAllTests içindeki N setImmediate(worker) çağrısı event-loop check
  // fazında art arda çalışır; workerRunning=true kontrolü FONKSIYON İÇİNDE olmalı — dışarıdaki
  // if kontrolü ilk setImmediate çalışmadan tümü kuyruğa girdiğinden hepsini bloklamaz.
  if (workerRunning) return;
  workerRunning = true;
  // Test paketi çalışırken mailer GERÇEK e-posta göndermesin (Resend'e sahte @example.com
  // adresleriyle çağrı yapmasın) + demo token'ı yanıtta göstersin. Bayrak yalnız SERVER-SIDE
  // set edilir (client header'ı değil) → gerçek kullanıcıda normal gönderim; test'te güvenli demo.
  globalThis.__beylinkTestRunning = true;
  try {
    while (queue.length) {
      const { testId, runId } = queue.shift();
      await runOne(testId, runId);
    }
  } finally {
    workerRunning = false;
    globalThis.__beylinkTestRunning = false;
  }
}

export function isRunning(testId) {
  if (inFlight.has(testId)) return true;
  return !!testModel.activeByTest(testId);
}

/** Testi kuyruğa alır. Aynı test zaten kuyrukta/çalışıyorsa null döner (409). */
export function startTest(testId, { triggeredBy = null } = {}) {
  const spec = findTest(testId);
  if (!spec) return { runId: null, error: 'Test bulunamadı' };
  if (isRunning(testId)) return { runId: null, error: 'Bu test zaten çalışıyor' };
  const runId = testModel.create({ testId, triggeredBy });
  inFlight.add(testId);
  queue.push({ testId, runId });
  if (!workerRunning) setImmediate(worker);
  return { runId };
}

/** Tüm testleri kuyruğa alır (zaten çalışanlar atlanır). Seri worker sıra ile işler. */
export function startAllTests({ triggeredBy = null } = {}) {
  const started = [];
  const skipped = [];
  for (const t of TESTS) {
    const r = startTest(t.id, { triggeredBy });
    if (r.runId) started.push({ id: t.id, run_id: r.runId });
    else skipped.push({ id: t.id, reason: r.error });
  }
  return { started, skipped };
}

// Sunucu açılışında yarım kalan 'running' satırları temizler (uzun bloklu UI'ı önler).
export function reconcileOnBoot() {
  const changed = testModel.markStaleAsError();
  if (changed) console.log(`[tests] ${changed} yarım kalan test 'error' olarak işaretlendi`);
}
