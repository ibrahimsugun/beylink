import db from '../db/connection.js';

// Kullanıcının kaydettiği tasarım şablonları ("Şablonlarım"). theme_json parse edilerek döner.
function row(r) {
  if (!r) return null;
  let theme = {};
  try { theme = JSON.parse(r.theme_json); } catch { theme = {}; }
  return { id: r.id, user_id: r.user_id, name: r.name, theme_settings: theme, created_at: r.created_at };
}

export const designTemplateModel = {
  create(userId, { name, themeSettings }) {
    const info = db
      .prepare(`INSERT INTO design_templates (user_id, name, theme_json) VALUES (?, ?, ?)`)
      .run(userId, name, JSON.stringify(themeSettings || {}));
    return this.findById(info.lastInsertRowid);
  },

  findById(id) {
    return row(db.prepare(`SELECT * FROM design_templates WHERE id = ?`).get(id));
  },

  listByUser(userId) {
    return db.prepare(`SELECT * FROM design_templates WHERE user_id = ? ORDER BY id DESC`).all(userId).map(row);
  },

  countByUser(userId) {
    return db.prepare(`SELECT COUNT(*) AS n FROM design_templates WHERE user_id = ?`).get(userId).n;
  },

  remove(id) {
    return db.prepare(`DELETE FROM design_templates WHERE id = ?`).run(id);
  },
};
