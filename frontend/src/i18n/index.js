import tr from '../locales/tr.json';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import pt from '../locales/pt.json';
import it from '../locales/it.json';
import ja from '../locales/ja.json';
import { LANG_MAP } from './languages.js';

const bundles = { tr, en, ru, es, de, fr, pt, it, ja };

function interpolate(str, params) {
  if (!params || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
}

// Locale başına tek Intl.PluralRules örneği (yeniden oluşturmak pahalı).
const _pluralRules = {};
function pluralCategory(locale, count) {
  return (_pluralRules[locale] ||= new Intl.PluralRules(locale)).select(count);
}

export function createT(lang) {
  const primary = bundles[lang] || bundles.en;
  const pick = (key) => primary[key] ?? bundles.en[key] ?? bundles.tr[key] ?? key;
  const t = (key, params) => interpolate(pick(key), params);
  t.plural = (key, count, params = {}) => {
    const locale = LANG_MAP[lang]?.locale || 'en-US';
    const cat = pluralCategory(locale, count);            // 'one' | 'few' | 'many' | 'other'
    const raw = primary[`${key}_${cat}`] ?? primary[`${key}_other`] ?? primary[key]
      ?? bundles.en[`${key}_${cat}`] ?? bundles.en[`${key}_other`] ?? bundles.en[key] ?? key;
    return interpolate(raw, { ...params, count });
  };
  return t;
}
