// Kredi/cüzdan kategorisi — walletModel atomic, ledger, negatif guard, admin adjust endpoint.
import db from '../db/connection.js';
import { walletModel } from '../models/walletModel.js';
import { apiFetch, createTestOwner, tokenFor } from './helpers.js';

const MICRO = 1_000_000;

export const creditTests = [
  {
    id: 'credit.wallet-apply-ledger',
    name: 'walletModel.apply ledger yazar + bakiye günceller',
    category: 'Kredi',
    description: '+$50 uygula, -$20 uygula → bakiye $30, 2 ledger satırı, balance_after doğru.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      walletModel.apply(u.id, 50 * MICRO, 'test.credit', 'unit');
      walletModel.apply(u.id, -20 * MICRO, 'test.debit', 'unit');
      ctx.equal(walletModel.balance(u.id), 30 * MICRO);
      const rows = walletModel.ledger(u.id, 5);
      ctx.assert(rows.length >= 2, 'en az 2 ledger satırı');
      ctx.equal(rows[0].balance_after_micro, 30 * MICRO, 'son satırda bakiye $30');
    },
  },
  {
    id: 'credit.negative-balance-guard',
    name: 'Negatif bakiyeye düşmek reddedilir',
    category: 'Kredi',
    description: 'Mevcut bakiyeden fazla düşme → hata; bakiye ve ledger değişmez.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx, { balance_micro: 10 * MICRO });
      const prevRows = walletModel.ledger(u.id, 10).length;
      let threw = false;
      try { walletModel.apply(u.id, -1000 * MICRO, 'test.overdraft'); } catch { threw = true; }
      ctx.assert(threw);
      ctx.equal(walletModel.balance(u.id), 10 * MICRO, 'bakiye değişmemeli');
      ctx.equal(walletModel.ledger(u.id, 10).length, prevRows, 'ledger satırı eklenmemeli');
    },
  },
  {
    id: 'credit.ledger-monotonic',
    name: 'Ledger balance_after monoton takip eder',
    category: 'Kredi',
    description: 'Ardışık işlemlerde her satırın balance_after değeri gerçek bakiyeyle tutarlı.',
    run: async (ctx) => {
      const u = await createTestOwner(ctx);
      const moves = [+40, -10, +5, -20, +15]; // net +30 USDT
      for (const m of moves) walletModel.apply(u.id, m * MICRO, m > 0 ? 'test.credit' : 'test.debit');
      ctx.equal(walletModel.balance(u.id), 30 * MICRO);
      // Ledger'ı ID artan sırayla al ve her satırda çalışan bakiye yürüt
      const rows = db.prepare(`SELECT amount_micro, balance_after_micro FROM balance_txns WHERE user_id = ? ORDER BY id ASC`).all(u.id);
      let running = 0;
      for (const r of rows) { running += r.amount_micro; ctx.equal(r.balance_after_micro, running, 'balance_after monoton tutarlı'); }
    },
  },
  {
    id: 'credit.admin-adjust-endpoint',
    name: 'Admin kredi düzenle endpoint mutlak set + ledger yazar',
    category: 'Kredi',
    description: 'PUT /admin/users/:id/credits {new_balance_usdt:42} → bakiye $42, fark ledger\'a admin.credit_adjust.',
    run: async (ctx) => {
      const admin = await createTestOwner(ctx, { is_admin: 1 });
      const target = await createTestOwner(ctx, { balance_micro: 10 * MICRO });
      const r = await apiFetch(`/admin/users/${target.id}/credits`, {
        method: 'PUT', token: tokenFor(admin), body: { new_balance_usdt: 42, note: 'test set' },
      });
      ctx.equal(r.status, 200);
      ctx.equal(r.body.balance_micro, 42 * MICRO);
      const last = walletModel.ledger(target.id, 1)[0];
      ctx.equal(last?.reason, 'admin.credit_adjust');
      ctx.equal(last?.amount_micro, 32 * MICRO, 'delta $32 (42 - 10)');
    },
  },
  {
    id: 'credit.admin-adjust-negative-rejected',
    name: 'Admin kredi negatif değer 400',
    category: 'Kredi',
    description: '{new_balance_usdt: -5} → 400; bakiye değişmez.',
    run: async (ctx) => {
      const admin = await createTestOwner(ctx, { is_admin: 1 });
      const target = await createTestOwner(ctx, { balance_micro: 10 * MICRO });
      const r = await apiFetch(`/admin/users/${target.id}/credits`, {
        method: 'PUT', token: tokenFor(admin), body: { new_balance_usdt: -5 },
      });
      ctx.equal(r.status, 400);
      ctx.equal(walletModel.balance(target.id), 10 * MICRO);
    },
  },
  {
    id: 'credit.admin-adjust-same-value-rejected',
    name: 'Admin kredi aynı değere set etmek 400',
    category: 'Kredi',
    description: 'Bakiye zaten talep edilen değerde ise "değişiklik yok" → 400 (fark 0).',
    run: async (ctx) => {
      const admin = await createTestOwner(ctx, { is_admin: 1 });
      const target = await createTestOwner(ctx, { balance_micro: 25 * MICRO });
      const r = await apiFetch(`/admin/users/${target.id}/credits`, {
        method: 'PUT', token: tokenFor(admin), body: { new_balance_usdt: 25 },
      });
      ctx.equal(r.status, 400, 'fark 0 → 400');
    },
  },
];
