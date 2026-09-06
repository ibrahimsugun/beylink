// Alt Hesap kategorisi — plan-bazlı vs hesaba-kalıcı haklar, premium yaşam döngüsü (askı/reaktivasyon),
// guardSuspended mutasyon bloğu, alt hesap SEO salt-okunur.
import db from '../db/connection.js';
import { userModel } from '../models/userModel.js';
import { profileModel } from '../models/profileModel.js';
import { applyExpiryIfNeeded } from '../utils/plan.js';
import { apiFetch, createTestOwner, createTestSub, tokenFor, sqlNow, TEST_PASSWORD } from './helpers.js';

const MICRO = 1_000_000;

export const subaccountTests = [
  {
    id: 'subaccount.created-with-basic-plan',
    name: 'Yeni alt hesap Basic plan ile oluşturulur',
    category: 'Alt Hesap',
    description: 'Pro owner POST /subaccounts → dönen alt hesabın plan alanı basic.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      // slug ≤30 char olmalı; bltest_z_ prefix'i cleanup için korunur
      const r = await apiFetch('/subaccounts', {
        method: 'POST', token: tokenFor(owner),
        body: { username: ctx.uniq('s').slice(0, 24), password: TEST_PASSWORD, display_name: 'Ekip' },
      });
      ctx.equal(r.status, 201, 'alt hesap 201');
      ctx.equal(r.body?.subAccount?.plan, 'basic', 'alt hesap Basic plan almalı');
    },
  },
  {
    id: 'subaccount.expiry-suspends-subs',
    name: 'Premium bitince alt hesaplar askıya alınır (silinmez)',
    category: 'Alt Hesap',
    description: 'Pro owner süresi dolar → applyExpiryIfNeeded Free + tüm subs is_suspended=1; satırlar durur.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(-86400000) });
      const sub = await createTestSub(ctx, owner);
      ctx.equal(userModel.findById(sub.id).is_suspended, 0, 'başta askıda değil');
      const resolved = applyExpiryIfNeeded(userModel.findById(owner.id));
      ctx.equal(resolved.plan, 'free', 'owner Free\'ye düşer');
      ctx.equal(userModel.findById(sub.id).is_suspended, 1, 'alt hesap askıya alınır');
      ctx.assert(!!userModel.findById(sub.id), 'alt hesap silinmez');
    },
  },
  {
    id: 'subaccount.reactivate-all',
    name: 'Premium yenilenince tüm alt hesaplar aktifleştirilir',
    category: 'Alt Hesap',
    description: 'Askıdaki subs + Pro owner → POST /subaccounts/reactivate-all → is_suspended=0.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const sub = await createTestSub(ctx, owner);
      db.prepare(`UPDATE users SET is_suspended = 1 WHERE id = ?`).run(sub.id);
      const r = await apiFetch('/subaccounts/reactivate-all', { method: 'POST', token: tokenFor(owner) });
      ctx.equal(r.status, 200, 'reactivate 200');
      ctx.equal(userModel.findById(sub.id).is_suspended, 0, 'alt hesap tekrar aktif');
    },
  },
  {
    id: 'subaccount.reactivate-requires-premium',
    name: 'Free owner alt hesap aktifleştiremez',
    category: 'Alt Hesap',
    description: 'Free plan owner → POST /subaccounts/reactivate-all 403.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'free' });
      const r = await apiFetch('/subaccounts/reactivate-all', { method: 'POST', token: tokenFor(owner) });
      ctx.equal(r.status, 403, 'Free\'de reactivate 403');
    },
  },
  {
    id: 'subaccount.suspended-cannot-mutate',
    name: 'Askıdaki alt hesap işlem yapamaz (GET serbest)',
    category: 'Alt Hesap',
    description: 'is_suspended=1 sub → POST /links 403 (guardSuspended); GET /profiles/me 200.',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const sub = await createTestSub(ctx, owner);
      db.prepare(`UPDATE users SET is_suspended = 1 WHERE id = ?`).run(sub.id);
      const prof = profileModel.findByUserId(sub.id);
      const token = tokenFor(sub);
      const get = await apiFetch('/profiles/me', { token });
      ctx.equal(get.status, 200, 'askıdayken GET serbest');
      const mut = await apiFetch('/links', { method: 'POST', token, body: { profile_id: prof.id, type: 'link', title: 'X', url: 'ornek.com' } });
      ctx.equal(mut.status, 403, 'askıdayken mutasyon 403');
    },
  },
  {
    id: 'subaccount.sub-seo-readonly',
    name: 'Alt hesap SEO alanlarını düzenleyemez (salt okunur)',
    category: 'Alt Hesap',
    description: 'Sub PATCH /profiles/:id {meta_title} → 403; {display_name} → 200 (SEO dışı serbest).',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const sub = await createTestSub(ctx, owner); // can_edit_profile=1, is_suspended=0
      const prof = profileModel.findByUserId(sub.id);
      const token = tokenFor(sub);
      const seo = await apiFetch(`/profiles/${prof.id}`, { method: 'PATCH', token, body: { meta_title: 'Deneme' } });
      ctx.equal(seo.status, 403, 'sub SEO yazımı 403');
      const nonSeo = await apiFetch(`/profiles/${prof.id}`, { method: 'PATCH', token, body: { display_name: 'Yeni Ad' } });
      ctx.equal(nonSeo.status, 200, 'sub SEO dışı düzenleme 200');
    },
  },
  {
    id: 'subaccount.owner-edit-suspended-blocked',
    name: 'Owner askıdaki alt hesabın profilini düzenleyemez',
    category: 'Alt Hesap',
    description: 'Askıdaki sub profilini owner PATCH → 403 (assertProfileEditable askı guard).',
    run: async (ctx) => {
      const owner = await createTestOwner(ctx, { plan: 'pro', expiresAt: sqlNow(30 * 86400000) });
      const sub = await createTestSub(ctx, owner);
      db.prepare(`UPDATE users SET is_suspended = 1 WHERE id = ?`).run(sub.id);
      const prof = profileModel.findByUserId(sub.id);
      const r = await apiFetch(`/profiles/${prof.id}`, { method: 'PATCH', token: tokenFor(owner), body: { display_name: 'X' } });
      ctx.equal(r.status, 403, 'owner askıdaki sub profilini düzenleyemez');
    },
  },
];
