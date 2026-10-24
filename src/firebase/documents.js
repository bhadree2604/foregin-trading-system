/** Documents client — MySQL backed, files stored via /api/upload. */
import { apiFetch } from '../lib/session';

export async function uploadDocument({ file, companyId, orderId, type, uploadedBy, onProgress }) {
  const form = new FormData();
  form.append('file', file);
  if (onProgress) { try { onProgress(50); } catch (_) {} }
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  const up = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(up.error || 'Upload failed');
  if (onProgress) { try { onProgress(90); } catch (_) {} }
  const data = await apiFetch('/api/documents', {
    method: 'POST',
    body: JSON.stringify({
      orderId, companyId, uploadedBy, type,
      fileName: file.name, fileSize: file.size, mimeType: file.type,
      storagePath: up.storagePath, downloadURL: up.downloadURL,
    }),
  });
  if (onProgress) { try { onProgress(100); } catch (_) {} }
  return { documentId: data.documentId, downloadURL: up.downloadURL };
}

export async function getDocument(documentId) {
  try {
    const data = await apiFetch(`/api/documents?id=${encodeURIComponent(documentId)}`);
    return data.document;
  } catch (_) {
    return null;
  }
}

export async function getOrderDocuments(orderId) {
  const data = await apiFetch(`/api/documents?orderId=${encodeURIComponent(orderId)}`);
  return data.documents || [];
}

export async function getCompanyDocuments(companyId) {
  const data = await apiFetch(`/api/documents?companyId=${encodeURIComponent(companyId)}&limit=50`);
  return data.documents || [];
}

export async function getAllDocuments({ statusFilter, limitCount = 50 } = {}) {
  const params = new URLSearchParams({ limit: String(limitCount) });
  if (statusFilter) params.set('status', statusFilter);
  const data = await apiFetch(`/api/documents?${params.toString()}`);
  return data.documents || [];
}

export async function verifyDocument(documentId, adminId, status, remarks = '') {
  await apiFetch('/api/documents', { method: 'PATCH', body: JSON.stringify({ documentId, adminId, status, remarks }) });
}

export async function deleteDocument(documentId) {
  await apiFetch(`/api/documents?documentId=${encodeURIComponent(documentId)}`, { method: 'DELETE' });
}
