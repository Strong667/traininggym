import { createContext, useContext, useState } from 'react';

const PROFILES_KEY = 'wd_profiles';
const SESSION_KEY  = 'wd_session';

const AuthContext = createContext(null);

export const PROFILE_COLORS = [
  '#f97316', '#3b82f6', '#22c55e', '#a855f7',
  '#ec4899', '#ef4444', '#14b8a6', '#f59e0b',
];

export const PROFILE_EMOJIS = [
  '💪', '🏋️', '🔥', '⚡', '🎯', '🚀',
  '🏆', '🌟', '🦁', '🐺', '🐯', '🦊',
];

function loadProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); }
  catch { return []; }
}

export function AuthProvider({ children }) {
  const [profiles, setProfilesRaw] = useState(loadProfiles);
  const [activeProfileId, setActiveProfileId] = useState(
    () => localStorage.getItem(SESSION_KEY) || null
  );

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  function saveProfiles(list) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
    setProfilesRaw(list);
  }

  function createProfile({ name, color, emoji, pin }) {
    const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const profile = {
      id,
      name: name.trim(),
      color: color || PROFILE_COLORS[0],
      emoji: emoji || '💪',
      pin: pin || '',
      createdAt: Date.now(),
    };
    saveProfiles([...profiles, profile]);
    return profile;
  }

  function login(profileId, pin = '') {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return false;
    if (profile.pin && profile.pin !== pin) return false;
    localStorage.setItem(SESSION_KEY, profileId);
    setActiveProfileId(profileId);
    return true;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setActiveProfileId(null);
  }

  function deleteProfile(id) {
    Object.keys(localStorage)
      .filter(k => k.endsWith('_' + id))
      .forEach(k => localStorage.removeItem(k));
    saveProfiles(profiles.filter(p => p.id !== id));
    if (activeProfileId === id) logout();
  }

  function updateProfile(id, changes) {
    saveProfiles(profiles.map(p => p.id === id ? { ...p, ...changes } : p));
  }

  return (
    <AuthContext.Provider value={{
      profiles, activeProfile, activeProfileId,
      createProfile, login, logout, deleteProfile, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
