import { Router } from 'express';
import { profileModel } from '../models/profileModel.js';
import { config } from '../config/env.js';

// SEO'nun teknik ayakları — hepsi ROOT path'te (SEO standardı: beylink.org/robots.txt).
// `/api/` prefix'siz mount edilir (app.js).

const router = Router();

// SEO URL — SITEMAP_BASE_URL (varsayılan https://beylink.org). Dev URL sitemap'e sızmasın diye
// PUBLIC_BASE_URL'den AYRI tutulur → Google canlı URL'leri indeksler, canonical/duplicate karışmaz.
// Env'den override edilebilir (staging için ör. https://staging.beylink.org).
// Host özel bir domainse (req.customDomain — bkz. resolveHost middleware) taban URL o domain
// olur (A4: "canonical/OG/sitemap host-farkında") — aksi halde sabit BeyLink canlı URL'si.
const BASE = (req) =>
  req?.customDomain
    ? `${req.protocol}://${req.customDomain.domain}`
    : String(config.sitemapBaseUrl || 'https://beylink.org').replace(/\/+$/, '');

// XML güvenlik: kullanıcı adı `[a-z0-9._-]{3,30}` regex'iyle sınırlı (slug), yine de her ihtimale karşı escape.
function xmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// SQLite datetime('now') → ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)
function toIsoZ(sqlUtc) {
  if (!sqlUtc) return null;
  const s = String(sqlUtc).replace(' ', 'T');
  return s.endsWith('Z') ? s : s + 'Z';
}

// Marketing/statik rotalar — Faz 1 ana sayfa + Faz 6 statik sayfalar + Faz 2 blog.
const STATIC_ROUTES = [
  { path: '/',              changefreq: 'weekly',  priority: 1.0 },
  { path: '/features',      changefreq: 'monthly', priority: 0.9 },
  { path: '/pricing',       changefreq: 'monthly', priority: 0.9 },
  { path: '/templates',     changefreq: 'monthly', priority: 0.8 },
  { path: '/blog',          changefreq: 'weekly',  priority: 0.9 },
  { path: '/help',          changefreq: 'monthly', priority: 0.6 },
  { path: '/faq',           changefreq: 'monthly', priority: 0.7 },
  { path: '/about',         changefreq: 'yearly',  priority: 0.5 },
  { path: '/contact',       changefreq: 'yearly',  priority: 0.5 },
  { path: '/privacy',       changefreq: 'yearly',  priority: 0.3 },
  { path: '/terms',         changefreq: 'yearly',  priority: 0.3 },
  { path: '/cookies',       changefreq: 'yearly',  priority: 0.3 },
];

// Blog makaleleri — frontend/src/site/blog/posts/*.jsx dosyalarındaki meta ile SENKRON tutulur.
// Yeni makale eklerken buraya da bir satır eklenir (elle senkron; makul sürede otomatikleştirilebilir).
const BLOG_POSTS = [
  { slug: 'what-is-link-in-bio',              title: 'What Is Link in Bio? The Complete 2026 Guide',                    publishedAt: '2026-07-07' },
  { slug: 'instagram-bio-optimization',       title: 'Instagram Bio Optimization: 10 Rules That Convert',               publishedAt: '2026-07-07' },
  { slug: 'tiktok-bio-link',                  title: 'TikTok Bio Link: 7 Moves After 1,000 Followers',                  publishedAt: '2026-07-07' },
  { slug: 'youtube-creator-tools',            title: 'YouTube Creator Tools: 8 Free Tools to Grow Faster',              publishedAt: '2026-07-07' },
  { slug: 'personal-branding-guide',          title: 'Personal Branding: 6 Steps to Stand Out in 90 Days',              publishedAt: '2026-07-07' },
  { slug: 'influencer-link-management',       title: 'Influencer Links: 5 Strategies to Grow Sponsor Revenue',          publishedAt: '2026-07-07' },
  { slug: 'qr-code-guide',                    title: 'QR Code Guide: Bridge Your Offline and Online World',             publishedAt: '2026-07-07' },
  { slug: 'digital-business-card-guide',      title: 'Digital Business Card Guide: A Modern 2026 Approach',             publishedAt: '2026-07-07' },
  { slug: 'short-link-benefits',              title: 'Short Link Benefits: Branding, Analytics & Security',             publishedAt: '2026-07-07' },
  { slug: 'landing-page-optimization',        title: 'Landing Page Optimization: 10 Tactics That Convert',              publishedAt: '2026-07-07' },
  { slug: 'how-to-collect-customer-reviews',  title: 'How to Collect Customer Reviews: 6 Free Methods',                 publishedAt: '2026-07-07' },
  { slug: 'understanding-link-analytics',     title: 'Understanding Link Analytics Metrics: What Each Means',           publishedAt: '2026-07-07' },
  { slug: 'sub-account-management',          title: 'Sub-Account Management: A Guide for Agencies & Teams',            publishedAt: '2026-07-07' },
  { slug: 'custom-domain-guide',              title: 'How to Connect a Custom Domain to Your BeyLink Page',             publishedAt: '2026-07-11' },
];

