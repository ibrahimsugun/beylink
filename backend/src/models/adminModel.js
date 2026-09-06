import db from '../db/connection.js';
import { CREDIT_ACTIONS, ACTIVITY_ACTIONS } from '../services/activityLog.js';
import { PLAN_KEYS } from '../config/plans.js';

// Admin dashboard veri erişimi — ham SQL, korelasyonlu alt sorgularla (N+1 yok).
// Kullanıcı = ana hesap (owner); alt hesaplar owner tarafından yönetilir, ayrı listelenmez.
export const adminModel = {
  // Genel özet kartları
  stats() {
    const totalUsers = db.prepare(`SELECT COUNT(*) AS c FROM users`).get().c;
    // Ücretli = free olmayan HER plan (proplus dahil) → yeni tier eklendiğinde kendiliğinden kapsar.
    const paidUsers = db.prepare(`SELECT COUNT(*) AS c FROM users WHERE plan != 'free'`).get().c;
    const totalLinks = db.prepare(`SELECT COUNT(*) AS c FROM links WHERE is_active = 1`).get().c;
    const totalClicks = db.prepare(`SELECT COUNT(*) AS c FROM analytics WHERE event_type = 'click'`).get().c;

    // Tüm plan anahtarlarından türet (free/basic/pro/proplus) → hardcode edilen liste eksik kalmaz.
    const byPlan = Object.fromEntries(PLAN_KEYS.map((k) => [k, 0]));
    for (const r of db.prepare(`SELECT plan, COUNT(*) AS c FROM users GROUP BY plan`).all()) {
      if (byPlan[r.plan] !== undefined) byPlan[r.plan] += r.c;
    }
    return { totalUsers, paidUsers, totalLinks, totalClicks, byPlan };
  },

  // Kullanıcılar (owner) + satır başı metrikler; opsiyonel arama (e-posta / ad / slug)
  listUsers(q = '') {
    const term = String(q || '').trim().toLowerCase();
    const where = term
      ? `AND (lower(u.email) LIKE ?
             OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id
                        AND (lower(p.display_name) LIKE ? OR lower(p.username) LIKE ?)))`
      : '';
    const like = `%${term}%`;
    const args = term ? [like, like, like] : [];
    return db
      .prepare(
        `SELECT u.id, u.email, u.plan, u.plan_expires_at, u.credits_micro, u.is_admin, u.created_at,
                u.totp_enabled, u.email_verified,
                (SELECT p.display_name FROM profiles p WHERE p.user_id = u.id ORDER BY p.id LIMIT 1) AS display_name,
                (SELECT p.username     FROM profiles p WHERE p.user_id = u.id ORDER BY p.id LIMIT 1) AS username,
                (SELECT COUNT(*) FROM links l JOIN profiles p ON p.id = l.profile_id
                   WHERE p.user_id = u.id AND l.is_active = 1) AS active_links,
                (SELECT COUNT(*) FROM analytics a JOIN profiles p ON p.id = a.profile_id
                   WHERE p.user_id = u.id AND a.event_type = 'click') AS total_clicks
           FROM users u
          WHERE u.role = 'owner' ${where}
          ORDER BY u.id ASC`
      )
      .all(...args);
  },

  // Tek kullanıcı (plan değişimi öncesi doğrulama + log detayı)
  findUser(id) {
    return db.prepare(`SELECT id, email, plan FROM users WHERE id = ?`).get(id);
  },

  // Kredi düzenleme öncesi doğrulama (mevcut bakiye + log detayı)
  findUserFull(id) {
    return db.prepare(`SELECT id, email, plan, credits_micro FROM users WHERE id = ?`).get(id);
  },

  // Aktivite logları (en yeni önce). Kategori: 'activity' | 'credit' | '' (hepsi).
  // Kategori seti activityLog.js'den gelir → tek gerçek kaynak; sözleşme dışı aksiyonlar
  // hiçbir kategoriye sızmaz (uncategorized → yalnız 'all' modda görünür).
  logs({ limit = 200, action = '', category = '' } = {}) {
    const lim = Math.min(1000, Math.max(1, Number(limit) || 200));
    const act = String(action || '').trim();
    const cat = String(category || '').trim();

    const clauses = [];
    const args = [];
    if (act) { clauses.push('a.action = ?'); args.push(act); }
    if (cat === 'credit' || cat === 'activity') {
      const set = cat === 'credit' ? CREDIT_ACTIONS : ACTIVITY_ACTIONS;
      const ids = [...set];
      if (ids.length === 0) return [];
      clauses.push(`a.action IN (${ids.map(() => '?').join(',')})`);
      args.push(...ids);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    args.push(lim);
    const rows = db
      .prepare(
        `SELECT a.id, a.user_id, u.email AS user_email, a.action, a.detail, a.ip, a.created_at
           FROM activity_logs a LEFT JOIN users u ON u.id = a.user_id
           ${where}
          ORDER BY a.id DESC LIMIT ?`
      )
      .all(...args);
    return rows.map((r) => ({ ...r, detail: r.detail ? safeParse(r.detail) : null }));
  },
};

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
