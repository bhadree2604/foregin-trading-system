import { query, rowToObject } from '../../../lib/db';

function mapCompany(o) {
  return {
    companyId: o.company_id,
    name: o.name,
    registrationNumber: o.registration_number,
    taxId: o.tax_id,
    country: o.country,
    address: o.address,
    city: o.city,
    postalCode: o.postal_code,
    phone: o.phone,
    email: o.email,
    type: o.type,
    verificationStatus: o.verification_status,
    documents: o.documents || [],
    ownerId: o.owner_id,
    rejectionReason: o.rejection_reason,
    suspensionReason: o.suspension_reason,
    verifiedAt: o.verified_at,
    verifiedBy: o.verified_by,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { id, status } = req.query;
      if (id) {
        const rows = await query('SELECT * FROM companies WHERE company_id = ? LIMIT 1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Company not found' });
        return res.status(200).json({ company: mapCompany(rowToObject(rows[0])) });
      }
      let rows;
      if (status) rows = await query('SELECT * FROM companies WHERE verification_status = ? ORDER BY created_at DESC LIMIT 100', [status]);
      else rows = await query('SELECT * FROM companies ORDER BY created_at DESC LIMIT 100');
      return res.status(200).json({ companies: rows.map((r) => mapCompany(rowToObject(r))) });
    }
    if (req.method === 'PATCH') {
      const { companyId, action, adminId, reason, data } = req.body || {};
      if (!companyId) return res.status(400).json({ error: 'companyId required' });
      if (action === 'approve') {
        await query(`UPDATE companies SET verification_status='verified', verified_at=NOW(), verified_by=?, updated_at=NOW() WHERE company_id=?`, [adminId || null, companyId]);
      } else if (action === 'reject') {
        await query(`UPDATE companies SET verification_status='rejected', rejection_reason=?, reviewed_by=?, updated_at=NOW() WHERE company_id=?`, [reason || '', adminId || null, companyId]);
      } else if (action === 'suspend') {
        await query(`UPDATE companies SET verification_status='suspended', suspension_reason=?, suspended_by=?, updated_at=NOW() WHERE company_id=?`, [reason || '', adminId || null, companyId]);
      } else if (data) {
        const allowed = { name: 'name', phone: 'phone', address: 'address', city: 'city', postalCode: 'postal_code', country: 'country', registrationNumber: 'registration_number', taxId: 'tax_id' };
        const sets = [];
        const params = [];
        for (const [k, col] of Object.entries(allowed)) {
          if (data[k] !== undefined) { sets.push(`\`${col}\` = ?`); params.push(data[k]); }
        }
        if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });
        params.push(companyId);
        await query(`UPDATE companies SET ${sets.join(', ')} WHERE company_id = ?`, params);
      } else {
        return res.status(400).json({ error: 'action or data required' });
      }
      const rows = await query('SELECT * FROM companies WHERE company_id = ? LIMIT 1', [companyId]);
      return res.status(200).json({ company: rows[0] ? mapCompany(rowToObject(rows[0])) : null });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/companies]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
