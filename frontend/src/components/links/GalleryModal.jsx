import { useEffect, useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { api } from '../../api/client.js';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function GalleryModal({ open, onClose, block, onSave }) {
  const { activeId } = useProfile();
  const { t } = useLanguage();
  const fileRef = useRef();
  const mounted = useRef(true);
  const [title, setTitle] = useState(block?.title || t('gallery.modalTitle'));
  const [images, setImages] = useState(Array.isArray(block?.config?.images) ? block.config.images : []);
  const [columns, setColumns] = useState(block?.config?.columns || 2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => { mounted.current = false; }, []);

  // Yükleme/kaydetme sürerken kapanmayı engelle (görsel kaybını önler)
  const requestClose = () => { if (!busy) onClose(); };

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    setBusy(true);
    setError('');
    let added = 0;
    let failed = 0;
    for (const file of files) {
      try {
        const form = new FormData();
        form.append('image', file);
        const { url } = await api.upload(`/profiles/${activeId}/gallery-image`, form);
        if (mounted.current) setImages((prev) => [...prev, { url, link: '' }]);
        added += 1;
      } catch {
        failed += 1; // tek dosya başarısız olsa da kalanlara devam et
      }
    }
    if (!mounted.current) return;
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
    if (failed) {
      setError(added
        ? t('gallery.uploadErrorWithAdded', { failed, added })
        : t('gallery.uploadErrorBase', { failed }));
    }
  };

  const removeAt = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const setLink = (i, val) => setImages((prev) => prev.map((im, idx) => (idx === i ? { ...im, link: val } : im)));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await onSave({ title: title.trim() || t('gallery.modalTitle'), config: { images, columns } });
      if (mounted.current) onClose();
    } catch {
      if (mounted.current) setError(t('gallery.saveError'));
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={requestClose}
      title={t('gallery.modalTitle')}
      maxWidth="max-w-xl"
      footer={<>
        <button onClick={requestClose} className="btn-ghost" disabled={busy}>{t('common.cancel')}</button>
        <button onClick={save} className="btn-brand" disabled={busy}>{t('common.save')}</button>
      </>}
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 thin-scroll">
        <div>
          <label className="label">{t('gallery.titleLabel')}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('gallery.modalTitle')} />
        </div>

        <div>
          <label className="label">{t('gallery.columnsLabel')}</label>
          <div className="flex gap-2">
            {[2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setColumns(n)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${columns === n ? 'border-brand-violet bg-brand-violet/10 text-brand-violet' : 'border-line bg-white text-ink-soft hover:bg-surface'}`}
              >
                {t('gallery.columnsOption', { n })}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label mb-0">{t('gallery.imagesLabel')} <span className="font-normal text-muted">({images.length})</span></label>
            <button onClick={() => fileRef.current.click()} className="btn-ghost" disabled={busy}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {t('gallery.addImageBtn')}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
          </div>
          {error && <div className="mb-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          {images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-muted">{t('gallery.empty')}</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.map((im, i) => (
                <div key={im.url || i} className="group relative">
                  <img src={im.url} alt="" className="aspect-square w-full rounded-lg border border-line object-cover" />
                  <button
                    onClick={() => removeAt(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"
                    title={t('gallery.removeTooltip')}
                  >
                    <X size={13} />
                  </button>
                  <input
                    className="input mt-1 px-2 py-1 text-xs"
                    value={im.link || ''}
                    onChange={(e) => setLink(i, e.target.value)}
                    placeholder={t('gallery.linkPlaceholder')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
