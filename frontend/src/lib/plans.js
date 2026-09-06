// Backend config/plans.js ile aynı gerçek — UI gating + planlar sayfası buradan beslenir.
export const MICRO = 1_000_000;

// features: i18n ANAHTAR dizileridir (metin değil) — render eden component `t(f)` ile çözer.
// Kaynak metinler: `locales/tr.json` / `locales/en.json` içinde `plan.<key>.features.<index>`.
export const PLANS = {
  free: {
    key: 'free',
    label: 'Free',
    priceMicro: 0,
    caps: { subAccounts: 0, analyticsAdvanced: false, seo: false, csv: false, richText: false, btag: false, presetThemes: false, bulkTemplateApply: false, hideBranding: false, brandedDomain: false },
    features: ['plan.free.features.0', 'plan.free.features.1', 'plan.free.features.2', 'plan.free.features.3', 'plan.free.features.4'],
  },
  basic: {
    key: 'basic',
    label: 'Basic',
    priceMicro: 5 * MICRO,
    caps: { subAccounts: 0, analyticsAdvanced: true, seo: true, csv: false, richText: false, btag: true, presetThemes: true, bulkTemplateApply: false, hideBranding: false, brandedDomain: false },
    features: ['plan.basic.features.0', 'plan.basic.features.1', 'plan.basic.features.2', 'plan.basic.features.3', 'plan.basic.features.4'],
  },
  pro: {
    key: 'pro',
    label: 'Pro',
    priceMicro: 10 * MICRO,
    caps: { subAccounts: 3, analyticsAdvanced: true, seo: true, csv: true, richText: true, btag: true, presetThemes: true, bulkTemplateApply: false, hideBranding: true, brandedDomain: false },
    features: ['plan.pro.features.0', 'plan.pro.features.1', 'plan.pro.features.2', 'plan.pro.features.3', 'plan.pro.features.4', 'plan.pro.features.5', 'plan.pro.features.6'],
    team: true,
  },
  proplus: {
    key: 'proplus',
    label: 'Pro Plus',
    priceMicro: 40 * MICRO,
    caps: { subAccounts: 15, analyticsAdvanced: true, seo: true, csv: true, richText: true, btag: true, presetThemes: true, bulkTemplateApply: true, hideBranding: true, brandedDomain: true },
    features: ['plan.proplus.features.0', 'plan.proplus.features.1', 'plan.proplus.features.2', 'plan.proplus.features.3', 'plan.proplus.features.4', 'plan.proplus.features.5', 'plan.proplus.features.6'],
    team: true,
  },
};

export const PLAN_ORDER = ['free', 'basic', 'pro', 'proplus'];
export const PLAN_TIER = { free: 0, basic: 1, pro: 2, proplus: 3 };
export function planTier(key) {
  return PLAN_TIER[key] ?? 0;
}

// Ek alt hesap hakkı paketleri (backend config/plans.js ile aynı gerçek). Hesap başına 1 kez.
// `label` alanı gösterim için KULLANILMAZ (henüz hiçbir consumer yok) — render eden component
// Task 2c'de `t.plural('subpack.rights', pack.rights)` çağırmalı (bkz. locales/{tr,en}.json).
export const SUBACCOUNT_PACKS = {
  basic_1: { key: 'basic_1', plan: 'basic', rights: 1, priceMicro: 10 * MICRO, label: '1 alt hesap hakkı' },
  pro_1: { key: 'pro_1', plan: 'pro', rights: 1, priceMicro: 10 * MICRO, label: '1 alt hesap hakkı' },
  pro_6: { key: 'pro_6', plan: 'pro', rights: 6, priceMicro: 50 * MICRO, label: '6 alt hesap hakkı' },
  proplus_1: { key: 'proplus_1', plan: 'proplus', rights: 1, priceMicro: 10 * MICRO, label: '1 alt hesap hakkı' },
  proplus_6: { key: 'proplus_6', plan: 'proplus', rights: 6, priceMicro: 50 * MICRO, label: '6 alt hesap hakkı' },
  proplus_10: { key: 'proplus_10', plan: 'proplus', rights: 10, priceMicro: 75 * MICRO, label: '10 alt hesap hakkı' },
  proplus_15: { key: 'proplus_15', plan: 'proplus', rights: 15, priceMicro: 100 * MICRO, label: '15 alt hesap hakkı' },
};
export const MAX_SUBACCOUNT_RIGHTS = 40;

export function capsFor(user) {
  return (PLANS[user?.plan] || PLANS.free).caps;
}

// planLabel(key, t?) — `label` alanları zaten İngilizce marka adı (Free/Basic/Pro/Pro Plus),
// bu yüzden t olmadan da doğru çalışır. t verilirse `plan.<key>.label` anahtarından okunur
// (i18n Anahtar Üretim Kuralı — Config). Mevcut çağrı yerleri (t'siz) bozulmaz.
export function planLabel(key, t) {
  const p = PLANS[key] || PLANS.free;
  return t ? t(`plan.${p.key}.label`) : p.label;
}
