import { query, rowToObject } from '../../../lib/db';

function publicUser(row) {
  const o = rowToObject(row);
  if (!o) return null;
  delete o.password_hash;
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
      const { uid, email } = req.query;
      let rows = [];
      if (uid) rows = await query('SELECT * FROM users WHERE uid = ? LIMIT 1', [uid]);
      else if (email) rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [String(email).toLowerCase()]);
      else return res.status(400).json({ error: 'uid or email required' });
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ user: publicUser(rows[0]) });
    }
    if (req.method === 'PATCH') {
      const { uid, ...data } = req.body || {};
      if (!uid) return res.status(400).json({ error: 'uid required' });
      const allowed = ['name', 'phone', 'country', 'company_name'];
      const sets = [];
      const params = [];
      for (const k of allowed) {
        if (data[k] !== undefined) {
          const col = k;
          sets.push(`\`${col}\` = ?`);
          params.push(data[k]);
        }
      }
      if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });
      params.push(uid);
      await query(`UPDATE users SET ${sets.join(', ')} WHERE uid = ?`, params);
      const rows = await query('SELECT * FROM users WHERE uid = ? LIMIT 1', [uid]);
      return res.status(200).json({ user: publicUser(rows[0]) });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/auth/me]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
