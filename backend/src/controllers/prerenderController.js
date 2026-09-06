import { profileModel } from '../models/profileModel.js';
import { linkModel } from '../models/linkModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeHtml, absoluteUrl } from '../utils/html.js';
import { resolveOgImage } from '../utils/seo.js';
import { toHttpTarget } from '../utils/url.js';

const SITE_NAME = 'BeyLink';

// Tek HTML iskeleti — head/body ÇAĞIRAN tarafından ESCAPE EDİLMİŞ gelmeli.
function htmlShell({ lang = 'tr', head = '', body = '' }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${head}
</head>
<body>
${body}
</body>
</html>`;
}

function notFoundHtml(res) {
  const head = [
    `<title>Profil bulunamadı — ${SITE_NAME}</title>`,
    `<meta name="robots" content="noindex,nofollow">`,
    `<meta name="description" content="Bu profil mevcut değil.">`,
  ].join('\n');
  return res.status(404).type('html').send(htmlShell({ head, body: '<h1>Profil bulunamadı</h1>' }));
}

// Paylaşılan render — hem `/api/prerender/:username` (ana domain) hem `/api/prerender/`
// (özel domain kökü) burayı çağırır. `pageUrl` çağıran tarafından üretilir (Host-farkında:
// özel domainde kök '/', ana domainde '/username' — bkz. resolveHost + A4).
function renderProfileHtml(req, res, profile, pageUrl) {
  const seo = profile.seo_settings || {};
  const rawTitle = profile.meta_title || profile.display_name || `@${profile.username}`;
  const rawDesc = profile.meta_description || profile.bio || `${profile.username} · ${SITE_NAME}`;
  const title = escapeHtml(rawTitle);
  const desc = escapeHtml(rawDesc);

  const canonical = escapeHtml(seo.canonical || pageUrl);
  const ogImageRaw = resolveOgImage(profile, seo);
  const ogImage = ogImageRaw ? absoluteUrl(req, ogImageRaw) : null;
  const ogImageEsc = ogImage ? escapeHtml(ogImage) : null;
  const robots = seo.robots === 'noindex' ? 'noindex,nofollow' : 'index,follow';
  const twitterCard = ogImage ? 'summary_large_image' : 'summary';
  const twitterHandle = seo.twitterHandle ? '@' + escapeHtml(seo.twitterHandle) : null;
  const keywords = seo.keywords ? escapeHtml(seo.keywords) : null;

  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}">`,
    `<meta name="robots" content="${robots}">`,
    keywords && `<meta name="keywords" content="${keywords}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:type" content="profile">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${desc}">`,
    `<meta property="og:url" content="${escapeHtml(pageUrl)}">`,
    ogImageEsc && `<meta property="og:image" content="${ogImageEsc}">`,
    `<meta name="twitter:card" content="${twitterCard}">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${desc}">`,
    ogImageEsc && `<meta name="twitter:image" content="${ogImageEsc}">`,
    twitterHandle && `<meta name="twitter:site" content="${twitterHandle}">`,
  ]
    .filter(Boolean)
    .join('\n');

  // Statik gövde — JS çalıştırmayan istemciler/botlar gerçek içerik görsün
  const links = linkModel.listByProfile(profile.id, { activeOnly: true });
  const linkItems = links
    .filter((l) => (l.type === 'link' || l.type === 'social') && l.url)
    .map((l) => {
      const href = toHttpTarget(l.url);
      if (!href) return '';
      return `<li><a href="${escapeHtml(href)}" rel="nofollow noopener">${escapeHtml(l.title || l.url)}</a></li>`;
    })
    .filter(Boolean)
    .join('\n');

  // JSON-LD yapısal veri (schema.org ProfilePage → Person) — crawler'lara güçlü SEO sinyali.
  // sameAs = sosyal hesap URL'leri (Google kişinin hesaplarını bilir). Değerler JSON.stringify +
  // '<' → '<' ile </script> breakout'a karşı güvenli.
  const sameAs = links
    .filter((l) => l.type === 'social' && l.url)
    .map((l) => toHttpTarget(l.url))
    .filter(Boolean);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.display_name || profile.username,
      ...(rawDesc ? { description: rawDesc } : {}),
      url: pageUrl,
      ...(ogImage ? { image: ogImage } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
  };
  const ldScript = `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;

  const avatar = profile.avatar_url ? absoluteUrl(req, profile.avatar_url) : null;
  const body = [
    '<main>',
    avatar ? `<img src="${escapeHtml(avatar)}" alt="${title} profil fotoğrafı" width="96" height="96">` : '',
    `<h1>${escapeHtml(profile.display_name || profile.username)}</h1>`,
    rawDesc ? `<p>${desc}</p>` : '',
    linkItems ? `<nav aria-label="Bağlantılar"><ul>\n${linkItems}\n</ul></nav>` : '',
    `<p><a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a></p>`,
    '</main>',
  ]
    .filter(Boolean)
    .join('\n');

  res.type('html').send(htmlShell({ head: head + '\n' + ldScript, body }));
}

/**
 * GET /api/prerender/:username — crawler'lar (WhatsApp/Twitter/Facebook/…) için
 * sunucu-taraflı OG/meta + statik içerik. nginx bot User-Agent'larını buraya yönlendirir.
 * Kimlik doğrulama YOK. Tüm dinamik değerler HTML-escape'lidir.
 * Host özel bir domainse (A4): yalnız o domainin sahibine ait profiller görünür — başka
 * BeyLink kullanıcısının slug'ı 404 (yatay sızma/gizlilik ihlali önlenir).
 */
export const prerenderProfile = asyncHandler(async (req, res) => {
  const profile = profileModel.findByUsername(req.params.username);
  if (!profile || !profile.is_published) return notFoundHtml(res);
  if (req.customDomain && profile.user_id !== req.customDomain.user_id) return notFoundHtml(res);

  const pageUrl = `${req.protocol}://${req.get('host')}/${profile.username}`;
  renderProfileHtml(req, res, profile, pageUrl);
});

/**
 * GET /api/prerender/ (kök, username YOK) — yalnız özel domain host'unda anlamlı: domainin
 * kök '/' yolu sahibinin `target_profile_id` ile eşleşen profilini bot'lara sunar (A4).
 */
export const prerenderRootProfile = asyncHandler(async (req, res) => {
  if (!req.customDomain?.target_profile_id) return notFoundHtml(res);
  const profile = profileModel.findById(req.customDomain.target_profile_id);
  if (!profile || !profile.is_published) return notFoundHtml(res);

  const pageUrl = `${req.protocol}://${req.get('host')}/`;
  renderProfileHtml(req, res, profile, pageUrl);
});
