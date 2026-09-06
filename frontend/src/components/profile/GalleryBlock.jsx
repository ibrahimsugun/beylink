import { useLanguage } from '../../context/LanguageContext.jsx';

const normalizeUrl = (u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);

export function GalleryBlock({ block, theme, onLinkClick }) {
  const { t } = useLanguage();
  const images = (Array.isArray(block.config?.images) ? block.config.images : []).filter((im) => im && im.url);
  const columns = block.config?.columns === 3 ? 3 : 2;
  if (images.length === 0) return null;

  const gridCls = columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const heading = block.title || t('gallery.modalTitle');

  return (
    <section aria-label={heading} className="rounded-xl p-3" style={theme.button}>
      {block.title && <h3 className="mb-2 text-sm font-bold opacity-90">{block.title}</h3>}
      <ul className={`grid ${gridCls} list-none gap-2`}>
        {images.map((im, i) => {
          const alt = t('gallery.imageAlt', { heading, index: i + 1 });
          const img = (
            // Galeri below-the-fold + tekrarlı: lazy + async decode; aspect-square CLS'i sıfırlar.
            <img src={im.url} alt={alt} loading="lazy" decoding="async" className="aspect-square w-full rounded-lg object-cover" />
          );
          return (
            <li key={i}>
              {im.link ? (
                <a
                  href={normalizeUrl(im.link)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={alt}
                  onClick={() => onLinkClick && onLinkClick(block)}
                  className="block transition hover:opacity-90"
                >
                  {img}
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
