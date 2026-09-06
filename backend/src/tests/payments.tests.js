// Payments kategorisi — demo top-up, TTL expire, order_ref formatı, unique-amount tuzu, demo settle bakiye kredisi.
import db from '../db/connection.js';
import { walletModel } from '../models/walletModel.js';
import { paymentModel } from '../models/paymentModel.js';
import { demoSettle } from '../services/payments.js';
import { apiFetch, createTestOwner, tokenFor } from './helpers.js';

const MICRO = 1_000_000;

export const paymentsTests = [
  {
    id: 'payments.demo-topup-credits-balance',
    name: 'Demo top-up bakiyeyi anında kredilendirir',
    category: 'Ödemeler',
    description: 'POST /billing/topup/demo {amount_usdt:15} → bakiye +$15 + ledger topup: satırı yazılır.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      db.prepare(`UPDATE users SET is_admin = 1 WHERE id = ?`).run(u.id); // DEMOÖDEME admin-only
      const before = walletModel.balance(u.id);
      const r = await apiFetch('/billing/topup/demo', { method: 'POST', token: tokenFor(u), body: { amount_usd: 15 } });
      ctx.assert(r.status === 200 || r.status === 201, `2xx bekleniyordu, got ${r.status}`);
      const after = walletModel.balance(u.id);
      ctx.equal(after - before, 15 * MICRO, 'bakiye $15 arttı');
      const last = walletModel.ledger(u.id, 1)[0];
      ctx.assert(String(last?.reason || '').startsWith('topup:'), 'reason topup: ile başlamalı');
    },
  },
  {
    id: 'payments.demo-topup-admin-only',
    name: 'DEMOÖDEME yalnızca admin erişebilir',
    category: 'Ödemeler',
    description: 'Admin olmayan owner POST /billing/topup/demo → 403; bakiye değişmez.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const before = walletModel.balance(u.id);
      const r = await apiFetch('/billing/topup/demo', { method: 'POST', token: tokenFor(u), body: { amount_usd: 10 } });
      ctx.equal(r.status, 403, 'admin olmayan → 403');
      ctx.equal(walletModel.balance(u.id), before, 'bakiye değişmemeli');
    },
  },
  {
    id: 'payments.order-ref-format',
    name: 'Sipariş numarası BL-YYYYMMDD-XXXXXX formatında',
    category: 'Ödemeler',
    description: 'demoSettle bir payment satırı yaratır → order_ref regex ile eşleşir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = demoSettle(u.id, 5 * MICRO, { kind: 'topup', target: null });
      ctx.assert(/^BL-\d{8}-[A-Z0-9]{6}$/.test(p.order_ref || ''), `order_ref format hatalı: ${p.order_ref}`);
    },
  },
  {
    id: 'payments.demo-settle-marks-paid-and-txid-unique',
    name: 'Demo settle payment\'ı paid işaretler + txid UNIQUE',
    category: 'Ödemeler',
    description: 'Payment status=paid; txid DEMO- ile başlar; aynı txid ikinci INSERT reddedilir.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const p = demoSettle(u.id, 3 * MICRO);
      ctx.equal(p.status, 'paid');
      ctx.assert(String(p.txid || '').startsWith('DEMO-'), 'txid DEMO- ile başlamalı');
      // Aynı txid ile ikinci payment yaratmayı deneyelim (UNIQUE ihlali beklenir)
      let violated = false;
      try {
        db.prepare(`INSERT INTO payments (user_id, order_ref, txid, status, expected_amount_micro) VALUES (?, ?, ?, 'paid', 0)`)
          .run(u.id, 'BL-DUPLICATE-TEST', p.txid);
      } catch (e) {
        violated = /UNIQUE/i.test(e.message);
      }
      ctx.assert(violated, 'txid UNIQUE ihlali beklenir');
    },
  },
  {
    id: 'payments.expire-stale-transitions',
    name: 'expireStale süresi geçmiş pending\'leri expired yapar',
    category: 'Ödemeler',
    description: 'Elle geçmiş expires_at yazılan pending → expireStale sonrası status=expired.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const info = db
        .prepare(`INSERT INTO payments (user_id, order_ref, status, expected_amount_micro, expires_at, network) VALUES (?, ?, 'pending', 5000000, datetime('now','-1 hour'), 'TRC20')`)
        .run(u.id, `bltest_z_stale_${Date.now()}`);
      const changed = paymentModel.expireStale();
      ctx.assert(changed >= 1, 'en az 1 satır expired olmalı');
      const row = db.prepare(`SELECT status FROM payments WHERE id = ?`).get(info.lastInsertRowid);
      ctx.equal(row.status, 'expired');
    },
  },
];
