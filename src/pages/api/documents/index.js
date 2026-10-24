import { query, rowToObject } from '../../../lib/db';
import { uid } from '../../../lib/auth';

function mapDoc(o) {
  return {
    documentId: o.document_id, orderId: o.order_id, companyId: o.company_id,
    uploadedBy: o.uploaded_by, type: o.type, fileName: o.file_name, fileSize: Number(o.file_size),
    mimeType: o.mime_type, storagePath: o.storage_path, downloadURL: o.download_url,
    verificationStatus: o.verification_status, verifiedBy: o.verified_by,
    verifiedAt: o.verified_at, remarks: o.remarks, createdAt: o.created_at, updatedAt: o.updated_at,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { id, orderId, companyId, status, limit: lim = '50' } = req.query;
      if (id) {
        const rows = await query('SELECT * FROM documents WHERE document_id = ? LIMIT 1', [id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ document: mapDoc(rowToObject(rows[0])) });
      }
      const conds = []; const params = [];
      if (orderId) { conds.push('order_id = ?'); params.push(orderId); }
      if (companyId) { conds.push('company_id = ?'); params.push(companyId); }
      if (status) { conds.push('verification_status = ?'); params.push(status); }
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
      const limitCount = Math.min(Number(lim) || 50, 100);
      const rows = await query(`SELECT * FROM documents ${where} ORDER BY created_at DESC LIMIT ${limitCount}`, params);
      return res.status(200).json({ documents: rows.map((r) => mapDoc(rowToObject(r))) });
    }
    if (req.method === 'POST') {
      const d = req.body || {};
      const documentId = d.documentId || uid();
      await query(
        `INSERT INTO documents (document_id, order_id, company_id, uploaded_by, type, file_name, file_size, mime_type, storage_path, download_url, verification_status, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [documentId, d.orderId || null, d.companyId || null, d.uploadedBy || null, d.type || '', d.fileName || '', Number(d.fileSize || 0), d.mimeType || '', d.storagePath || '', d.downloadURL || d.downloadUrl || '', d.remarks || '']
      );
      return res.status(201).json({ documentId, downloadURL: d.downloadURL || d.downloadUrl || '' });
    }
    if (req.method === 'PATCH') {
      const { documentId, adminId, status: st, remarks = '' } = req.body || {};
      if (!documentId) return res.status(400).json({ error: 'documentId required' });
      await query(`UPDATE documents SET verification_status=?, verified_by=?, verified_at=NOW(), remarks=? WHERE document_id=?`, [st, adminId || null, remarks, documentId]);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { documentId } = req.query;
      if (!documentId) return res.status(400).json({ error: 'documentId required' });
      await query('DELETE FROM documents WHERE document_id = ?', [documentId]);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/documents]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
