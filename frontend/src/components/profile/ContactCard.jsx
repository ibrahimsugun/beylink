import { Phone, Mail, Globe, MapPin, Clock, UserPlus } from 'lucide-react';
import { downloadVCard } from '../../lib/vcard.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function ContactCard({ block, theme, onLinkClick }) {
  const { t } = useLanguage();
  const c = block.config || {};
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
  const addr = c.address || {};
  const addrStr = [addr.street, addr.city, addr.zip, addr.country].filter(Boolean).join(', ');

  // label → erişilebilir isim (ikon dekoratif/aria-hidden olduğundan)
  const rows = [
    c.phone && { icon: Phone, label: t('contact.phone'), val: c.phone, href: `tel:${c.phone.replace(/\s/g, '')}` },
    c.email && { icon: Mail, label: t('contact.email'), val: c.email, href: `mailto:${c.email}` },
    c.website && {
      icon: Globe,
      label: t('contact.website'),
      val: c.website.replace(/^https?:\/\//, ''),
      href: /^https?:\/\//i.test(c.website) ? c.website : `https://${c.website}`,
    },
    addrStr && { icon: MapPin, label: t('contact.address'), val: addrStr },
    c.hours && { icon: Clock, label: t('contact.hours'), val: c.hours },
  ].filter(Boolean);

  const addToContacts = () => {
    if (onLinkClick) onLinkClick(block);
    downloadVCard(c, t);
  };

  const heading = block.title || name || t('contact.fallbackTitle');

  return (
    <section aria-label={heading} className="rounded-xl p-4" style={theme.button}>
      {block.title && <h3 className="mb-2 text-sm font-bold opacity-90">{block.title}</h3>}
      {name && <div className="text-base font-bold">{name}</div>}
      {(c.role || c.company) && (
        <div className="text-xs opacity-80">{[c.role, c.company].filter(Boolean).join(' · ')}</div>
      )}

      {rows.length > 0 && (
        <ul className="mt-3 list-none space-y-1.5">
          {rows.map((r, i) => {
            const Cmp = r.icon;
            const body = (
              <span className="flex items-center gap-2 text-sm opacity-90">
                <Cmp size={15} className="shrink-0" aria-hidden="true" /> <span className="truncate">{r.val}</span>
              </span>
            );
            return (
              <li key={i}>
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${r.label}: ${r.val}`}
                    className="block hover:opacity-100"
                    onClick={() => onLinkClick && onLinkClick(block)}
                  >
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={addToContacts}
        aria-label={t('contactCard.addToContactsAria')}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition hover:opacity-90"
        style={{ background: '#1B2340', color: '#ffffff' }}
      >
        <UserPlus size={15} aria-hidden="true" /> {t('contactCard.addToContactsBtn')}
      </button>
    </section>
  );
}
