import db from '../db/connection.js';

const parse = (row) => {
  if (!row) return row;
  let theme = {};
  try {
    theme = JSON.parse(row.theme_settings_json || '{}');
  } catch {
    theme = {};
  }
  let seo = {};
  try {
    seo = JSON.parse(row.seo_settings_json || '{}');
  } catch {
    seo = {};
  }
  return { ...row, theme_settings: theme, seo_settings: seo, is_published: !!row.is_published };
};

export const profileModel = {
  create({ userId, username, displayName = null, bio = null, theme = {} }) {
    const info = db
      .prepare(
        `INSERT INTO profiles (user_id, username, display_name, bio, theme_settings_json)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(userId, username, displayName, bio, JSON.stringify(theme));
    return this.findById(info.lastInsertRowid);
  },

  findById(id) {
    return parse(db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(id));
  },

  findByUserId(userId) {
    return parse(db.prepare(`SELECT * FROM profiles WHERE user_id = ?`).get(userId));
  },

  findByUsername(username) {
    return parse(db.prepare(`SELECT * FROM profiles WHERE username = ?`).get(username));
  },

  usernameExists(username) {
    return !!db.prepare(`SELECT 1 FROM profiles WHERE username = ?`).get(username);
  },

  // Sitemap için: yayında olan tüm profil slug'ları + son güncellenme zamanı (lastmod).
  // Askıdaki alt hesap profilleri (sub + is_suspended=1) DAHİL EDİLMEZ — public'te render edilmezler.
  listPublishedForSitemap(limit = 50000) {
    return db
      .prepare(
        `SELECT p.username, p.updated_at
           FROM profiles p
           JOIN users u ON u.id = p.user_id
          WHERE p.is_published = 1
            AND (u.role != 'sub' OR COALESCE(u.is_suspended, 0) = 0)
            AND u.is_active = 1
          ORDER BY p.updated_at DESC
          LIMIT ?`
      )
      .all(limit);
  },

  update(id, fields) {
    // NOT: 'username' (public slug) BİLİNÇLİ olarak listede yok — kayıttan sonra
    // değiştirilemez (kalıcı profil adresi). İlk değer kayıtta belirlenir.
    const allowed = [
      'display_name',
      'bio',
      'bio_html',
      'avatar_url',
      'cover_url',
      'meta_title',
      'meta_description',
      'is_published',
    ];
    const sets = [];
    const values = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(key === 'is_published' ? (fields[key] ? 1 : 0) : fields[key]);
      }
    }

    if (fields.theme_settings !== undefined) {
      sets.push('theme_settings_json = ?');
      values.push(JSON.stringify(fields.theme_settings));
    }

    if (fields.seo_settings !== undefined) {
      sets.push('seo_settings_json = ?');
      values.push(JSON.stringify(fields.seo_settings));
    }

    if (sets.length === 0) return this.findById(id);

    sets.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE profiles SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },
};

export { parse as parseProfile };
