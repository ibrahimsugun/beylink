import db from '../db/connection.js';
import { badRequest } from '../utils/ApiError.js';

// Tüm bakiye mutasyonları buradan geçer — kullanıcı bakiyesi + ledger her zaman tutarlı.
export const walletModel = {
  balance(userId) {
    const r = db.prepare(`SELECT credits_micro FROM users WHERE id = ?`).get(userId);
    return r ? r.credits_micro : 0;
  },

  /**
   * Bakiyeye imzalı bir tutar uygula (+ kredi / − borç) ve ledger satırı yaz — TEK transaction.
   * Borç bakiyeyi negatife düşürüyorsa reddeder (yetersiz bakiye).
   * Döndürür: { balance_after_micro }
   */
  apply(userId, amountMicro, reason, ref = null) {
    const amt = Math.trunc(Number(amountMicro) || 0);
    const tx = db.transaction(() => {
      const row = db.prepare(`SELECT credits_micro FROM users WHERE id = ?`).get(userId);
      if (!row) throw badRequest('Kullanıcı bulunamadı');
      const next = row.credits_micro + amt;
      if (next < 0) throw badRequest('Yetersiz bakiye');
      db.prepare(`UPDATE users SET credits_micro = ?, updated_at = datetime('now') WHERE id = ?`).run(next, userId);
      db.prepare(
        `INSERT INTO balance_txns (user_id, amount_micro, reason, ref, balance_after_micro)
         VALUES (?, ?, ?, ?, ?)`
      ).run(userId, amt, reason, ref, next);
      return next;
    });
    const balance_after_micro = tx();
    return { balance_after_micro };
  },

  ledger(userId, limit = 50) {
    return db
      .prepare(
        `SELECT id, amount_micro, reason, ref, balance_after_micro, created_at
         FROM balance_txns WHERE user_id = ? ORDER BY id DESC LIMIT ?`
      )
      .all(userId, limit);
  },
};
