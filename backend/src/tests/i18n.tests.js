// i18n bütünlük / kalite testleri — DAVRANIŞ değil, ÇEVİRİ SAĞLIĞI denetler.
// Amaç: frontend locale dosyalarında (`frontend/src/locales/*.json`) bir regresyon —
// eksik/fazla anahtar, placeholder kayması, em-dash sızıntısı, Türkiye/KVKK/GDPR referansı,
// yanlış çoğul kategorisi — admin panelde KIRMIZI olarak yüzeye çıksın.
// Bu, `frontend/scripts/i18n-check.mjs` + PostToolUse hook'un koştuğu denetimin BAĞIMSIZ ikizidir
// (aynı değişmezleri arka uçtan tekrar doğrular → iki tarafın uyuşmazlığı da bir sinyaldir).
//
// Kaynak salt-okunur: yalnız frontend JSON + languages.js OKUNUR, hiçbir şey yazılmaz, gerçek
// veriye (massskaa/demo) dokunulmaz. Prod api konteynerinde frontend kaynağı bulunmayabilir
// (web ayrı konteyner) → dizin yoksa test not düşüp GEÇER (yanlış kırmızı vermez).
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// backend/src/tests → repo kökü → frontend/src/...
const FRONTEND_SRC = resolve(__dirname, '..', '..', '..', 'frontend', 'src');
const LOCALES_DIR = join(FRONTEND_SRC, 'locales');
const LANGUAGES_JS = join(FRONTEND_SRC, 'i18n', 'languages.js');
const CANONICAL_CODE = 'tr';

// i18n-check.mjs ile BİREBİR aynı desenler (kasıtlı ikiz — kayarsa uyuşmazlık sinyaldir).
const PLURAL_SUFFIX_RE = /_(zero|one|two|few|many|other)$/;
const EM_DASH_RE = /—/; // — (U+2014)
const TURKEY_RE =
  /(KVKK|GDPR|Türkiye|Turkey|Türk\b|Turkish|\+90|İstanbul|Istanbul|Ankara|İzmir|Izmir|Türkei|türkisch|Turquie|turque?|Turquia|turco|Turchia|トルコ|Турци|турецк)/i;

const ph = (s) => new Set(String(s).match(/\{(\w+)\}/g) || []);
const setEq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

// Frontend i18n kaynağını yükler. Dizin yoksa null döner (test "atla+geç" yapar).
async function loadI18n(ctx) {
  if (!existsSync(LOCALES_DIR) || !existsSync(LANGUAGES_JS)) {
    ctx.log(`frontend i18n kaynağı bu ortamda yok (${LOCALES_DIR}) → denetim atlanıyor, GEÇ.`);
    return null;
  }
  // languages.js SAF bir modül (React yok; navigator yalnız fonksiyon gövdesinde) → güvenle import.
  const mod = await import(pathToFileURL(LANGUAGES_JS).href);
  const LANGUAGES = mod.LANGUAGES;
  ctx.assert(Array.isArray(LANGUAGES) && LANGUAGES.length > 0, 'languages.js LANGUAGES dizisi boş/okunamadı');

  const bundles = {};
  for (const l of LANGUAGES) {
    const p = join(LOCALES_DIR, `${l.code}.json`);
    ctx.assert(existsSync(p), `locale dosyası eksik: ${l.code}.json`);
    bundles[l.code] = JSON.parse(readFileSync(p, 'utf8'));
  }

  const canonical = bundles[CANONICAL_CODE];
  ctx.assert(canonical, 'kanonik (tr) locale bulunamadı');
  const canonicalAllKeys = new Set(Object.keys(canonical));

  const pluralBases = new Set();
  for (const k of canonicalAllKeys) {
    const m = k.match(PLURAL_SUFFIX_RE);
    if (m) pluralBases.add(k.slice(0, -m[0].length));
  }
  const normalKeys = new Set([...canonicalAllKeys].filter((k) => !PLURAL_SUFFIX_RE.test(k)));
  const visible = LANGUAGES.filter((l) => l.visible);

  return { LANGUAGES, visible, bundles, canonical, canonicalAllKeys, pluralBases, normalKeys };
}

