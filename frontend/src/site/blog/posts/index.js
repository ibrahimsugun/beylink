// Tüm blog makaleleri — meta ve component'i tek yerden export edilir.
// Route (BlogPost) burdan slug'a göre bulur. Sitemap+feed backend'de statik listelenir; buraya makale
// eklendikçe backend/src/routes/seoRoutes.js'deki BLOG_POSTS listesi de güncellenir (elle senkron).

import * as linkInBioNedir from './link-in-bio-nedir.jsx';
import * as instagramBioOptimizasyonu from './instagram-bio-optimizasyonu.jsx';
import * as tiktokLinkKullanimi from './tiktok-link-kullanimi.jsx';
import * as youtubeCreatorAraclari from './youtube-creator-araclari.jsx';
import * as kisiselMarkaOlusturma from './kisisel-marka-olusturma.jsx';
import * as influencerLinkYonetimi from './influencer-link-yonetimi.jsx';
import * as qrKodKullanimRehberi from './qr-kod-kullanim-rehberi.jsx';
import * as dijitalKartvizitRehberi from './dijital-kartvizit-rehberi.jsx';
import * as kisaLinkAvantajlari from './kisa-link-avantajlari.jsx';
import * as landingPageOptimizasyonu from './landing-page-optimizasyonu.jsx';
import * as musteriYorumlariNasilToplanir from './musteri-yorumlari-nasil-toplanir.jsx';
import * as analitikMetrikleriniAnlamak from './analitik-metriklerini-anlamak.jsx';
import * as altHesapYonetimi from './alt-hesap-yonetimi-ekipler-icin.jsx';
import * as ozelAlanAdiNasilBaglanir from './ozel-alan-adi-nasil-baglanir.jsx';

const ALL = [
  linkInBioNedir,
  instagramBioOptimizasyonu,
  tiktokLinkKullanimi,
  youtubeCreatorAraclari,
  kisiselMarkaOlusturma,
  influencerLinkYonetimi,
  qrKodKullanimRehberi,
  dijitalKartvizitRehberi,
  kisaLinkAvantajlari,
  landingPageOptimizasyonu,
  musteriYorumlariNasilToplanir,
  analitikMetrikleriniAnlamak,
  altHesapYonetimi,
  ozelAlanAdiNasilBaglanir,
];

// Yeniden yayın tarihine göre azalan sırayla (en yeni üstte)
export const POSTS = ALL
  .map((m) => ({ ...m.meta, Component: m.default }))
  .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

export function findPostBySlug(slug) {
  return POSTS.find((p) => p.slug === slug) || null;
}

// tags {tr,en} iki-dilli VEYA düz dizi olabilir (kademeli çeviri) — skorlama için dile bakılmaksızın
// düz bir diziye indirger (fallback en→tr).
function tagList(tags) {
  if (Array.isArray(tags)) return tags;
  if (tags && typeof tags === 'object') return tags.en ?? tags.tr ?? [];
  return [];
}

// Benzer/ilgili makaleler — aynı kategori öncelikli, sonra ortak tag; hariç tut mevcut.
export function relatedPosts(currentSlug, limit = 3) {
  const current = findPostBySlug(currentSlug);
  if (!current) return [];
  const currentTags = tagList(current.tags);
  const rest = POSTS.filter((p) => p.slug !== currentSlug);
  const withScore = rest.map((p) => {
    let score = 0;
    if (p.category === current.category) score += 10;
    const common = tagList(p.tags).filter((t) => currentTags.includes(t)).length;
    score += common * 3;
    return { ...p, _score: score };
  });
  return withScore.sort((a, b) => b._score - a._score).slice(0, limit);
}
