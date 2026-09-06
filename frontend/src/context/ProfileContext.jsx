import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';
import { capsFor } from '../lib/plans.js';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user, profile: ownProfile } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [subProfiles, setSubProfiles] = useState([]);
  const [btags, setBtags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Owner ise alt hesap profillerini yükle (profil değiştirici için) — dışarıdan da yenilenebilir
  const refreshSubProfiles = useCallback(async () => {
    if (user?.role !== 'owner') return;
    try {
      const d = await api.get('/subaccounts');
      setSubProfiles(d.subAccounts.filter((s) => s.profile).map((s) => ({ ...s.profile, _sub: true, sub_username: s.username })));
    } catch {
      /* sessiz geç */
    }
  }, [user]);

  useEffect(() => {
    refreshSubProfiles();
  }, [refreshSubProfiles]);

  // Başlangıç aktif profili = kendi profili
  useEffect(() => {
    if (ownProfile && activeId == null) setActiveId(ownProfile.id);
  }, [ownProfile, activeId]);

  const load = useCallback(async (id) => {
    setLoading(true);
    try {
      const [{ profile: p }, { links: l }] = await Promise.all([
        api.get(`/profiles/${id}`),
        api.get(`/links?profileId=${id}`),
      ]);
      setProfile(p);
      setLinks(l);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeId != null) load(activeId);
  }, [activeId, load]);

  // Aktif profilin kayıtlı BTAG'leri (link editörü seçimi + BtagsPage için)
  const refreshBtags = useCallback(async () => {
    // BTAG Basic+ — Free planda endpoint 403 döner; gereksiz istek atma
    if (activeId == null || !capsFor(user).btag) { setBtags([]); return; }
    try {
      const d = await api.get(`/btags/${activeId}`);
      setBtags(d.btags || []);
    } catch {
      setBtags([]);
    }
  }, [activeId, user]);

  useEffect(() => {
    refreshBtags();
  }, [refreshBtags]);

  // --- Profil ---
  const patchLocal = (patch) => setProfile((p) => ({ ...p, ...patch }));

  const saveProfile = async (patch) => {
    const { profile: updated } = await api.patch(`/profiles/${activeId}`, patch);
    setProfile(updated);
    return updated;
  };

  const uploadImage = async (kind, file) => {
    const form = new FormData();
    form.append('image', file);
    const { profile: updated } = await api.upload(`/profiles/${activeId}/${kind}`, form);
    setProfile(updated);
    return updated;
  };

  // --- Linkler / Bloklar ---
  const addLink = async (payload) => {
    const { link } = await api.post('/links', { profile_id: activeId, ...payload });
    setLinks((prev) => [...prev, link]);
    return link;
  };

  const updateLink = async (id, patch) => {
    const prev = links;
    // Anında yansıt (önizleme), sonra kaydet; hata olursa geri al
    setLinks((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    try {
      const { link } = await api.patch(`/links/${id}`, patch);
      setLinks((p) => p.map((l) => (l.id === id ? link : l)));
      return link;
    } catch (e) {
      setLinks(prev);
      throw e;
    }
  };

  const removeLink = async (id) => {
    const prev = links;
    setLinks((p) => p.filter((l) => l.id !== id));
    try {
      await api.delete(`/links/${id}`);
    } catch (e) {
      setLinks(prev);
      throw e;
    }
  };

  // Hazır sayfa şablonu uygula — mevcut bloklar sunucuda değiştirilir; profil+linkler yeniden yüklenir.
  const applyTemplate = async (payload) => {
    const { profile: p, links: l } = await api.post(`/profiles/${activeId}/apply-template`, payload);
    setProfile(p);
    setLinks(l);
    return { profile: p, links: l };
  };

  // Kayıtlı tasarım şablonunu AKTİF profile uygula (yalnız tema; bloklar korunur) → önizleme güncellenir.
  const applyDesignTemplateToActive = async (templateId) => {
    const { profile: updated } = await api.post(`/templates/${templateId}/apply`, { profile_id: activeId });
    setProfile(updated);
    return updated;
  };

  const reorder = async (orderedIds) => {
    const prev = links;
    setLinks(orderedIds.map((id) => prev.find((l) => l.id === id)).filter(Boolean));
    try {
      const { links: fresh } = await api.patch('/links/reorder', { profile_id: activeId, order: orderedIds });
      setLinks(fresh);
    } catch {
      setLinks(prev); // sunucu reddetti → görsel sırayı geri al
    }
  };

  const allProfiles = [
    ...(ownProfile ? [{ ...ownProfile, _self: true }] : []),
    ...subProfiles,
  ];

  // Owner her zaman düzenler; alt hesap yalnızca izni açıksa
  const canEdit = user?.role === 'owner' || !!user?.can_edit_profile;

  const value = {
    profile, links, loading, activeId, setActiveId, allProfiles, canEdit, btags,
    patchLocal, saveProfile, uploadImage, refreshSubProfiles, refreshBtags,
    addLink, updateLink, removeLink, reorder, applyTemplate, applyDesignTemplateToActive, reload: () => load(activeId),
  };
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};
