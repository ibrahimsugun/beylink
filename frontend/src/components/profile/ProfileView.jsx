import { getTheme, resolveButton } from '../../lib/themes.js';
import { Icon } from '../../lib/icons.jsx';
import { Logo } from '../ui/Logo.jsx';
import { ContactCard } from './ContactCard.jsx';
import { GalleryBlock } from './GalleryBlock.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * Bir profili + bloklarını temaya göre render eder.
 * Hem Dashboard canlı önizlemesinde hem de gerçek public sayfada kullanılır.
 */
export function ProfileView({ profile, links = [], onLinkClick, onPixel, showBranding = true, rootClassName = 'min-h-full', redirect = false, btag = null, landmark = false, headingAs = 'h1' }) {
  const { t } = useLanguage();
  if (!profile) return null;
  const ts = profile.theme_settings || {};
  const theme = getTheme(ts.template);
  const btnStyle = resolveButton(theme, ts.buttonStyle); // buton dolgu/kenar + seçilen köşe şekli
  const align = ts.title_align || 'center';
  const headerType = ts.header_type || 'avatar';

  const alignCls = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';

  const socials = links.filter((l) => l.type === 'social');
  const blocks = links.filter((l) => l.type !== 'social');

  const initial = (profile.display_name || profile.username || '?').charAt(0).toUpperCase();

  // Public sayfada link/social tıklaması backend yönlendirme motoruna gider
  // (/api/go → BTAG'i hedefe ekler + sunucuda loglar). Önizlemede doğrudan URL.
  // mailto:/tel: iletişim şemaları /api/go üzerinden GİTMEZ (sunucu yalnız http/https'e yönlendirir) →
  // doğrudan href basılır; e-posta/telefon uygulaması açılır.
  const isContactScheme = (u) => /^(mailto:|tel:)/i.test(u || '');

  const goHref = (block) => {
    if (redirect && block.url && !isContactScheme(block.url)) {
      // Sayfa btag'i yalnızca gömülü btag'i OLMAYAN linklere uygulanır; gömülü
      // btag'li linkler backend two-hop ile kendi (link-özel) atıfını korur.
      const q = btag && !block.btag ? `?btag=${encodeURIComponent(btag)}` : '';
      return `/api/go/${block.id}${q}`;
    }
    return block.url || '#';
  };

  const handleClick = (e, link) => {
    if (onPixel) onPixel(link); // Facebook Pixel — hem redirect hem client-track linklerinde
    // http/https redirect linkleri sunucu /api/go üzerinden loglanır → burada çift sayma. mailto/tel
    // doğrudan gider (izlenmez); önizleme/istemci-track modunda onLinkClick çalışır.
    if (redirect && link.url && !isContactScheme(link.url)) return;
    if (onLinkClick) onLinkClick(link);
    if (!link.url) e.preventDefault();
  };

  // landmark=true (gerçek public sayfa) → içerik <main>; önizlemede iç-içe <main> olmasın diye <div>
  const Content = landmark ? 'main' : 'div';

  return (
    <div className={`w-full ${rootClassName}`} style={{ ...theme.pageStyle, color: theme.text }}>
      {(headerType === 'cover' || headerType === 'both') && profile.cover_url && (
        <div
          className="h-28 w-full bg-cover bg-center"
          role="img"
          aria-label={t('profileView.coverAlt', { name: profile.display_name || profile.username })}
          style={{ backgroundImage: `url(${profile.cover_url})` }}
        />
      )}

      <Content className="mx-auto flex max-w-md flex-col px-5 pb-16 pt-8">
        <header className={`flex flex-col gap-3 ${alignCls}`}>
          {headerType !== 'cover' && (
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white/40 bg-white/20 shadow-lg">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={t('profileView.avatarAlt', { name: profile.display_name || profile.username })}
                  className="h-full w-full object-cover"
                  width={80}
                  height={80}
                  decoding="async"
                  // Public sayfada above-the-fold'un en belirgin imgesi — LCP adayı. eager + high öncelik.
                  loading="eager"
                  fetchpriority="high"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold" aria-hidden="true">{initial}</div>
              )}
            </div>
          )}

          <div className={align === 'center' ? 'text-center' : ''}>
            {/* Landmark modu KAPALI kullanımlarda (ör. landing hero dekorasyonu) çağıran 'h3'/'div' geçebilir
                → sayfada birden fazla h1 oluşmasın (SEO: tek H1). Default 'h1' — public sayfa korunur. */}
            {(() => {
              const Heading = headingAs || 'h1';
              return (
                <Heading className="font-display text-xl font-bold leading-tight">
                  {profile.display_name || `@${profile.username}`}
                </Heading>
              );
            })()}
            {profile.bio_html ? (
              // bio_html sunucuda sanitize edilmiştir (allowlist) → güvenle basılır
              <div className="bl-rich mt-1 text-sm opacity-90" dangerouslySetInnerHTML={{ __html: profile.bio_html }} />
            ) : (
              profile.bio && <p className="mt-1 text-sm opacity-90">{profile.bio}</p>
            )}
          </div>

          {socials.length > 0 && (
            <nav aria-label={t('profileView.socialNavAria')} className="mt-1 flex flex-wrap gap-3" style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={goHref(s)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => handleClick(e, s)}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110"
                  style={theme.button}
                  title={s.title}
                  aria-label={s.title || s.icon_name || t('profileView.socialFallbackAria')}
                >
                  <Icon name={s.icon_name || s.title?.toLowerCase()} size={18} aria-hidden="true" />
                </a>
              ))}
            </nav>
          )}
        </header>

        <section aria-label={t('profileView.blocksAria')} className="mt-6 flex flex-col gap-3">
          {blocks.map((block) =>
            block.type === 'divider' ? (
              <div key={block.id} className="flex items-center gap-3 py-1 opacity-80">
                <span className="h-px flex-1 bg-current opacity-30" aria-hidden="true" />
                {block.title && <h2 className="text-xs font-semibold uppercase tracking-wide">{block.title}</h2>}
                <span className="h-px flex-1 bg-current opacity-30" aria-hidden="true" />
              </div>
            ) : block.type === 'contact' ? (
              <ContactCard key={block.id} block={block} theme={theme} onLinkClick={onLinkClick} />
            ) : block.type === 'gallery' ? (
              <GalleryBlock key={block.id} block={block} theme={theme} onLinkClick={onLinkClick} />
            ) : (
              <a
                key={block.id}
                href={goHref(block)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => handleClick(e, block)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-lg"
                style={btnStyle}
                aria-label={block.title || block.url}
              >
                {block.icon_name && <Icon name={block.icon_name} size={18} aria-hidden="true" />}
                <span className="flex-1 text-center">{block.title || block.url}</span>
              </a>
            )
          )}
        </section>

        {showBranding && !ts.hide_branding && (
          <footer className="mt-10 flex justify-center opacity-90">
            <div className="rounded-full bg-white/85 px-3 py-1.5 shadow">
              <Logo size={18} />
            </div>
          </footer>
        )}
      </Content>
    </div>
  );
}
