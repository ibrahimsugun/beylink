import db from '../db/connection.js';

// auth_tokens: şifre sıfırlama + e-posta doğrulama. Yalnız hash saklanır; tek kullanımlık + süreli.
export const authTokenModel = {
  create({ userId, kind, tokenHash, codeHash = null, ttlMinutes = 30 }) {
    db.prepare(
      `INSERT INTO auth_tokens (user_id, kind, token_hash, code_hash, expires_at)
       VALUES (?, ?, ?, ?, datetime('now', ?))`
    ).run(userId, kind, tokenHash, codeHash, `+${Number(ttlMinutes)} minutes`);
  },

  // Geçerli token: doğru hash+kind, kullanılmamış, süresi dolmamış
  findValid(tokenHash, kind) {
    return db
      .prepare(
        `SELECT * FROM auth_tokens
         WHERE token_hash = ? AND kind = ? AND used_at IS NULL AND expires_at > datetime('now')`
      )
      .get(tokenHash, kind);
  },

  // Kod ile geçerli satır — DAİMA user_id'ye scope'lu (6 hane yalnız hesap bağlamında doğrulanır).
  findValidByCode(userId, codeHash, kind) {
    return db
      .prepare(
        `SELECT * FROM auth_tokens
         WHERE user_id = ? AND code_hash = ? AND kind = ? AND used_at IS NULL AND expires_at > datetime('now')`
      )
      .get(userId, codeHash, kind);
  },

  markUsed(id) {
    db.prepare(`UPDATE auth_tokens SET used_at = datetime('now') WHERE id = ?`).run(id);
  },

  // Yeni token vermeden önce aynı kullanıcı+tür için bekleyenleri geçersiz kıl (tek aktif token)
  invalidateUserKind(userId, kind) {
    db.prepare(
      `UPDATE auth_tokens SET used_at = datetime('now') WHERE user_id = ? AND kind = ? AND used_at IS NULL`
    ).run(userId, kind);
  },
};
