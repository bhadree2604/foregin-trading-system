import { query, rowToObject } from '../../../lib/db';
import { verifyPassword, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [String(email).toLowerCase()]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
    const dbUser = rowToObject(rows[0]);

    const ok = await verifyPassword(password, dbUser.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials.' });
    if (dbUser.status === 'disabled') {
      return res.status(403).json({ error: 'Your account has been disabled. Please contact support.' });
    }

    await query('UPDATE users SET last_login_at = NOW() WHERE uid = ?', [dbUser.uid]);

    const user = {
      uid: dbUser.uid,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role,
      companyId: dbUser.company_id,
      companyName: dbUser.company_name,
      country: dbUser.country,
      status: dbUser.status,
    };
    const token = signToken({ uid: dbUser.uid, email: dbUser.email, role: dbUser.role });
    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('[/api/auth/login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}
