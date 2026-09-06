import db from '../db/connection.js';

// Ek alt hesap hakkı paketleri (hesaba kalıcı). Her (user, pack_key) tek satır; tekrar alım `quantity`'yi artırır.
export const subaccountPackModel = {
  // Kullanıcının satın aldığı tüm paketler
  listByUser(userId) {
    return db.prepare(`SELECT * FROM subaccount_packs WHERE user_id = ? ORDER BY id ASC`).all(userId);
  },

  // Kullanıcının satın aldığı pack_key'ler (Set için)
  keysByUser(userId) {
    return db.prepare(`SELECT pack_key FROM subaccount_packs WHERE user_id = ?`).all(userId).map((r) => r.pack_key);
  },

  // Bu paket daha önce alınmış mı?
  has(userId, packKey) {
    return !!db.prepare(`SELECT 1 FROM subaccount_packs WHERE user_id = ? AND pack_key = ?`).get(userId, packKey);
  },

  // Toplam satın alınmış hak = Σ (rights × quantity) — tekrar-alımlar dahil; plandan bağımsız, kalıcı.
  totalRights(userId) {
    return db.prepare(`SELECT COALESCE(SUM(rights * quantity), 0) AS n FROM subaccount_packs WHERE user_id = ?`).get(userId).n;
  },

  // Paket ekle — tekrar-satın-alınabilir: aynı (user, pack_key) varsa quantity'yi artır (UNIQUE korunur, rights per-pack kalır).
  add(userId, { packKey, rights, priceMicro }) {
    db.prepare(
      `INSERT INTO subaccount_packs (user_id, pack_key, rights, price_micro, quantity) VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(user_id, pack_key) DO UPDATE SET quantity = quantity + 1`,
    ).run(userId, packKey, rights, priceMicro);
    return this.listByUser(userId);
  },
};
