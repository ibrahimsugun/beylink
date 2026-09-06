#!/usr/bin/env node
// Çok dilli i18n parite + kalite denetimi (bağımlılıksız, saf Node).
//
// `visible` diller (languages.js — tek gerçek kaynak) için ZORLA (hata → exit 1):
//   1) normal anahtar kümesi == kanonik (tr) normal küme
//   2) çoğul grup tabanları == kanonik gruplar, her grup o dilin Intl.PluralRules
//      kategorileriyle (one/few/many/other) birebir eşleşir
//   3) her ortak anahtarda {placeholder} kümesi kanonikle eşit (DeepL kaymasını yakalar)
//   4) em-dash guard — hiçbir değerde "—" (U+2014) yok
//   5) Türkiye/KVKK/GDPR guard — ülke/otorite/yargı-yeri referansı yok (`lang.*` muaf)
//   6) src/**/*.{jsx,js} içinde t('…')/t.plural('…') literal anahtarları tr.json'da var mı
//
// `visible:false` diller (RU/ES çeviri sürerken) bloklamaz — tek satır kapsam raporu basar.
// Temiz → "✓ ..." + exit 0. Hata → liste + exit 1 (hook build'i durdurur).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { LANGUAGES } from '../src/i18n/languages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..', 'src');
const LOCALES = join(SRC, 'locales');
const CANONICAL_CODE = 'tr';

function loadJson(p) {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`✗ JSON okunamadı/parse edilemedi: ${p}\n  ${e.message}`);
    process.exit(1);
  }
}

const bundles = {};
for (const l of LANGUAGES) bundles[l.code] = loadJson(join(LOCALES, `${l.code}.json`));

const canonical = bundles[CANONICAL_CODE];
const canonicalAllKeys = new Set(Object.keys(canonical));

// Çoğul grup tabanları — tr.json'da `<base>_<suffix>` biçiminde geçen her `<base>`.
const PLURAL_SUFFIX_RE = /_(zero|one|two|few|many|other)$/;
const pluralBases = new Set();
for (const k of canonicalAllKeys) {
  const m = k.match(PLURAL_SUFFIX_RE);
  if (m) pluralBases.add(k.slice(0, -m[0].length));
}
// Normal anahtarlar = çoğul varyant SÜFİKSİ taşımayan her anahtar (bare taban dahil).
const normalKeys = new Set([...canonicalAllKeys].filter((k) => !PLURAL_SUFFIX_RE.test(k)));

function pluralCategories(locale) {
  return new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
}

// Bir dilin TAM olması gereken anahtar kümesi: normal anahtarlar + o dilin locale'ine
// göre her çoğul taban için beklenen kategori-sonekli anahtarlar.
function expectedKeys(locale) {
  const keys = new Set(normalKeys);
  const cats = pluralCategories(locale);
  for (const base of pluralBases) for (const cat of cats) keys.add(`${base}_${cat}`);
  return keys;
}

const ph = (s) => new Set(String(s).match(/\{(\w+)\}/g) || []);
const setEq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

const EM_DASH_RE = /—/;
const TURKEY_RE =
  /(KVKK|GDPR|Türkiye|Turkey|Türk\b|Turkish|\+90|İstanbul|Istanbul|Ankara|İzmir|Izmir|Türkei|türkisch|Turquie|turque?|Turquia|turco|Turchia|トルコ|Турци|турецк)/i;

const errors = [];
const scopeReports = [];

