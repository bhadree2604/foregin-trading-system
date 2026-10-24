/** Orders client — MySQL backed. */
import { apiFetch } from '../lib/session';

export async function createOrder(orderData) {
  const data = await apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(orderData) });
  return data.orderId;
}

export async function getOrder(orderId) {
  try {
    const data = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`);
    return data.order;
  } catch (_) {
    return null;
  }
}

export async function getBuyerOrders(buyerId, statusFilter = null) {
  const params = new URLSearchParams({ buyerId, limit: '50' });
  if (statusFilter) params.set('status', statusFilter);
  const data = await apiFetch(`/api/orders?${params.toString()}`);
  return data.orders || [];
}

export async function getExporterOrders(exporterId, statusFilter = null) {
  const params = new URLSearchParams({ exporterId, limit: '50' });
  if (statusFilter) params.set('status', statusFilter);
  const data = await apiFetch(`/api/orders?${params.toString()}`);
  return data.orders || [];
}

export async function getAllOrders({ statusFilter, limitCount = 50 } = {}) {
  const params = new URLSearchParams({ limit: String(limitCount) });
  if (statusFilter) params.set('status', statusFilter);
  const data = await apiFetch(`/api/orders?${params.toString()}`);
  return data.orders || [];
}

export async function updateOrderStatus(orderId, newStatus, additionalData = {}) {
  const data = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: JSON.stringify({ newStatus, additionalData }) });
  return data.order;
}

export async function acceptOrder(orderId, exporterId) {
  await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: JSON.stringify({ action: 'accept', exporterId }) });
}

export async function rejectOrder(orderId, exporterId, reason) {
  await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: JSON.stringify({ action: 'reject', exporterId, reason }) });
}

export async function cancelOrder(orderId, buyerId, reason) {
  await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: JSON.stringify({ action: 'cancel', buyerId, reason }) });
}

function pollSubscribe(fetchFn, callback, ms = 10000) {
  let cancelled = false;
  const run = async () => { try { const v = await fetchFn(); if (!cancelled) callback(v); } catch (_) {} };
  run();
  const id = setInterval(run, ms);
  return () => { cancelled = true; clearInterval(id); };
}

export function subscribeToBuyerOrders(buyerId, callback) {
  return pollSubscribe(() => getBuyerOrders(buyerId), callback);
}

export function subscribeToExporterOrders(exporterId, callback) {
  return pollSubscribe(() => getExporterOrders(exporterId), callback);
}

export function subscribeToOrder(orderId, callback) {
  return pollSubscribe(() => getOrder(orderId), callback, 5000);
}
