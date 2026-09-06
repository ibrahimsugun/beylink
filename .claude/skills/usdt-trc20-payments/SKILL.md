---
name: usdt-trc20-payments
description: Self-custody USDT (TRC-20) crypto payment + credit top-up without a payment provider — TronGrid REST verification, no extra npm deps, private key never on the server. Includes the polished two-column payment UI (demo instant-confirm mode + real on-chain verified mode with pending/paid/expired states, black QR, cancel). Use when adding "pay with crypto" / credit loading to a Node/Express + React app. Reusable pattern from Tıklatbari.
---

# USDT TRC-20 Payments (self-custody, no provider)

Verify incoming USDT (TRC-20 / Tron) payments **yourself** — no NOWPayments/Cryptomus, no commission,
no third-party dependency. Node/Express + `better-sqlite3` + React. **The Gotchas section contains
two bugs that will silently break the whole thing — read it before shipping.**

## Architecture decisions
- **TronGrid REST**, Node `fetch`, **zero extra npm packages** (no tronweb).
- **Private key is NOT on the server.** The server only knows the *receiving address* (cold wallet).
  If the server is compromised, funds are still safe.
- **Not a separate process/service** — a `services/payments.js` module + a `setTimeout`-chained poller
  started from `server.js`. (Single-instance MVP; a separate process adds no security.)
- One network only (**TRC-20**) keeps the surface small: ~$0.5 fee, ~3s blocks, ~1min finality.

## Two UI modes (same visual language)
1. **Demo mode** (`PaymentPage`): plan upgrade / credit top-up that credits *instantly* on an
   "Ödemeyi Yaptım" click. For prototypes only — trusts the client. Never ship as real.
2. **Real verified mode** (`TestOdemePage`): user gets an invoice, sends exactly that amount on-chain,
   a poller detects it via TronGrid and credits automatically. This is the production path.

## Schema (`payments`)
```
id, user_id, order_ref TEXT UNIQUE, network TEXT ('TRC20'), address TEXT,
service_amount_micro INT, fee_amount_micro INT, expected_amount_micro INT,   -- USDT*1e6
received_amount_micro INT, txid TEXT UNIQUE, confirmations INT,
status TEXT ('pending'|'paid'|'expired'), expires_at, created_at, paid_at
```
Credits balance lives on `users.credits` (REAL). `txid UNIQUE` is the idempotency backbone.

## Matching an incoming payment to an order
TRC-20 has **no memo/tag field** — you cannot attach an order id. Two options:
- **Exact amount** (simplest): `expected_amount_micro = amount*1e6`; match incoming value to the
  oldest pending invoice. Great for single-user/test; at scale two identical-amount pending invoices
  can mis-match.
- **Unique-amount salt** (multi-user): add `0..999` micro salt so each pending amount is unique; use a
  TTL reservation. Downside: user must send a non-round amount (e.g. `10.000347`) — surface it as the
  single authoritative "send exactly this" number with a copy button, or it causes confusion.
- **Scale answer:** HD wallet, one derived address per order (needs key management).

