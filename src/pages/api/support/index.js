import { query } from '../../../lib/db';
import { uid } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await query('SELECT * FROM support_messages ORDER BY created_at DESC LIMIT 100');
      return res.status(200).json({ messages: rows.map((r) => ({ messageId: String(r.message_id), name: r.name, email: r.email, subject: r.subject, message: r.message, status: r.status, createdAt: r.created_at })) });
    }
    if (req.method === 'POST') {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message required' });
      const messageId = uid();
      await query(`INSERT INTO support_messages (message_id, name, email, subject, message, status) VALUES (?, ?, ?, ?, ?, 'NEW')`,
        [messageId, String(name).trim(), String(email).trim(), String(subject || 'General Inquiry').trim(), String(message).trim()]);
      return res.status(201).json({ messageId });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/support]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
