/** Products client — MySQL backed. Uploads go to /api/upload (local disk). */
import { apiFetch } from '../lib/session';

export async function createProduct(exporterId, companyId, productData) {
  const data = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify({ exporterId, companyId, ...productData }) });
  return data.productId;
}

export async function getProduct(productId) {
  try {
    const data = await apiFetch(`/api/products/${encodeURIComponent(productId)}`);
    return data.product;
  } catch (_) {
    return null;
  }
}

export async function getProducts({ category, country, status = 'active', limitCount = 20 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (category) params.set('category', category);
  if (country) params.set('country', country);
  if (limitCount) params.set('limit', String(limitCount));
  const data = await apiFetch(`/api/products?${params.toString()}`);
  return data.products || [];
}

export async function getExporterProducts(exporterId) {
  const data = await apiFetch(`/api/products?exporterId=${encodeURIComponent(exporterId)}&limit=100`);
  return data.products || [];
}

export async function updateProduct(productId, data) {
  await apiFetch(`/api/products/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function archiveProduct(productId) {
  await apiFetch(`/api/products/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify({ action: 'archive' }) });
}

export async function restoreProduct(productId) {
  await apiFetch(`/api/products/${encodeURIComponent(productId)}`, { method: 'PATCH', body: JSON.stringify({ action: 'restore' }) });
}

/** Upload a product image to local /public/uploads. Returns public URL. */
export async function uploadProductImage(companyId, productId, file, onProgress) {
  const form = new FormData();
  form.append('file', file);
  if (onProgress) { try { onProgress(50); } catch (_) {} }
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  if (onProgress) { try { onProgress(100); } catch (_) {} }
  return data.downloadURL;
}

/** One-shot fetch (no realtime in MySQL mode). Returns unsubscribe noop. */
export function subscribeToProducts(callback, { category, country } = {}) {
  let cancelled = false;
  getProducts({ category, country, limitCount: 50 }).then((list) => { if (!cancelled) callback(list); }).catch(() => { if (!cancelled) callback([]); });
  return () => { cancelled = true; };
}