// ---- /robots.txt ----------------------------------------------------------
// Google'ın erişebileceği/erişemeyeceği rotalar. Login/register/dashboard/panel/api indekslenmez.
router.get('/robots.txt', (req, res) => {
  // Özel domain kökü yalnız tek bir profil sunar (dashboard/login/register orada YOK) —
  // kısa/minimal robots yeterli ve doğru.
  if (req.customDomain) {
    const lines = ['User-agent: *', 'Allow: /', '', `Sitemap: ${BASE(req)}/sitemap.xml`];
    return res.type('text/plain; charset=utf-8').send(lines.join('\n'));
  }
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /dashboard/',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /forgot-password',
    'Disallow: /reset-password',
    'Disallow: /verify-email',
    'Disallow: /uploads/',   // yüklenmiş görseller doğrudan URL keşfi yerine profil üzerinden görülmeli
    '',
    // AI crawler'lar için de saygılı ama açık kural
    'User-agent: GPTBot',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /dashboard/',
    '',
    `Sitemap: ${BASE(req)}/sitemap.xml`,
  ];
  res.type('text/plain; charset=utf-8').send(lines.join('\n'));
});

// ---- /sitemap.xml --------------------------------------------------------
// Dinamik: statik marketing rotaları + yayında olan tüm public profiller (/:username).
// Özel domain host'unda yalnız o domainin kök profili listelenir (marketing/blog rotaları
// oradan servis edilmez). 50k satır sınırı standardı; şu an bir sunucuda yeterli.
router.get('/sitemap.xml', (req, res) => {
  const base = BASE(req);
  const now = new Date().toISOString();

  const urls = [];

  if (req.customDomain) {
    urls.push(`  <url><loc>${xmlEscape(base + '/')}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`);
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.join('\n') +
      '\n</urlset>';
    return res.type('application/xml; charset=utf-8').send(xml);
  }

  for (const r of STATIC_ROUTES) {
    urls.push(
      `  <url>` +
        `<loc>${xmlEscape(base + r.path)}</loc>` +
        `<lastmod>${now}</lastmod>` +
        `<changefreq>${r.changefreq}</changefreq>` +
        `<priority>${r.priority.toFixed(1)}</priority>` +
      `</url>`
    );
  }

  // Blog makaleleri
  for (const p of BLOG_POSTS) {
    urls.push(
      `  <url>` +
        `<loc>${xmlEscape(`${base}/blog/${p.slug}`)}</loc>` +
        `<lastmod>${xmlEscape(p.publishedAt + 'T00:00:00Z')}</lastmod>` +
        `<changefreq>monthly</changefreq>` +
        `<priority>0.6</priority>` +
      `</url>`
    );
  }

  try {
    const profiles = profileModel.listPublishedForSitemap();
    for (const p of profiles) {
      const iso = toIsoZ(p.updated_at) || now;
      urls.push(
        `  <url>` +
          `<loc>${xmlEscape(`${base}/${p.username}`)}</loc>` +
          `<lastmod>${xmlEscape(iso)}</lastmod>` +
          `<changefreq>weekly</changefreq>` +
          `<priority>0.7</priority>` +
        `</url>`
      );
    }
  } catch (e) {
    // DB hatası sitemap'i öldürmesin — statik rotalar en azından servis edilir.
    console.error('[sitemap] profile listesi okunamadı:', e.message);
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join('\n') +
    '\n</urlset>';

  res.type('application/xml; charset=utf-8').send(xml);
});

// ---- /feed.xml (RSS 2.0) --------------------------------------------------
// Blog için hazır iskelet — Faz 2'de gerçek makale listesi eklenecek. Şimdilik boş channel.
// Feed discovery için index.html'e `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` bağlı.
router.get('/feed.xml', (_req, res) => {
  const base = BASE();
  const now = new Date().toUTCString();
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '<channel>\n' +
    `  <title>BeyLink Blog</title>\n` +
    `  <link>${xmlEscape(base)}/blog</link>\n` +
    `  <description>Link-in-bio, kişisel marka ve dijital büyüme üzerine Türkçe rehberler.</description>\n` +
    `  <language>tr-TR</language>\n` +
    `  <lastBuildDate>${now}</lastBuildDate>\n` +
    `  <atom:link href="${xmlEscape(base)}/feed.xml" rel="self" type="application/rss+xml"/>\n` +
    BLOG_POSTS.map((p) =>
      `  <item>\n` +
      `    <title>${xmlEscape(p.title)}</title>\n` +
      `    <link>${xmlEscape(`${base}/blog/${p.slug}`)}</link>\n` +
      `    <guid isPermaLink="true">${xmlEscape(`${base}/blog/${p.slug}`)}</guid>\n` +
      `    <pubDate>${new Date(p.publishedAt + 'T00:00:00Z').toUTCString()}</pubDate>\n` +
      `  </item>\n`
    ).join('') +
    '</channel>\n' +
    '</rss>';
  res.type('application/rss+xml; charset=utf-8').send(xml);
});

export default router;
