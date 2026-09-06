import db from '../db/connection.js';

export const paymentModel = {
  create({ userId, orderRef, intentKind = 'topup', intentTarget = null, network = 'TRC20', address = null, expectedMicro, ttlMinutes = 30 }) {
    const info = db
      .prepare(
        `INSERT INTO payments (user_id, order_ref, intent_kind, intent_target, network, address,
           expected_amount_micro, status, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now', ?))`
      )
      .run(userId, orderRef, intentKind, intentTarget, network, address, expectedMicro, `+${ttlMinutes} minutes`);
    return this.findById(info.lastInsertRowid);
  },

  findById(id) {
    return db.prepare(`SELECT * FROM payments WHERE id = ?`).get(id);
  },

  findByRef(orderRef) {
    return db.prepare(`SELECT * FROM payments WHERE order_ref = ?`).get(orderRef);
  },

  // Kullanıcının en güncel aktif (pending + süresi dolmamış) faturası
  getActivePending(userId) {
    return db
      .prepare(
        `SELECT * FROM payments
         WHERE user_id = ? AND status = 'pending' AND (expires_at IS NULL OR expires_at > datetime('now'))
         ORDER BY id DESC LIMIT 1`
      )
      .get(userId);
  },

  // Tutara birebir uyan en eski aktif pending fatura (benzersiz-tutar tuzu ile tekildir)
  findPendingByAmount(expectedMicro) {
    return db
      .prepare(
        `SELECT * FROM payments
         WHERE status = 'pending' AND expected_amount_micro = ?
           AND (expires_at IS NULL OR expires_at > datetime('now'))
         ORDER BY id ASC LIMIT 1`
      )
      .get(expectedMicro);
  },

  // En az bir aktif (pending + süresi dolmamış) fatura var mı? — poller boşta TronGrid taramasını
  // atlamak için kullanır (aktif ödeme yoksa API'ye hiç gidilmez → kota israfı kesilir).
  hasActivePending() {
    return !!db
      .prepare(
        `SELECT 1 FROM payments
         WHERE status = 'pending' AND (expires_at IS NULL OR expires_at > datetime('now')) LIMIT 1`
      )
      .get();
  },

  // Bu tutarın halihazırda başka bir aktif pending tarafından kullanılıp kullanılmadığı (tuz çakışması)
  amountInUse(expectedMicro) {
    return !!db
      .prepare(
        `SELECT 1 FROM payments
         WHERE status = 'pending' AND expected_amount_micro = ?
           AND (expires_at IS NULL OR expires_at > datetime('now')) LIMIT 1`
      )
      .get(expectedMicro);
  },

  // Idempotent ödendi işaretle (CAS): yalnızca hâlâ pending ise başarılı olur
  markPaid(id, txid, receivedMicro) {
    const info = db
      .prepare(
        `UPDATE payments SET status = 'paid', txid = ?, received_amount_micro = ?, paid_at = datetime('now')
         WHERE id = ? AND status = 'pending'`
      )
      .run(txid, receivedMicro, id);
    return info.changes === 1;
  },

  markIntentApplied(id) {
    db.prepare(`UPDATE payments SET intent_applied = 1 WHERE id = ?`).run(id);
  },

  // Tahsil edilmiş ama niyeti (plan/paket) henüz uygulanmamış ödemeler — poller retry eder
  listUnappliedIntents() {
    return db
      .prepare(
        `SELECT * FROM payments
         WHERE status = 'paid' AND intent_applied = 0 AND intent_kind IN ('plan','subpack')`
      )
      .all();
  },

  cancel(orderRef, userId) {
    const info = db
      .prepare(`UPDATE payments SET status = 'expired' WHERE order_ref = ? AND user_id = ? AND status = 'pending'`)
      .run(orderRef, userId);
    return info.changes === 1;
  },

  expireStale() {
    return db
      .prepare(
        `UPDATE payments SET status = 'expired'
         WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < datetime('now')`
      )
      .run().changes;
  },

  // expireStale + ETKİLENEN satırları döndürür (süresi dolan faturalar için bildirim e-postası).
  // Tek geçişte: önce hedef satırları oku, sonra aynı koşulla expired'a çevir (better-sqlite3 senkron → yarış yok).
  expireStaleReturning() {
    const stale = db
      .prepare(
        `SELECT * FROM payments
         WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < datetime('now')`
      )
      .all();
    if (!stale.length) return [];
    const ph = stale.map(() => '?').join(',');
    db.prepare(`UPDATE payments SET status = 'expired' WHERE id IN (${ph})`).run(...stale.map((p) => p.id));
    return stale;
  },

  listByUser(userId, limit = 20) {
    return db
      .prepare(`SELECT * FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT ?`)
      .all(userId, limit);
  },
};
