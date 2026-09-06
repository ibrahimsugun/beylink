import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Check, X, Minus, Contact, Images } from 'lucide-react';
import { Toggle } from '../ui/Toggle.jsx';
import { Icon } from '../../lib/icons.jsx';
import { ContactModal } from './ContactModal.jsx';
import { GalleryModal } from './GalleryModal.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { capsFor } from '../../lib/plans.js';

export function LinkRow({ link, onUpdate, onDelete }) {
  const { btags } = useProfile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const [editing, setEditing] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [draft, setDraft] = useState({ title: link.title || '', url: link.url || '', icon_name: link.icon_name || '', btag: link.btag || '' });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const isDivider = link.type === 'divider';
  const isContact = link.type === 'contact';
  const isGallery = link.type === 'gallery';
  const isSpecial = isDivider || isContact || isGallery;

  const save = () => {
    // Sadece "https://" (kullanıcı alan adı yazmadı) → boş kabul et (yarım URL kaydetme)
    const url = /^https?:\/\/$/i.test(draft.url) ? '' : draft.url;
    onUpdate(link.id, { title: draft.title, url, icon_name: draft.icon_name || null, btag: draft.btag || null });
    setEditing(false);
  };

  const btagValues = new Set(btags.map((b) => b.value));

  const onPencil = () => {
    if (isContact) setContactOpen(true);
    else if (isGallery) setGalleryOpen(true);
    else setEditing((e) => !e);
  };

  const rowIcon = isDivider ? <Minus size={18} /> : isContact ? <Contact size={18} /> : isGallery ? <Images size={18} /> : <Icon name={link.icon_name || link.title?.toLowerCase()} size={18} />;
  const fallbackTitle = isDivider ? t('linkRow.divider.fallback') : isContact ? t('linkRow.contact.fallback') : isGallery ? t('linkRow.gallery.fallback') : link.url;
  const subtitle = isContact
    ? [link.config?.firstName, link.config?.lastName].filter(Boolean).join(' ') || t('linkRow.contact.subtitleFallback')
    : isGallery
      ? t.plural('gallery.images', (link.config?.images || []).length)
      : link.url;

  return (
    <div ref={setNodeRef} style={style} className="card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3">
        <button className="cursor-grab touch-none text-muted hover:text-ink" {...attributes} {...listeners} title={t('linkRow.dragTooltip')}>
          <GripVertical size={18} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink-soft">{rowIcon}</div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{link.title || fallbackTitle}</div>
          {!isDivider && subtitle && <div className="truncate text-xs text-muted">{subtitle}</div>}
        </div>

        <Toggle checked={!!link.is_active} onChange={(v) => onUpdate(link.id, { is_active: v })} size="sm" />
        <button onClick={onPencil} className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-brand-violet" title={t('linkRow.editTooltip')}>
          <Pencil size={15} />
        </button>
        <button onClick={() => onDelete(link.id)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" title={t('common.delete')}>
          <Trash2 size={15} />
        </button>
      </div>

      {editing && !isSpecial && (
        <div className="space-y-3 border-t border-line bg-surface/60 px-3 py-3">
          <div>
            <label className="label">{t('linkRow.edit.titleLabel')}</label>
            <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={t('linkRow.edit.titlePlaceholder')} />
          </div>
          <div>
            <label className="label">{t('linkRow.edit.urlLabel')}</label>
            {/^(mailto:|tel:)/i.test(draft.url) ? (
              // İletişim şeması (e-posta/telefon) — olduğu gibi düzenlenir (https prefix uygulanmaz)
              <input className="input" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder={t('linkRow.edit.mailtoPlaceholder')} />
            ) : (
              // Web linki — sabit https:// öneki (düzenlenemez); kullanıcı yalnız alan adı + yol yazar
              <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand-violet">
                <span className="flex shrink-0 select-none items-center border-r border-line bg-surface px-3 font-mono text-sm text-muted">https://</span>
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                  value={draft.url.replace(/^https?:\/\//i, '')}
                  onChange={(e) => setDraft({ ...draft, url: 'https://' + e.target.value.replace(/^https?:\/\//i, '') })}
                  placeholder={t('linkRow.edit.urlPlaceholder')}
                />
              </div>
            )}
          </div>
          <div>
            <label className="label">{t('linkRow.edit.iconLabel')} <span className="font-normal text-muted">{t('linkRow.edit.iconHint')}</span></label>
            <input className="input" value={draft.icon_name} onChange={(e) => setDraft({ ...draft, icon_name: e.target.value })} placeholder={t('linkRow.edit.iconPlaceholder')} />
          </div>
          {capsFor(user).btag && (btags.length > 0 || draft.btag) && (
            <div>
              <label className="label">{t('linkRow.edit.btagLabel')} <span className="font-normal text-muted">{t('linkRow.edit.btagHint')}</span></label>
              <select className="input" value={draft.btag} onChange={(e) => setDraft({ ...draft, btag: e.target.value })}>
                <option value="">{t('btag.none')}</option>
                {draft.btag && !btagValues.has(draft.btag) && <option value={draft.btag}>{draft.btag} {t('linkRow.edit.btagDeletedSuffix')}</option>}
                {btags.map((b) => (
                  <option key={b.id} value={b.value}>{b.label ? `${b.label} (${b.value})` : b.value}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="btn-ghost"><X size={15} /> {t('common.cancel')}</button>
            <button onClick={save} className="btn-brand"><Check size={15} /> {t('common.save')}</button>
          </div>
        </div>
      )}

      {editing && isDivider && (
        <div className="space-y-3 border-t border-line bg-surface/60 px-3 py-3">
          <div>
            <label className="label">{t('linkRow.divider.titleLabel')} <span className="font-normal text-muted">{t('linkRow.divider.titleHint')}</span></label>
            <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={t('linkRow.divider.titlePlaceholder')} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="btn-ghost"><X size={15} /> {t('common.cancel')}</button>
            <button onClick={save} className="btn-brand"><Check size={15} /> {t('common.save')}</button>
          </div>
        </div>
      )}

      {isContact && contactOpen && (
        <ContactModal open onClose={() => setContactOpen(false)} block={link} onSave={(fields) => onUpdate(link.id, fields)} />
      )}
      {isGallery && galleryOpen && (
        <GalleryModal open onClose={() => setGalleryOpen(false)} block={link} onSave={(fields) => onUpdate(link.id, fields)} />
      )}
    </div>
  );
}
