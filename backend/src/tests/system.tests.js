// Sistem / Bütünlük teşhis testleri — DAVRANIŞ değil, SAĞLIK denetler.
// Amaç: sunucu, DB veya veri katmanında bir bozukluk varsa bunu kırmızı olarak yüzeye çıkarmak.
// Bu testler GERÇEK (canlı) veriyi SALT-OKUNUR denetler — massskaa/demo/gerçek satırlara dokunmaz.
// (Tek istisna: api-db-roundtrip geçici bir bltest_z_ kullanıcı yaratır, finally'de temizlenir;
//  db-writable transaction'ı rollback eder → hiçbir şey kalıcı olmaz.)
import db from '../db/connection.js';
import { config } from '../config/env.js';
import { planTier, PLANS } from '../config/plans.js';
import { FREE_TEMPLATE_KEYS } from '../config/themes.js';
import { TESTS, CATEGORIES } from './registry.js';
import { apiFetch, createTestOwner, tokenFor } from './helpers.js';

// Migrate'in oluşturması BEKLENEN tablolar (drift dedektörü).
const EXPECTED_TABLES = [
  'users', 'profiles', 'links', 'analytics', 'btags', 'payments',
  'balance_txns', 'activity_logs', 'auth_tokens', 'test_runs',
];

// ensureColumn ile eklenen KRİTİK kolonlar — bir migrasyon çalışmadıysa yakalar.
const EXPECTED_COLUMNS = {
  users: ['credits_micro', 'plan_expires_at', 'extra_subaccount_packs', 'is_active', 'can_edit_profile',
    'is_admin', 'totp_secret', 'totp_enabled', 'email_verified', 'token_version'],
  profiles: ['seo_settings_json', 'bio_html', 'is_published'],
  links: ['btag', 'config_json', 'sort_order'],
  analytics: ['btag', 'visitor', 'browser', 'os'],
  test_runs: ['status', 'ok', 'details_json', 'triggered_by'],
};

// Var olması beklenen kritik index'ler (sorgu performansı + tekil sayım lookup'ları).
const EXPECTED_INDEXES = [
  'idx_profiles_username', 'idx_links_profile_order', 'idx_analytics_profile',
  'idx_analytics_visitor', 'idx_test_runs_test',
];

function tableColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
}

