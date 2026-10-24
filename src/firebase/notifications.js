/** Notifications client — MySQL backed (polling instead of realtime). */
import { apiFetch } from '../lib/session';

export async function createNotification({ userId, title, message, type, resourceId = null }) {
  const data = await apiFetch('/api/notifications', { method: 'POST', body: JSON.stringify({ userId, title, message, type, resourceId }) });
  return data.notificationId;
}

export async function getUserNotifications(userId, limitCount = 50) {
  const data = await apiFetch(`/api/notifications?userId=${encodeURIComponent(userId)}&limit=${limitCount}`);
  return data.notifications || [];
}

export async function markNotificationRead(notificationId) {
  await apiFetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ notificationId }) });
}

export async function markAllNotificationsRead(userId) {
  await apiFetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ userId, markAll: true }) });
}

export function subscribeToNotifications(userId, callback) {
  let cancelled = false;
  const run = async () => {
    try {
      const list = await getUserNotifications(userId);
      if (!cancelled) callback(list);
    } catch (_) {}
  };
  run();
  const id = setInterval(run, 10000);
  return () => { cancelled = true; clearInterval(id); };
}
