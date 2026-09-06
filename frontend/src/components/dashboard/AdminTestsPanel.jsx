// Sistem testleri panelini render eder — AdminDashboard'daki "Testler" sekmesinin içeriği.
// Kategori bazlı gruplu; tekli/toplu tetikleme, otomatik polling (çalışan test varken 1s),
// tıklandığında detay modalı. Backend testleri seri kuyrukta işler; UI bunu göstermek için
// running olanı ⌛, biteni ✓/✗ olarak günceller.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlaskConical, Play, PlayCircle, Loader2, CheckCircle2, XCircle, AlertTriangle, Info, Search, X } from 'lucide-react';
import { api } from '../../api/client.js';
import { Modal } from '../ui/Modal.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const STATUS_LABEL_KEY = {
  running: 'admin.tests.status.running',
  passed: 'admin.tests.status.passed',
  failed: 'admin.tests.status.failed',
  error: 'admin.tests.status.error',
};

function StatusBadge({ running, lastRun, t }) {
  if (running) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-violet/10 px-2 py-0.5 text-[11px] font-semibold text-brand-violet">
        <Loader2 size={11} className="animate-spin" /> {t('admin.tests.status.running')}
      </span>
    );
  }
  if (!lastRun) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted">{t('admin.tests.status.neverRun')}</span>;
  }
  if (lastRun.ok) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
        <CheckCircle2 size={11} /> {t('admin.tests.status.passed')}
      </span>
    );
  }
  const cls = lastRun.status === 'error' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger';
  const Icon = lastRun.status === 'error' ? AlertTriangle : XCircle;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      <Icon size={11} /> {STATUS_LABEL_KEY[lastRun.status] ? t(STATUS_LABEL_KEY[lastRun.status]) : lastRun.status}
    </span>
  );
}

// SQLite datetime saniye çözünürlüğünde tuttuğu için ms kaybolur → önce sunucu-hesaplı
// details.elapsed_ms'i tercih et; yoksa iki saniye alanı arasındaki farkı kullan.
function elapsedMs(l) {
  if (!l) return null;
  if (Number.isFinite(l.details?.elapsed_ms)) return l.details.elapsed_ms;
  if (!l.finished_at) return null;
  const a = new Date(String(l.started_at).replace(' ', 'T') + 'Z').getTime();
  const b = new Date(String(l.finished_at).replace(' ', 'T') + 'Z').getTime();
  const d = b - a;
  return Number.isFinite(d) && d >= 0 ? d : null;
}

