import { query, rowToObject } from '../../../lib/db';
import { uid } from '../../../lib/auth';

function mapNotif(o) {
  return {
    notificationId: o.notification_id, userId: o.user_id, title: o.title,
    message: o.message, type: o.type, resourceId: o.resource_id,
    read: Boolean(o.is_read), createdAt: o.created_at,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId, limit: lim = '50' } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });
      const limitCount = Math.min(Number(lim) || 50, 100);
      const rows = await query(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limitCount}`, [userId]);
      return res.status(200).json({ notifications: rows.map((r) => mapNotif(rowToObject(r))) });
    }
    if (req.method === 'POST') {
      const { userId, title, message, type = 'GENERAL', resourceId = null } = req.body || {};
      if (!userId || !title) return res.status(400).json({ error: 'userId and title required' });
      const notificationId = uid();
      await query(`INSERT INTO notifications (notification_id, user_id, title, message, type, resource_id, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [notificationId, userId, title, message || '', type, resourceId]);
      return res.status(201).json({ notificationId });
    }
    if (req.method === 'PATCH') {
      const { notificationId, userId, markAll } = req.body || {};
      if (markAll && userId) {
        await query(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`, [userId]);
        return res.status(200).json({ success: true });
      }
      if (notificationId) {
        await query(`UPDATE notifications SET is_read = 1 WHERE notification_id = ?`, [notificationId]);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'notificationId or (userId + markAll) required' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/notifications]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
