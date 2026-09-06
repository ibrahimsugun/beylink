import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', '..');

const resolveFromRoot = (p, fallback) =>
  p ? path.resolve(backendRoot, p) : path.resolve(backendRoot, fallback);

export const config = {
  env: process.env.NODE_ENV || 'development',
  // 4501: bu makinedeki sibling projelerle (NoLnk 4900/5973, eski beylink kopyaları 4001) çakışmayan
  // dev varsayılanı. Docker'da compose PORT'u explicit set eder (api konteyneri: 4000, iç ağ).
  port: Number(process.env.PORT) || 4501,

  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  dbPath: resolveFromRoot(process.env.DB_PATH, 'data/beylink.sqlite'),
  uploadsDir: resolveFromRoot(process.env.UPLOADS_DIR, 'uploads'),

  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5501',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:5501',
  // SEO — sitemap.xml/robots.txt/feed.xml için sabit canlı URL. Google'ın taradığı sitemap dev URL
  // içermemeli (aksi halde canonical/duplicate signal karışır). Boşsa publicBaseUrl'e fallback.
  sitemapBaseUrl: process.env.SITEMAP_BASE_URL || 'https://beylink.org',

  // Admin dashboard yetkisi verilen e-postalar (virgülle ayrık). Varsayılan admin: admin@example.com
  adminEmails: (process.env.ADMIN_EMAILS || 'admin@example.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),

  // BeyLink'in KENDİ hostname'leri — resolveHost middleware bu listede OLMAYAN her Host'u
  // olası bir özel (kullanıcı) domaini olarak custom_domains'te arar. Prod'da beylink.org +
  // www; dev'de vite/preview portları. Virgülle ayrık env ile genişletilebilir.
  appHostnames: new Set(
    (process.env.APP_HOSTNAMES || 'beylink.org,www.beylink.org,localhost,127.0.0.1')
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  ),

  // Özel alan adı (branded domain) doğrulama hedefleri — kullanıcı DNS panelinde bunlara işaret eder.
  // serverIp: apex/kök domain için A kaydı hedefi (sunucunun statik IP'si). Boşsa A-kaydı doğrulaması
  // atlanır (yalnız CNAME/TXT geçerli olur) — dev'de genelde boş.
  // cnameTarget: subdomain için CNAME hedefi.
  brandedDomain: {
    serverIp: process.env.BRANDED_DOMAIN_SERVER_IP || '',
    cnameTarget: process.env.BRANDED_DOMAIN_CNAME_TARGET || 'cname.beylink.org',
  },

  // E-posta gönderimi. Sağlayıcı öncelik sırası:
  //   1) RESEND_API_KEY varsa → Resend (HTTP API, önerilen)
  //   2) MAIL_ENABLED=true    → SMTP (altyapı hazır, sağlayıcı eklenince)
  //   3) hiçbiri              → demo (gerçek göndermez; token'ı yanıtta/konsolda gösterir — yalnız dev)
  // NOT: Resend'de `from` domain'i DOĞRULANMIŞ olmalı. Domain doğrulanana kadar yalnız
  // `onboarding@resend.dev` adresinden ve YALNIZCA kendi hesap e-postana gönderebilirsin.
  mail: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.MAIL_FROM || 'BeyLink <onboarding@resend.dev>',
    replyTo: process.env.MAIL_REPLY_TO || '',
    smtpEnabled: process.env.MAIL_ENABLED === 'true',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    get enabled() {
      return !!this.resendApiKey || this.smtpEnabled;
    },
  },
  // E-postadaki bağlantılar için uygulama (frontend) taban URL'si
  appUrl: process.env.APP_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5501',

  // USDT (TRC20) ödemeleri — self-custody (private key sunucuda YOK, yalnızca alıcı adres)
  trc20: {
    walletAddress: process.env.TRC20_WALLET_ADDRESS || '', // boşsa poller kapalı + gerçek fatura 503
    usdtContract: process.env.TRC20_USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // mainnet USDT
    trongridApiKey: process.env.TRONGRID_API_KEY || '', // mainnet için önerilir
    minConfirmations: Number(process.env.TRC20_MIN_CONFIRMATIONS) || 19,
    ttlMinutes: Number(process.env.PAYMENT_TTL_MINUTES) || 30,
    pollIntervalSeconds: Number(process.env.PAYMENT_POLL_INTERVAL_SECONDS) || 30,
    minUsd: Number(process.env.PAYMENT_MIN_USD) || 1,
    maxUsd: Number(process.env.PAYMENT_MAX_USD) || 10000,
    // Demo mod: anında kredi (istemciye güvenir). Prod'da VARSAYILAN KAPALI.
    demoPayments: process.env.DEMO_PAYMENTS
      ? process.env.DEMO_PAYMENTS === 'true'
      : (process.env.NODE_ENV || 'development') !== 'production',
  },
};

// GÜVENLİK (fail-fast): üretimde zayıf/varsayılan JWT_SECRET ile açılışı ENGELLE.
// Aksi halde repo'da yazılı varsayılan secret'la imzalanan sahte token'lar herhangi bir
// kullanıcı (admin dahil) adına geçerli oturum açabilir → tam hesap ele geçirme. Dev'de serbest.
const WEAK_JWT_SECRETS = new Set([
  'dev-secret-change-me',
  'please-change-this-secret',
  'change-this-in-production-please',
]);
if (config.env === 'production') {
  if (!process.env.JWT_SECRET || WEAK_JWT_SECRETS.has(config.jwtSecret) || config.jwtSecret.length < 32) {
    throw new Error(
      'Güvenlik: üretimde güçlü bir JWT_SECRET ayarlanmalı (en az 32 karakter, varsayılan/boş değer reddedilir).',
    );
  }
}
