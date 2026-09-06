import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANG_MAP, DEFAULT_LANG, detectInitialLang } from '../i18n/languages.js';
import { createT } from '../i18n/index.js';
import { setFormatLocale } from '../lib/format.js';

const LS_KEY = 'beylink_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangRaw] = useState(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored && LANG_MAP[stored]) return stored;
    return detectInitialLang() || DEFAULT_LANG;
  });

  const setLang = useCallback((code) => {
    if (!LANG_MAP[code]) return;
    setLangRaw(code);
    localStorage.setItem(LS_KEY, code);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    setFormatLocale(LANG_MAP[lang]?.locale || 'en-US');
  }, [lang]);

  const t = useMemo(() => createT(lang), [lang]);
  const locale = LANG_MAP[lang]?.locale || 'en-US';

  const value = useMemo(() => ({ lang, setLang, t, locale }), [lang, setLang, t, locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
