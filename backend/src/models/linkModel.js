import db from '../db/connection.js';

const parse = (row) => {
  if (!row) return row;
  let cfg = {};
  try {
    cfg = JSON.parse(row.config_json || '{}');
  } catch {
    cfg = {};
  }
  return { ...row, config: cfg, is_active: !!row.is_active };
};

export const linkModel = {
  listByProfile(profileId, { activeOnly = false } = {}) {
    const where = activeOnly ? 'AND is_active = 1' : '';
    return db
      .prepare(
        `SELECT * FROM links WHERE profile_id = ? ${where} ORDER BY sort_order ASC, id ASC`
      )
      .all(profileId)
      .map(parse);
  },

  findById(id) {
    return parse(db.prepare(`SELECT * FROM links WHERE id = ?`).get(id));
  },

  create({ profileId, type = 'link', title = null, url = null, iconName = null, config = {}, btag = null }) {
    const next =
      db.prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM links WHERE profile_id = ?`).get(profileId).n;
    const info = db
      .prepare(
        `INSERT INTO links (profile_id, type, title, url, icon_name, config_json, sort_order, btag)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(profileId, type, title, url, iconName, JSON.stringify(config), next, btag || null);
    return this.findById(info.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = ['type', 'title', 'url', 'icon_name', 'is_active', 'sort_order', 'btag'];
    const sets = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(key === 'is_active' ? (fields[key] ? 1 : 0) : fields[key]);
      }
    }
    if (fields.config !== undefined) {
      sets.push('config_json = ?');
      values.push(JSON.stringify(fields.config));
    }
    if (sets.length === 0) return this.findById(id);
    sets.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE links SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  remove(id) {
    return db.prepare(`DELETE FROM links WHERE id = ?`).run(id);
  },

  // [{id, sort_order}] listesini tek transaction'da uygular
  reorder(profileId, orderedIds) {
    const stmt = db.prepare(
      `UPDATE links SET sort_order = ?, updated_at = datetime('now') WHERE id = ? AND profile_id = ?`
    );
    // Yalnızca bu profile ait id'ler + eksik kalanları sona ekle (çakışan sort_order olmasın)
    const all = db.prepare(`SELECT id FROM links WHERE profile_id = ?`).all(profileId).map((r) => r.id);
    const ordered = orderedIds.filter((id) => all.includes(id));
    const finalOrder = [...ordered, ...all.filter((id) => !ordered.includes(id))];
    const tx = db.transaction((ids) => {
      ids.forEach((id, index) => stmt.run(index, id, profileId));
    });
    tx(finalOrder);
    return this.listByProfile(profileId);
  },
};
