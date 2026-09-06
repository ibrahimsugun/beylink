// Basit bellek-içi deneme sınırlayıcı (tek sunucu — Redis gerekmez).
// Anahtar başına başarısız denemeleri sayar; eşik aşılınca cooldown süresince kilitler.
// Başarılı işlemde clearAttempts ile sıfırlanır. Sürekli büyümeyi önlemek için
// süresi geçmiş kayıtlar okuma sırasında (lazy) temizlenir.
import { tooManyRequests } from './ApiError.js';

const buckets = new Map(); // key -> { fails, firstAt, blockedUntil, staleAfter }

const DEFAULTS = { max: 10, windowMs: 10 * 60 * 1000, blockMs: 10 * 60 * 1000 };

/** Şu an kilitli mi? (kilit süresi dolduysa kaydı temizler) */
export function isBlocked(key, now = Date.now()) {
  const b = buckets.get(key);
  if (!b) return false;
  if (b.blockedUntil && now < b.blockedUntil) return true;
  if (b.blockedUntil && now >= b.blockedUntil) buckets.delete(key); // kilit bitti → temiz başla
  return false;
}

/** Başarısız denemeyi kaydet; eşik aşılırsa kilitle. Kalan deneme sayısını döndürür. */
export function recordFailure(key, opts = {}) {
  const { max, windowMs, blockMs } = { ...DEFAULTS, ...opts };
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.firstAt > windowMs) b = { fails: 0, firstAt: now, blockedUntil: 0 };
  b.fails += 1;
  if (b.fails >= max) b.blockedUntil = now + blockMs;
  b.staleAfter = now + Math.max(windowMs, blockMs); // yalnız GC süpürmesi için — okuma/blok mantığını etkilemez
  buckets.set(key, b);
  return Math.max(0, max - b.fails);
}

/** Başarılı işlem — sayacı sıfırla. */
export function clearAttempts(key) {
  buckets.delete(key);
}

// --- İş 1: her isteği sayan middleware limiter'ları (auth deneme sayaçlarından ayrı semantik) ---

/** In-house test paketi koşuyor mu? (sunucu-tarafı bayrak, istemci spoof edemez) */
export function isTestRunning() {
  return globalThis.__beylinkTestRunning === true;
}

/**
 * Her isteği sayar (başarı/başarısızlık ayrımı yok). Eşik aşılırsa kilitler.
 * recordFailure ile aynı bucket şeklini paylaşır ama ayrı sayaç alanı (`hits`) kullanır
 * ki auth deneme sayaçlarıyla (`fails`) karışmasın.
 */
export function consume(key, opts = {}) {
  const { max, windowMs, blockMs } = { ...DEFAULTS, ...opts };
  const now = Date.now();
  let b = buckets.get(key);

  if (b && b.blockedUntil && now < b.blockedUntil) {
    return { blocked: true, retryAfterSec: Math.ceil((b.blockedUntil - now) / 1000) };
  }

  if (!b || b.hits === undefined || now - b.firstAt > windowMs) {
    b = { hits: 0, firstAt: now, blockedUntil: 0 };
  }
  b.hits += 1;
  if (b.hits >= max) b.blockedUntil = now + blockMs;
  b.staleAfter = now + Math.max(windowMs, blockMs);
  buckets.set(key, b);

  if (b.blockedUntil && now < b.blockedUntil) {
    return { blocked: true, retryAfterSec: Math.ceil((b.blockedUntil - now) / 1000) };
  }
  return { blocked: false, retryAfterSec: 0 };
}

/**
 * Express middleware fabrikası — her isteği sayan basit limiter.
 * keyFn(req) -> string|null (null => atlanır). exempt(req) -> boolean (opsiyonel, path muafiyeti).
 * Fail-open: limiter'ın kendi hatası next() ile yutulur; yalnız kasıtlı 429 iletilir.
 */
export function createRateLimiter({ keyFn, max, windowMs, blockMs, message, exempt }) {
  return function rateLimiterMiddleware(req, res, next) {
    try {
      if (isTestRunning()) return next();
      if (exempt && exempt(req)) return next();
      const key = keyFn(req);
      if (!key) return next();
      const { blocked, retryAfterSec } = consume(key, { max, windowMs, blockMs });
      if (blocked) {
        if (retryAfterSec > 0) res.setHeader('Retry-After', String(retryAfterSec));
        return next(tooManyRequests(message));
      }
      return next();
    } catch {
      return next(); // fail-open — limiter'ın kendi hatası legit trafiği engellemesin
    }
  };
}

// --- İş 2: bellek-içi Map'in sınırsız büyümesini önleyen periyodik süpürme (GC) ---

let sweepIntervalHandle = null;

/**
 * Stale bucket'ları siler: `now > staleAfter` VE AKTİF blokta değil (`!blockedUntil || now >= blockedUntil`).
 * AKTİF bloktaki bir saldırgan sweep ile serbest kalmamalı — blok bitene kadar bucket kalır.
 * Döner: silinen bucket sayısı.
 */
export function sweep(now = Date.now()) {
  let deleted = 0;
  for (const [key, b] of buckets) {
    if (b.staleAfter === undefined) continue; // staleAfter yazılmamış eski/bilinmeyen kayıt — dokunma
    const activelyBlocked = b.blockedUntil && now < b.blockedUntil;
    if (now > b.staleAfter && !activelyBlocked) {
      buckets.delete(key);
      deleted += 1;
    }
  }
  return deleted;
}

/** Periyodik süpürmeyi başlatır (idempotent — zaten çalışıyorsa yeniden başlatmaz). `.unref()` → süreç çıkışını engellemez. */
export function startSweeper(intervalMs = 5 * 60 * 1000) {
  if (sweepIntervalHandle) return sweepIntervalHandle;
  sweepIntervalHandle = setInterval(() => sweep(), intervalMs);
  sweepIntervalHandle.unref?.();
  return sweepIntervalHandle;
}

/** Süpürmeyi durdurur (test/kapanış). */
export function stopSweeper() {
  if (sweepIntervalHandle) {
    clearInterval(sweepIntervalHandle);
    sweepIntervalHandle = null;
  }
}

// --- test-only introspection ---
export function __bucketCount() {
  return buckets.size;
}
export function __sweepNow() {
  return sweep(Date.now());
}
