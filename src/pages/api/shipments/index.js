import { query, rowToObject } from '../../../lib/db';
import { uid } from '../../../lib/auth';

function mapShipment(o) {
  return {
    shipmentId: o.shipment_id, orderId: o.order_id, carrier: o.carrier,
    trackingNumber: o.tracking_number, origin: o.origin, destination: o.destination,
    currentLocation: o.current_location, latitude: o.latitude, longitude: o.longitude,
    status: o.status, estimatedDelivery: o.estimated_delivery,
    logisticsProviderId: o.logistics_provider_id, createdAt: o.created_at, updatedAt: o.updated_at,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { id, orderId, providerId, status, limit: lim = '50' } = req.query;
      if (id) {
        const rows = await query('SELECT * FROM shipments WHERE shipment_id = ? LIMIT 1', [id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ shipment: mapShipment(rowToObject(rows[0])) });
      }
      const conds = []; const params = [];
      if (orderId) { conds.push('order_id = ?'); params.push(orderId); }
      if (providerId) { conds.push('logistics_provider_id = ?'); params.push(providerId); }
      if (status) { conds.push('status = ?'); params.push(status); }
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
      const limitCount = Math.min(Number(lim) || 50, 100);
      const rows = await query(`SELECT * FROM shipments ${where} ORDER BY created_at DESC LIMIT ${limitCount}`, params);
      const list = rows.map((r) => mapShipment(rowToObject(r)));
      return res.status(200).json({ shipments: list, shipment: list[0] || null });
    }
    if (req.method === 'POST') {
      const d = req.body || {};
      const shipmentId = d.shipmentId || uid();
      await query(
        `INSERT INTO shipments (shipment_id, order_id, carrier, tracking_number, origin, destination, current_location, latitude, longitude, status, estimated_delivery, logistics_provider_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [shipmentId, d.orderId || null, d.carrier || '', d.trackingNumber || '', d.origin || '', d.destination || '', d.currentLocation || d.origin || '', d.latitude || null, d.longitude || null, d.status || 'CREATED', d.estimatedDelivery || null, d.logisticsProviderId || d.providerId || null]
      );
      if (d.orderId) {
        try { await query(`UPDATE orders SET shipment_id = ?, status = CASE WHEN status='PAID' THEN 'SHIPPED' ELSE status END, shipped_at = CASE WHEN status='PAID' THEN NOW() ELSE shipped_at END WHERE order_id = ?`, [shipmentId, d.orderId]); } catch (_) {}
      }
      return res.status(201).json({ shipmentId });
    }
    if (req.method === 'PATCH') {
      const { shipmentId, ...data } = req.body || {};
      if (!shipmentId) return res.status(400).json({ error: 'shipmentId required' });
      const allowed = { carrier: 'carrier', trackingNumber: 'tracking_number', origin: 'origin', destination: 'destination', currentLocation: 'current_location', latitude: 'latitude', longitude: 'longitude', status: 'status', estimatedDelivery: 'estimated_delivery', logisticsProviderId: 'logistics_provider_id' };
      const sets = []; const params = [];
      for (const [k, c] of Object.entries(allowed)) if (data[k] !== undefined) { sets.push(`\`${c}\` = ?`); params.push(data[k]); }
      if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
      params.push(shipmentId);
      await query(`UPDATE shipments SET ${sets.join(', ')} WHERE shipment_id = ?`, params);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/shipments]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
