import { query, rowToObject } from '../../../lib/db';
import { uid } from '../../../lib/auth';

function mapLog(o) {
  return {
    logId: o.log_id, actorId: o.actor_id, actorRole: o.actor_role, action: o.action,
    resourceType: o.resource_type, resourceId: o.resource_id, result: o.result,
    metadata: o.metadata || {}, timestamp: o.timestamp,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { actorId, action, resourceType, limit: lim = '100' } = req.query;
      const conds = []; const params = [];
      if (actorId) { conds.push('actor_id = ?'); params.push(actorId); }
      if (action) { conds.push('action = ?'); params.push(action); }
      if (resourceType) { conds.push('resource_type = ?'); params.push(resourceType); }
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
      const limitCount = Math.min(Number(lim) || 100, 200);
      const rows = await query(`SELECT * FROM audit_logs ${where} ORDER BY timestamp DESC LIMIT ${limitCount}`, params);
      return res.status(200).json({ logs: rows.map((r) => mapLog(rowToObject(r))) });
    }
    if (req.method === 'POST') {
      const { actorId, actorRole = '', action, resourceType = '', resourceId = null, result = 'success', metadata = {} } = req.body || {};
      const logId = uid();
      await query(`INSERT INTO audit_logs (log_id, actor_id, actor_role, action, resource_type, resource_id, result, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, actorId || null, actorRole, action || '', resourceType, resourceId, result, JSON.stringify(metadata)]);
      return res.status(201).json({ logId });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/audit-logs]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
