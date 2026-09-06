import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, Share2, Minus, Link2, Sparkles, Contact, Images, Bookmark } from 'lucide-react';
import { useProfile } from '../context/ProfileContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LinkRow } from '../components/links/LinkRow.jsx';
import { AddSocialModal } from '../components/links/AddSocialModal.jsx';

const CATEGORIES = [
  { key: 'social', icon: Share2 },
  { key: 'link', icon: Link2 },
  { key: 'contact', icon: Contact },
  { key: 'gallery', icon: Images },
  { key: 'divider', icon: Minus },
];

export default function LinksPage() {
  const { links, btags, addLink, updateLink, removeLink, reorder } = useProfile();
  const { t } = useLanguage();
  const [socialOpen, setSocialOpen] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [pasteBtag, setPasteBtag] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const next = arrayMove(links, oldIndex, newIndex);
    reorder(next.map((l) => l.id));
  };

  const quickAdd = async (key) => {
    if (key === 'social') return setSocialOpen(true);
    if (key === 'divider') return addLink({ type: 'divider', title: '' });
    if (key === 'contact') return addLink({ type: 'contact', title: t('contact.cardTitlePlaceholder'), config: {} });
    if (key === 'gallery') return addLink({ type: 'gallery', title: t('gallery.modalTitle'), config: { images: [], columns: 2 } });
    return addLink({ type: 'link', title: t('links.quickAdd.newLink'), url: 'https://', icon_name: 'link' });
  };

  const addFromPaste = async () => {
    const url = pasteUrl.trim();
    if (!url) return;
    // Başlık için şemayı at; URL'yi ham gönder — backend başında https:// yoksa otomatik ekler
    const title = url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    await addLink({ type: 'link', title, url, icon_name: 'link', btag: pasteBtag || null });
    setPasteUrl('');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">{t('links.title')}</h1>
        <Link
          to="/dashboard/design#my-templates"
          className="inline-flex items-center gap-1.5 rounded-xl bg-danger px-3.5 py-2 text-sm font-bold text-white shadow-card transition hover:opacity-90"
          title={t('links.myTemplatesTooltip')}
        >
          <Bookmark size={15} /> {t('design.myTemplates.title')}
        </Link>
      </div>

      {/* Kategori hızlı ekleme kartları */}
      <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {CATEGORIES.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => quickAdd(key)}
            className="group flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-white p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand-violet"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-violet/10 text-brand-violet transition group-hover:bg-brand-gradient group-hover:text-white">
              <Icon size={20} />
            </span>
            <span className="text-sm font-bold text-ink">{t(`links.category.${key}.label`)}</span>
            <span className="text-[11px] text-muted">{t(`links.category.${key}.desc`)}</span>
          </button>
        ))}
      </div>

      {/* URL yapıştır (+ opsiyonel BTAG) */}
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          className="input min-w-[12rem] flex-1"
          value={pasteUrl}
          onChange={(e) => setPasteUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addFromPaste()}
          placeholder={t('links.pasteUrlPlaceholder')}
        />
        {btags.length > 0 && (
          <select
            className="input w-full shrink-0 sm:w-48"
            value={pasteBtag}
            onChange={(e) => setPasteBtag(e.target.value)}
            title={t('links.pasteBtagTooltip')}
          >
            <option value="">{t('btag.none')}</option>
            {btags.map((b) => (
              <option key={b.id} value={b.value}>{b.label ? `${b.label} (${b.value})` : b.value}</option>
            ))}
          </select>
        )}
        <button onClick={addFromPaste} className="btn-primary shrink-0"><Plus size={16} /> {t('common.add')}</button>
      </div>

      {/* Blok listesi */}
      {links.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
          <Sparkles className="text-brand-violet" />
          <p className="font-semibold text-ink">{t('links.empty.title')}</p>
          <p className="text-sm text-muted">{t('links.empty.body')}</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {links.map((link) => (
                <LinkRow key={link.id} link={link} onUpdate={updateLink} onDelete={removeLink} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddSocialModal open={socialOpen} onClose={() => setSocialOpen(false)} onAdd={addLink} />
    </div>
  );
}
