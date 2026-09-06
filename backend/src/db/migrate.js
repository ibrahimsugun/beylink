import db from './connection.js';
import { config } from '../config/env.js';
import { parseBrowser, parseOs } from '../utils/ua.js';

/**
 * Tabloları oluşturur (idempotent). Hem CLI (npm run migrate) hem de
 * sunucu açılışında (index.js) çağrılabilir.
 */
export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      email          TEXT UNIQUE,
      username       TEXT UNIQUE,
      password_hash  TEXT NOT NULL,
      role           TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','sub')),
      plan           TEXT NOT NULL DEFAULT 'free',
      credits_micro          INTEGER NOT NULL DEFAULT 0,
      plan_expires_at        TEXT,
      extra_subaccount_packs INTEGER NOT NULL DEFAULT 0,
      is_active        INTEGER NOT NULL DEFAULT 1,
      can_edit_profile INTEGER NOT NULL DEFAULT 1,
      parent_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username            TEXT UNIQUE NOT NULL,
      display_name        TEXT,
      bio                 TEXT,
      avatar_url          TEXT,
      cover_url           TEXT,
      theme_settings_json TEXT NOT NULL DEFAULT '{}',
      meta_title          TEXT,
      meta_description    TEXT,
      is_published        INTEGER NOT NULL DEFAULT 1,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS links (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      type        TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('link','social','divider','contact','gallery','menu')),
      title       TEXT,
      url         TEXT,
      icon_name   TEXT,
      config_json TEXT NOT NULL DEFAULT '{}',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      link_id    INTEGER REFERENCES links(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL DEFAULT 'click' CHECK (event_type IN ('click','view')),
      click_time TEXT NOT NULL DEFAULT (datetime('now')),
      device     TEXT,
      country    TEXT,
      referrer   TEXT,
      user_agent TEXT
    );

    -- BTAG (affiliate/banner takip etiketi) — kullanıcının kayıtlı, isimli etiketleri
    CREATE TABLE IF NOT EXISTS btags (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      value       TEXT NOT NULL,
      label       TEXT,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (profile_id, value)
    );

    -- USDT (TRC20) ödeme faturaları — self-custody, txid idempotency omurgası
    CREATE TABLE IF NOT EXISTS payments (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_ref             TEXT UNIQUE NOT NULL,
      intent_kind           TEXT NOT NULL DEFAULT 'topup',   -- 'topup' | 'plan' | 'subpack'
      intent_target         TEXT,                             -- plan adı vb.
      network               TEXT NOT NULL DEFAULT 'TRC20',
      address               TEXT,
      expected_amount_micro INTEGER NOT NULL,
      received_amount_micro INTEGER,
      txid                  TEXT UNIQUE,
      status                TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid' | 'expired'
      intent_applied        INTEGER NOT NULL DEFAULT 0,
      expires_at            TEXT,
      created_at            TEXT NOT NULL DEFAULT (datetime('now')),
      paid_at               TEXT
    );

    -- Bakiye defteri (ledger) — her kredi/borç kaydı imzalı tutulur (düzgün bakiye sistemi)
    CREATE TABLE IF NOT EXISTS balance_txns (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount_micro       INTEGER NOT NULL,                    -- + kredi / − borç
      reason             TEXT NOT NULL,
      ref                TEXT,
      balance_after_micro INTEGER NOT NULL,
      created_at         TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Kullanıcının kaydettiği TASARIM şablonları ("Şablonlarım") — tema/düzen/buton anlık görüntüsü.
    -- İçerik (blok) şablonlarından (Hazır Sayfalar) ve hazır presetlerden ayrıdır; hesaba bağlıdır.
    CREATE TABLE IF NOT EXISTS design_templates (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      theme_json TEXT NOT NULL,                       -- sanitize edilmiş theme_settings
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Ek alt hesap hakkı paketleri (HESABA KALICI). Her (user, pack_key) tek satır → "hesap başına 1 kez".
    -- Premium bitince silinmez; subAccountLimit free planda saymaz, premium yenilenince tekrar sayar.
    CREATE TABLE IF NOT EXISTS subaccount_packs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pack_key    TEXT NOT NULL,                       -- 'basic_1' | 'pro_1' | 'pro_6' | 'proplus_10' | 'proplus_15'
      rights      INTEGER NOT NULL,                    -- bu paketin verdiği alt hesap hakkı sayısı
      price_micro INTEGER NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, pack_key)
    );

    -- Aktivite / denetim logları — kullanıcı görmez; yalnızca admin dashboard + mutabakat için.
    -- action: 'auth.login' | 'auth.register' | 'plan.purchase' | 'credit.topup' | 'admin.plan_change' vb.
    -- detail: JSON metin. user_id NULL olabilir (sistem olayları, ör. zincir tahsilatı).
    CREATE TABLE IF NOT EXISTS activity_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action     TEXT NOT NULL,
      detail     TEXT,
      ip         TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Şifre sıfırlama & e-posta doğrulama token'ları — ham token DB'de TUTULMAZ (sha256 hash).
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind       TEXT NOT NULL,                       -- 'password_reset' | 'email_verify'
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_profiles_username    ON profiles(username);
    CREATE INDEX IF NOT EXISTS idx_profiles_user        ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_links_profile_order  ON links(profile_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_analytics_profile    ON analytics(profile_id, click_time);
    CREATE INDEX IF NOT EXISTS idx_analytics_link       ON analytics(link_id);
    CREATE INDEX IF NOT EXISTS idx_btags_profile        ON btags(profile_id);
    CREATE INDEX IF NOT EXISTS idx_users_parent         ON users(parent_user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_user        ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_balance_txns_user    ON balance_txns(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_logs_created         ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_logs_action          ON activity_logs(action);
    CREATE INDEX IF NOT EXISTS idx_logs_user            ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash     ON auth_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_user     ON auth_tokens(user_id, kind);

    -- Admin panelinden manuel tetiklenen sistem testleri (in-house test runner).
    -- Her satır bir çalıştırma sonucu; en yeni satır UI'da "son durum" olarak gösterilir.
    CREATE TABLE IF NOT EXISTS test_runs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id       TEXT NOT NULL,                              -- registry test id (auth.register vs)
      status        TEXT NOT NULL CHECK (status IN ('running','passed','failed','error')),
      ok            INTEGER NOT NULL DEFAULT 0,                 -- 1 = geçti; 'running'da 0
      summary       TEXT,                                       -- kısa özet (başarısızlıkta hata mesajı)
      details_json  TEXT,                                       -- {logs: [...], error?: str, elapsed_ms}
      triggered_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
      started_at    TEXT NOT NULL DEFAULT (datetime('now')),
      finished_at   TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_test_runs_test    ON test_runs(test_id, id DESC);
    CREATE INDEX IF NOT EXISTS idx_test_runs_status  ON test_runs(status);

    -- Özel alan adı (branded domain) — yalnız Pro Plus. Kullanıcının kendi satın aldığı domain
    -- doğrulanıp aktifleşince o domain'in kökü hedef profili sunar (bkz. middleware/resolveHost.js).
    CREATE TABLE IF NOT EXISTS custom_domains (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      domain            TEXT UNIQUE NOT NULL,                 -- normalize: lowercase, şema/nokta yok
      target_profile_id INTEGER REFERENCES profiles(id) ON DELETE SET NULL, -- kök '/' buraya
      status            TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','verifying','active','error')),
      verify_method     TEXT,                                 -- 'dns_a' | 'dns_cname' | 'txt'
      verify_token      TEXT,                                 -- opsiyonel TXT sahiplik token'ı
      last_error        TEXT,
      verified_at       TEXT,
      last_checked_at   TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_custom_domains_user   ON custom_domains(user_id);
    CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
  `);

  // Sürüm yükseltmeleri — mevcut veritabanına eksik sütunları ekle (idempotent)
  ensureColumn('users', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn('users', 'can_edit_profile', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn('users', 'credits_micro', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('users', 'plan_expires_at', 'TEXT');
  ensureColumn('users', 'extra_subaccount_packs', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('analytics', 'btag', 'TEXT'); // tıklamayı sürükleyen BTAG kaynağı
  ensureColumn('analytics', 'visitor', 'TEXT'); // birinci-taraf ziyaretçi kimliği (tekil sayım)
  ensureColumn('analytics', 'browser', 'TEXT'); // UA'dan tarayıcı (Chrome/Safari…)
  ensureColumn('analytics', 'os', 'TEXT');      // UA'dan işletim sistemi (iOS/Android mobil dahil)
  ensureColumn('links', 'btag', 'TEXT');     // linke gömülü BTAG (two-hop)
  ensureColumn('users', 'is_admin', 'INTEGER NOT NULL DEFAULT 0'); // admin dashboard yetkisi
  ensureColumn('users', 'totp_secret', 'TEXT');                    // 2FA gizli anahtarı (base32; asla dışa sızmaz)
  ensureColumn('users', 'totp_enabled', 'INTEGER NOT NULL DEFAULT 0'); // 2FA etkin mi
  ensureColumn('profiles', 'seo_settings_json', "TEXT NOT NULL DEFAULT '{}'"); // gelişmiş SEO (og görsel, keywords, canonical, robots, twitter, FB Pixel)
  ensureColumn('profiles', 'bio_html', 'TEXT'); // Pro zengin metin bio (sanitize edilmiş HTML; düz metin `bio`'da senkron tutulur)
  {
    // E-posta doğrulama (demo akış). İlk eklemede mevcut e-postalı hesapları doğrulanmış say
    // (yeni kayıtlar 0'dan başlar) → mevcut kullanıcılar gereksiz "doğrula" uyarısı görmez.
    const existed = db.prepare(`PRAGMA table_info(users)`).all().some((c) => c.name === 'email_verified');
    ensureColumn('users', 'email_verified', 'INTEGER NOT NULL DEFAULT 0');
    if (!existed) db.prepare(`UPDATE users SET email_verified = 1 WHERE email IS NOT NULL`).run();
  }
  ensureColumn('users', 'token_version', 'INTEGER NOT NULL DEFAULT 0'); // şifre değişince eski JWT'leri geçersiz kıl
  ensureColumn('auth_tokens', 'code_hash', 'TEXT'); // e-posta doğrulama 6 haneli kodu (peppered sha256; link token'ı ile aynı satırda)
  ensureColumn('users', 'is_suspended', 'INTEGER NOT NULL DEFAULT 0'); // alt hesap premium-kapısı: 1 iken giriş yapabilir ama işlem yapamaz (is_active'ten ayrı)
  ensureColumn('subaccount_packs', 'quantity', 'INTEGER NOT NULL DEFAULT 1'); // paket tekrar alınınca artar (UNIQUE korunur; totalRights = SUM(rights*quantity))
  db.exec(`CREATE INDEX IF NOT EXISTS idx_subaccount_packs_user ON subaccount_packs(user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_design_templates_user ON design_templates(user_id, id DESC);`);
  // GeoIP artık `geoip-lite` npm paketiyle (bundled MaxMind datası) çözülür → eski yerel aralık tablosu kaldırıldı.
  db.exec(`DROP TABLE IF EXISTS geoip_ranges;`);
  ensureColumn('users', 'deferred_plan', 'TEXT');       // yükseltmede saklanan alt plan (yüksek plan bitince devam eder)
  ensureColumn('users', 'deferred_expires_at', 'TEXT'); // saklanan alt planın (mutlak) bitiş zamanı — yüksek planın süresi kadar ileri itilmiştir
  ensureColumn('custom_domains', 'kind', "TEXT NOT NULL DEFAULT 'apex'"); // 'apex' | 'subdomain' — talimat/doğrulama tipini belirler (kullanıcı panelden seçer); mevcut satırlar apex
  db.exec(`CREATE INDEX IF NOT EXISTS idx_analytics_btag ON analytics(profile_id, btag);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics(profile_id, visitor, click_time);`); // dedup + tekil sayım lookup'ı

  relaxPlanCheck();    // eski CHECK(plan IN ('starter','pro')) → kaldır + starter→free
  seedAdmins();        // config.adminEmails → is_admin = 1 (idempotent, her açılışta)
  backfillUaFields();  // eski analytics satırlarında user_agent'tan browser/os çıkar (tek sefer)
}

/**
 * Geçmiş analytics satırlarında browser/os boşsa, saklı user_agent'tan çıkarır.
 * `browser IS NULL` filtresi → ilk çalıştırmadan sonra 0 satır (idempotent, ucuz).
 */
function backfillUaFields() {
  const rows = db
    .prepare(`SELECT id, user_agent FROM analytics WHERE browser IS NULL AND user_agent IS NOT NULL AND user_agent <> ''`)
    .all();
  if (!rows.length) return;
  const upd = db.prepare(`UPDATE analytics SET browser = ?, os = ? WHERE id = ?`);
  db.transaction(() => {
    for (const r of rows) upd.run(parseBrowser(r.user_agent), parseOs(r.user_agent), r.id);
  })();
}

/**
 * Yapılandırılmış admin e-postalarına is_admin yetkisi verir (idempotent).
 * admin@example.com varsayılan admindir. Kullanıcı sonradan kaydolsa bile,
 * sunucu her açılışta bu eşleşmeyi tekrar uygular. requireAdmin ayrıca e-posta
 * allowlist'ine de bakar → son açılıştan sonra kaydolan admin bile erişebilir.
 */
function seedAdmins() {
  const emails = (config.adminEmails || []).map((e) => e.toLowerCase()).filter(Boolean);
  if (!emails.length) return;
  const placeholders = emails.map(() => '?').join(',');
  db.prepare(`UPDATE users SET is_admin = 1 WHERE lower(email) IN (${placeholders})`).run(...emails);
}

/**
 * Eski users tablosundaki plan CHECK kısıtı yalnızca 'starter'/'pro' kabul ediyordu.
 * Yeni planlar (free/basic/pro) için CHECK'i kaldırmak gerekir — SQLite CHECK'i ALTER
 * ile değiştiremez, tabloyu yeniden inşa ederiz (guarded + idempotent, tek sefer çalışır).
 */
function relaxPlanCheck() {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='users'`).get();
  if (!row || !/'starter'/.test(row.sql)) return; // zaten yeni şema

  const tx = db.transaction(() => {
    db.exec(`
      CREATE TABLE users_new (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        email          TEXT UNIQUE,
        username       TEXT UNIQUE,
        password_hash  TEXT NOT NULL,
        role           TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','sub')),
        plan           TEXT NOT NULL DEFAULT 'free',
        credits_micro          INTEGER NOT NULL DEFAULT 0,
        plan_expires_at        TEXT,
        extra_subaccount_packs INTEGER NOT NULL DEFAULT 0,
        is_active        INTEGER NOT NULL DEFAULT 1,
        can_edit_profile INTEGER NOT NULL DEFAULT 1,
        parent_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at     TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO users_new (id, email, username, password_hash, role, plan,
        credits_micro, plan_expires_at, extra_subaccount_packs, is_active, can_edit_profile,
        parent_user_id, created_at, updated_at)
      SELECT id, email, username, password_hash, role,
        CASE plan WHEN 'pro' THEN 'pro' ELSE 'free' END,
        COALESCE(credits_micro, 0), plan_expires_at, COALESCE(extra_subaccount_packs, 0),
        is_active, can_edit_profile, parent_user_id, created_at, updated_at
      FROM users;
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
      CREATE INDEX IF NOT EXISTS idx_users_parent ON users(parent_user_id);
    `);
  });

  db.pragma('foreign_keys = OFF');
  try {
    tx();
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

function ensureColumn(table, column, definition) {
  const exists = db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

// CLI olarak çalıştırıldıysa
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
  console.log('✓ Migration tamamlandı (tablolar hazır).');
  process.exit(0);
}