const pluralCategories = (locale) => new Intl.PluralRules(locale).resolvedOptions().pluralCategories;

// Bir dilin locale'ine göre TAM olması beklenen anahtar kümesi.
function expectedKeys(locale, normalKeys, pluralBases) {
  const keys = new Set(normalKeys);
  const cats = pluralCategories(locale);
  for (const base of pluralBases) for (const cat of cats) keys.add(`${base}_${cat}`);
  return keys;
}

export const i18nTests = [
  {
    id: 'i18n.visible-language-set',
    name: 'Görünür dil kümesi beklenen 9 dille eşleşiyor (locale + dosya)',
    category: 'i18n',
    description: 'languages.js\'te tr/en/ru/es/de/fr/pt/it/ja hepsi visible + doğru locale kodu + her birinin locale JSON dosyası mevcut ve parse ediliyor.',
    run: async (ctx) => {
      const data = await loadI18n(ctx);
      if (!data) return; // kaynak yok → geç
      const EXPECTED = {
        tr: 'tr-TR', en: 'en-US', ru: 'ru-RU', es: 'es-ES',
        de: 'de-DE', fr: 'fr-FR', pt: 'pt-BR', it: 'it-IT', ja: 'ja-JP',
      };
      const visibleCodes = data.visible.map((l) => l.code).sort();
      ctx.log(`visible: [${visibleCodes.join(', ')}]`);
      const expectedCodes = Object.keys(EXPECTED).sort();
      const missing = expectedCodes.filter((c) => !visibleCodes.includes(c));
      const unexpected = visibleCodes.filter((c) => !expectedCodes.includes(c));
      ctx.equal(missing.length, 0, `görünür olması beklenen ama olmayan dil(ler): ${missing.join(', ')}`);
      ctx.equal(unexpected.length, 0, `beklenmeyen görünür dil(ler): ${unexpected.join(', ')}`);
      const badLocale = [];
      for (const l of data.visible) {
        if (EXPECTED[l.code] && l.locale !== EXPECTED[l.code]) badLocale.push(`${l.code}: ${l.locale} (beklenen ${EXPECTED[l.code]})`);
      }
      ctx.equal(badLocale.length, 0, `yanlış locale kodu: ${badLocale.join(', ')}`);
    },
  },
  {
    id: 'i18n.key-parity',
    name: 'Anahtar paritesi tam (her görünür dil == kanonik tr)',
    category: 'i18n',
    description: 'Her görünür dilin anahtar kümesi (normal + o locale\'in CLDR çoğul varyantları) kanonik tr\'den türetilen beklenen kümeyle birebir eşleşir — eksik/fazla anahtar yakalanır.',
    run: async (ctx) => {
      const data = await loadI18n(ctx);
      if (!data) return;
      const problems = [];
      for (const l of data.visible) {
        if (l.code === CANONICAL_CODE) continue;
        const expected = expectedKeys(l.locale, data.normalKeys, data.pluralBases);
        const have = new Set(Object.keys(data.bundles[l.code]));
        const missing = [...expected].filter((k) => !have.has(k));
        const extra = [...have].filter((k) => !expected.has(k));
        if (missing.length) problems.push(`${l.code} EKSİK(${missing.length}): ${missing.slice(0, 8).join(', ')}`);
        if (extra.length) problems.push(`${l.code} FAZLA(${extra.length}): ${extra.slice(0, 8).join(', ')}`);
      }
      ctx.log(`kanonik tr: ${data.canonicalAllKeys.size} anahtar · ${data.visible.length} görünür dil denetlendi`);
      ctx.equal(problems.length, 0, problems.join(' | '));
    },
  },
  {
    id: 'i18n.placeholder-parity',
    name: 'Placeholder paritesi ({token} seti kanonikle eşit)',
    category: 'i18n',
    description: 'Her görünür dilde, her ortak anahtarın {placeholder} token kümesi kanonik tr ile birebir aynı — DeepL\'in değişken adını çevirmesi (ör. {year}→{yil}) yakalanır.',
    run: async (ctx) => {
      const data = await loadI18n(ctx);
      if (!data) return;
      const mismatches = [];
      for (const l of data.visible) {
        if (l.code === CANONICAL_CODE) continue;
        const bundle = data.bundles[l.code];
        const expected = expectedKeys(l.locale, data.normalKeys, data.pluralBases);
        for (const k of expected) {
          if (!(k in bundle)) continue;
          const m = k.match(PLURAL_SUFFIX_RE);
          // çoğul varyant için referans: kanonik'te aynı anahtar varsa o, yoksa `${base}_other`, yoksa bare base
          const refKey = m ? (data.canonicalAllKeys.has(k) ? k : `${k.slice(0, -m[0].length)}_other`) : k;
          const refVal = data.canonical[refKey] ?? data.canonical[m ? m.input.slice(0, -m[0].length) : k];
          if (refVal == null) continue;
          if (!setEq(ph(refVal), ph(bundle[k]))) {
            mismatches.push(`[${l.code}] ${k}: {${[...ph(refVal)].join(' ')}} ≠ {${[...ph(bundle[k])].join(' ')}}`);
          }
        }
      }
      ctx.equal(mismatches.length, 0, `placeholder uyuşmazlığı → ${mismatches.slice(0, 6).join(' | ')}`);
    },
  },
  {
    id: 'i18n.brand-safety-guard',
    name: 'Marka güvenliği (em-dash 0 · Türkiye/KVKK/GDPR 0, çok-scriptli)',
    category: 'i18n',
    description: 'Her görünür dilde hiçbir değerde em-dash (—, U+2014) yok; ve `lang.*` hariç hiçbir değer Türkiye/KVKK/GDPR/ülke-şehir referansı içermez (katakana トルコ dahil).',
    run: async (ctx) => {
      const data = await loadI18n(ctx);
      if (!data) return;
      const emDash = [];
      const turkey = [];
      for (const l of data.visible) {
        for (const [k, v] of Object.entries(data.bundles[l.code])) {
          if (typeof v !== 'string') continue;
          if (EM_DASH_RE.test(v)) emDash.push(`[${l.code}] ${k}`);
          if (k.startsWith('lang.')) continue; // dil-adı etiketi muaf (ör. lang.tr = "Türkçe")
          const m = v.match(TURKEY_RE);
          if (m) turkey.push(`[${l.code}] ${k} → "${m[0]}"`);
        }
      }
      ctx.equal(emDash.length, 0, `em-dash bulundu → ${emDash.slice(0, 8).join(', ')}`);
      ctx.equal(turkey.length, 0, `Türkiye/KVKK/GDPR referansı → ${turkey.slice(0, 8).join(', ')}`);
    },
  },
  {
    id: 'i18n.plural-categories',
    name: 'Çoğul kategorileri locale CLDR\'sine tam uyuyor',
    category: 'i18n',
    description: 'Her görünür dilde her çoğul taban, o locale\'in TAM CLDR kategori kümesine sahip (de one/other · fr/pt/it one/many/other · ja yalnız other · ru one/few/many/other) — eksik VEYA fazla süfiks (ör. ja\'da yanlış _one) yakalanır.',
    run: async (ctx) => {
      const data = await loadI18n(ctx);
      if (!data) return;
      const problems = [];
      for (const l of data.visible) {
        const cats = pluralCategories(l.locale);
        const have = new Set(Object.keys(data.bundles[l.code]));
        for (const base of data.pluralBases) {
          const expectedSet = new Set(cats.map((c) => `${base}_${c}`));
          // o tabana ait dilde mevcut TÜM süfiksli anahtarlar
          const actualSet = new Set([...have].filter((k) => {
            const m = k.match(PLURAL_SUFFIX_RE);
            return m && k.slice(0, -m[0].length) === base;
          }));
          const missing = [...expectedSet].filter((k) => !actualSet.has(k));
          const extra = [...actualSet].filter((k) => !expectedSet.has(k));
          if (missing.length) problems.push(`${l.code} ${base} EKSİK: ${missing.join(', ')}`);
          if (extra.length) problems.push(`${l.code} ${base} FAZLA: ${extra.join(', ')}`);
        }
      }
      ctx.log(`${data.pluralBases.size} çoğul taban × ${data.visible.length} dil denetlendi`);
      ctx.equal(problems.length, 0, problems.slice(0, 8).join(' | '));
    },
  },
];
