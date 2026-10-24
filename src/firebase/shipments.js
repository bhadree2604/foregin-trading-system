/** Shipments + tracking events client — MySQL backed. */
import { apiFetch } from '../lib/session';

export async function getShipment(shipmentId) {
  try {
    const data = await apiFetch(`/api/shipments?id=${encodeURIComponent(shipmentId)}`);
    return data.shipment;
  } catch (_) {
    return null;
  }
}

export async function getShipmentByOrderId(orderId) {
  const data = await apiFetch(`/api/shipments?orderId=${encodeURIComponent(orderId)}&limit=1`);
  return data.shipment || null;
}

export const getShipmentsByOrderId = getShipmentByOrderId;

export async function getAllShipments({ statusFilter, limitCount = 50 } = {}) {
  const params = new URLSearchParams({ limit: String(limitCount) });
  if (statusFilter) params.set('status', statusFilter);
  const data = await apiFetch(`/api/shipments?${params.toString()}`);
  return data.shipments || [];
}

export async function getLogisticsShipments(providerId) {
  const data = await apiFetch(`/api/shipments?providerId=${encodeURIComponent(providerId)}&limit=50`);
  return data.shipments || [];
}

export async function updateShipment(shipmentId, data) {
  await apiFetch('/api/shipments', { method: 'PATCH', body: JSON.stringify({ shipmentId, ...data }) });
}

export async function createShipmentLocal(shipmentData) {
  const data = await apiFetch('/api/shipments', { method: 'POST', body: JSON.stringify(shipmentData) });
  return data.shipmentId;
}

export function subscribeToShipment(shipmentId, callback) {
  let cancelled = false;
  const run = async () => { try { const s = await getShipment(shipmentId); if (!cancelled) callback(s); } catch (_) {} };
  run();
  const id = setInterval(run, 5000);
  return () => { cancelled = true; clearInterval(id); };
}

export async function addTrackingEvent(eventData) {
  const data = await apiFetch('/api/tracking', { method: 'POST', body: JSON.stringify(eventData) });
  return data.eventId;
}

export async function getTrackingEvents(shipmentId) {
  const data = await apiFetch(`/api/tracking?shipmentId=${encodeURIComponent(shipmentId)}`);
  return data.events || [];
}

export function subscribeToTrackingEvents(shipmentId, callback) {
  let cancelled = false;
  const run = async () => { try { const e = await getTrackingEvents(shipmentId); if (!cancelled) callback(e); } catch (_) {} };
  run();
  const id = setInterval(run, 5000);
  return () => { cancelled = true; clearInterval(id); };
}