export const systemTests = [
  {
    id: 'system.db-integrity-check',
    name: 'SQLite bütünlük denetimi (PRAGMA integrity_check)',
    category: 'Sistem',
    description: 'DB dosyasında sayfa/indeks bozulması var mı? SQLite\'ın kendi denetimi "ok" dönmeli.',
    run: async (ctx) => {
      const rows = db.pragma('integrity_check');
      ctx.log(`integrity_check → ${JSON.stringify(rows)}`);
      ctx.assert(rows.length === 1 && rows[0].integrity_check === 'ok', `bozulma tespit edildi: ${JSON.stringify(rows)}`);
    },
  },
  {
    id: 'system.db-foreign-key-check',
    name: 'Yetim foreign key yok (PRAGMA foreign_key_check)',
    category: 'Sistem',
    description: 'Var olmayan bir satıra işaret eden FK (bozuk ilişki) var mı? Boş dönmeli.',
    run: async (ctx) => {
      const violations = db.pragma('foreign_key_check');
      ctx.log(`foreign_key_check → ${violations.length} ihlal`);
      ctx.equal(violations.length, 0, `FK ihlalleri: ${JSON.stringify(violations.slice(0, 5))}`);
    },
  },
  {
    id: 'system.db-runtime-pragmas',
    name: 'Çalışma zamanı PRAGMA\'ları doğru (WAL + foreign_keys)',
    category: 'Sistem',
    description: 'Bağlantıda foreign_keys=ON ve journal_mode=WAL aktif olmalı (aksi halde FK enforce edilmez).',
    run: async (ctx) => {
      const fk = db.pragma('foreign_keys', { simple: true });
      const jm = db.pragma('journal_mode', { simple: true });
      ctx.equal(Number(fk), 1, 'foreign_keys ON olmalı');
      ctx.equal(String(jm).toLowerCase(), 'wal', 'journal_mode WAL olmalı');
    },
  },
  {
    id: 'system.schema-tables-present',
    name: 'Beklenen tüm tablolar mevcut',
    category: 'Sistem',
    description: 'Migrasyon eksik çalıştıysa tablo eksikliği burada görünür.',
    run: async (ctx) => {
      const existing = new Set(db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map((r) => r.name));
      const missing = EXPECTED_TABLES.filter((t) => !existing.has(t));
      ctx.equal(missing.length, 0, `eksik tablolar: ${missing.join(', ')}`);
    },
  },
  {
    id: 'system.schema-columns-present',
    name: 'Kritik kolonlar mevcut (şema kayması yok)',
    category: 'Sistem',
    description: 'ensureColumn ile eklenen kolonlardan biri eksikse (yarım migrasyon) yakalar.',
    run: async (ctx) => {
      const problems = [];
      for (const [table, cols] of Object.entries(EXPECTED_COLUMNS)) {
        const have = new Set(tableColumns(table));
        for (const c of cols) if (!have.has(c)) problems.push(`${table}.${c}`);
      }
      ctx.equal(problems.length, 0, `eksik kolonlar: ${problems.join(', ')}`);
    },
  },
  {
    id: 'system.schema-indexes-present',
    name: 'Kritik index\'ler mevcut',
    category: 'Sistem',
    description: 'Performans + tekil sayım index\'lerinden biri düşerse (drop/eksik migrasyon) yakalar.',
    run: async (ctx) => {
      const existing = new Set(db.prepare(`SELECT name FROM sqlite_master WHERE type='index'`).all().map((r) => r.name));
      const missing = EXPECTED_INDEXES.filter((i) => !existing.has(i));
      ctx.equal(missing.length, 0, `eksik index'ler: ${missing.join(', ')}`);
    },
  },
  {
    id: 'system.no-orphan-rows',
    name: 'Yetim satır yok (profil/link/analitik/btag/ledger/ödeme)',
    category: 'Sistem',
    description: 'Bir üst-kayıt silinmişken çocuk kalmışsa (CASCADE bozulması / manuel müdahale) yakalar.',
    run: async (ctx) => {
      const checks = [
        ['profiles', `SELECT COUNT(*) c FROM profiles p WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)`],
        ['links', `SELECT COUNT(*) c FROM links l WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = l.profile_id)`],
        ['analytics', `SELECT COUNT(*) c FROM analytics a WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = a.profile_id)`],
        ['btags', `SELECT COUNT(*) c FROM btags b WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = b.profile_id)`],
        ['balance_txns', `SELECT COUNT(*) c FROM balance_txns t WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = t.user_id)`],
        ['payments', `SELECT COUNT(*) c FROM payments pm WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = pm.user_id)`],
      ];
      const orphans = [];
      for (const [label, sql] of checks) {
        const c = db.prepare(sql).get().c;
        if (c > 0) orphans.push(`${label}: ${c}`);
      }
      ctx.equal(orphans.length, 0, `yetim satırlar → ${orphans.join(', ')}`);
    },
  },
  {
    id: 'system.wallet-ledger-consistency',
    name: 'Cüzdan defteri tutarlı (bakiye = son ledger + adım-adım)',
    category: 'Sistem',
    description: 'Her kullanıcının credits_micro son ledger satırıyla eşit; ledger adımları toplamı doğru; negatif bakiye yok. Para izinde bozulma yakalar.',
    run: async (ctx) => {
      // (a) Negatif bakiye asla olmamalı
      const neg = db.prepare(`SELECT COUNT(*) c FROM users WHERE credits_micro < 0`).get().c;
      ctx.equal(neg, 0, 'negatif bakiyeli kullanıcı olmamalı');

      // (b) Adım-adım: ardışık ledger satırlarında balance_after[i] = balance_after[i-1] + amount[i]
      // (c) credits_micro = son ledger balance_after (ledger'ı olan kullanıcılar için)
      const userIds = db.prepare(`SELECT DISTINCT user_id FROM balance_txns`).all().map((r) => r.user_id);
      const stepBad = [];
      const tailBad = [];
      for (const uid of userIds) {
        const rows = db.prepare(`SELECT id, amount_micro, balance_after_micro FROM balance_txns WHERE user_id = ? ORDER BY id ASC`).all(uid);
        for (let i = 1; i < rows.length; i++) {
          if (rows[i].balance_after_micro !== rows[i - 1].balance_after_micro + rows[i].amount_micro) {
            stepBad.push(`user ${uid} satır ${rows[i].id}`);
          }
        }
        const last = rows[rows.length - 1];
        const u = db.prepare(`SELECT credits_micro FROM users WHERE id = ?`).get(uid);
        if (u && last && u.credits_micro !== last.balance_after_micro) {
          tailBad.push(`user ${uid}: bakiye ${u.credits_micro} ≠ son ledger ${last.balance_after_micro}`);
        }
      }
      ctx.equal(stepBad.length, 0, `ledger adım tutarsızlığı → ${stepBad.slice(0, 5).join('; ')}`);
      ctx.equal(tailBad.length, 0, `bakiye/ledger uyuşmazlığı → ${tailBad.slice(0, 5).join('; ')}`);
    },
  },
  {
    id: 'system.preset-theme-gating-config',
    name: 'Hazır tema gating yapılandırması tutarlı',
    category: 'Sistem',
    description: 'presetThemes cap free=false, basic/pro=true; serbest şablon allowlist dolu ve iş-koluna özel preset içermez.',
    run: async (ctx) => {
      ctx.equal(PLANS.free.presetThemes, false, 'Free presetThemes false');
      ctx.equal(PLANS.basic.presetThemes, true, 'Basic presetThemes true');
      ctx.equal(PLANS.pro.presetThemes, true, 'Pro presetThemes true');
      ctx.assert(FREE_TEMPLATE_KEYS.size >= 8, `serbest şablon allowlist dolu (got ${FREE_TEMPLATE_KEYS.size})`);
      // Bilinen iş-koluna özel presetler ASLA serbest allowlist'te olmamalı (yoksa gate atlanır)
      for (const k of ['corporate', 'legal', 'finance', 'medical', 'realestate']) {
        ctx.assert(!FREE_TEMPLATE_KEYS.has(k), `preset '${k}' serbest allowlist'te OLMAMALI`);
      }
    },
  },
  {
    id: 'system.deferred-plan-consistency',
    name: 'Saklanan (deferred) plan durumu tutarlı',
    category: 'Sistem',
    description: 'deferred_plan set olan kullanıcılarda: alt plan geçerli + üst plandan düşük tier + deferred bitişi üst planın bitişinden sonra olmalı.',
    run: async (ctx) => {
      const rows = db.prepare(
        `SELECT id, plan, plan_expires_at, deferred_plan, deferred_expires_at FROM users
           WHERE deferred_plan IS NOT NULL`,
      ).all();
      const bad = [];
      for (const u of rows) {
        // deferred_plan geçerli bir ücretli plan olmalı (free saklanmaz)
        if (u.deferred_plan === 'free' || planTier(u.deferred_plan) === 0) { bad.push(`user ${u.id}: deferred '${u.deferred_plan}' geçersiz`); continue; }
        // alt plan üst plandan DÜŞÜK tier olmalı (stacking yönü)
        if (planTier(u.deferred_plan) >= planTier(u.plan)) { bad.push(`user ${u.id}: deferred tier(${u.deferred_plan}) >= plan tier(${u.plan})`); continue; }
        // deferred bitişi olmalı ve üst planın bitişinden SONRA olmalı (alt plan üstte)
        if (!u.deferred_expires_at) { bad.push(`user ${u.id}: deferred_expires_at boş`); continue; }
        if (u.plan_expires_at && u.deferred_expires_at <= u.plan_expires_at) {
          bad.push(`user ${u.id}: deferred bitiş üst plan bitişinden önce`);
        }
      }
      ctx.equal(bad.length, 0, `tutarsız deferred → ${bad.slice(0, 5).join('; ')}`);
    },
  },
  {
    id: 'system.no-duplicate-identities',
    name: 'Mükerrer kimlik yok (e-posta CI / kullanıcı adı / profil slug)',
    category: 'Sistem',
    description: 'Büyük/küçük harf duyarsız e-posta çifti veya aynı username/slug → giriş/yetki karışması riski.',
    run: async (ctx) => {
      const dupEmail = db.prepare(`SELECT lower(email) e, COUNT(*) c FROM users WHERE email IS NOT NULL GROUP BY lower(email) HAVING c > 1`).all();
      const dupUname = db.prepare(`SELECT username u, COUNT(*) c FROM users WHERE username IS NOT NULL GROUP BY username HAVING c > 1`).all();
      const dupSlug = db.prepare(`SELECT lower(username) s, COUNT(*) c FROM profiles GROUP BY lower(username) HAVING c > 1`).all();
      ctx.equal(dupEmail.length, 0, `mükerrer e-posta: ${dupEmail.map((r) => r.e).join(', ')}`);
      ctx.equal(dupUname.length, 0, `mükerrer kullanıcı adı: ${dupUname.map((r) => r.u).join(', ')}`);
      ctx.equal(dupSlug.length, 0, `mükerrer profil slug: ${dupSlug.map((r) => r.s).join(', ')}`);
    },
  },
  {
    id: 'system.data-enums-valid',
    name: 'Enum alanları geçerli (plan / role / sub-parent)',
    category: 'Sistem',
    description: 'plan ∈ {free,basic,pro,proplus}; role ∈ {owner,sub}; her sub hesabın parent_user_id\'si dolu olmalı.',
    run: async (ctx) => {
      const badPlan = db.prepare(`SELECT COUNT(*) c FROM users WHERE plan NOT IN ('free','basic','pro','proplus')`).get().c;
      const badRole = db.prepare(`SELECT COUNT(*) c FROM users WHERE role NOT IN ('owner','sub')`).get().c;
      const subNoParent = db.prepare(`SELECT COUNT(*) c FROM users WHERE role = 'sub' AND parent_user_id IS NULL`).get().c;
      ctx.equal(badPlan, 0, 'geçersiz plan değeri olan kullanıcı var');
      ctx.equal(badRole, 0, 'geçersiz role değeri olan kullanıcı var');
      ctx.equal(subNoParent, 0, 'parent_user_id olmayan alt hesap var');
    },
  },
  {
    id: 'system.admin-config-consistency',
    name: 'Admin yapılandırması tutarlı (config e-postaları is_admin=1)',
    category: 'Sistem',
    description: 'config.adminEmails içindeki kayıtlı bir kullanıcının is_admin bayrağı düşmüşse (yetki kaybı) yakalar.',
    run: async (ctx) => {
      const bad = [];
      for (const email of config.adminEmails) {
        const u = db.prepare(`SELECT is_admin FROM users WHERE lower(email) = lower(?)`).get(email);
        if (u && u.is_admin !== 1) bad.push(email); // yalnız KAYITLI admin e-postaları denetlenir
      }
      ctx.equal(bad.length, 0, `is_admin bayrağı düşmüş admin(ler): ${bad.join(', ')}`);
    },
  },
  {
    id: 'system.payments-idempotency-keys',
    name: 'Ödeme idempotency anahtarları tekil (txid / order_ref)',
    category: 'Sistem',
    description: 'Aynı txid iki kez işlenmiş (çift kredi) veya order_ref çakışması varsa yakalar.',
    run: async (ctx) => {
      const dupTxid = db.prepare(`SELECT txid, COUNT(*) c FROM payments WHERE txid IS NOT NULL GROUP BY txid HAVING c > 1`).all();
      const dupRef = db.prepare(`SELECT order_ref, COUNT(*) c FROM payments GROUP BY order_ref HAVING c > 1`).all();
      ctx.equal(dupTxid.length, 0, `mükerrer txid: ${dupTxid.map((r) => r.txid).join(', ')}`);
      ctx.equal(dupRef.length, 0, `mükerrer order_ref: ${dupRef.map((r) => r.order_ref).join(', ')}`);
    },
  },
  {
    id: 'system.health-endpoint',
    name: 'Sağlık ucu yanıt veriyor (GET /health)',
    category: 'Sistem',
    description: 'Sunucu ayakta ve HTTP isteğine yanıt veriyor mu? 200 + status:ok beklenir.',
    run: async (ctx) => {
      const res = await fetch(`http://127.0.0.1:${config.port}/health`);
      ctx.equal(res.status, 200, '/health 200 dönmeli');
      const body = await res.json();
      ctx.equal(body.status, 'ok', 'status ok olmalı');
    },
  },
  {
    id: 'system.api-db-roundtrip',
    name: 'API → DB tam tur (auth zinciri + okuma)',
    category: 'Sistem',
    description: 'Gerçek HTTP isteği tüm middleware + DB okumasından geçiyor mu? Token üret → GET /auth/me 200.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const r = await apiFetch('/auth/me', { token: tokenFor(u) });
      ctx.equal(r.status, 200, '/auth/me 200 dönmeli (sunucu+DB+auth zinciri sağlam)');
      ctx.equal(r.body?.user?.id, u.id, 'dönen kullanıcı doğru olmalı');
    },
  },
  {
    id: 'system.db-writable',
    name: 'DB yazılabilir (insert + rollback, kalıcı iz bırakmaz)',
    category: 'Sistem',
    description: 'Disk dolu / salt-okunur / kilitli mi? Bir satır yaz, transaction\'ı geri al — hiçbir şey kalıcı olmamalı.',
    run: async (ctx) => {
      let wroteInTx = false;
      try {
        db.transaction(() => {
          db.prepare(`INSERT INTO test_runs (test_id, status) VALUES ('__writecheck__', 'running')`).run();
          wroteInTx = true;
          throw new Error('rollback-sentinel'); // bilerek geri al
        })();
      } catch (e) {
        if (e.message !== 'rollback-sentinel') throw e; // gerçek yazma hatası → testi düşür
      }
      ctx.assert(wroteInTx, 'insert transaction içinde başarılı olmalıydı (DB yazılabilir)');
      const leftover = db.prepare(`SELECT COUNT(*) c FROM test_runs WHERE test_id = '__writecheck__'`).get().c;
      ctx.equal(leftover, 0, 'rollback sonrası kalıcı satır kalmamalı');
    },
  },
  {
    id: 'system.test-registry-valid',
    name: 'Test kataloğu tutarlı (tekil id + geçerli alanlar)',
    category: 'Sistem',
    description: 'Testlerin kendisinde çakışan id, eksik alan veya tanımsız kategori varsa yakalar (test paketini korur).',
    run: async (ctx) => {
      const ids = new Set();
      const dupes = [];
      const badFields = [];
      const badCat = [];
      const cats = new Set(CATEGORIES);
      for (const t of TESTS) {
        if (ids.has(t.id)) dupes.push(t.id); else ids.add(t.id);
        if (!t.id || !t.name || !t.category || typeof t.run !== 'function') badFields.push(t.id || '(id yok)');
        if (t.category && !cats.has(t.category)) badCat.push(`${t.id}:${t.category}`);
      }
      ctx.equal(dupes.length, 0, `çakışan test id: ${dupes.join(', ')}`);
      ctx.equal(badFields.length, 0, `eksik alanlı test: ${badFields.join(', ')}`);
      ctx.equal(badCat.length, 0, `CATEGORIES'te olmayan kategori: ${badCat.join(', ')}`);
      ctx.assert(TESTS.length > 0, 'en az bir test kayıtlı olmalı');
    },
  },
];
