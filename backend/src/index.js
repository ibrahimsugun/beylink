import { createApp } from './app.js';
import { migrate } from './db/migrate.js';
import { config } from './config/env.js';
import { startPoller } from './services/payments.js';
import { reconcileOnBoot as reconcileTests } from './services/testRunner.js';
import { startSweeper as startRateLimitSweeper } from './utils/rateLimit.js';

// Açılışta tabloları garanti et (idempotent)
migrate();

// USDT (TRC20) ödeme poller'ı — yalnızca cüzdan adresi tanımlıysa çalışır
startPoller();

// Yarım kalan sistem testlerini 'error'a düşür (aksi halde UI'da ilelebet loading)
reconcileTests();

// Bellek-içi rate-limit Map'ini periyodik süpür — sunucu entry'de başlatılır ki
// unit-test importları interval spawn etmesin.
startRateLimitSweeper();

const app = createApp();

app.listen(config.port, () => {
  console.log(`\n🔗 BeyLink API  →  http://localhost:${config.port}`);
  console.log(`   Sağlık       →  http://localhost:${config.port}/health`);
  console.log(`   Ortam        →  ${config.env}\n`);
});
