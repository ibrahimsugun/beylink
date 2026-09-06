// Merkezi plan tanımı — hem backend gating hem frontend (lib/plans.js) aynı gerçeği kullanır.
// Tüm tutarlar tam sayı micro-USDT (USDT * 1e6) — float sapması olmaz.

export const MICRO = 1_000_000;

export const PLANS = {
  free: {
    key: 'free',
    label: 'Free',
    priceMicro: 0,
    subAccounts: 0,
    subAccountMax: 0, // ulaşılabilir maks alt hesap (paketlerle tekrar alınarak)
    analyticsAdvanced: false,
    seo: false,
    csv: false,
    richText: false,
    btag: false,
    presetThemes: false,
    bulkTemplateApply: false,
    hideBranding: false,
    brandedDomain: false,
  },
  basic: {
    key: 'basic',
    label: 'Basic',
    priceMicro: 5 * MICRO,
    subAccounts: 0,
    subAccountMax: 1, // Basic: yalnız 1 ek hak; fazlası için Pro'ya yükseltme
    analyticsAdvanced: true,
    seo: true,
    csv: false,
    richText: false,
    btag: true,
    presetThemes: true, // hazır temalar + şablonlar Basic ve Pro'da açık
    bulkTemplateApply: false,
    hideBranding: false,
    brandedDomain: false,
  },
  pro: {
    key: 'pro',
    label: 'Pro',
    priceMicro: 10 * MICRO,
    subAccounts: 3, // varsayılan (plan-bazlı) alt hesap hakkı
    subAccountMax: 10, // paketlerle tekrar alınarak 10'a kadar
    analyticsAdvanced: true,
    seo: true,
    csv: true,
    richText: true,
    btag: true,
    presetThemes: true,
    bulkTemplateApply: false,
    hideBranding: true, // Pro'dan itibaren BeyLink markasını public sayfadan kaldırma
    brandedDomain: false,
  },
  proplus: {
    key: 'proplus',
    label: 'Pro Plus',
    priceMicro: 40 * MICRO,
    subAccounts: 15, // varsayılan alt hesap hakkı (ekip yönetimi)
    subAccountMax: 40, // paketlerle tekrar alınarak 40'a kadar (sistem tavanı)
    analyticsAdvanced: true,
    seo: true,
    csv: true,
    richText: true,
    btag: true,
    presetThemes: true,
    bulkTemplateApply: true, // şablonu alt hesaplara TOPLU uygulama yalnızca Pro Plus
    hideBranding: true,
    brandedDomain: true, // özel alan adı bağlama yalnızca Pro Plus
  },
};

export const PLAN_KEYS = Object.keys(PLANS);
export const PLAN_DURATION_DAYS = 30;

// Plan hiyerarşisi — yükseltme/düşürme kararları buradan verilir (free < basic < pro < proplus).
export const PLAN_TIER = { free: 0, basic: 1, pro: 2, proplus: 3 };
export function planTier(key) {
  return PLAN_TIER[key] ?? 0;
}

// --- Ek alt hesap hakkı paketleri (HESABA KALICI) ---
// Her paket bir plana bağlıdır (yalnız o plandayken satın alınabilir) ve HESAP BAŞINA 1 KEZ alınır.
// Satın alınan haklar hesaba kalıcı tanımlanır: premium bitince silinmez, yalnız pasifleşir
// (subAccountLimit free planda 0 döndürür); premium yenilenince tekrar sayılır.
// Paketler plan limitine kadar TEKRAR TEKRAR satın alınabilir (hesap başına 1 kez DEĞİL).
export const SUBACCOUNT_PACKS = {
  basic_1: { key: 'basic_1', plan: 'basic', rights: 1, priceMicro: 10 * MICRO },
  pro_1: { key: 'pro_1', plan: 'pro', rights: 1, priceMicro: 10 * MICRO },
  pro_6: { key: 'pro_6', plan: 'pro', rights: 6, priceMicro: 50 * MICRO },
  proplus_1: { key: 'proplus_1', plan: 'proplus', rights: 1, priceMicro: 10 * MICRO },
  proplus_6: { key: 'proplus_6', plan: 'proplus', rights: 6, priceMicro: 50 * MICRO },
  proplus_10: { key: 'proplus_10', plan: 'proplus', rights: 10, priceMicro: 75 * MICRO },
  proplus_15: { key: 'proplus_15', plan: 'proplus', rights: 15, priceMicro: 100 * MICRO },
};

// Tek hesabın aşırı büyümesini önlemek için toplam alt hesap hakkı tavanı (global güvenlik ağı).
export const MAX_SUBACCOUNT_RIGHTS = 40;

// Bir planın satın alabileceği paketler (o plana bağlı olanlar)
export function packsForPlan(planKey) {
  return Object.values(SUBACCOUNT_PACKS).filter((p) => p.plan === planKey);
}

// Bir planın ULAŞABİLECEĞİ maks alt hesap = planın açık tavanı (paketler tekrar alınarak buraya çıkılır).
// Paketler tekrar-satın-alınabilir olduğundan "varsayılan + paket toplamı" formülü ARTIK GEÇERSİZ.
//   free 0 · basic 1 · pro 10 · proplus 40 (global MAX_SUBACCOUNT_RIGHTS ile sınırlı).
export function planSubAccountMax(planKey) {
  return Math.min(MAX_SUBACCOUNT_RIGHTS, planOf(planKey).subAccountMax ?? 0);
}

// Geriye-uyum: eski +5'lik paket sayacı (users.extra_subaccount_packs) hâlâ desteklenir.
export const LEGACY_SUBACCOUNT_PACK_SIZE = 5;

// Free planında izinli analitik aralıkları (gelişmiş aralıklar Basic+)
export const FREE_ANALYTICS_RANGES = ['7d', '30d', 'all'];

export function planOf(planKey) {
  return PLANS[planKey] || PLANS.free;
}
