import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Bookmark, Plus, Download, Upload, Trash2, Users, Check, Copy, Lock, Loader2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { Modal } from '../ui/Modal.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { capsFor } from '../../lib/plans.js';
import { getTheme, resolveButton } from '../../lib/themes.js';

// Şablon mini önizleme (tema arka planı + iki buton çubuğu)
function Swatch({ theme }) {
  const th = getTheme(theme?.template);
  const btn = resolveButton(th, theme?.buttonStyle);
  return (
    <div className="flex h-20 flex-col items-center justify-center gap-1.5 p-2" style={th.pageStyle}>
      <div className="h-5 w-5 rounded-full bg-white/40" />
      <div className="h-2.5 w-14" style={btn} />
      <div className="h-2.5 w-14" style={btn} />
    </div>
  );
}

export function MyTemplatesSection() {
  const { profile, activeId, allProfiles, applyDesignTemplateToActive } = useProfile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportFor, setExportFor] = useState(null); // {code, link, name}
  const [bulkFor, setBulkFor] = useState(null);      // template
  const [applyingId, setApplyingId] = useState(null);
  const [msg, setMsg] = useState('');

  const canBulk = capsFor(user).bulkTemplateApply; // toplu uygula yalnız Pro Plus
  const subProfiles = allProfiles.filter((p) => p._sub);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/templates').then((d) => setTemplates(d.templates || [])).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  // Paylaşım linkinden gelindiyse (?import=CODE) içe aktarma modalını otomatik aç
  useEffect(() => {
    if (params.get('import')) setImportOpen(true);
  }, [params]);

  const flash = (msgText) => { setMsg(msgText); setTimeout(() => setMsg(''), 2500); };

  const applyToActive = async (tpl) => {
    setApplyingId(tpl.id);
    try { await applyDesignTemplateToActive(tpl.id); flash(t('design.myTemplates.appliedFlash', { name: tpl.name })); }
    catch (e) { flash(e.message || t('design.myTemplates.applyError')); }
    finally { setApplyingId(null); }
  };

  const openExport = async (tpl) => {
    try { setExportFor(await api.get(`/templates/${tpl.id}/export`)); }
    catch (e) { flash(e.message); }
  };

  const remove = async (tpl) => {
    if (!confirm(t('design.myTemplates.deleteConfirm', { name: tpl.name }))) return;
    await api.delete(`/templates/${tpl.id}`);
    load();
  };

  return (
    <div id="my-templates" className="card scroll-mt-24 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
          <Bookmark size={15} className="text-brand-violet" /> {t('design.myTemplates.title')}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setImportOpen(true)} className="btn-ghost text-xs"><Upload size={14} /> {t('design.myTemplates.importBtn')}</button>
          <button onClick={() => setSaveOpen(true)} className="btn-soft text-xs"><Plus size={14} /> {t('design.myTemplates.saveBtn')}</button>
        </div>
      </div>

      {msg && <div className="mb-3 rounded-xl bg-brand-violet/10 px-3 py-2 text-xs font-medium text-brand-violet">{msg}</div>}

      {loading ? (
        <div className="flex justify-center py-8 text-brand-violet"><Loader2 className="animate-spin" size={22} /></div>
      ) : templates.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted">
          {t('design.myTemplates.empty')}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {templates.map((tpl) => (
            <div key={tpl.id} className="overflow-hidden rounded-xl border border-line">
              <Swatch theme={tpl.theme_settings} />
              <div className="space-y-2 p-2">
                <div className="truncate text-xs font-bold text-ink" title={tpl.name}>{tpl.name}</div>
                <button
                  onClick={() => applyToActive(tpl)}
                  disabled={applyingId === tpl.id}
                  className="w-full rounded-lg bg-brand-violet/10 py-1.5 text-xs font-bold text-brand-violet transition hover:bg-brand-violet/20 disabled:opacity-50"
                >
                  {applyingId === tpl.id ? '…' : t('design.myTemplates.applyBtn')}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => openExport(tpl)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-surface py-1.5 text-[11px] font-semibold text-ink-soft hover:bg-line/60" title={t('design.myTemplates.exportTooltip')}>
                    <Download size={12} /> {t('design.myTemplates.exportBtn')}
                  </button>
                  <button
                    onClick={() => canBulk && setBulkFor(tpl)}
                    disabled={!canBulk}
                    title={canBulk ? t('design.myTemplates.bulkTooltipEnabled') : t('design.myTemplates.bulkTooltipLocked')}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold ${canBulk ? 'bg-surface text-ink-soft hover:bg-line/60' : 'cursor-not-allowed bg-surface text-muted/50'}`}
                  >
                    {canBulk ? <Users size={12} /> : <Lock size={11} />} {t('design.myTemplates.bulkBtn')}
                  </button>
                  <button onClick={() => remove(tpl)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" title={t('common.delete')}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!canBulk && templates.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <Lock size={12} /> {t('design.myTemplates.bulkUpsellText')}{' '}
          <Link to="/dashboard/plans" className="font-semibold text-brand-violet hover:underline">{t('design.myTemplates.bulkUpsellLink')}</Link>.
        </p>
      )}

      {saveOpen && (
        <SaveModal
          onClose={() => setSaveOpen(false)}
          onSaved={() => { setSaveOpen(false); load(); flash(t('design.myTemplates.savedFlash')); }}
          profileId={activeId}
          defaultName={profile?.display_name ? t('design.saveModal.defaultNameWithProfile', { name: profile.display_name }) : t('design.saveModal.defaultNameFallback')}
        />
      )}
      {importOpen && (
        <ImportModal
          initialCode={params.get('import') || ''}
          onClose={() => { setImportOpen(false); if (params.get('import')) { params.delete('import'); setParams(params, { replace: true }); } }}
          onImported={() => { setImportOpen(false); if (params.get('import')) { params.delete('import'); setParams(params, { replace: true }); } load(); flash(t('design.myTemplates.importedFlash')); }}
        />
      )}
      {exportFor && <ExportModal data={exportFor} onClose={() => setExportFor(null)} />}
      {bulkFor && (
        <BulkModal
          template={bulkFor}
          subProfiles={subProfiles}
          onClose={() => setBulkFor(null)}
          onDone={(n) => { setBulkFor(null); flash(t('design.myTemplates.bulkAppliedFlash', { n })); }}
        />
      )}
    </div>
  );
}

// --- Kaydet ---
function SaveModal({ onClose, onSaved, profileId, defaultName }) {
  const { t } = useLanguage();
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setBusy(true); setError('');
    try { await api.post('/templates', { name, profile_id: profileId }); onSaved(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={t('design.myTemplates.saveBtn')} maxWidth="max-w-sm"
      footer={<>
        <button onClick={onClose} className="btn-ghost">{t('common.cancel')}</button>
        <button onClick={save} disabled={busy || !name.trim()} className="btn-brand disabled:opacity-50">{busy ? '…' : t('common.save')}</button>
      </>}>
      <p className="mb-3 text-sm text-muted">{t('design.saveModal.desc')}</p>
      <label className="label">{t('design.saveModal.nameLabel')}</label>
      <input className="input" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('design.saveModal.namePlaceholder')} autoFocus />
      {error && <div className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
    </Modal>
  );
}

// --- İçeri Aktar ---
function ImportModal({ onClose, onImported, initialCode }) {
  const { t } = useLanguage();
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const doImport = async () => {
    setBusy(true); setError('');
    try { await api.post('/templates/import', { code: code.trim(), name: name.trim() || undefined }); onImported(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={t('design.importModal.title')} maxWidth="max-w-sm"
      footer={<>
        <button onClick={onClose} className="btn-ghost">{t('common.cancel')}</button>
        <button onClick={doImport} disabled={busy || !code.trim()} className="btn-brand disabled:opacity-50">{busy ? '…' : t('design.myTemplates.importBtn')}</button>
      </>}>
      <p className="mb-3 text-sm text-muted">{t('design.importModal.desc')}</p>
      <label className="label">{t('design.importModal.codeLabel')}</label>
      <textarea className="input min-h-[80px] resize-none font-mono text-xs" value={code} onChange={(e) => setCode(e.target.value)} placeholder="BLT1.…" autoFocus />
      <label className="label mt-3">{t('design.importModal.nameLabel')} <span className="font-normal text-muted">{t('design.importModal.nameHint')}</span></label>
      <input className="input" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('design.importModal.namePlaceholder')} />
      {error && <div className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
    </Modal>
  );
}

// --- Dışa Aktar ---
function ExportModal({ data, onClose }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState('');
  const copy = (text, which) => { navigator.clipboard?.writeText(text); setCopied(which); setTimeout(() => setCopied(''), 1500); };
  // Paylaşım linkini istemcinin GERÇEK origin'inden üret → sunucu APP_URL'i yanlış portta olsa bile doğru.
  const shareLink = `${window.location.origin}/dashboard/design?import=${encodeURIComponent(data.code)}`;
  return (
    <Modal open onClose={onClose} title={t('design.exportModal.title')} maxWidth="max-w-md">
      <p className="mb-3 text-sm text-muted">{t('design.exportModal.desc')}</p>
      <label className="label">{t('design.exportModal.codeLabel')}</label>
      <div className="flex gap-2">
        <textarea readOnly className="input min-h-[70px] flex-1 resize-none font-mono text-xs" value={data.code} onClick={(e) => e.target.select()} />
        <button onClick={() => copy(data.code, 'code')} className="btn-soft shrink-0 self-start">{copied === 'code' ? <Check size={14} /> : <Copy size={14} />}</button>
      </div>
      <label className="label mt-3">{t('design.exportModal.linkLabel')}</label>
      <div className="flex gap-2">
        <input readOnly className="input flex-1 font-mono text-xs" value={shareLink} onClick={(e) => e.target.select()} />
        <button onClick={() => copy(shareLink, 'link')} className="btn-soft shrink-0">{copied === 'link' ? <Check size={14} /> : <Copy size={14} />}</button>
      </div>
    </Modal>
  );
}

// --- Alt hesaplara TOPLU uygula (Pro Plus) ---
function BulkModal({ template, subProfiles, onClose, onDone }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(() => new Set());
  const [stage, setStage] = useState('pick'); // pick | busy
  const [error, setError] = useState('');
  const allSelected = subProfiles.length > 0 && selected.size === subProfiles.length;

  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(subProfiles.map((p) => p.id)));

  const apply = async () => {
    setStage('busy'); setError('');
    try {
      const r = await api.post(`/templates/${template.id}/apply-bulk`, { profile_ids: [...selected] });
      onDone(r.applied?.length || 0);
    } catch (e) { setError(e.message); setStage('pick'); }
  };

  return (
    <Modal open onClose={stage === 'busy' ? undefined : onClose} title={t('design.bulkModal.titleTemplate', { name: template.name })} maxWidth="max-w-md">
      {subProfiles.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted">{t('design.bulkModal.empty')}</p>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-muted">{t('design.bulkModal.pickPrompt')}</p>
            <button onClick={toggleAll} className="text-xs font-semibold text-brand-violet hover:underline">{allSelected ? t('design.bulkModal.deselectAll') : t('design.bulkModal.selectAll')}</button>
          </div>
          <div className="thin-scroll max-h-[46vh] space-y-1.5 overflow-y-auto">
            {subProfiles.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3 py-2 hover:bg-surface">
                <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-brand-violet" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{p.display_name || p.sub_username}</span>
                  <span className="block truncate text-xs text-muted">/{p.username}</span>
                </span>
              </label>
            ))}
          </div>
          {error && <div className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div className="mt-4 flex gap-2">
            <button onClick={onClose} disabled={stage === 'busy'} className="btn-ghost flex-1">{t('common.cancel')}</button>
            <button onClick={apply} disabled={stage === 'busy' || selected.size === 0} className="btn-brand flex-1 disabled:opacity-50">
              {stage === 'busy' ? '…' : t('design.bulkModal.applyBtn', { count: selected.size })}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