for (const lang of LANGUAGES) {
  const code = lang.code;
  const bundle = bundles[code];
  const bundleKeys = new Set(Object.keys(bundle));
  const expected = expectedKeys(lang.locale);

  if (lang.visible) {
    // 1+2) anahtar kümesi (normal + çoğul varyant) birebir kanonik-türetilmiş beklentiyle eşleşmeli
    const missing = [...expected].filter((k) => !bundleKeys.has(k));
    const extra = [...bundleKeys].filter((k) => !expected.has(k));
    if (missing.length) errors.push(`${code}.json'da EKSİK (${missing.length}): ${missing.join(', ')}`);
    if (extra.length) errors.push(`${code}.json'da FAZLA/beklenmeyen (${extra.length}): ${extra.join(', ')}`);

    // 3) placeholder — ortak anahtarlarda {..} kümesi kanonikle eşit olmalı
    //    (çoğul varyantlar için referans: kanonik'teki aynı-taban `_other`, yoksa bare taban)
    for (const k of expected) {
      if (!bundleKeys.has(k)) continue;
      const m = k.match(PLURAL_SUFFIX_RE);
      const refKey = m ? (canonicalAllKeys.has(k) ? k : `${k.slice(0, -m[0].length)}_other`) : k;
      const refVal = canonical[refKey] ?? canonical[m ? m.input.slice(0, -m[0].length) : k];
      if (refVal == null) continue;
      if (!setEq(ph(refVal), ph(bundle[k]))) {
        errors.push(`placeholder uyuşmuyor [${code}]: "${k}" → beklenen{${[...ph(refVal)].join(' ')}} ≠ ${code}{${[...ph(bundle[k])].join(' ')}}`);
      }
    }

    // 4) em-dash guard
    for (const [k, v] of Object.entries(bundle)) {
      if (typeof v === 'string' && EM_DASH_RE.test(v)) {
        errors.push(`em-dash guard [${code}]: "${k}" değerinde "—" var`);
      }
    }

    // 5) Türkiye/KVKK/GDPR guard (lang.* muaf)
    for (const [k, v] of Object.entries(bundle)) {
      if (k.startsWith('lang.')) continue;
      if (typeof v === 'string') {
        const m = v.match(TURKEY_RE);
        if (m) errors.push(`Türkiye/KVKK/GDPR guard [${code}]: "${k}" değerinde "${m[0]}" var`);
      }
    }
  } else {
    // Kapsam raporu — bloklamaz, sadece bilgi
    const presentCount = [...expected].filter((k) => bundleKeys.has(k)).length;
    const missingCount = expected.size - presentCount;
    const cats = pluralCategories(lang.locale);
    let completeGroups = 0;
    for (const base of pluralBases) {
      if (cats.every((c) => bundleKeys.has(`${base}_${c}`))) completeGroups += 1;
    }
    const emDashCount = Object.values(bundle).filter((v) => typeof v === 'string' && EM_DASH_RE.test(v)).length;
    scopeReports.push(
      `${code}: ${presentCount}/${expected.size} · ${missingCount} eksik · ${completeGroups}/${pluralBases.size} çoğul grup · em-dash ${emDashCount}`,
    );
  }
}

// 6) Kod kullanımı — t('key') / t.plural('key') literal anahtarları tr.json'da var mı
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(jsx?|tsx?)$/.test(name)) out.push(p);
  }
  return out;
}
// t('x') | t("x") | t.plural('x') — backtick/değişken argümanlar (dinamik) KASITLI atlanır
const RE = /\bt(?:\.plural)?\(\s*(['"])([^'"]+?)\1/g;
const usedMissing = new Map(); // key -> Set(dosya)
for (const file of walk(SRC)) {
  const code = readFileSync(file, 'utf8');
  let m;
  while ((m = RE.exec(code))) {
    const key = m[2];
    if (!canonicalAllKeys.has(key)) {
      if (!usedMissing.has(key)) usedMissing.set(key, new Set());
      usedMissing.get(key).add(file.replace(SRC, 'src'));
    }
  }
}
for (const [key, files] of usedMissing) {
  errors.push(`kod'da kullanılan ama JSON'da olmayan anahtar: "${key}" (${[...files].join(', ')})`);
}

if (errors.length) {
  console.error('✗ i18n parite HATASI:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

const visibleCodes = LANGUAGES.filter((l) => l.visible).map((l) => l.code);
console.log(`✓ i18n: ${canonicalAllKeys.size} anahtar (tr) · visible [${visibleCodes.join(', ')}] parite OK · placeholder OK · em-dash 0 · Türkiye/KVKK/GDPR 0 · 0 eksik`);
for (const line of scopeReports) console.log(`  · ${line}`);
process.exit(0);
