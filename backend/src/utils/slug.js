import { profileModel } from '../models/profileModel.js';

const RESERVED = new Set([
  'admin', 'api', 'login', 'register', 'dashboard', 'design', 'seo',
  'analytics', 'settings', 'sub-accounts', 'subaccounts', 'plans', 'app', 'www',
]);

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])$/;

export function normalizeSlug(raw = '') {
  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.\-_]+|[.\-_]+$/g, '');
}

export function isValidSlug(slug) {
  return SLUG_RE.test(slug) && !RESERVED.has(slug);
}

/** slug'ı benzersiz hale getirir (çakışırsa -2, -3 ekler) */
export function uniqueSlug(base) {
  let slug = normalizeSlug(base) || 'kullanici';
  if (slug.length < 3) slug = `${slug}-bio`;
  let candidate = slug;
  let i = 1;
  while (profileModel.usernameExists(candidate)) {
    i += 1;
    candidate = `${slug}-${i}`;
  }
  return candidate;
}
