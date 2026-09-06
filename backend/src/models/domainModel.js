import db from '../db/connection.js';

// Basit hostname doğrulaması — etiketler 1-63 karakter, alfasayısal+tire, tire ile başlayıp bitemez,
// en az bir nokta (TLD) zorunlu. IP adresi/localhost reddedilir (gerçek bir domain olmalı).
const HOSTNAME_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

// Kullanıcı girdisini normalize eder: küçük harf, şema (http/https), path, port, sondaki nokta atılır.
// Geçersizse null döner.
export function normalizeDomain(input) {
  let s = String(input == null ? '' : input).trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, ''); // şema
  s = s.split('/')[0]; // path
  s = s.split('?')[0].split('#')[0];
  s = s.replace(/:\d+$/, ''); // port
  s = s.replace(/\.$/, ''); // sondaki nokta (FQDN)
  s = s.replace(/^www\./, ''); // www → apex (kanonik: apex kaydedilir, www yönlendirmesi ayrı ele alınır)
  if (!HOSTNAME_RE.test(s)) return null;
  return s;
}

const parse = (row) => row;

export const domainModel = {
  normalize: normalizeDomain,

  listByUser(userId) {
    return db
      .prepare(`SELECT * FROM custom_domains WHERE user_id = ? ORDER BY created_at DESC, id DESC`)
      .all(userId)
      .map(parse);
  },

  countByUser(userId) {
    return db.prepare(`SELECT COUNT(*) AS n FROM custom_domains WHERE user_id = ?`).get(userId).n;
  },

  findById(id) {
    return parse(db.prepare(`SELECT * FROM custom_domains WHERE id = ?`).get(id));
  },

  findByDomain(domain) {
    return parse(db.prepare(`SELECT * FROM custom_domains WHERE domain = ?`).get(domain));
  },

  // Yalnız aktif (doğrulanmış) domain — resolveHost + tls-check kapısı için.
  findActiveByDomain(domain) {
    return parse(db.prepare(`SELECT * FROM custom_domains WHERE domain = ? AND status = 'active'`).get(domain));
  },

  create({ userId, domain, targetProfileId = null, verifyToken = null, kind = 'apex' }) {
    const info = db
      .prepare(
        `INSERT INTO custom_domains (user_id, domain, target_profile_id, verify_token, kind)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(userId, domain, targetProfileId, verifyToken, kind === 'subdomain' ? 'subdomain' : 'apex');
    return this.findById(info.lastInsertRowid);
  },

  // Doğrulama sonucu — status geçişleri: pending/verifying → active | error.
  setVerifyResult(id, { status, verifyMethod = null, lastError = null }) {
    db.prepare(
      `UPDATE custom_domains
       SET status = ?, verify_method = ?, last_error = ?, last_checked_at = datetime('now'),
           verified_at = CASE WHEN ? = 'active' THEN datetime('now') ELSE verified_at END,
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(status, verifyMethod, lastError, status, id);
    return this.findById(id);
  },

  remove(id) {
    return db.prepare(`DELETE FROM custom_domains WHERE id = ?`).run(id);
  },
};