## TronGrid read (`fetchTrc20Transfers`)
```js
const url = new URL(`https://api.trongrid.io/v1/accounts/${WALLET}/transactions/trc20`);
url.searchParams.set('only_to', 'true');
url.searchParams.set('only_confirmed', 'true');   // ← FINALITY GATE. See Gotcha #1.
url.searchParams.set('limit', '50');
url.searchParams.set('order_by', 'block_timestamp,asc');
if (minTimestampMs > 0) url.searchParams.set('min_timestamp', String(minTimestampMs));
const headers = { accept: 'application/json' };
if (API_KEY) headers['TRON-PRO-API-KEY'] = API_KEY;   // mainnet needs a key; testnets don't
const body = await (await fetch(url, { headers })).json();
return Array.isArray(body?.data) ? body.data : [];
```
Real tx fields: `token_info.address` (contract), `to`, `value` (string micro), `transaction_id`,
`block_timestamp`. (There is **no** per-tx `confirmed` field on this endpoint — Gotcha #1.)

## processTransfer security (order matters)
1. **Contract whitelist** — `tx.token_info.address === USDT_CONTRACT`
   (mainnet `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`). Check the **contract hash**, never the symbol/name
   (fake tokens reuse "USDT"). This one line kills the fake-token attack.
2. `tx.to === WALLET`.
3. Finality via `only_confirmed=true` (do NOT gate on `tx.confirmed !== true`; see Gotcha #1).
4. Match `Number(tx.value)` to a pending invoice's `expected_amount_micro`.
5. **Idempotent credit** in one transaction: `UPDATE payments SET status='paid', txid=? WHERE id=? AND
   status='pending'` (CAS) + `UPDATE users SET credits = credits + ?`. `txid UNIQUE` makes a second
   credit impossible even under retries/webhook duplicates.

## Poller + lifecycle
- `startPoller()` from `server.js`: `setTimeout`-chained tick (not `setInterval`, so errors don't
  pile up), every ~30s: `expireStale()` then `pollTron()`. Advance `min_timestamp` from the max
  `block_timestamp` seen so you don't rescan history (idempotency covers the overlap window).
- `cancelInvoice(orderRef, userId)`: user "Cancel" must flip status `pending→expired` **server-side**
  — otherwise it re-hydrates on reload and can still match a payment. The frontend cancel clears local
  state AND calls `POST /invoice/:ref/cancel`.
- `getActiveInvoice(userId)`: on page load, hydrate the latest pending invoice so the user doesn't
  re-enter the amount.

## Frontend (`TestOdemePage`)
Two-column (`md:grid-cols-5`, left `col-span-3` / right `col-span-2`). Left: method tabs
(Crypto active / Card "soon"), a single **USDT — TRC-20** badge (no coin selector — one network only),
a prominent **amber network warning**, address + **plain black QR** (`qr-code-styling`, `dotsOptions
type:'square' color:'#000'`, no logo — not the branded QR), and state blocks:
- **pending:** the amount to send as the hero (big, mono, copy button) + "waiting" box with MM:SS
  countdown, "check now", and "Cancel".
- **paid:** green "Ödeme Ulaştı", credited amount, txid, "New payment".
- **expired:** amber + "New invoice".
Auto-poll `GET /invoice/:ref` every 10s; on `pending→paid` call `refreshUser().catch(()=>{})`.
Show `walletInfo()` (`GET /billing/wallet`) so the address/QR render even before an invoice.

## Env
`TRC20_WALLET_ADDRESS` (receive-only), `TRC20_USDT_CONTRACT`, `TRONGRID_API_KEY` (optional),
`TRC20_MIN_CONFIRMATIONS` (test 1 / mainnet 19), `PAYMENT_TTL_MINUTES`, `PAYMENT_POLL_INTERVAL_SECONDS`,
`PAYMENT_MIN_USD`, `PAYMENT_MAX_USD`. Keep `.env` out of git; there is no `.env` by default — the app
won't start the poller (and invoice creation 503s) until `TRC20_WALLET_ADDRESS` is set.

## Gotchas (each one silently breaks payments)
1. **TronGrid's `/transactions/trc20` endpoint does NOT return a `confirmed` field** (it's
   `undefined`). If you gate on `if (tx.confirmed !== true) skip`, `undefined !== true` is always
   true → **every payment is rejected, nobody is ever credited.** Filter via the **`only_confirmed=true`
   query param** instead; then trust the returned rows. Found only by hitting the live API.
2. **Mock harnesses hide #1** — the mock faked `confirmed:true`, so tests were green while the real
   integration was 100% broken. **Always verify a payment/external-API integration with a live
   read-only call** (fetch the receiving address's real transfers), not just mocks.
3. **Cancel must hit the server.** Clearing only local state leaves a live pending invoice that
   re-appears and can still capture a payment.
4. **Credit = intended amount, not necessarily received.** If you add a fee, credit the service
   portion; if not, `received == expected == credit`. Be explicit so tax/fee lines aren't cosmetic.
5. **You cannot recover funds sent on the wrong network.** Make the "TRC-20 only" warning unmissable —
   this is a universal crypto truth, not something code can fix.

## Verification
- **Live E2E (the important one):** fetch a real confirmed transfer to the wallet, insert a pending
  invoice whose `expected_amount_micro` equals that transfer's `value`, run `processTransfer(realTx)`,
  assert it credits, records `txid`, is idempotent on repeat, and rejects a fake contract.
- Boot on a temp `DB_PATH`; assert cancel → `expired` + no active invoice + no match; wrong
  contract/amount → skipped.
