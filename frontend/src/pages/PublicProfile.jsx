import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useHeadMeta } from '../lib/useHeadMeta.js';
import { api } from '../api/client.js';
import { getVisitorId } from '../lib/visitor.js';
import { ProfileView } from '../components/profile/ProfileView.jsx';
import { FullScreenLoader } from '../components/ui/Spinner.jsx';
import { Logo } from '../components/ui/Logo.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function PublicProfile() {
  const { t } = useLanguage();
  const { username } = useParams();
  const location = useLocation();
  const [state, setState] = useState({ loading: true, profile: null, links: [], error: null });

  // URL'deki ?btag= (büyük/küçük harf duyarsız) — bu ziyaretin affiliate kaynağı
  const btag = useMemo(() => {
    const m = location.search.match(/[?&]btag=([^&#]+)/i);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch { return m[1]; }
  }, [location.search]);

  // Veri fetch'i — SAF (görüntülenme kaydı YOK; StrictMode/prefetch çift-fetch'i zararsız).
  // username YOKSA (özel domain kökü '/') → kök endpoint; backend Host'a göre hedef profili çözer.
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true }));
    api.get(username ? `/public/${username}` : '/public/', { auth: false })
      .then((d) => active && setState({ loading: false, profile: d.profile, links: d.links, error: null }))
      .catch((e) => active && setState({ loading: false, profile: null, links: [], error: e }));
    return () => { active = false; };
  }, [username]);

  // Görüntülenme beacon'ı — ziyaret başına TEK (StrictMode/çift-fetch'e karşı ref koruması).
  // Anahtar profil+btag: aynı ziyaret için tekrar POST atılmaz.
  const viewedKey = useRef('');
  useEffect(() => {
    const pid = state.profile?.id;
    if (!pid) return;
    const key = `${pid}|${btag || ''}`;
    if (viewedKey.current === key) return;
    viewedKey.current = key;
    api.post('/public/track', { profile_id: pid, event_type: 'view', btag, visitor: getVisitorId() }, { auth: false }).catch(() => {});
  }, [state.profile, btag]);

  // Galeri/iletişim alt-linkleri client tarafında loglanır (link/social sunucuda /api/go ile)
  const trackClick = (link) => {
    api.post('/public/track', { profile_id: state.profile.id, link_id: link.id, event_type: 'click', btag, visitor: getVisitorId() }, { auth: false }).catch(() => {});
  };

  // Facebook Pixel — profilde tanımlıysa fbevents yükle + PageView (ziyaret başına tek).
  const pixelDone = useRef('');
  useEffect(() => {
    const pid = state.profile?.seo_settings?.fbPixelId;
    if (!pid || !/^\d{5,20}$/.test(pid)) return;
    if (pixelDone.current === pid) return;
    pixelDone.current = pid;
    if (!window.fbq) {
      /* eslint-disable */
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
    }
    window.fbq('init', pid);
    window.fbq('track', 'PageView');
  }, [state.profile]);

  // Link tıklamasında Pixel özel olayı (hem /api/go hem client-track linkleri)
  const firePixelClick = (link) => {
    if (window.fbq) window.fbq('trackCustom', 'LinkClick', { link_id: link.id, title: link.title || '' });
  };

  // <head> yönetimi — hook KOŞULSUZ çağrılmalı (erken return'lerden ÖNCE); profil yokken boş geçilir.
  const p = state.profile;
  const seo = p?.seo_settings || {};
  const title = p ? (p.meta_title || p.display_name || `@${p.username}`) : undefined;
  const desc = p ? (p.meta_description || p.bio || `${p.username} · BeyLink`) : undefined;
  const ogMode = seo.ogImageMode || 'cover';
  let ogImage = !p ? null : ogMode === 'custom' ? seo.ogImageUrl : ogMode === 'avatar' ? (p.avatar_url || p.cover_url) : (p.cover_url || p.avatar_url);
  if (ogImage && ogImage.startsWith('/')) ogImage = window.location.origin + ogImage;
  // Özel domain kökünde ('/') canonical de kök olmalı; slug ile erişimde her zaman /username.
  const pageUrl = p ? `${window.location.origin}${username ? `/${p.username}` : '/'}` : undefined;
  const canonical = p ? (seo.canonical || pageUrl) : undefined;
  const robots = seo.robots === 'noindex' ? 'noindex,nofollow' : 'index,follow';
  const twitterCard = ogImage ? 'summary_large_image' : 'summary';
  useHeadMeta(p ? {
    title,
    tags: [
      { name: 'description', content: desc },
      seo.keywords && { name: 'keywords', content: seo.keywords },
      { name: 'robots', content: robots },
      { rel: 'canonical', href: canonical },
      { property: 'og:site_name', content: 'BeyLink' },
      { property: 'og:type', content: 'profile' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:url', content: pageUrl },
      ogImage && { property: 'og:image', content: ogImage },
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
      ogImage && { name: 'twitter:image', content: ogImage },
      seo.twitterHandle && { name: 'twitter:site', content: '@' + seo.twitterHandle },
    ].filter(Boolean),
  } : {});

  if (state.loading) return <FullScreenLoader />;

  if (state.error || !state.profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <Logo size={40} />
        <h1 className="font-display text-2xl font-bold text-ink">{t('publicProfile.notFound.title')}</h1>
        <p className="text-muted">{t('publicProfile.notFound.text', { username: username || window.location.hostname })}</p>
        <Link to="/" className="btn-brand">{t('publicProfile.notFound.cta')}</Link>
      </div>
    );
  }

  const { profile, links } = state;
  return (
    <ProfileView profile={profile} links={links} onLinkClick={trackClick} onPixel={firePixelClick} redirect landmark btag={btag} rootClassName="min-h-screen" />
  );
}
