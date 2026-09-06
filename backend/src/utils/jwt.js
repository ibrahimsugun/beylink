import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const signToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// 2FA ara-adım (challenge) tokenı — parola doğru ama TOTP henüz girilmedi.
// pending_2fa bayrağı normal oturum tokenından ayırır (requireAuth reddeder). Kısa ömürlü.
export const signChallenge = (payload) =>
  jwt.sign({ ...payload, pending_2fa: true }, config.jwtSecret, { expiresIn: '5m' });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);
