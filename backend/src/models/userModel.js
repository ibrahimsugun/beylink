import db from '../db/connection.js';

const PUBLIC_COLS =
  'id, email, username, role, plan, credits_micro, plan_expires_at, deferred_plan, deferred_expires_at, extra_subaccount_packs, ' +
  'is_active, is_suspended, can_edit_profile, is_admin, totp_enabled, email_verified, token_version, parent_user_id, created_at, updated_at';
// NOT: totp_secret ASLA PUBLIC_COLS'a eklenmez — yalnızca findByIdWithHash / *WithHash ile okunur.

export const userModel = {
  createOwner({ email, passwordHash }) {
    const info = db
      .prepare(`INSERT INTO users (email, password_hash, role, plan) VALUES (?, ?, 'owner', 'free')`)
      .run(email, passwordHash);
    return this.findById(info.lastInsertRowid);
  },

  createSub({ username, passwordHash, parentUserId }) {
    // Yeni alt hesaba varsayılan olarak Basic plan tanımlanır (SEO yalnız salt-okunur görünür).
    const info = db
      .prepare(
        `INSERT INTO users (username, password_hash, role, plan, parent_user_id)
         VALUES (?, ?, 'sub', 'basic', ?)`
      )
      .run(username, passwordHash, parentUserId);
    return this.findById(info.lastInsertRowid);
  },

  findById(id) {
    return db.prepare(`SELECT ${PUBLIC_COLS} FROM users WHERE id = ?`).get(id);
  },

  // Auth için hash dahil. E-posta karşılaştırması case-insensitive — admin yetkisi
  // (requireAdmin) e-postayı küçük harfe çevirdiğinden, kimlik doğrulama ile aynı
  // canonical değeri kullanmak ZORUNLU (büyük/küçük harf ile admin taklidi engellenir).
  findByEmailWithHash(email) {
    return db.prepare(`SELECT * FROM users WHERE lower(email) = lower(?)`).get(email);
  },

  findByUsernameWithHash(username) {
    return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
  },

  // Şifre değiştirmede mevcut şifreyi doğrulamak için (hash dahil)
  findByIdWithHash(id) {
    return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
  },

  // Owner'lar profil slug'ı ile giriş yapar (users.username owner'da NULL)
  findByProfileUsernameWithHash(slug) {
    return db
      .prepare(
        `SELECT u.* FROM users u JOIN profiles p ON p.user_id = u.id
         WHERE lower(p.username) = lower(?)`
      )
      .get(slug);
  },

  // Case-insensitive — 'Admin@x.com' ile 'admin@x.com' AYNI hesap sayılır (yetki taklidi guard'ı)
  emailExists(email) {
    return !!db.prepare(`SELECT 1 FROM users WHERE lower(email) = lower(?)`).get(email);
  },

  usernameExists(username) {
    return !!db.prepare(`SELECT 1 FROM users WHERE username = ?`).get(username);
  },

  listSubAccounts(parentUserId) {
    return db
      .prepare(
        `SELECT ${PUBLIC_COLS} FROM users WHERE parent_user_id = ? ORDER BY created_at DESC`
      )
      .all(parentUserId);
  },

  countSubAccounts(parentUserId) {
    return db.prepare(`SELECT COUNT(*) AS n FROM users WHERE parent_user_id = ?`).get(parentUserId).n;
  },

  // Doğrudan plan set — saklanan (deferred) alt plan TEMİZLENİR (temiz durum). Admin override
  // ve süre-dolumu-Free geçişi bunu kullanır. Deferred'a düşüş (resume) için de kullanılır:
  // updatePlan(id, deferred_plan, deferred_expires_at) → plan set + deferred temizlenir.
  updatePlan(id, plan, expiresAt = null) {
    db.prepare(
      `UPDATE users SET plan = ?, plan_expires_at = ?, deferred_plan = NULL, deferred_expires_at = NULL, updated_at = datetime('now') WHERE id = ?`,
    ).run(plan, expiresAt, id);
    return this.findById(id);
  },

  // Yığılı plan durumunu set eder (yükseltme/uzatma). Deferred alanları AÇIKÇA verilir.
  setPlanState(id, { plan, expiresAt = null, deferredPlan = null, deferredExpiresAt = null }) {
    db.prepare(
      `UPDATE users SET plan = ?, plan_expires_at = ?, deferred_plan = ?, deferred_expires_at = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(plan, expiresAt, deferredPlan, deferredExpiresAt, id);
    return this.findById(id);
  },

  updatePassword(id, passwordHash) {
    // token_version'ı artır → bu kullanıcının mevcut tüm JWT'leri geçersizleşir (requireAuth tv kontrolü)
    db.prepare(`UPDATE users SET password_hash = ?, token_version = token_version + 1, updated_at = datetime('now') WHERE id = ?`).run(passwordHash, id);
    return this.findById(id);
  },

  setEmailVerified(id) {
    db.prepare(`UPDATE users SET email_verified = 1, updated_at = datetime('now') WHERE id = ?`).run(id);
    return this.findById(id);
  },

  // 2FA (TOTP) — secret'ı sakla (henüz etkin değil), etkinleştir, temizle
  setTotpSecret(id, secret) {
    db.prepare(`UPDATE users SET totp_secret = ?, totp_enabled = 0, updated_at = datetime('now') WHERE id = ?`).run(secret, id);
    return this.findById(id);
  },

  enableTotp(id) {
    db.prepare(`UPDATE users SET totp_enabled = 1, updated_at = datetime('now') WHERE id = ?`).run(id);
    return this.findById(id);
  },

  disableTotp(id) {
    db.prepare(`UPDATE users SET totp_secret = NULL, totp_enabled = 0, updated_at = datetime('now') WHERE id = ?`).run(id);
    return this.findById(id);
  },

  addExtraSubPack(id, size) {
    db.prepare(
      `UPDATE users SET extra_subaccount_packs = extra_subaccount_packs + ?, updated_at = datetime('now') WHERE id = ?`
    ).run(size, id);
    return this.findById(id);
  },

  updateSubCredentials(id, { username, passwordHash, isActive, canEditProfile }) {
    if (username !== undefined) {
      db.prepare(`UPDATE users SET username = ?, updated_at = datetime('now') WHERE id = ?`).run(username, id);
    }
    if (passwordHash !== undefined) {
      db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(passwordHash, id);
    }
    if (isActive !== undefined) {
      db.prepare(`UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?`).run(isActive ? 1 : 0, id);
    }
    if (canEditProfile !== undefined) {
      db.prepare(`UPDATE users SET can_edit_profile = ?, updated_at = datetime('now') WHERE id = ?`).run(canEditProfile ? 1 : 0, id);
    }
    return this.findById(id);
  },

  // Premium bitince ana hesabın TÜM alt hesaplarını askıya al (is_suspended=1). Asla silinmez.
  // Giriş yapabilirler ama işlem yapamazlar (guardSuspended). Zaten askıdakiler değişmez.
  suspendSubs(parentUserId) {
    return db
      .prepare(`UPDATE users SET is_suspended = 1, updated_at = datetime('now') WHERE parent_user_id = ? AND role = 'sub' AND is_suspended = 0`)
      .run(parentUserId).changes;
  },

  // Premium yenilenince (kullanıcı onayıyla) tüm alt hesapları tekrar aktifleştir.
  reactivateSubs(parentUserId) {
    return db
      .prepare(`UPDATE users SET is_suspended = 0, updated_at = datetime('now') WHERE parent_user_id = ? AND role = 'sub' AND is_suspended = 1`)
      .run(parentUserId).changes;
  },

  countSuspendedSubs(parentUserId) {
    return db.prepare(`SELECT COUNT(*) AS n FROM users WHERE parent_user_id = ? AND role = 'sub' AND is_suspended = 1`).get(parentUserId).n;
  },

  remove(id) {
    return db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  },
};
