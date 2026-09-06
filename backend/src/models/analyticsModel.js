import db from '../db/connection.js';

export const analyticsModel = {
  record({ profileId, linkId = null, eventType = 'click', device = null, country = null, referrer = null, userAgent = null, browser = null, os = null, btag = null, visitor = null }) {
    return db
      .prepare(
        `INSERT INTO analytics (profile_id, link_id, event_type, device, country, referrer, user_agent, browser, os, btag, visitor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(profileId, linkId, eventType, device, country, referrer, userAgent, browser || null, os || null, btag || null, visitor || null);
  },

  // Anti-fraud dedup — aynı ziyaretçinin aynı GÜN tekrarını kaynakta TEK sayar (satır hiç eklenmez):
  //   view  → (profil, visitor, gün) başına 1  → aynı kişi aynı gün 5× girse görüntülenme 1 kalır
  //   click → (profil, visitor, link, BTAG, gün) başına 1  → aynı linke aynı gün AYNI banner'la tekrar
  //           tıklama şişirmez; FARKLI banner (btag) atıfı korunur (iki kampanya karşılaştırması doğru).
  // Farklı GÜN = ayrı sayılır. visitor DAİMA doludur (istemci id'si ya da IP-hash yedeği).
  // deduped:true → satır eklenmedi. (better-sqlite3 senkron → SELECT+INSERT tek istekte atomik, yarış yok.)
  recordDedup(payload) {
    const { profileId, eventType = 'click', visitor, linkId = null, btag = null } = payload;
    if (!visitor) { this.record(payload); return { deduped: false }; }

    let exists;
    if (eventType === 'view') {
      exists = db
        .prepare(
          `SELECT 1 FROM analytics
           WHERE profile_id = ? AND event_type = 'view' AND visitor = ? AND date(click_time) = date('now')
           LIMIT 1`
        )
        .get(profileId, visitor);
    } else {
      const linkCond = linkId == null ? 'link_id IS NULL' : 'link_id = ?';
      const btagCond = btag == null ? 'btag IS NULL' : 'btag = ?';
      const args = [profileId, visitor];
      if (linkId != null) args.push(linkId);
      if (btag != null) args.push(btag);
      exists = db
        .prepare(
          `SELECT 1 FROM analytics
           WHERE profile_id = ? AND event_type = 'click' AND visitor = ? AND ${linkCond} AND ${btagCond} AND date(click_time) = date('now')
           LIMIT 1`
        )
        .get(...args);
    }
    if (exists) return { deduped: true };
    this.record(payload);
    return { deduped: false };
  },

  // Belirli tarih aralığı için (ISO tarih string'i). bucket: 'hour' | 'day'
  summary(profileId, sinceIso, bucket = 'day') {
    const since = sinceIso || '1970-01-01';
    const bucketExpr = bucket === 'hour' ? "strftime('%Y-%m-%d %H:00', click_time)" : 'date(click_time)';

    const totals = db
      .prepare(
        `SELECT
           SUM(CASE WHEN event_type = 'view'  THEN 1 ELSE 0 END) AS views,
           SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) AS clicks
         FROM analytics
         WHERE profile_id = ? AND click_time >= ?`
      )
      .get(profileId, since);

    const views = totals.views || 0;
    const clicks = totals.clicks || 0;

    // Gerçek tekil ziyaretçi: aynı tarayıcı (visitor) tekrar görüntülemeleri tek sayılır.
    // visitor'ı olmayan eski satırlar tekilleştirilemez → her biri satır id'siyle tek sayılır
    // (eski davranışa denk; "0 tekil" yanılgısını önler). Yeni ziyaretler visitor ile gerçek tekil.
    const uniqueRow = db
      .prepare(
        `SELECT COUNT(DISTINCT COALESCE(visitor, 'v' || id)) AS n
         FROM analytics
         WHERE profile_id = ? AND event_type = 'view' AND click_time >= ?`
      )
      .get(profileId, since);
    const uniqueVisitors = uniqueRow.n || 0;

    const byDevice = db
      .prepare(
        `SELECT COALESCE(device, 'unknown') AS device, COUNT(*) AS count
         FROM analytics
         WHERE profile_id = ? AND click_time >= ?
         GROUP BY device ORDER BY count DESC`
      )
      .all(profileId, since);

    const byReferrer = db
      .prepare(
        `SELECT COALESCE(NULLIF(referrer, ''), 'direct') AS referrer, COUNT(*) AS count
         FROM analytics
         WHERE profile_id = ? AND click_time >= ?
         GROUP BY COALESCE(NULLIF(referrer, ''), 'direct') ORDER BY count DESC LIMIT 10`
      )
      .all(profileId, since);

    const byCountry = db
      .prepare(
        `SELECT COALESCE(country, 'unknown') AS country, COUNT(*) AS count
         FROM analytics
         WHERE profile_id = ? AND click_time >= ?
         GROUP BY country ORDER BY count DESC LIMIT 10`
      )
      .all(profileId, since);

    const byBrowser = db
      .prepare(
        `SELECT COALESCE(NULLIF(browser, ''), 'Bilinmiyor') AS browser, COUNT(*) AS count
         FROM analytics
         WHERE profile_id = ? AND click_time >= ?
         GROUP BY COALESCE(NULLIF(browser, ''), 'Bilinmiyor') ORDER BY count DESC LIMIT 10`
      )
      .all(profileId, since);

    const byOs = db
      .prepare(
        `SELECT COALESCE(NULLIF(os, ''), 'Bilinmiyor') AS os, COUNT(*) AS count
         FROM analytics
         WHERE profile_id = ? AND click_time >= ?
         GROUP BY COALESCE(NULLIF(os, ''), 'Bilinmiyor') ORDER BY count DESC LIMIT 10`
      )
      .all(profileId, since);

    const timeseries = db
      .prepare(
        `SELECT ${bucketExpr} AS day,
                SUM(CASE WHEN event_type = 'view'  THEN 1 ELSE 0 END) AS views,
                SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) AS clicks
         FROM analytics
         WHERE profile_id = ? AND click_time >= ?
         GROUP BY day ORDER BY day ASC`
      )
      .all(profileId, since);

    const topLinks = db
      .prepare(
        `SELECT l.id, l.title, l.url, l.icon_name, COUNT(a.id) AS clicks
         FROM analytics a
         JOIN links l ON l.id = a.link_id
         WHERE a.profile_id = ? AND a.event_type = 'click' AND a.click_time >= ?
         GROUP BY l.id ORDER BY clicks DESC LIMIT 10`
      )
      .all(profileId, since);

    return {
      totals: {
        views,
        clicks,
        unique_visitors: uniqueVisitors, // COUNT(DISTINCT visitor) — gerçek tekil ziyaretçi
        ctr: views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0, // %
      },
      timeseries,
      top_links: topLinks,
      by_device: byDevice,
      by_referrer: byReferrer,
      by_country: byCountry,
      by_browser: byBrowser,
      by_os: byOs,
    };
  },

  // CSV dışa aktarma için ham olay satırları
  exportRows(profileId, sinceIso) {
    const since = sinceIso || '1970-01-01';
    return db
      .prepare(
        `SELECT a.click_time, a.event_type, l.title AS link_title, l.url AS url,
                a.device, a.browser, a.os, a.country, a.referrer
         FROM analytics a
         LEFT JOIN links l ON l.id = a.link_id
         WHERE a.profile_id = ? AND a.click_time >= ?
         ORDER BY a.click_time DESC`
      )
      .all(profileId, since);
  },
};
