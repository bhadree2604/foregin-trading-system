import { query, rowToObject } from '../../../lib/db';

function mapUser(o) {
  return {
    uid: o.uid,
    name: o.name,
    email: o.email,
    phone: o.phone,
    role: o.role,
    companyId: o.company_id,
    companyName: o.company_name,
    country: o.country,
    status: o.status,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    lastLoginAt: o.last_login_at,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const limitCount = Math.min(Number(req.query.limit || 50), 200);
      const rows = await query(`SELECT * FROM users ORDER BY created_at DESC LIMIT ${limitCount}`);
      return res.status(200).json({ users: rows.map((r) => mapUser(rowToObject(r))) });
    }
    if (req.method === 'PATCH') {
      const { uid, status } = req.body || {};
      if (!uid || !status) return res.status(400).json({ error: 'uid and status required' });
      await query('UPDATE users SET status = ? WHERE uid = ?', [status, uid]);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/users]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
