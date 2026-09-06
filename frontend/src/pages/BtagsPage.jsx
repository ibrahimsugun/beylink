import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tag, Plus, Trash2, Copy, Check, Info, Sparkles, MousePointerClick, BarChart3, Users, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../api/client.js';
import { capsFor } from '../lib/plans.js';
import { Spinner } from '../components/ui/Spinner.jsx';

const VALUE_RE = /^[A-Za-z0-9_.-]{1,64}$/;

export default function BtagsPage() {
  const { activeId, profile, canEdit, refreshBtags } = useProfile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null); // { btags, discovered }
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    if (!activeId || !capsFor(user).btag) return; // Free: endpoint 403 → boşuna isteme (kapı aşağıda)
    setLoading(true);
    try {
      setData(await api.get(`/btags/${activeId}`));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeId, user]);

  useEffect(() => { load(); }, [load]);

  const create = async (v = value, l = label) => {
    const val = (v || '').trim();
    setError('');
    if (!VALUE_RE.test(val)) { setError(t('btags.errorInvalidValue')); return; }
    setBusy(true);
    try {
      await api.post(`/btags/${activeId}`, { value: val, label: (l || '').trim() || null });
      setValue(''); setLabel('');
      await load();
      refreshBtags();
    } catch (e) {
      setError(e.message || t('btags.errorAddFailed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await api.delete(`/btags/${activeId}/${id}`);
      await load();
      refreshBtags();
    } catch (e) {
      setError(e.message || t('btags.errorDeleteFailed'));
    } finally {
      setBusy(false);
    }
  };

  const linkFor = (v) => `${window.location.origin}/${profile?.username}?btag=${encodeURIComponent(v)}`;
  const copy = async (v) => {
    try {
      await navigator.clipboard.writeText(linkFor(v));
      setCopied(v);
      setTimeout(() => setCopied((c) => (c === v ? null : c)), 1500);
    } catch { /* pano yok — sessiz geç */ }
  };

  const registered = data?.btags || [];
  const discovered = data?.discovered || [];
  const rankedRegistered = useMemo(() => [...registered].sort((a, b) => (b.visitors || 0) - (a.visitors || 0)), [registered]);
  const totals = useMemo(() => {
    const all = [...registered, ...discovered];
    return {
      visitors: all.reduce((s, r) => s + (r.visitors || 0), 0),
      clicks: all.reduce((s, r) => s + (r.clicks || 0), 0),
    };
  }, [registered, discovered]);
  const maxVisitors = Math.max(1, ...registered.map((b) => b.visitors || 0), ...discovered.map((d) => d.visitors || 0));

  // BTAG yalnızca Basic+ — Free planda yükseltme kartı (SeoPage deseni)
  if (!capsFor(user).btag) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-2xl font-extrabold text-ink">{t('btags.title')}</h1>
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Crown size={26} /></span>
          <p className="text-lg font-bold text-ink">{t('btags.locked.heading')}</p>
          <p className="max-w-sm text-sm text-muted">{t('btags.locked.desc')}</p>
          <Link to="/dashboard/plans" className="btn-brand mt-1">{t('common.upgradeCta')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-2 flex items-center gap-2">
        <Tag size={22} className="text-brand-violet" />
        <h1 className="text-2xl font-extrabold text-ink">{t('btags.title')}</h1>
      </div>
      <p className="mb-5 text-sm text-muted">
        {t('btags.intro')}
      </p>

      {/* Yeni BTAG formu */}
      {canEdit && (
        <div className="card mb-5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Plus size={16} className="text-brand-violet" /> {t('btags.newBtagLabel')}
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="label">{t('btags.codeLabel')} <span className="font-normal text-muted">{t('btags.codeHint')}</span></label>
              <input
                className="input font-mono"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && create()}
                placeholder={t('btags.codePlaceholder')}
                maxLength={64}
              />
            </div>
            <div>
              <label className="label">{t('btags.nameLabel')} <span className="font-normal text-muted">{t('btags.nameHint')}</span></label>
              <input
                className="input"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && create()}
                placeholder={t('btags.namePlaceholder')}
                maxLength={80}
              />
            </div>
            <div className="flex items-end">
              <button onClick={() => create()} className="btn-brand w-full sm:w-auto" disabled={busy}>
                <Plus size={16} /> {t('common.add')}
              </button>
            </div>
          </div>
          {error && <div className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-brand-violet"><Spinner size={26} /></div>
      ) : !data ? (
        <div className="card px-6 py-12 text-center text-muted">{t('btags.loadError')}</div>
      ) : (
        <>
          {/* Kayıtlı BTAG'ler */}
          <div className="card mb-5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-ink">{t('btags.registeredTitle')} <span className="font-normal text-muted">({registered.length})</span></span>
            </div>
            {registered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-muted">
                {t('btags.registeredEmpty')}
              </div>
            ) : (
              <div className="space-y-2">
                {registered.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                    <span className="rounded-lg bg-brand-violet/10 px-2 py-1 font-mono text-xs font-bold text-brand-violet">{b.value}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">{b.label || b.value}</div>
                      <button onClick={() => copy(b.value)} className="mt-0.5 flex items-center gap-1 text-[11px] text-muted hover:text-brand-violet" title={t('btags.copyLinkTooltip')}>
                        {copied === b.value ? <><Check size={12} /> {t('topbar.copied')}</> : <><Copy size={12} /> {t('btags.copyLinkText')}</>}
                      </button>
                    </div>
                    <span className="flex items-center gap-3 font-mono text-sm font-bold">
                      <span className="flex items-center gap-1 text-ink" title={t('btags.visitorTooltipLong')}><Users size={14} className="text-brand-violet" /> {b.visitors}</span>
                      <span className="flex items-center gap-1 text-muted" title={t('btags.clickTooltipLong')}><MousePointerClick size={13} /> {b.clicks}</span>
                    </span>
                    {canEdit && (
                      <button onClick={() => remove(b.id)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" title={t('btags.deleteTooltip')} disabled={busy}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TAG İstatistiği */}
          <div className="card p-5">
            <div className="mb-1 flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-teal" />
              <h2 className="text-sm font-bold text-ink">{t('btags.statsTitle')}</h2>
            </div>
            <p className="mb-4 text-xs text-muted">
              {t('btags.statsSummary', { visitors: totals.visitors, clicks: totals.clicks })}
            </p>

            {rankedRegistered.length === 0 && discovered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">{t('btags.statsEmpty')}</div>
            ) : (
              <div className="space-y-4">
                {rankedRegistered.length > 0 && (
                  <div className="space-y-2.5">
                    {rankedRegistered.map((b) => (
                      <div key={b.id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="truncate text-ink-soft">
                            <span className="font-mono text-xs text-brand-violet">{b.value}</span>
                            {b.label && <span className="ml-2 text-muted">· {b.label}</span>}
                          </span>
                          <span className="flex items-center gap-2 font-mono font-semibold">
                            <span className="flex items-center gap-1 text-ink" title={t('btags.visitorTooltipShort')}><Users size={13} className="text-brand-violet" /> {b.visitors}</span>
                            <span className="flex items-center gap-1 text-muted" title={t('btags.clickTooltipShort')}><MousePointerClick size={12} /> {b.clicks}</span>
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(b.visitors / maxVisitors) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Keşfedilen — trafikte görülüp kayıtlı olmayan BTAG'ler */}
                {discovered.length > 0 && (
                  <div className="rounded-xl border border-line bg-surface/50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                      <Sparkles size={14} className="text-brand-teal" /> {t('btags.discoveredTitle')}
                      <span className="group relative">
                        <Info size={13} className="text-muted" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-52 -translate-x-1/2 rounded-lg bg-ink px-2 py-1.5 text-[11px] font-normal text-white opacity-0 transition group-hover:opacity-100">
                          {t('btags.discoveredTooltip')}
                        </span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      {discovered.map((d) => (
                        <div key={d.value} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2">
                          <span className="rounded-lg bg-brand-teal/10 px-2 py-1 font-mono text-xs font-bold text-brand-teal">{d.value}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                            <div className="h-full rounded-full bg-brand-teal/70" style={{ width: `${(d.visitors / maxVisitors) * 100}%` }} />
                          </div>
                          <span className="flex items-center gap-2 font-mono text-sm font-bold">
                            <span className="flex items-center gap-1 text-ink" title={t('btags.visitorTooltipShort')}><Users size={13} className="text-brand-teal" /> {d.visitors}</span>
                            <span className="flex items-center gap-1 text-muted" title={t('btags.clickTooltipShort')}><MousePointerClick size={12} /> {d.clicks}</span>
                          </span>
                          {canEdit && (
                            <button onClick={() => create(d.value, '')} className="btn-ghost text-xs" disabled={busy} title={t('btags.discoveredAddTooltip')}>
                              <Plus size={13} /> {t('common.add')}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
