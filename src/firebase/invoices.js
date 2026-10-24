/** Invoices client — MySQL backed. */
import { apiFetch } from '../lib/session';

export async function createInvoice(invoiceData) {
  const data = await apiFetch('/api/invoices', { method: 'POST', body: JSON.stringify(invoiceData) });
  return data.invoiceId;
}

export async function getInvoice(invoiceId) {
  try {
    const data = await apiFetch(`/api/invoices?id=${encodeURIComponent(invoiceId)}`);
    return data.invoice;
  } catch (_) {
    return null;
  }
}

export async function getInvoiceByOrderId(orderId) {
  const data = await apiFetch(`/api/invoices?orderId=${encodeURIComponent(orderId)}`);
  return data.invoice || null;
}

export async function getBuyerInvoices(buyerId) {
  const data = await apiFetch(`/api/invoices?buyerId=${encodeURIComponent(buyerId)}&limit=50`);
  return data.invoices || [];
}

export async function getExporterInvoices(exporterId) {
  const data = await apiFetch(`/api/invoices?exporterId=${encodeURIComponent(exporterId)}&limit=50`);
  return data.invoices || [];
}

export async function getAllInvoices({ limitCount = 100 } = {}) {
  const data = await apiFetch(`/api/invoices?limit=${limitCount}`);
  return data.invoices || [];
}

export function generateInvoiceNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${dateStr}-${rand}`;
}
