import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { Eye, Users, MousePointerClick, Percent, Download, Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api, tokenStore } from '../api/client.js';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Icon } from '../lib/icons.jsx';
import { capsFor } from '../lib/plans.js';

const RANGE_KEYS = ['all', '1h', 'today', '24h', '7d', '30d', '90d'];
const DEVICE_COLORS = { mobile: '#6D3BEA', desktop: '#12C4B0', tablet: '#F5A524', unknown: '#B7BECF' };
const FREE_RANGE_KEYS = ['7d', '30d', 'all'];

function Stat({ icon: I, label, value, tint }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${tint}1a`, color: tint }}><I size={16} /></span>
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { activeId, profile } = useProfile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const caps = capsFor(user);
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const RANGES = RANGE_KEYS.map((key) => ({ key, label: t(`analytics.range.${key}`) }));
  const ranges = caps.analyticsAdvanced ? RANGES : RANGES.filter((r) => FREE_RANGE_KEYS.includes(r.key));
  const DEVICE_LABELS = { mobile: t('analytics.device.mobile'), desktop: t('analytics.device.desktop'), tablet: t('analytics.device.tablet'), unknown: t('analytics.device.unknown') };

  useEffect(() => {
    if (!activeId) return;
    let active = true; // eski istek geç dönerse yenisini ezmesin
    setLoading(true);
    api.get(`/analytics/${activeId}?range=${range}`)
      .then((d) => { if (active) setData(d); })
      .catch(() => { if (active) setData(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeId, range]);

  const downloadCsv = async () => {
    const res = await fetch(`/api/analytics/${activeId}/export?range=${range}`, {
      headers: { Authorization: `Bearer ${tokenStore.get()}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beylink-analitik-${range}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const totals = data?.totals || { views: 0, unique_visitors: 0, clicks: 0, ctr: 0 };
  const fmtTick = (d) => (data?.bucket === 'hour' ? String(d).slice(11) : String(d).slice(5));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">{t('analytics.title')}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
            {ranges.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${range === r.key ? 'bg-brand-violet/10 text-brand-violet' : 'text-muted hover:text-ink'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {caps.csv ? (
            <button onClick={downloadCsv} className="btn-ghost text-xs" title={t('analytics.csvExportTooltip')}>
              <Download size={14} /> {t('analytics.csvExportBtn')}
            </button>
          ) : (
            <Link to="/dashboard/plans" className="btn-ghost text-xs text-muted" title={t('analytics.csvLockedTooltip')}>
              <Lock size={13} /> {t('analytics.csvLockedBtn')}
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-brand-violet"><Spinner size={28} /></div>
      ) : !data ? (
        <div className="card px-6 py-16 text-center text-muted">{t('analytics.loadError')}</div>
      ) : (
        <div className="space-y-5">
          {/* Metrikler */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat icon={Eye} label={t('analytics.stat.views')} value={totals.views} tint="#6D3BEA" />
            <Stat icon={Users} label={t('analytics.stat.uniqueVisitors')} value={totals.unique_visitors} tint="#12C4B0" />
            <Stat icon={MousePointerClick} label={t('analytics.stat.clicks')} value={totals.clicks} tint="#F5A524" />
            <Stat icon={Percent} label={t('analytics.stat.ctrLabel')} value={t('analytics.ctrValue', { value: totals.ctr })} tint="#F04438" />
          </div>

          <p className="-mt-1 px-1 text-xs text-muted">
            {t('analytics.dedupNote')}
          </p>

          {/* Zaman serisi */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold text-ink">{t('analytics.chart.title')}</h2>
            {data.timeseries.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted">{t('analytics.chart.empty')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.timeseries} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6D3BEA" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6D3BEA" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#12C4B0" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#12C4B0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F2" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7392' }} tickFormatter={fmtTick} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7392' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E9F2', fontSize: 12 }} />
                  <Area type="monotone" dataKey="views" name={t('analytics.stat.views')} stroke="#6D3BEA" fill="url(#gv)" strokeWidth={2} />
                  <Area type="monotone" dataKey="clicks" name={t('analytics.stat.clicks')} stroke="#12C4B0" fill="url(#gc)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* En iyi linkler */}
            <div className="card p-5">
              <h2 className="mb-4 text-sm font-bold text-ink">{t('analytics.topLinks.title')}</h2>
              {data.top_links.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">{t('analytics.topLinks.empty')}</p>
              ) : (
                <div className="space-y-2">
                  {data.top_links.map((l, i) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                      <span className="w-5 text-center font-mono text-sm font-bold text-muted">{i + 1}</span>
                      <Icon name={l.icon_name || 'link'} size={16} className="text-brand-violet" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{l.title || l.url}</span>
                      <span className="font-mono text-sm font-bold text-ink">{l.clicks}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {caps.analyticsAdvanced ? (
              <>
                {/* Cihaz kırılımı */}
                <div className="card p-5">
                  <h2 className="mb-4 text-sm font-bold text-ink">{t('analytics.device.title')}</h2>
                  {data.by_device.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted">{t('analytics.noData')}</p>
                  ) : (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie data={data.by_device} dataKey="count" nameKey="device" innerRadius={40} outerRadius={64} paddingAngle={2}>
                            {data.by_device.map((d) => (
                              <Cell key={d.device} fill={DEVICE_COLORS[d.device] || '#B7BECF'} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E9F2', fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5">
                        {data.by_device.map((d) => (
                          <div key={d.device} className="flex items-center gap-2 text-sm">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: DEVICE_COLORS[d.device] || '#B7BECF' }} />
                            <span className="text-ink-soft">{DEVICE_LABELS[d.device] || d.device}</span>
                            <span className="font-mono font-semibold text-ink">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tarayıcı */}
                <BreakdownList title={t('analytics.browser.title')} noDataText={t('analytics.noData')} rows={data.by_browser || []} labelKey="browser" />
                {/* Platform / İşletim Sistemi (iOS/Android = mobil) */}
                <BreakdownList title={t('analytics.platform.title')} noDataText={t('analytics.noData')} rows={data.by_os || []} labelKey="os" />
                {/* Ülke — geoip yok → gerçek trafikte çoğunlukla "Bilinmiyor" */}
                <BreakdownList title={t('analytics.country.title')} noDataText={t('analytics.noData')} rows={(data.by_country || []).map((r) => ({ ...r, country: r.country === 'unknown' ? t('analytics.device.unknown') : r.country }))} labelKey="country" />
                {/* Referrer */}
                <BreakdownList title={t('analytics.referrer.title')} noDataText={t('analytics.noData')} rows={data.by_referrer} labelKey="referrer" />
              </>
            ) : (
              <div className="card flex flex-col items-center justify-center gap-2 p-8 text-center lg:col-span-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Crown size={22} /></span>
                <p className="font-bold text-ink">{t('analytics.upsell.title')}</p>
                <p className="max-w-sm text-sm text-muted">{t('analytics.upsell.desc')}</p>
                <Link to="/dashboard/plans" className="btn-brand mt-1">{t('common.upgradeCta')}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BreakdownList({ title, rows, labelKey, noDataText }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-bold text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{noDataText}</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r[labelKey]}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="truncate text-ink-soft">{r[labelKey]}</span>
                <span className="font-mono font-semibold text-ink">{r.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
