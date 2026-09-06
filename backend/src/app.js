import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';

import authRoutes from './routes/authRoutes.js';
import subAccountRoutes from './routes/subAccountRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import btagRoutes from './routes/btagRoutes.js';
import goRoutes from './routes/goRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import prerenderRoutes from './routes/prerenderRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { resolveHost } from './middleware/resolveHost.js';
import { createRateLimiter } from './utils/rateLimit.js';

// Global fallback limiter — elle limiti olmayan tüm rotalar (gelecekte eklenenler dahil)
// taban korumaya kavuşur. /health ve /uploads/* düşük risk → muaf.
const globalLimiter = createRateLimiter({
  keyFn: (req) => `global:${req.ip}`,
  max: 300,
  windowMs: 60 * 1000,
  blockMs: 60 * 1000,
  message: 'Çok fazla istek. Lütfen bir dakika sonra tekrar deneyin.',
  exempt: (req) => req.path === '/health' || req.path === '/uploads' || req.path.startsWith('/uploads/'),
});

export function createApp() {
  const app = express();

  // Reverse-proxy zinciri arkasında gerçek istemci IP'sini X-Forwarded-For'dan oku
  // (aktivite loglarındaki ip alanı, geoip VE rate-limit anahtarları için — hepsi req.ip kullanır).
  // Prod'da PAYLAŞIMLI Caddy edge → nginx (beylink-web) → api: 2 hop (Caddyfile: her iki site
  // bloğu da `reverse_proxy beylink-web:80`'e gider, api'ye asla doğrudan değil). trust proxy=1
  // burada YANLIŞ olurdu — Express tek hop güvenip XFF'in SAĞ-en girdisini (nginx'in eklediği
  // Caddy IP'si) alır, req.ip her istekte Caddy'nin IP'sine sabitlenir → global/auth limiter'lar
  // TÜM kullanıcıları tek kovaya toplar (limiter işlevsiz kalır). trust proxy=2 → XFF'in SOL-en
  // (gerçek istemci) girdisini alır. Dev'de (proxy yok, XFF header'ı gelmez) davranış değişmez —
  // doğrudan soket adresi (::1/127.0.0.1) kullanılır.
  // ÖNKOŞUL (deploy zamanı doğrulanmalı): nginx'in host portu (8501) VPS güvenlik duvarında dışa
  // KAPALI olmalı — yalnız Caddy internet'e açık olmalı. Aksi halde saldırgan Caddy'yi atlayıp
  // nginx'e doğrudan XFF enjekte edebilir (nginx `$proxy_add_x_forwarded_for` istemci XFF'ini
  // silmeden ekler) ve trust proxy=2 o sahte girdiyi gerçek IP sanır.
  app.set('trust proxy', 2);

  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(globalLimiter); // express.json'dan ÖNCE — büyük gövde parse edilmeden 429
  app.use(express.json({ limit: '1mb' }));

  // Host-farkında yönlendirme — özel alan adı istekleri için req.customDomain'i erken doldurur
  // (public/prerender/seo route'ları bunu kullanır). Diğer tüm isteklerde no-op.
  app.use(resolveHost);

  // Yüklenen görseller — MIME sniffing kapalı + kısıtlı CSP (SVG script çalıştıramaz)
  app.use(
    '/uploads',
    express.static(config.uploadsDir, {
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
      },
    })
  );

  // Sağlık kontrolü
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'beylink-api' }));

  // Teknik SEO — kök path'lerde (standart: beylink.org/robots.txt, /sitemap.xml, /feed.xml).
  // API prefix'siz mount; dev'de Vite proxy, prod'da nginx bunları backend'e yönlendirir.
  app.use('/', seoRoutes);

  // API rotaları
  app.use('/api/auth', authRoutes);
  app.use('/api/subaccounts', subAccountRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/links', linkRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/btags', btagRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/go', goRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/prerender', prerenderRoutes);
  app.use('/api/domains', domainRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
