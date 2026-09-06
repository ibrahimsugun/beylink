import { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Icon, SOCIAL_CATALOG, socialLabel } from '../../lib/icons.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function AddSocialModal({ open, onClose, onAdd }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [url, setUrl] = useState('');

  const reset = () => { setSelected(null); setUrl(''); };
  const close = () => { reset(); onClose(); };

  const submit = async () => {
    if (!selected || !url) return;
    await onAdd({ type: 'social', title: socialLabel(selected, t), icon_name: selected.key, url: url.trim() });
    close();
  };

  return (
    <Modal open={open} onClose={close} title={t('addSocial.title')} maxWidth="max-w-lg">
      {!selected ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SOCIAL_CATALOG.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelected(s)}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-3 text-sm font-semibold text-ink-soft transition hover:border-brand-violet hover:text-brand-violet"
            >
              <Icon name={s.key} size={18} /> {socialLabel(s, t)}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-brand-violet/10 px-3 py-2 text-sm font-semibold text-brand-violet">
            <Icon name={selected.key} size={18} /> {socialLabel(selected, t)}
          </div>
          <div>
            <label className="label">{t('addSocial.urlLabel')}</label>
            <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={selected.placeholder} autoFocus />
          </div>
          <div className="flex justify-between">
            <button onClick={() => setSelected(null)} className="btn-ghost">← {t('common.back')}</button>
            <button onClick={submit} className="btn-brand" disabled={!url}>{t('common.add')}</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
