// Test kataloğu — kategori dosyalarını tek TESTS array'inde birleştirir.
// Her test: { id, name, category, description, run(ctx) }. Testler seri kuyrukta çalışır
// (framework/services/testRunner.js). Her test `bltest_z_%` prefix'li izole veri yaratır;
// finally'de cleanupTestUsers topluca temizler → massskaa/demo/gerçek veri etkilenmez.
import { authTests } from './auth.tests.js';
import { twofaTests } from './twofa.tests.js';
import { authResetTests } from './authReset.tests.js';
import { rateLimitTests } from './rateLimit.tests.js';
import { planTests } from './plan.tests.js';
import { subaccountTests } from './subaccount.tests.js';
import { designTemplateTests } from './designTemplate.tests.js';
import { capsTests } from './caps.tests.js';
import { creditTests } from './credit.tests.js';
import { paymentsTests } from './payments.tests.js';
import { btagTests } from './btag.tests.js';
import { linksTests } from './links.tests.js';
import { publicTests } from './public.tests.js';
import { analyticsTests } from './analytics.tests.js';
import { profileTests } from './profile.tests.js';
import { securityTests } from './security.tests.js';
import { adminTests } from './admin.tests.js';
import { i18nTests } from './i18n.tests.js';
import { systemTests } from './system.tests.js';
import { domainsTests } from './domains.tests.js';

export const TESTS = [
  ...authTests,
  ...twofaTests,
  ...authResetTests,
  ...rateLimitTests,
  ...planTests,
  ...subaccountTests,
  ...designTemplateTests,
  ...capsTests,
  ...creditTests,
  ...paymentsTests,
  ...btagTests,
  ...linksTests,
  ...publicTests,
  ...analyticsTests,
  ...profileTests,
  ...securityTests,
  ...adminTests,
  ...i18nTests,
  ...systemTests,
  ...domainsTests,
];

// UI'daki gruplama sırası — testlerin category alanı bunu takip eder.
export const CATEGORIES = [
  'Auth',
  '2FA',
  'Şifre Reset',
  'Rate Limit',
  'Plan',
  'Alt Hesap',
  'Şablonlarım',
  'Yetenek Kilitleri',
  'Kredi',
  'Ödemeler',
  'BTAG',
  'Linkler',
  'Public / SEO',
  'Analitik',
  'Profil',
  'Güvenlik',
  'Admin',
  'i18n',
  'Sistem',
  'Özel Alan Adı',
];

export function findTest(id) {
  return TESTS.find((t) => t.id === id) || null;
}
