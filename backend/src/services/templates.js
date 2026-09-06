// Hazır sayfa şablonu uygulama — blokları (linkler) DEĞİŞTİR + profil ad/bio/tema güncelle.
// Tümü TEK transaction: yarım uygulama olmaz (ya hepsi ya hiçbiri).
import db from '../db/connection.js';
import { profileModel } from '../models/profileModel.js';

/**
 * applyPageTemplate(profileId, { profilePatch, blocks })
 * - blocks: [{ type, title, url, iconName, config }] — SIRALI (index = sort_order)
 * - Mevcut TÜM bloklar silinir, yerine bunlar yazılır (replace modu).
 * - profilePatch: profileModel.update ile aynı alanlar (display_name, bio, bio_html, theme_settings).
 */
export function applyPageTemplate(profileId, { profilePatch = {}, blocks = [] }) {
  const del = db.prepare(`DELETE FROM links WHERE profile_id = ?`);
  const ins = db.prepare(
    `INSERT INTO links (profile_id, type, title, url, icon_name, config_json, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const tx = db.transaction(() => {
    del.run(profileId);
    blocks.forEach((b, i) =>
      ins.run(profileId, b.type, b.title ?? null, b.url ?? null, b.iconName ?? null, JSON.stringify(b.config || {}), i),
    );
    if (Object.keys(profilePatch).length) profileModel.update(profileId, profilePatch);
  });
  tx();
}
