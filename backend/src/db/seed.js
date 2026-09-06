import db from './connection.js';
import { migrate } from './migrate.js';
import { hashPassword } from '../utils/hash.js';

async function seed() {
  migrate();

  // Temiz başlangıç
  db.exec('DELETE FROM balance_txns; DELETE FROM payments; DELETE FROM analytics; DELETE FROM btags; DELETE FROM links; DELETE FROM profiles; DELETE FROM users;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','profiles','links','analytics','btags','payments','balance_txns');");

  const pw = await hashPassword('Passw0rd!');

  // Ana hesap (owner) — Pro plan (30 gün) + başlangıç bakiyesi 25 USDT
  const owner = db
    .prepare(
      `INSERT INTO users (email, password_hash, role, plan, credits_micro, plan_expires_at)
       VALUES (?, ?, 'owner', 'pro', ?, datetime('now', '+30 days'))`
    )
    .run('demo@beylink.com', pw, 25_000_000);
  const ownerId = owner.lastInsertRowid;

  // Örnek bakiye hareketi (yüklenen bakiye defter kaydı)
  db.prepare(
    `INSERT INTO balance_txns (user_id, amount_micro, reason, ref, balance_after_micro)
     VALUES (?, ?, 'topup:seed', 'BL-SEED-000001', ?)`
  ).run(ownerId, 25_000_000, 25_000_000);

  const theme = {
    template: 'wave',
    background: 'gradient',
    colors: { primary: '#6D3BEA', accent: '#12C4B0' },
    buttonStyle: 'rounded',
    header_type: 'avatar',
    title_align: 'center',
    layout: 'single',
    header_icons: ['qr', 'share'],
  };

  const profile = db
    .prepare(
      `INSERT INTO profiles (user_id, username, display_name, bio, theme_settings_json, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      ownerId,
      'demo',
      'Demo Bey',
      'Merhaba! Tüm bağlantılarım burada. 🌊',
      JSON.stringify(theme),
      'Demo Bey — BeyLink',
      'Demo Bey profilindeki tüm bağlantılar tek yerde.'
    );
  const profileId = profile.lastInsertRowid;

  const links = [
    { type: 'social', title: 'Instagram', url: 'https://instagram.com/beylink', icon_name: 'instagram' },
    { type: 'social', title: 'X (Twitter)', url: 'https://x.com/beylink', icon_name: 'twitter' },
    { type: 'social', title: 'YouTube', url: 'https://youtube.com/@beylink', icon_name: 'youtube' },
    { type: 'divider', title: 'Projelerim', url: null, icon_name: null },
    { type: 'link', title: 'Kişisel Web Sitem', url: 'https://beylink.com', icon_name: 'globe' },
    { type: 'link', title: 'Blog Yazılarım', url: 'https://beylink.com/blog', icon_name: 'book-open' },
    {
      type: 'contact', title: 'İletişim Bilgilerim', url: null, icon_name: null,
      config: {
        firstName: 'Demo', lastName: 'Bey', role: 'İçerik Üreticisi', company: 'BeyLink',
        phone: '+90 500 000 00 00', email: 'demo@beylink.com', website: 'https://beylink.com',
        address: { country: 'Türkiye', city: 'İstanbul' }, hours: '09:00 - 18:00',
      },
    },
  ];

  const insertLink = db.prepare(
    `INSERT INTO links (profile_id, type, title, url, icon_name, config_json, sort_order, btag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  links.forEach((l, i) => insertLink.run(profileId, l.type, l.title, l.url ?? null, l.icon_name ?? null, JSON.stringify(l.config || {}), i, l.btag ?? null));

  // Kayıtlı BTAG'ler (isimli) — TAG istatistiği / two-hop demosu için
  const insertBtag = db.prepare(`INSERT INTO btags (profile_id, value, label) VALUES (?, ?, ?)`);
  insertBtag.run(profileId, 'insta', 'Instagram Kampanyası');
  insertBtag.run(profileId, 'yt', 'YouTube Bio');
  insertBtag.run(profileId, 'news', 'Bülten');
  // "Kişisel Web Sitem" linkine gömülü BTAG (btag'siz tıklamada two-hop devreye girer)
  db.prepare(`UPDATE links SET btag = 'insta' WHERE profile_id = ? AND url = 'https://beylink.com'`).run(profileId);

  // Alt hesap (sub)
  const sub = db
    .prepare(
      `INSERT INTO users (username, password_hash, role, plan, parent_user_id)
       VALUES (?, ?, 'sub', 'free', ?)`
    )
    .run('demo-sub', pw, ownerId);
  const subId = sub.lastInsertRowid;

  const subProfile = db
    .prepare(
      `INSERT INTO profiles (user_id, username, display_name, bio, theme_settings_json)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(subId, 'demo-sub', 'Alt Hesap', 'Owner tarafından yönetilen alt profil.', JSON.stringify(theme));
  const subProfileId = subProfile.lastInsertRowid;
  insertLink.run(subProfileId, 'link', 'Örnek Bağlantı', 'https://example.com', 'link', '{}', 0, null);

  // Örnek analitik (son 14 gün) — bazı olaylara BTAG bağlanır (kayıtlı + keşfedilen)
  const insertA = db.prepare(
    `INSERT INTO analytics (profile_id, link_id, event_type, device, os, browser, country, referrer, btag, visitor, click_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
  );
  // NOT: country NULL — geoip henüz yok → gerçek trafik gibi "Bilinmiyor" (sahte ülke verisi yanıltmasın).
  // Gerçekçi cihaz/OS/tarayıcı üçlüleri (mobil, masaüstü, tablet karışık)
  const clients = [
    { device: 'mobile', os: 'iOS', browser: 'Safari' },
    { device: 'mobile', os: 'Android', browser: 'Chrome' },
    { device: 'desktop', os: 'Windows', browser: 'Chrome' },
    { device: 'desktop', os: 'macOS', browser: 'Safari' },
    { device: 'desktop', os: 'Windows', browser: 'Edge' },
    { device: 'tablet', os: 'iOS', browser: 'Safari' },
    { device: 'mobile', os: 'Android', browser: 'Samsung Internet' },
    { device: 'desktop', os: 'Linux', browser: 'Firefox' },
  ];
  // Tekil ziyaretçi havuzu — dedup gerçeğine uygun (gün içinde her ziyaretçi 1 görüntüleme).
  const visitors = Array.from({ length: 14 }, (_, i) => `seed-visitor-${i.toString().padStart(2, '0')}`);
  // Kayıtlı 'insta'/'yt'/'news' + kayıtsız 'partner_x'/'tiktok_ads' (keşfedilen) + btag'siz
  const btagPool = ['insta', 'yt', 'news', 'partner_x', 'tiktok_ads', null, null];
  const linkRows = db.prepare(`SELECT id FROM links WHERE profile_id = ? AND type != 'divider'`).all(profileId);
  for (let d = 0; d < 14; d++) {
    const offset = `-${d} days`;
    const views = 6 + (d % 7); // 6-12 tekil ziyaretçi/gün (havuz 14 → gün içi çakışma yok)
    for (let v = 0; v < views; v++) {
      const bt = v % 3 === 0 ? btagPool[(d + v) % btagPool.length] : null;
      const cl = clients[(d + v) % clients.length];
      insertA.run(profileId, null, 'view', cl.device, cl.os, cl.browser, null, v % 2 ? 'instagram.com' : '', bt, visitors[v], offset);
    }
    const clicks = 2 + (d % 8);
    for (let c = 0; c < clicks; c++) {
      const link = linkRows[c % linkRows.length];
      const bt = btagPool[(d + c) % btagPool.length];
      const cl = clients[(d + c + 3) % clients.length];
      insertA.run(profileId, link.id, 'click', cl.device, cl.os, cl.browser, null, c % 2 ? 'google.com' : '', bt, visitors[c], offset);
    }
  }

  console.log('✓ Seed tamamlandı.');
  console.log('  Owner    : demo@beylink.com / Passw0rd!');
  console.log('  Alt hesap: demo-sub / Passw0rd!');
  console.log('  Public   : /demo');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed hatası:', err);
    process.exit(1);
  });
