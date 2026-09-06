import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { LANGUAGES, LANG_MAP } from '../../i18n/languages.js';

const VISIBLE_LANGUAGES = LANGUAGES.filter((l) => l.visible);

export function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANG_MAP[lang] || VISIBLE_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('lang.select')}
          className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {VISIBLE_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === lang}
              onClick={() => select(l.code)}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition ${
                l.code === lang
                  ? 'bg-brand-violet/10 text-brand-violet'
                  : 'text-ink-soft hover:bg-surface'
              }`}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
