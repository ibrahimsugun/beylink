import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((data) => {
    if (data.token) tokenStore.set(data.token);
    setUser(data.user);
    if (data.profile) setProfile(data.profile);
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      // Yalnız kimlik geçersiz/süresi dolmuşsa çıkış yap; ağ/5xx (ör. backend yeniden
      // başlarken) oturumu düşürmesin — aksi halde geçici hata "otomatik çıkış" hissi verir.
      if (err?.status === 401) {
        tokenStore.clear();
        setUser(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (identifier, password) => {
    const data = await api.post('/auth/login', { identifier, password }, { auth: false });
    // 2FA etkinse token gelmez; oturumu kurma, çağıran 2. adıma (verify2fa) geçer.
    if (!data.requires_2fa) applySession(data);
    return data;
  };

  // 2FA giriş 2. adımı — login'den dönen challenge tokenı + TOTP kodu.
  const verify2fa = async (challenge, code) => {
    const data = await api.post('/auth/2fa/verify', { challenge, code }, { auth: false });
    applySession(data);
    return data;
  };

  const register = async (payload) => {
    const data = await api.post('/auth/register', payload, { auth: false });
    applySession(data);
    return data;
  };

  const logout = () => {
    // Server logout audit'i — fire-and-forget: token'ı elimizle taşırız çünkü hemen ardından
    // localStorage'dan sileceğiz (varsayılan interceptor "token yok" der ve isteği atlar).
    const token = tokenStore.get();
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      }).catch(() => { /* çıkış UX'ini bloklamayalım */ });
    }
    tokenStore.clear();
    setUser(null);
    setProfile(null);
  };

  const value = { user, setUser, profile, setProfile, loading, login, verify2fa, register, logout, refresh };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
