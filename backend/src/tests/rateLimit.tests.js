// Rate-limit kategorisi — brute-force koruması login + forgot-password + 2FA + şifre + kayıt için.
// Not: rateLimit modülü in-memory Map; testler işi bitince clearAttempts ile de sıfırlar.
import { apiFetch, createTestOwner, tokenFor, TEST_PASSWORD } from './helpers.js';
import { clearAttempts, createRateLimiter, consume, sweep, isBlocked, __bucketCount } from '../utils/rateLimit.js';
import { normalizeDomain } from '../models/domainModel.js';
import { _totpHelpers } from './twofa.tests.js';

const fakeRes = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v; } });

export const rateLimitTests = [
  {
    id: 'rl.login-brute-force-blocked',
    name: 'Login 10 hatalı denemeden sonra kilitler (429)',
    category: 'Rate Limit',
    description: 'Aynı IP\'den 10 yanlış şifre → 11. istek 429. Test bitince sayaç sıfırlanır.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const key = 'login:::ffff:127.0.0.1'; // Node ipv6-mapped ipv4 → '::ffff:127.0.0.1'
      const altKey = 'login:127.0.0.1';
      try {
        for (let i = 0; i < 10; i++) {
          await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: 'wrong' } });
        }
        const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: 'wrong' } });
        ctx.equal(r.status, 429, '11. deneme 429 olmalı');
      } finally {
        clearAttempts(key); clearAttempts(altKey); // sonraki testler etkilenmesin
      }
    },
  },
  {
    id: 'rl.login-success-clears-attempts',
    name: 'Başarılı giriş rate-limit sayacını sıfırlar',
    category: 'Rate Limit',
    description: '9 hatalı + 1 doğru = sayaç sıfır; sonraki 10 hatalı yeni kilitleme yaratabilir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      try {
        for (let i = 0; i < 5; i++) await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: 'wrong' } });
        const ok = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: TEST_PASSWORD } });
        ctx.equal(ok.status, 200, 'doğru şifre 200');
        // Şimdi 5 yanlış daha — kilit gelmemeli (sayaç sıfırlandı)
        for (let i = 0; i < 5; i++) await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: 'wrong' } });
        const r = await apiFetch('/auth/login', { method: 'POST', body: { identifier: u.email, password: 'wrong' } });
        ctx.equal(r.status, 401, 'sayaç sıfırlandığı için hala 401 (429 değil)');
      } finally {
        clearAttempts('login:::ffff:127.0.0.1'); clearAttempts('login:127.0.0.1');
      }
    },
  },
  {
    id: 'rl.change-password-brute-force-blocked',
    name: 'Şifre değiştirme 10 hatalı mevcut-şifreden sonra kilitler (429)',
    category: 'Rate Limit',
    description: 'Açık oturumda yanlış current_password 10x → 11. istek 429 (çalınan oturumda parola brute-force durur).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      try {
        for (let i = 0; i < 10; i++) {
          await apiFetch('/auth/change-password', { method: 'POST', token, body: { current_password: 'wrong', new_password: 'newpass12' } });
        }
        const r = await apiFetch('/auth/change-password', { method: 'POST', token, body: { current_password: 'wrong', new_password: 'newpass12' } });
        ctx.equal(r.status, 429, '11. deneme 429 olmalı');
      } finally {
        clearAttempts(`pwchange:${u.id}`);
      }
    },
  },
  {
    id: 'rl.2fa-disable-brute-force-blocked',
    name: '2FA devre dışı bırakma 10 hatalı denemeden sonra kilitler (429)',
    category: 'Rate Limit',
    description: 'Yanlış parola ile 2FA disable 10x → 11. istek 429 (ele geçmiş oturumda 2FA sökülemez).',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const token = tokenFor(u);
      const setup = await apiFetch('/auth/2fa/setup', { method: 'POST', token });
      await apiFetch('/auth/2fa/enable', { method: 'POST', token, body: { code: _totpHelpers.totpCode(setup.body.secret) } });
      try {
        for (let i = 0; i < 10; i++) {
          await apiFetch('/auth/2fa/disable', { method: 'POST', token, body: { password: 'wrong-pass' } });
        }
        const r = await apiFetch('/auth/2fa/disable', { method: 'POST', token, body: { password: 'wrong-pass' } });
        ctx.equal(r.status, 429, '11. deneme 429 olmalı');
      } finally {
        clearAttempts(`2fa_disable:${u.id}`);
      }
    },
  },
  {
    id: 'rl.register-enumeration-blocked',
    name: 'Kayıt: aynı IP\'den 10 çakışma (409) sonrası kilitler (429)',
    category: 'Rate Limit',
    description: 'Var olan e-posta ile 10 kayıt denemesi (enumeration) → 11. istek 429. Benzersiz kayıt sayılmaz.',
    run: async (ctx) => {
      const email = ctx.uniq('enum') + '@example.com';
      try {
        const first = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
        ctx.equal(first.status, 201, 'ilk (benzersiz) kayıt 201');
        for (let i = 0; i < 10; i++) {
          await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } }); // 409 çakışma
        }
        const r = await apiFetch('/auth/register', { method: 'POST', body: { email, password: TEST_PASSWORD } });
        ctx.equal(r.status, 429, '11. çakışma denemesi 429 olmalı');
      } finally {
        clearAttempts('register:::ffff:127.0.0.1'); clearAttempts('register:127.0.0.1');
      }
    },
  },

  // --- Yeni (İş 1 + İş 2): middleware limiter'ları doğrudan çağırarak test edilir (HTTP değil,
  // sahte req/res/next) — __beylinkTestRunning muafiyeti test süresince bypass edilir ki
  // "muaf olduğu için test edilemiyor" paradoksu çözülsün. Her test finally'de bayrağı geri
  // yükler (mailer de bu bayrağı kullanır — geri yüklenmezse sonraki testlerde gerçek e-posta
  // gönderimi tetiklenebilir) ve kendi bucket'larını temizler.
  {
    id: 'rl.new-threshold-blocks-with-retry-after',
    name: 'Yeni middleware limiter eşik aşımında 429 + Retry-After döner',
    category: 'Rate Limit',
    description: 'createRateLimiter ile üretilen limiter doğrudan çağrılır (max=3): ilk 2 istek geçer, 3. ve 4. istek (aktif blokta) 429 + Retry-After header.',
    run: async (ctx) => {
      const key = ctx.uniq('newlim');
      const limiter = createRateLimiter({ keyFn: () => key, max: 3, windowMs: 60000, blockMs: 5000, message: 'test-limit' });
      const wasRunning = globalThis.__beylinkTestRunning;
      globalThis.__beylinkTestRunning = false; // muafiyeti bypass et
      try {
        const calls = [];
        const res = fakeRes();
        const next = (err) => calls.push(err);
        limiter({}, res, next); // 1 -> ok
        limiter({}, res, next); // 2 -> ok
        limiter({}, res, next); // 3 -> hits=max -> blocked
        limiter({}, res, next); // 4 -> aktif blokta -> blocked
        ctx.equal(calls.length, 4, '4 next() çağrısı olmalı');
        ctx.assert(!calls[0] && !calls[1], 'ilk 2 çağrı hatasız geçmeli');
        ctx.assert(calls[2] && calls[2].status === 429, '3. çağrı (eşiğe ulaşan) 429 olmalı');
        ctx.assert(calls[3] && calls[3].status === 429, '4. çağrı (aktif blokta) 429 olmalı');
        ctx.assert(Number(res.headers['Retry-After']) > 0, 'Retry-After header pozitif olmalı');
      } finally {
        globalThis.__beylinkTestRunning = wasRunning;
        clearAttempts(key);
      }
    },
  },
  {
    id: 'rl.new-limiter-test-flag-exemption',
    name: '__beylinkTestRunning bayrağı yeni limiter\'ları muaf tutar',
    category: 'Rate Limit',
    description: 'Bayrak true iken eşik aşımı bile bucket\'a dokunmaz/429 üretmez; false\'a çevrilince aynı limiter normal çalışır.',
    run: async (ctx) => {
      const key = ctx.uniq('exempt');
      const limiter = createRateLimiter({ keyFn: () => key, max: 2, windowMs: 60000, blockMs: 5000, message: 'test-limit' });
      const wasRunning = globalThis.__beylinkTestRunning;
      try {
        globalThis.__beylinkTestRunning = true;
        const calls1 = [];
        const res1 = fakeRes();
        for (let i = 0; i < 5; i++) limiter({}, res1, (err) => calls1.push(err));
        ctx.assert(calls1.every((e) => !e), 'bayrak true iken hiçbir çağrı 429 olmamalı (5 istek > max=2 olsa da)');

        globalThis.__beylinkTestRunning = false;
        const calls2 = [];
        const res2 = fakeRes();
        limiter({}, res2, (e) => calls2.push(e)); // 1 -> ok (exempt fazında bucket hiç dokunulmamıştı)
        limiter({}, res2, (e) => calls2.push(e)); // 2 -> hits=max -> blocked
        ctx.assert(!calls2[0], 'bayrak false\'a çevrilince ilk istek geçmeli');
        ctx.assert(calls2[1] && calls2[1].status === 429, 'bayrak false iken 2. istek (max=2) 429 üretmeli');
      } finally {
        globalThis.__beylinkTestRunning = wasRunning;
        clearAttempts(key);
      }
    },
  },
  {
    id: 'rl.new-limiter-keyfn-user-scoped',
    name: 'Kullanıcı-başı keyFn deseni (billing/upload) doğru izole eder',
    category: 'Rate Limit',
    description: 'billing/upload limiter deseni: req.user.id anahtar üretir, req.user yoksa null (atlanır); farklı kullanıcılar birbirini bloklamaz.',
    run: async (ctx) => {
      const tag = ctx.uniq('userscope');
      const keyFn = (req) => (req.user ? `billing:${tag}:${req.user.id}` : null);
      const limiter = createRateLimiter({ keyFn, max: 2, windowMs: 60000, blockMs: 5000, message: 'test-limit' });
      const wasRunning = globalThis.__beylinkTestRunning;
      globalThis.__beylinkTestRunning = false;
      try {
        const resA = fakeRes();
        const callsA = [];
        const reqA = { user: { id: 'A' } };
        limiter(reqA, resA, (e) => callsA.push(e)); // 1 ok
        limiter(reqA, resA, (e) => callsA.push(e)); // 2 blocked
        ctx.assert(!callsA[0], 'A kullanıcısı ilk istek geçmeli');
        ctx.assert(callsA[1] && callsA[1].status === 429, 'A kullanıcısı 2. istekte bloklanmalı');

        const resB = fakeRes();
        const callsB = [];
        const reqB = { user: { id: 'B' } };
        limiter(reqB, resB, (e) => callsB.push(e));
        ctx.assert(!callsB[0], 'B kullanıcısı A\'nın bloğundan etkilenmemeli (ayrı anahtar)');

        const resNoUser = fakeRes();
        const callsNoUser = [];
        for (let i = 0; i < 5; i++) limiter({}, resNoUser, (e) => callsNoUser.push(e));
        ctx.assert(callsNoUser.every((e) => !e), 'req.user yoksa anahtar null → her zaman atlanır, asla bloklanmaz');
      } finally {
        globalThis.__beylinkTestRunning = wasRunning;
        clearAttempts(`billing:${tag}:A`);
        clearAttempts(`billing:${tag}:B`);
      }
    },
  },
  {
    id: 'rl.new-limiter-keyfn-domain-normalized',
    name: 'tls-check keyFn deseni domain-normalize eder, domain-başı izole',
    category: 'Rate Limit',
    description: 'normalizeDomain ile aynı domain farklı yazımlarda (case) aynı bucket\'a düşer; farklı domain ayrı bucket (legit çok-domain Caddy boğulmaz).',
    run: async (ctx) => {
      // normalizeDomain alt çizgiye izin vermez (gerçek hostname kuralı) — ctx.uniq()'ün
      // ürettiği '_' karakterlerini '-' ile değiştirerek geçerli bir sentetik domain kurulur.
      const tag = ctx.uniq('tlsdom').replace(/_/g, '-');
      const domainA = `example-${tag}.com`;
      const domainB = `other-${tag}.com`;
      const keyFn = (req) => `tls:${normalizeDomain(req.query.domain) || `ip:${req.ip}`}`;
      const limiter = createRateLimiter({ keyFn, max: 2, windowMs: 60000, blockMs: 5000, message: 'test-limit' });
      const wasRunning = globalThis.__beylinkTestRunning;
      globalThis.__beylinkTestRunning = false;
      try {
        ctx.assert(normalizeDomain(domainA) === domainA, 'ön koşul: sentetik domain geçerli normalize edilmeli');

        const res1 = fakeRes();
        const calls1 = [];
        limiter({ query: { domain: domainA.toUpperCase() } }, res1, (e) => calls1.push(e)); // 1 ok (büyük harf)
        limiter({ query: { domain: domainA } }, res1, (e) => calls1.push(e)); // 2 -> aynı normalize edilmiş anahtar -> blocked
        ctx.assert(!calls1[0], '1. istek geçmeli');
        ctx.assert(calls1[1] && calls1[1].status === 429, '2. istek (case-normalize sonrası aynı anahtar) bloklanmalı');

        const res2 = fakeRes();
        const calls2 = [];
        limiter({ query: { domain: domainB } }, res2, (e) => calls2.push(e));
        ctx.assert(!calls2[0], 'farklı domain bloklu ilk domainden etkilenmemeli (Caddy çok-domain boğulmaz)');
      } finally {
        globalThis.__beylinkTestRunning = wasRunning;
        clearAttempts(`tls:${domainA}`);
        clearAttempts(`tls:${domainB}`);
      }
    },
  },
  {
    id: 'rl.sweep-removes-stale-preserves-active-block',
    name: 'sweep() stale bucket\'ları siler, AKTİF bloğu korur',
    category: 'Rate Limit',
    description: 'Stale (süresi geçmiş, bloklu olmayan) bucket sweep ile silinir; aktif blokta olan bucket silinmez (saldırgan serbest kalmaz). __bucketCount ile ölçülür.',
    run: async (ctx) => {
      const keyStale = ctx.uniq('stale');
      const keyActive = ctx.uniq('active');
      try {
        clearAttempts(keyStale);
        clearAttempts(keyActive);
        const countBefore = __bucketCount();

        consume(keyStale, { max: 100, windowMs: 50, blockMs: 50 });     // hiç bloklanmadı, staleAfter ≈ +50ms
        consume(keyActive, { max: 1, windowMs: 100, blockMs: 100000 }); // hemen bloklanır, staleAfter ≈ +100000ms

        ctx.equal(__bucketCount(), countBefore + 2, 'iki yeni bucket eklenmiş olmalı');

        const future = Date.now() + 5000; // stale'in staleAfter'ı (+50ms) geçti, active'inki (+100000ms) geçmedi
        const deleted = sweep(future);

        ctx.assert(deleted >= 1, 'en az 1 stale bucket silinmeli');
        ctx.equal(__bucketCount(), countBefore + 1, 'yalnız stale silinmeli, aktif blok kalmalı');
        ctx.assert(isBlocked(keyActive, future), 'aktif blok sweep sonrası hâlâ bloklu olmalı');
      } finally {
        clearAttempts(keyStale);
        clearAttempts(keyActive);
      }
    },
  },
  {
    id: 'rl.new-limiter-fail-open-on-keyfn-throw',
    name: 'Limiter kendi hatasında fail-open (next() hatasız çağrılır)',
    category: 'Rate Limit',
    description: 'keyFn beklenmedik şekilde throw ederse legit trafik engellenmez — try/catch next() ile yutulur.',
    run: async (ctx) => {
      const limiter = createRateLimiter({
        keyFn: () => { throw new Error('boom'); },
        max: 1, windowMs: 1000, blockMs: 1000, message: 'test-limit',
      });
      const wasRunning = globalThis.__beylinkTestRunning;
      globalThis.__beylinkTestRunning = false;
      try {
        const calls = [];
        const res = fakeRes();
        limiter({}, res, (e) => calls.push(e));
        ctx.equal(calls.length, 1, 'next() bir kez çağrılmalı');
        ctx.assert(calls[0] === undefined, 'fail-open: next() hatasız (argümansız) çağrılmalı');
      } finally {
        globalThis.__beylinkTestRunning = wasRunning;
      }
    },
  },
];
