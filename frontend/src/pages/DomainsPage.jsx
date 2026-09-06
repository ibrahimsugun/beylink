import { useCallback, useEffect, useState } from 'react';
import { Globe, Plus, Trash2, RefreshCw, Copy, Check, Crown, AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../api/client.js';
import { capsFor } from '../lib/plans.js';
import { Spinner } from '../components/ui/Spinner.jsx';

const STATUS_STYLES = {
  pending: { cls: 'bg-warning/10 text-warning', Icon: Clock },
  verifying: { cls: 'bg-warning/10 text-warning', Icon: RefreshCw },
  active: { cls: 'bg-success/10 text-success', Icon: CheckCircle2 },
  error: { cls: 'bg-danger/10 text-danger', Icon: AlertTriangle },
};

// Girdiyi normalizeDomain gibi soyar (şema/path/port/sondaki nokta/lider www) — tip sezgisi
// ve subdomain etiket kontrolü backend ile aynı şekli görsün diye.
function bareDomain(v) {
  return String(v || '').trim().toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
    .split('/')[0].split('?')[0].split('#')[0]
    .replace(/:\d+$/, '').replace(/\.$/, '').replace(/^www\./, '');
}
const labelCount = (v) => bareDomain(v).split('.').filter(Boolean).length;

// A6: hesap başına 1 domain. Talimatlar tipe göre (tek gerçek kaynak backend withInstructions):
//   apex      → A(@ · aRecord config'de boşsa dev'de gizli) + CNAME(www) + TXT
//   subdomain → CNAME(tam alt alan = cnameHost) + TXT; A satırı YOK
function dnsRows(domain, t) {
  const inst = domain.instructions || {};
  const kind = inst.kind || domain.kind || 'apex';
  const txtRow = { key: 'txt', type: 'TXT', host: '_beylink-verify', value: inst.txtValue, label: t('domains.dnsTxtLabel'), hint: t('domains.dnsTxtHint') };
  if (kind === 'subdomain') {
    return [
      { key: 'cname', type: 'CNAME', host: inst.cnameHost, value: inst.cnameTarget, label: t('domains.dnsSubdomainCnameLabel'), hint: t('domains.dnsSubdomainCnameHint') },
      { ...txtRow, host: inst.txtHost || '_beylink-verify' },
    ];
  }
  const rows = [];
  if (inst.aRecord) {
    rows.push({ key: 'a', type: 'A', host: '@', value: inst.aRecord, label: t('domains.dnsARecordLabel'), hint: t('domains.dnsARecordHint') });
  }
  rows.push({ key: 'cname', type: 'CNAME', host: 'www', value: inst.cnameTarget, label: t('domains.dnsCnameLabel'), hint: t('domains.dnsCnameHint') });
  rows.push(txtRow);
  return rows;
}

export default function DomainsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainInput, setDomainInput] = useState('');
  const [kind, setKind] = useState('apex');       // 'apex' | 'subdomain' — kullanıcı seçer (A1)
  const [kindTouched, setKindTouched] = useState(false); // kullanıcı toggle'a dokununca sezgi durur
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);

  // Girdi değişince, kullanıcı henüz manuel seçmediyse tipi etiket sayısına göre öner (≥3 → subdomain).
  const onDomainChange = (val) => {
    setDomainInput(val);
    if (!kindTouched) setKind(labelCount(val) >= 3 ? 'subdomain' : 'apex');
  };
  const chooseKind = (k) => { setKind(k); setKindTouched(true); };

  const load = useCallback(async () => {
    if (!capsFor(user).brandedDomain) return;
    setLoading(true);
    try {
      const d = await api.get('/domains');
      setDomains(d.domains || []);
    } catch {
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    const value = domainInput.trim();
    setError('');
    if (!value) { setError(t('domains.errorEmpty')); return; }
    // İstemci ön-kontrolü (backend de 400 ile zorlar): subdomain modu bir alt alan adı öneki ister.
    if (kind === 'subdomain' && labelCount(value) < 3) { setError(t('domains.errorSubdomainNeedsLabel')); return; }
    setBusy(true);
    try {
      await api.post('/domains', { domain: value, kind });
      setDomainInput('');
      setKindTouched(false);
      await load();
    } catch (e) {
      setError(e.message || t('domains.errorAddFailed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    setError('');
    try {
      await api.delete(`/domains/${id}`);
      await load();
    } catch (e) {
      setError(e.message || t('domains.errorRemoveFailed'));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (id) => {
    setBusy(true);
    setError('');
    try {
      const d = await api.post(`/domains/${id}/verify`);
      setDomains((prev) => prev.map((x) => (x.id === id ? d.domain : x)));
    } catch (e) {
      setError(e.message || t('domains.errorVerifyFailed'));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch { /* pano yok — sessiz geç */ }
  };

  // Free/Basic/Pro — proplus dışı: özelliği göster ama yükseltmeye yönlendir (A5)
  if (!capsFor(user).brandedDomain) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-2xl font-extrabold text-ink">{t('domains.title')}</h1>
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Crown size={26} /></span>
          <p className="text-lg font-bold text-ink">{t('domains.locked.heading')}</p>
          <p className="max-w-sm text-sm text-muted">{t('domains.locked.desc')}</p>
          <Link to="/dashboard/plans" className="btn-brand mt-1">{t('common.upgradeCta')}</Link>
        </div>
      </div>
    );
  }

  const domain = domains[0] || null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-center gap-2">
        <Globe size={22} className="text-brand-violet" />
        <h1 className="text-2xl font-extrabold text-ink">{t('domains.title')}</h1>
      </div>
      <p className="mb-5 text-sm text-muted">{t('domains.intro')}</p>

      {loading ? (
        <div className="flex justify-center py-16 text-brand-violet"><Spinner size={26} /></div>
      ) : !domain ? (
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Plus size={16} className="text-brand-violet" /> {t('domains.addLabel')}
          </div>

          {/* Tip seçimi (apex / subdomain) — kullanıcı açıkça seçer (A1) */}
          <div className="mb-3">
            <div className="inline-flex rounded-xl border border-line p-1">
              {['apex', 'subdomain'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => chooseKind(k)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${kind === k ? 'bg-brand-violet text-white' : 'text-muted hover:text-ink'}`}
                >
                  {t(k === 'apex' ? 'domains.kindApex' : 'domains.kindSubdomain')}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">{t(kind === 'subdomain' ? 'domains.kindSubdomainHint' : 'domains.kindApexHint')}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              className="input font-mono"
              value={domainInput}
              onChange={(e) => onDomainChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder={t(kind === 'subdomain' ? 'domains.addPlaceholderSubdomain' : 'domains.addPlaceholder')}
              maxLength={255}
            />
            <button onClick={create} className="btn-brand" disabled={busy}>
              <Plus size={16} /> {t('common.add')}
            </button>
          </div>
          {error && <div className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Durum kartı */}
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-mono text-base font-bold text-ink">{domain.domain}</div>
                <div className="mt-1.5">
                  {(() => {
                    const s = STATUS_STYLES[domain.status] || STATUS_STYLES.pending;
                    const S = s.Icon;
                    return (
                      <span className={`chip inline-flex items-center gap-1 ${s.cls}`}>
                        <S size={12} /> {t(`domains.status.${domain.status}`)}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => verify(domain.id)} className="btn-ghost" disabled={busy}>
                  <RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> {t('domains.verifyCta')}
                </button>
                <button onClick={() => remove(domain.id)} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger" title={t('domains.removeTooltip')} disabled={busy}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {domain.status === 'error' && domain.last_error && (
              <div className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{domain.last_error}</div>
            )}
            {domain.status === 'active' && (
              <div className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">{t('domains.activeHint')}</div>
            )}
            {error && <div className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          </div>

          {/* DNS talimatları */}
          <div className="card p-5">
            <div className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
              <Info size={16} className="text-brand-violet" /> {t('domains.dnsTitle')}
            </div>
            <p className="mb-4 text-xs text-muted">{t('domains.dnsIntro')}</p>

            {/* Cloudflare/proxy uyarısı — her tipte görünür (proxy TURUNCU olursa doğrulama+SSL kırılır, A6) */}
            <div className="mb-4 flex gap-2 rounded-xl bg-warning/10 px-3 py-2.5">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink">{t('domains.dnsProxyWarningTitle')}</div>
                <p className="mt-0.5 text-xs text-muted">{t('domains.dnsProxyWarning')}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[420px] text-xs">
                <thead>
                  <tr className="border-b border-line bg-surface text-left">
                    <th className="px-3 py-2 font-bold text-ink-soft">{t('domains.dnsTypeLabel')}</th>
                    <th className="px-3 py-2 font-bold text-ink-soft">{t('domains.dnsHostLabel')}</th>
                    <th className="px-3 py-2 font-bold text-ink-soft">{t('domains.dnsValueLabel')}</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {dnsRows(domain, t).map((row) => (
                    <tr key={row.key} className="border-b border-line/60 last:border-0">
                      <td className="px-3 py-2.5">
                        <span className="chip bg-brand-violet/10 font-mono text-brand-violet">{row.type}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-ink">{row.host}</td>
                      <td className="max-w-[200px] truncate px-3 py-2.5 font-mono text-ink" title={row.value || ''}>{row.value || '—'}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => copy(row.value, row.key)}
                          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-brand-violet disabled:opacity-30"
                          title={t('domains.copyTooltip')}
                          disabled={!row.value}
                        >
                          {copied === row.key ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 space-y-1.5 text-xs text-muted">
              {dnsRows(domain, t).map((row) => (
                <li key={row.key}><strong className="text-ink-soft">{row.label}:</strong> {row.hint}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{t('domains.dnsPropagationNote')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