export function AdminTestsPanel() {
  const { t } = useLanguage();
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(new Set()); // client-side "just clicked" seti
  const [detail, setDetail] = useState(null);              // { test, run }
  const [detailLoading, setDetailLoading] = useState(false);
  const [query, setQuery] = useState('');                   // arama
  const [statusFilter, setStatusFilter] = useState('all');  // all | passed | failed | never | running

  const load = useCallback(async () => {
    try {
      const r = await api.get('/admin/tests');
      setTests(r.tests || []);
      setCategories(r.categories || []);
    } catch { /* sessiz */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Aktif test varsa 1 saniyede bir yenile — biten testin durumu UI'a otururken
  // kullanıcı manuel refresh yapmasın. Hiçbir aktif yoksa polling durur (idle CPU sıfır).
  const anyRunning = useMemo(() => tests.some((test) => test.running), [tests]);
  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(load, 1000);
    return () => clearInterval(id);
  }, [anyRunning, load]);

  const runOne = async (id) => {
    setTriggering((s) => new Set(s).add(id));
    try {
      await api.post(`/admin/tests/${id}/run`);
      await load();
    } catch (e) {
      alert(e.message || t('admin.tests.errorRunOne'));
    } finally {
      setTriggering((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  const runAll = async () => {
    if (!window.confirm(t('admin.tests.confirmRunAll', { count: tests.length }))) return;
    try {
      await api.post('/admin/tests/run-all');
      await load();
    } catch (e) {
      alert(e.message || t('admin.tests.errorRunAll'));
    }
  };

  const openDetail = async (test) => {
    if (!test.last_run) return;
    setDetail({ test, run: null });
    setDetailLoading(true);
    try {
      const r = await api.get(`/admin/tests/runs/${test.last_run.id}`);
      setDetail({ test, run: r.run });
    } catch (e) {
      setDetail({ test, run: { error: e.message } });
    } finally {
      setDetailLoading(false);
    }
  };

  // Arama + status filtresi uygulanmış görünen testler
  const visibleTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((test) => {
      if (q && !`${test.id} ${test.name} ${test.category} ${test.description}`.toLowerCase().includes(q)) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'running') return !!test.running;
      if (statusFilter === 'never') return !test.last_run && !test.running;
      if (statusFilter === 'passed') return test.last_run?.ok;
      if (statusFilter === 'failed') return test.last_run && !test.last_run.ok;
      return true;
    });
  }, [tests, query, statusFilter]);

  const grouped = useMemo(() => {
    const g = {};
    for (const test of visibleTests) { (g[test.category] = g[test.category] || []).push(test); }
    return g;
  }, [visibleTests]);

  const summary = useMemo(() => {
    const s = { pass: 0, fail: 0, err: 0, run: 0, none: 0 };
    for (const test of tests) {
      if (test.running) s.run++;
      else if (!test.last_run) s.none++;
      else if (test.last_run.ok) s.pass++;
      else if (test.last_run.status === 'error') s.err++;
      else s.fail++;
    }
    return s;
  }, [tests]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-violet" size={26} /></div>;

  return (
    <div className="space-y-4">
      {/* Üst bar: özet + toplu tetik */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 text-sm">
          <FlaskConical size={16} className="text-brand-violet" />
          <span className="font-semibold text-ink">{t('admin.tests.summary', { count: tests.length })}</span>
          <span className="text-muted">·</span>
          <span className="chip bg-success/10 text-success">✓ {summary.pass}</span>
          <span className="chip bg-danger/10 text-danger">✗ {summary.fail}</span>
          {summary.err > 0 && <span className="chip bg-warning/10 text-warning">⚠ {summary.err}</span>}
          {summary.run > 0 && <span className="chip bg-brand-violet/10 text-brand-violet">⌛ {summary.run}</span>}
          {summary.none > 0 && <span className="chip bg-surface text-muted">… {summary.none}</span>}
        </div>
        <button onClick={runAll} className="btn-brand inline-flex items-center gap-1.5 text-sm">
          <PlayCircle size={16} /> {t('admin.tests.runAllBtn')}
        </button>
      </div>

      {/* Arama + status filtresi */}
      <div className="card flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('admin.tests.searchPlaceholder')}
            className="w-full rounded-xl border border-line bg-white py-2 pl-9 pr-9 text-sm text-ink outline-none focus:border-brand-violet"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:bg-surface hover:text-ink"
              title={t('admin.tests.clearTitle')}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1 text-xs">
          {[
            { k: 'all', l: t('admin.tests.filter.all'), cnt: tests.length },
            { k: 'passed', l: t('admin.tests.filter.passed'), cnt: summary.pass },
            { k: 'failed', l: t('admin.tests.status.failed'), cnt: summary.fail + summary.err },
            { k: 'running', l: t('admin.tests.status.running'), cnt: summary.run },
            { k: 'never', l: t('admin.tests.filter.never'), cnt: summary.none },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setStatusFilter(f.k)}
              className={`rounded-lg border px-2.5 py-1 font-semibold transition ${
                statusFilter === f.k ? 'border-brand-violet bg-brand-violet text-white' : 'border-line bg-white text-ink-soft hover:border-brand-violet'
              }`}
            >
              {f.l} <span className="ml-1 opacity-70">{f.cnt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Boş sonuç durumu */}
      {visibleTests.length === 0 && (
        <div className="card p-8 text-center text-sm text-muted">
          {t('admin.tests.emptyState')} <button onClick={() => { setQuery(''); setStatusFilter('all'); }} className="font-semibold text-brand-violet hover:underline">{t('admin.tests.clearFilterBtn')}</button>
        </div>
      )}

      {/* Kategori grupları */}
      {categories.filter((c) => grouped[c]?.length).map((cat) => (
        <div key={cat} className="card overflow-hidden p-0">
          <div className="border-b border-line bg-surface px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted">{cat}</div>
          <ul className="divide-y divide-line">
            {grouped[cat].map((test) => {
              const isRunning = test.running || triggering.has(test.id);
              const ms = elapsedMs(test.last_run);
              return (
                <li key={test.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface/40">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{test.name}</span>
                      <StatusBadge running={isRunning} lastRun={test.last_run} t={t} />
                      {ms != null && !isRunning && <span className="text-[11px] font-mono text-muted">{ms}ms</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{test.description}</div>
                    {test.last_run?.summary && !test.last_run.ok && (
                      <div className="mt-1 rounded bg-danger/5 px-2 py-1 text-[11px] font-mono text-danger">{test.last_run.summary}</div>
                    )}
                    <div className="mt-1 text-[11px] font-mono text-muted">{test.id}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {test.last_run && (
                      <button
                        onClick={() => openDetail(test)}
                        className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-ink-soft hover:border-brand-violet hover:text-brand-violet"
                        title={t('admin.tests.detailBtnTitle')}
                      >
                        <Info size={13} className="inline" /> {t('admin.tests.detailBtn')}
                      </button>
                    )}
                    <button
                      onClick={() => runOne(test.id)}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-violet/10 px-2 py-1 text-xs font-semibold text-brand-violet hover:bg-brand-violet hover:text-white disabled:opacity-50"
                    >
                      {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} {t('admin.tests.runBtn')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {detail && (
        <Modal open onClose={() => setDetail(null)} title={detail.test.name} maxWidth="max-w-2xl">
          <div className="mb-3 space-y-1 text-xs text-muted">
            <div><span className="font-semibold text-ink">{t('admin.tests.detail.testId')}</span> <span className="font-mono">{detail.test.id}</span></div>
            <div><span className="font-semibold text-ink">{t('admin.tests.detail.description')}</span> {detail.test.description}</div>
          </div>
          {detailLoading || !detail.run ? (
            <div className="flex justify-center py-10 text-brand-violet"><Loader2 className="animate-spin" size={24} /></div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge running={false} lastRun={detail.run} t={t} />
                {detail.run.details?.elapsed_ms != null && (
                  <span className="chip bg-surface font-mono text-ink-soft">{detail.run.details.elapsed_ms}ms</span>
                )}
                <span className="text-muted">{t('admin.tests.detail.timing', { started: detail.run.started_at, finished: detail.run.finished_at || '—' })}</span>
              </div>
              {detail.run.summary && !detail.run.ok && (
                <div className="mb-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
                  <div className="font-semibold">{t('admin.tests.detail.summaryLabel', { summary: detail.run.summary })}</div>
                </div>
              )}
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('admin.tests.detail.logs')}</div>
              <pre className="max-h-80 overflow-auto rounded-xl bg-ink px-3 py-2 font-mono text-[11px] leading-relaxed text-white/90">
                {(detail.run.details?.logs || []).map((l, i) => {
                  const c = l.level === 'fail' ? 'text-red-400' : l.level === 'ok' ? 'text-emerald-300' : l.level === 'step' ? 'text-brand-teal' : 'text-white/70';
                  return <div key={i} className={c}>{l.msg}</div>;
                })}
                {!(detail.run.details?.logs || []).length && <div className="text-white/50">{t('admin.tests.detail.noLogs')}</div>}
              </pre>
              {detail.run.details?.error?.stack && (
                <>
                  <div className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('admin.tests.detail.errorStack')}</div>
                  <pre className="max-h-48 overflow-auto rounded-xl bg-danger/5 px-3 py-2 font-mono text-[11px] leading-relaxed text-danger">
                    {detail.run.details.error.stack}
                  </pre>
                </>
              )}
            </>
          )}
          <div className="mt-4 text-right">
            <button onClick={() => setDetail(null)} className="btn-ghost">{t('common.close')}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
