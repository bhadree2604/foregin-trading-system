/** Audit logs client — MySQL backed. */
import { apiFetch } from '../lib/session';

export async function writeAuditLog({ actorId, actorRole, action, resourceType, resourceId, result = 'success', metadata = {} }) {
  const data = await apiFetch('/api/audit-logs', { method: 'POST', body: JSON.stringify({ actorId, actorRole, action, resourceType, resourceId, result, metadata }) });
  return data.logId;
}

export async function getAuditLogs({ actorId, action, resourceType, limitCount = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limitCount) });
  if (actorId) params.set('actorId', actorId);
  if (action) params.set('action', action);
  if (resourceType) params.set('resourceType', resourceType);
  const data = await apiFetch(`/api/audit-logs?${params.toString()}`);
  return data.logs || [];
}
