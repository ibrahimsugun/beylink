import { useEffect } from 'react';
import { useHeadMeta } from './useHeadMeta.js';

// Marketing site SEO çekirdek yardımcıları — her sayfa `useSeo(...)` ile benzersiz meta + JSON-LD alır.
// canonical/OG absolute URL'ler VITE_PUBLIC_BASE_URL üzerinden türetilir → Faz 9 subdomain'e taşınırken
// tek env değeri değişir, kodda link araması gerekmez.

const BASE = (import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:5501').replace(/\/+$/, '');
export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'BeyLink';
export const SITE_BASE = BASE;

export function absoluteUrl(path = '/') {
  if (!path) return BASE;
  if (/^https?:\/\//i.test(path)) return path;
  return BASE + (path.startsWith('/') ? path : '/' + path);
}

/**
 * Sayfa SEO'sunu tek çağrıyla ayarlar.
 *  - title/description/keywords/robots (meta)
 *  - canonical + og:url (absolute)
 *  - OpenGraph + Twitter Card (image absolute)
 *  - JSON-LD (dizi ya da tek obje) — head'e <script type="application/ld+json"> ekler, unmount'ta temizler
 *  - author/publisher — Article/BlogPosting için opsiyonel
 */
export function useSeo({
  title,
  description,
  path,
  image,
  type = 'website', // 'website' | 'article' | 'profile'
  keywords,
  robots,
  jsonLd,
  twitterCard,
  siteName = SITE_NAME,
} = {}) {
  const url = absoluteUrl(path || (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const imageAbs = image ? absoluteUrl(image) : null;
  const twCard = twitterCard || (imageAbs ? 'summary_large_image' : 'summary');

  const fullTitle = title ? `${title} · ${siteName}` : siteName;

  useHeadMeta({
    title: fullTitle,
    tags: [
      description && { name: 'description', content: description },
      keywords && { name: 'keywords', content: keywords },
      robots && { name: 'robots', content: robots },
      { rel: 'canonical', href: url },

      { property: 'og:type', content: type },
      { property: 'og:site_name', content: siteName },
      { property: 'og:title', content: title || siteName },
      description && { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      imageAbs && { property: 'og:image', content: imageAbs },

      { name: 'twitter:card', content: twCard },
      { name: 'twitter:title', content: title || siteName },
      description && { name: 'twitter:description', content: description },
      imageAbs && { name: 'twitter:image', content: imageAbs },
    ],
  });

  // JSON-LD ayrı — useHeadMeta script'i desteklemiyor; kendimiz upsert + restore.
  useJsonLd(jsonLd);
}

/** Head'e bir veya daha fazla JSON-LD script'i ekler; unmount'ta kaldırır. */
export function useJsonLd(schema) {
  const serialized = schema ? JSON.stringify(schema) : '';
  useEffect(() => {
    if (!serialized) return;
    const items = Array.isArray(schema) ? schema : [schema];
    const nodes = [];
    for (const s of items) {
      if (!s) continue;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      // XSS koruması: `<` → `<` ile </script> breakout engellenir
      script.textContent = JSON.stringify(s).replace(/</g, '\\u003c');
      script.setAttribute('data-bl-ld', '');
      document.head.appendChild(script);
      nodes.push(script);
    }
    return () => nodes.forEach((n) => n.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);
}

// ---- JSON-LD şablonları (schema.org) --------------------------------------------------------
// Kullanım: `useSeo({ ..., jsonLd: [orgSchema(), websiteSchema(), softwareApplicationSchema()] })`

export const orgSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: BASE,
  logo: absoluteUrl('/favicon-32.png'),
  sameAs: [], // gelecekte sosyal linkler
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: BASE,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const softwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan available',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '128',
  },
});

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});

export const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((q) => ({
    '@type': 'Question',
    name: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
});

export const articleSchema = ({ title, description, path, image, datePublished, dateModified, author = SITE_NAME }) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description,
  image: image ? absoluteUrl(image) : undefined,
  datePublished,
  dateModified: dateModified || datePublished,
  author: { '@type': 'Organization', name: author },
  publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon-32.png') } },
  mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
});

// Product/Offer — Paketler sayfasında pricing için
export const productSchema = ({ name, description, price, priceCurrency = 'USD', path }) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description,
  offers: { '@type': 'Offer', price: String(price), priceCurrency, url: absoluteUrl(path) },
});
