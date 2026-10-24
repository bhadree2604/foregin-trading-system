import { query, rowToObject, toJson } from '../../../lib/db';
import { hashPassword, signToken, uid } from '../../../lib/auth';

function publicUser(row) {
  if (!row) return null;
  const o = rowToObject(row);
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const {
      email, password, name, phone = '', role,
      companyName = '', country = '', address = '', city = '',
      postalCode = '', registrationNumber = '', taxId = '',
    } = req.body || {};

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'email, password, name and role are required' });
    }
    if (role === 'admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be self-registered.' });
    }

    const existing = await query('SELECT uid FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered.' });

    const newUid = uid();
    const passwordHash = await hashPassword(password);

    // Create company (uid doubles as company_id on registration, same as before)
    await query(
      `INSERT INTO companies (company_id, name, registration_number, tax_id, country, address, city, postal_code, phone, email, type, verification_status, documents, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '[]', ?)`,
      [newUid, companyName || `${name}'s Company`, registrationNumber, taxId, country, address, city, postalCode, phone, email.toLowerCase(), role, newUid]
    );

    await query(
      `INSERT INTO users (uid, name, email, password_hash, phone, role, company_id, company_name, country, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [newUid, name, email.toLowerCase(), passwordHash, phone, role, newUid, companyName || '', country]
    );

    const rows = await query('SELECT * FROM users WHERE uid = ? LIMIT 1', [newUid]);
    const user = publicUser(rows[0]);
    const token = signToken({ uid: newUid, email: user.email, role: user.role });

    return res.status(201).json({ uid: newUid, role: user.role, companyId: newUid, token, user });
  } catch (err) {
    console.error('[/api/auth/register]', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
