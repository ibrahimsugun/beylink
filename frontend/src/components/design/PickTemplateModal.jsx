import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { api } from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getTheme, resolveButton } from '../../lib/themes.js';

// Kayıtlı şablonlardan birini seçip belirli bir profile (ör. bir alt hesaba) uygulama modalı.
export function PickTemplateModal({ targetProfileId, targetLabel, onClose, onApplied }) {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/templates').then((d) => setTemplates(d.templates || [])).catch(() => setTemplates([])).finally(() => setLoading(false));
  }, []);

  const apply = async (tpl) => {
    setApplyingId(tpl.id); setError('');
    try {
      await api.post(`/templates/${tpl.id}/apply`, { profile_id: targetProfileId });
      onApplied(tpl.name);
    } catch (e) { setError(e.message); setApplyingId(null); }
  };

  return (
    <Modal open onClose={applyingId ? undefined : onClose} title={targetLabel ? t('pickTemplate.titleWithTarget', { target: targetLabel }) : t('pickTemplate.title')} maxWidth="max-w-md">
      {loading ? (
        <div className="flex justify-center py-8 text-brand-violet"><Loader2 className="animate-spin" size={22} /></div>
      ) : templates.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted">
          {t('pickTemplate.empty')}
          <Link to="/dashboard/design#my-templates" className="mt-2 block font-semibold text-brand-violet hover:underline">{t('pickTemplate.goToMyTemplates')}</Link>
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">{t('pickTemplate.desc')}</p>
          {error && <div className="mb-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div className="thin-scroll max-h-[52vh] space-y-2 overflow-y-auto">
            {templates.map((tpl) => {
              const th = getTheme(tpl.theme_settings?.template);
              const btn = resolveButton(th, tpl.theme_settings?.buttonStyle);
              return (
                <div key={tpl.id} className="flex items-center gap-3 rounded-xl border border-line p-2">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg" style={th.pageStyle}>
                    <div className="h-1.5 w-7" style={btn} />
                    <div className="h-1.5 w-7" style={btn} />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{tpl.name}</span>
                  <button onClick={() => apply(tpl)} disabled={applyingId != null} className="btn-brand py-1.5 text-xs disabled:opacity-50">
                    {applyingId === tpl.id ? '…' : <><Check size={14} /> {t('pickTemplate.applyBtn')}</>}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
