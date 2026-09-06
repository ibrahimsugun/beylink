// Test yardımcıları — model/service çağrıları için ince sarmalayıcı + self-loopback fetch.
// Testler `bltest_z_` prefix'li izole veriyle çalışır; cleanupTestUsers() sonunda temizler.
import bcrypt from 'bcryptjs';
import http from 'node:http';
import db from '../db/connection.js';
import { userModel } from '../models/userModel.js';
import { profileModel } from '../models/profileModel.js';
import { walletModel } from '../models/walletModel.js';
import { signToken } from '../utils/jwt.js';
import { config } from '../config/env.js';

const BASE = () => `http://127.0.0.1:${config.port}/api`;

const TEST_PASSWORD = 'testtest123';

// Owner kullanıcı yaratır (opsiyonel plan/bakiye/admin) + profil. Şifre 'testtest123'.
export async function createTestOwner(ctx, { plan = 'free', balance_micro = 0, is_admin = 0, expiresAt = null, is_active = 1, email_verified = 1 } = {}) {
  const email = ctx.uniq('user') + '@example.com';
  const passwordHash = bcrypt.hashSync(TEST_PASSWORD, 8);
  const user = userModel.createOwner({ email, passwordHash });
  const slug = ctx.uniq('slug').toLowerCase();
  profileModel.create({ userId: user.id, username: slug, displayName: 'Test User' });
  // Test owner'ları VARSAYILAN doğrulanmış (email_verified=1) — çoğu işlevsel test için normal baseline.
  // E-posta onay gating'ini test edenler açıkça { email_verified: 0 } geçer.
  db.prepare(
    `UPDATE users SET plan = ?, plan_expires_at = ?, credits_micro = ?, is_admin = ?, is_active = ?, email_verified = ? WHERE id = ?`,
  ).run(plan, expiresAt, balance_micro, is_admin ? 1 : 0, is_active, email_verified ? 1 : 0, user.id);
  return { ...userModel.findById(user.id), password: TEST_PASSWORD, profile_slug: slug };
}

// Alt hesap (sub) yaratır — parent owner tarafından yönetilir.
export async function createTestSub(ctx, parentUser, { is_active = 1, can_edit_profile = 1 } = {}) {
  const username = ctx.uniq('sub').toLowerCase();
  const passwordHash = bcrypt.hashSync(TEST_PASSWORD, 8);
  const sub = userModel.createSub({ username, passwordHash, parentUserId: parentUser.id });
  profileModel.create({ userId: sub.id, username, displayName: 'Sub User' });
  if (is_active !== 1 || can_edit_profile !== 1) {
    db.prepare(`UPDATE users SET is_active = ?, can_edit_profile = ? WHERE id = ?`).run(is_active, can_edit_profile, sub.id);
  }
  return { ...userModel.findById(sub.id), password: TEST_PASSWORD, username };
}

// Doğrudan JWT üret — kayıt/giriş akışını atlayıp test hızını artırır.
export function tokenFor(user) {
  return signToken({ sub: user.id, tv: user.token_version ?? 0 });
}

// Self-loopback HTTP çağrısı — endpoint davranışını gerçek middleware zinciriyle test etmek için.
// Testlere x-test-runner header'ı bilgi amaçlıdır (rate-limit istisnası yapmıyoruz).
export async function apiFetch(path, { method = 'GET', body, token, headers = {} } = {}) {
  const h = { 'Content-Type': 'application/json', 'x-test-runner': '1', ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE() + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* text kalır */ }
  return { status: res.status, body: json ?? text };
}

// Host-farkında self-loopback istek — özel domain testleri için. `fetch()` Host başlığını
// değiştirmeye izin VERMEZ (Fetch spec'inde yasak başlık); ham `http.request` bunu kısıtlamaz,
// bu yüzden resolveHost middleware'ini gerçek bir istekle (Caddy/nginx'in ilettiği gibi) test
// etmenin tek yolu budur.
export function hostFetch(path, host, { method = 'GET', body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: config.port,
        path: `/api${path}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-test-runner': '1',
          Host: host,
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          let json = null;
          try { json = data ? JSON.parse(data) : null; } catch { /* text kalır */ }
          resolve({ status: res.statusCode, body: json ?? data });
        });
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Bakiye ver — walletModel.apply ile ledger'a yazılır.
export function creditUser(userId, micro) {
  return walletModel.apply(userId, micro, 'test.setup', 'test');
}

// Profile için link yaratır (helper) — döner link satırını.
export function createLinkFor(profileId, { type = 'link', title = 'L', url = 'https://example.com', sort_order = 0, is_active = 1, btag = null } = {}) {
  const info = db
    .prepare(`INSERT INTO links (profile_id, type, title, url, sort_order, is_active, btag) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(profileId, type, title, url, sort_order, is_active, btag);
  return db.prepare(`SELECT * FROM links WHERE id = ?`).get(info.lastInsertRowid);
}

// UTC datetime string (SQLite formatı) — opsiyonel offset ms
export function sqlNow(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString().slice(0, 19).replace('T', ' ');
}

export { TEST_PASSWORD };
