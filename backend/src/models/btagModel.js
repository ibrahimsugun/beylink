import db from '../db/connection.js';

const parse = (row) => (row ? { ...row, is_active: !!row.is_active } : row);

export const btagModel = {
  listByProfile(profileId) {
    return db
      .prepare(`SELECT * FROM btags WHERE profile_id = ? ORDER BY created_at DESC, id DESC`)
      .all(profileId)
      .map(parse);
  },

  findById(id) {
    return parse(db.prepare(`SELECT * FROM btags WHERE id = ?`).get(id));
  },

  valueExists(profileId, value) {
    return !!db.prepare(`SELECT 1 FROM btags WHERE profile_id = ? AND value = ?`).get(profileId, value);
  },

  create({ profileId, value, label = null }) {
    const info = db
      .prepare(`INSERT INTO btags (profile_id, value, label) VALUES (?, ?, ?)`)
      .run(profileId, value, label);
    return this.findById(info.lastInsertRowid);
  },

  update(id, { label, is_active }) {
    const sets = [];
    const values = [];
    if (label !== undefined) {
      sets.push('label = ?');
      values.push(label);
    }
    if (is_active !== undefined) {
      sets.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    if (sets.length === 0) return this.findById(id);
    values.push(id);
    db.prepare(`UPDATE btags SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  remove(id) {
    return db.prepare(`DELETE FROM btags WHERE id = ?`).run(id);
  },

  // BTAG performansı — kaynağa göre iki sayı:
  //   visitors = bu BTAG ile temas eden TEKİL ziyaretçi (view+click, COUNT DISTINCT visitor)
  //              → link tıklamalarıyla ŞİŞMEZ (1 kişi kaç link tıklarsa tıklasın 1 sayılır).
  //   clicks   = bu BTAG'e atfedilen tıklama olayı sayısı (dedup sonrası: kişi/link/gün başına 1).
  // Not: /api/go tıklamaları artık cookie'den visitor taşır → DISTINCT doğru çalışır.
  // Eski/seed satırlarında visitor NULL → 'e'||id ile tekil (eski davranış, yanıltmaz).
  clickCounts(profileId) {
    return db
      .prepare(
        `SELECT btag AS value,
                COUNT(DISTINCT COALESCE(visitor, 'e' || id)) AS visitors,
                SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) AS clicks
         FROM analytics
         WHERE profile_id = ? AND btag IS NOT NULL AND btag != ''
         GROUP BY btag`
      )
      .all(profileId);
  },
};
