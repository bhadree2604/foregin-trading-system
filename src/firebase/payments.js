/** Payments client — MySQL backed. */
import { apiFetch } from '../lib/session';

export async function createPaymentRecord(paymentData) {
  const data = await apiFetch('/api/payments', { method: 'POST', body: JSON.stringify({ orderId: paymentData.orderId, buyerId: paymentData.buyerId }) });
  return data.paymentId;
}

export async function getPayment(paymentId) {
  try {
    const data = await apiFetch(`/api/payments?paymentId=${encodeURIComponent(paymentId)}`);
    return data.payment || null;
  } catch (_) {
    return null;
  }
}

export async function getPaymentByOrderId(orderId) {
  try {
    const data = await apiFetch(`/api/payments?orderId=${encodeURIComponent(orderId)}&single=1`);
    return data.payment || null;
  } catch (_) {
    return null;
  }
}

export async function getBuyerPayments(buyerId) {
  const data = await apiFetch(`/api/payments?buyerId=${encodeURIComponent(buyerId)}&limit=50`);
  return data.payments || [];
}

export async function getAllPayments({ statusFilter, limitCount = 50 } = {}) {
  const params = new URLSearchParams({ limit: String(limitCount) });
  if (statusFilter) params.set('status', statusFilter);
  const data = await apiFetch(`/api/payments?${params.toString()}`);
  return data.payments || [];
}

export function subscribeToPayment(paymentId, callback) {
  // No realtime in MySQL mode; emit once with unknown (callers refetch by order).
  getPaymentByOrderId(paymentId).then(() => {}).catch(() => {});
  return () => {};
}
