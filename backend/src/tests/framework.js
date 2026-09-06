// Sıfır bağımlılıklı mini test framework — admin panelden manuel tetiklenen sistem testleri için.
// Her test bir Context alır; ctx.log/step/assert/equal ile kendini belgeler; sonucu structured döner.
import db from '../db/connection.js';

// Cleanup prefix'i BİLİNÇLİ olarak dar tutulur (`bltest_z_`) — framework'ün oluşturduğu
// geçici test kullanıcıları hedeflenir, dışarıda başka amaçla yaratılmış `bltest_*` (ör.
// geliştirici debug kullanıcıları) etkilenmez. massskaa/demo zaten prefix ile örtüşmez.
const TEST_PREFIX = 'bltest_z_';

export function makeContext() {
  const logs = [];
  const now = () => Date.now();
  const push = (level, msg) => logs.push({ t: now(), level, msg: String(msg).slice(0, 500) });

  const ctx = {
    logs,
    log: (msg) => push('info', msg),
    step: async (name, fn) => {
      push('step', `▸ ${name}`);
      try {
        const r = await fn();
        push('ok', `  ✓ ${name}`);
        return r;
      } catch (e) {
        push('fail', `  ✗ ${name}: ${e.message}`);
        throw e;
      }
    },
    assert(cond, msg) {
      if (!cond) throw new Error(msg || 'assertion failed');
    },
    equal(actual, expected, msg) {
      if (actual !== expected) {
        throw new Error(`${msg || 'değerler eşit değil'}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
      }
    },
    contains(str, needle, msg) {
      if (typeof str !== 'string' || !str.includes(needle)) {
        throw new Error(`${msg || 'metin içermiyor'}: ${JSON.stringify(String(str).slice(0, 120))} ⊄ ${JSON.stringify(needle)}`);
      }
    },
    // Test-lokal benzersiz kimlik üretir — bltest_ prefix'i cleanup mekanizmalarınca yakalanır.
    uniq(tag = '') {
      const rand = Math.random().toString(36).slice(2, 8);
      return `${TEST_PREFIX}${tag}_${Date.now()}_${rand}`;
    },
  };
  return ctx;
}

/**
 * Tüm bltest_ prefix'li kullanıcıları ve ilişkili verileri siler (idempotent, güvenli).
 * massskaa/demo hesapları prefix ile ÖRTÜŞMEZ → asla etkilenmez.
 * Test setup/teardown ve her testin finally'sinde çağrılabilir.
 */
export function cleanupTestUsers() {
  const users = db
    .prepare(`SELECT id FROM users WHERE email LIKE ? OR username LIKE ?`)
    .all(`${TEST_PREFIX}%`, `${TEST_PREFIX}%`);
  if (!users.length) return 0;
  const del = db.transaction(() => {
    for (const u of users) {
      db.prepare(`DELETE FROM activity_logs WHERE user_id = ?`).run(u.id);
      db.prepare(`DELETE FROM balance_txns  WHERE user_id = ?`).run(u.id);
      db.prepare(`DELETE FROM auth_tokens   WHERE user_id = ?`).run(u.id);
      db.prepare(`DELETE FROM analytics WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = ?)`).run(u.id);
      db.prepare(`DELETE FROM links     WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = ?)`).run(u.id);
      db.prepare(`DELETE FROM btags     WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = ?)`).run(u.id);
      db.prepare(`DELETE FROM custom_domains WHERE user_id = ?`).run(u.id);
      db.prepare(`DELETE FROM profiles  WHERE user_id = ?`).run(u.id);
      db.prepare(`DELETE FROM users     WHERE id = ?`).run(u.id);
    }
  });
  del();
  return users.length;
}

export const TEST_USER_PREFIX = TEST_PREFIX;
