// test_runs CRUD — admin panelinden manuel tetiklenen sistem testlerinin sonuçları.
import db from '../db/connection.js';

function parse(row) {
  if (!row) return row;
  let details = null;
  try { details = row.details_json ? JSON.parse(row.details_json) : null; } catch { details = row.details_json; }
  return { ...row, ok: !!row.ok, details };
}

export const testModel = {
  create({ testId, triggeredBy = null }) {
    const info = db
      .prepare(
        `INSERT INTO test_runs (test_id, status, ok, triggered_by, started_at)
         VALUES (?, 'running', 0, ?, datetime('now'))`
      )
      .run(testId, triggeredBy);
    return info.lastInsertRowid;
  },

  finish({ runId, status, ok, summary, details }) {
    db.prepare(
      `UPDATE test_runs SET status = ?, ok = ?, summary = ?, details_json = ?, finished_at = datetime('now')
       WHERE id = ?`
    ).run(status, ok ? 1 : 0, summary || null, details ? JSON.stringify(details) : null, runId);
  },

  findById(id) {
    return parse(db.prepare(`SELECT * FROM test_runs WHERE id = ?`).get(id));
  },

  // Belirli test için son çalıştırma (özet + details_json → UI'da elapsed_ms için).
  latestByTest(testId) {
    return parse(
      db
        .prepare(
          `SELECT id, test_id, status, ok, summary, details_json, triggered_by, started_at, finished_at
             FROM test_runs WHERE test_id = ? ORDER BY id DESC LIMIT 1`
        )
        .get(testId),
    );
  },

  // Aktif (running) çalıştırma varsa döndürür — aynı testin ikinci tetiklemesini engellemek için.
  activeByTest(testId) {
    return parse(
      db
        .prepare(
          `SELECT id, test_id, status, started_at FROM test_runs
             WHERE test_id = ? AND status = 'running' ORDER BY id DESC LIMIT 1`
        )
        .get(testId),
    );
  },

  historyByTest(testId, limit = 20) {
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));
    return db
      .prepare(
        `SELECT id, status, ok, summary, started_at, finished_at FROM test_runs
           WHERE test_id = ? ORDER BY id DESC LIMIT ?`
      )
      .all(testId, lim)
      .map(parse);
  },

  // Yeniden başlarken kilit temizliği: server restart olursa yarım kalan 'running' satırları
  // 'error' olarak işaretle (yoksa UI ilelebet loading gösterir).
  markStaleAsError() {
    return db
      .prepare(
        `UPDATE test_runs SET status = 'error', summary = COALESCE(summary, ?), finished_at = datetime('now')
           WHERE status = 'running'`
      )
      .run('Sunucu yeniden başlatıldı — test yarıda kesildi').changes;
  },
};
