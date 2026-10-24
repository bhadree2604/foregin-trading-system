/**
 * Client-side authentication helpers backed by the application's API.
 */
import { apiFetch, getSession, setSession } from '../lib/session';
import { ROLES } from '../constants/roles';

export async function registerUser(formData) {
  const { role } = formData;
  if (role === ROLES.ADMIN) throw new Error('Admin accounts cannot be self-registered.');
  const data = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(formData) });
  setSession({ uid: data.uid, token: data.token, email: data.user?.email, role: data.role });
  return { uid: data.uid, role: data.role, companyId: data.companyId };
}

export async function loginUser(email, password) {
  const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  setSession({ uid: data.user.uid, token: data.token, email: data.user.email, role: data.user.role });
  return data.user;
}

export async function logoutUser() {
  setSession(null);
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const data = await apiFetch(`/api/auth/me?uid=${encodeURIComponent(uid)}`);
    return data.user;
  } catch (_) {
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  await apiFetch('/api/auth/me', { method: 'PATCH', body: JSON.stringify({ uid, ...data }) });
}

/** Subscribe to session changes in this browser tab and other tabs. */
export function onAuthChange(callback) {
  if (typeof window === 'undefined') return () => {};
  const emit = () => {
    const s = getSession();
    if (!s?.uid) callback(null);
    else callback({ uid: s.uid, email: s.email });
  };
  emit();
  const handler = () => emit();
  window.addEventListener('fts-auth-change', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('fts-auth-change', handler);
    window.removeEventListener('storage', handler);
  };
}
