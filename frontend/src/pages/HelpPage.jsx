import { useState } from 'react';
import {
  HelpCircle, ChevronDown, Rocket, Link2, Palette, Search, BarChart3, Tag,
  Users, Wallet, Coins, FlaskConical, Crown, Share2, Settings, ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

// Her bölüm: ikon + id + kaç madde olduğu. Metinler tr/en.json'da `help.sections.<id>.*` altında.
const SECTIONS = [
  { id: 'start', icon: Rocket, itemCount: 4 },
  { id: 'links', icon: Link2, itemCount: 5 },
  { id: 'design', icon: Palette, itemCount: 4 },
  { id: 'seo', icon: Search, itemCount: 2 },
  { id: 'analytics', icon: BarChart3, itemCount: 4 },
  { id: 'btag', icon: Tag, itemCount: 3 },
  { id: 'sub', icon: Users, itemCount: 3 },
  { id: 'wallet', icon: Wallet, itemCount: 4 },
  { id: 'share', icon: Share2, itemCount: 2 },
  { id: 'settings', icon: Settings, itemCount: 2 },
];

function Accordion({ section, open, onToggle, t }) {
  const Icon = section.icon;
  const title = t(`help.sections.${section.id}.title`);
  const intro = t(`help.sections.${section.id}.intro`);
  const items = Array.from({ length: section.itemCount }, (_, i) => ({
    label: t(`help.sections.${section.id}.items.${i}.label`),
    text: t(`help.sections.${section.id}.items.${i}.text`),
  }));
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-surface"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-violet/10 text-brand-violet">
          <Icon size={18} />
        </span>
        <span className="flex-1 text-sm font-bold text-ink">{title}</span>
        <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-line px-5 py-4">
          {intro && <p className="mb-3 text-sm text-ink-soft">{intro}</p>}
          <div className="space-y-2.5">
            {items.map((it) => (
              <div key={it.label} className="rounded-xl bg-surface px-3.5 py-2.5">
                <div className="text-sm font-semibold text-ink">{it.label}</div>
                <div className="mt-0.5 text-sm text-muted">{it.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const { t } = useLanguage();
  const [open, setOpen] = useState('start');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <HelpCircle size={22} className="text-brand-violet" />
          <h1 className="text-2xl font-extrabold text-ink">{t('help.pageTitle')}</h1>
        </div>
        <p className="mt-0.5 text-sm text-muted">{t('help.pageSubtitle')}</p>
      </div>

      {/* Hızlı başlangıç */}
      <div className="card flex items-start gap-3 border-brand-violet/20 bg-brand-violet/5 p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand-teal" />
        <p className="text-sm text-ink-soft">
          <b>{t('help.tip.label')}</b> {t('help.tip.intro')} <b>{t('help.tip.bold')}</b> {t('help.tip.outro')}
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <Accordion key={s.id} section={s} open={open === s.id} onToggle={() => setOpen((o) => (o === s.id ? '' : s.id))} t={t} />
        ))}
      </div>

      <p className="pb-4 text-center text-xs text-muted">
        {t('help.footer')}
      </p>
    </div>
  );
}
