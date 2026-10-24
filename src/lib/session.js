/**
 * Client-side session helpers for the application's MySQL/JWT auth.
 */
const KEY = 'fts_session';

export function getSession() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setSession(session) {
  try {
    if (typeof window === 'undefined') return;
    if (!session) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('fts-auth-change'));
  } catch (_) {}
}

export function authHeaders() {
  const s = getSession();
  return s?.token ? { Authorization: `Bearer ${s.token}` } : {};
}

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
