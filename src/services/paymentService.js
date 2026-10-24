import { apiFetch } from '../lib/session';

/**
 * Initiates a MySQL-backed payment session (sandbox).
 */
export async function createPaymentSession(orderId, buyerId) {
  const data = await apiFetch('/api/payments', {
    method: 'POST',
    body: JSON.stringify({ orderId, buyerId }),
  });
  return data;
}

/**
 * Processes payment success transactionally on the server:
 * order -> PAID, invoice generated, notifications + audit log written.
 */
export async function processPaymentSuccess({
  paymentId,
  orderId,
  buyerId,
  providerTransactionId,
  actorRole = 'buyer',
}) {
  const data = await apiFetch('/api/payments/process', {
    method: 'POST',
    body: JSON.stringify({ paymentId, orderId, buyerId, providerTransactionId, actorRole }),
  });
  return data;
}
