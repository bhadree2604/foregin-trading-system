import { query, rowToObject } from '../../../lib/db';
import { uid } from '../../../lib/auth';

function mapEvent(o) {
  return {
    eventId: o.event_id, shipmentId: o.shipment_id, orderId: o.order_id,
    status: o.status, location: o.location, latitude: o.latitude, longitude: o.longitude,
    note: o.note, timestamp: o.timestamp, createdAt: o.created_at,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { shipmentId } = req.query;
      if (!shipmentId) return res.status(400).json({ error: 'shipmentId required' });
      const rows = await query('SELECT * FROM tracking_events WHERE shipment_id = ? ORDER BY timestamp ASC', [shipmentId]);
      return res.status(200).json({ events: rows.map((r) => mapEvent(rowToObject(r))) });
    }
    if (req.method === 'POST') {
      const d = req.body || {};
      if (!d.shipmentId) return res.status(400).json({ error: 'shipmentId required' });
      const eventId = d.eventId || uid();
      await query(
        `INSERT INTO tracking_events (event_id, shipment_id, order_id, status, location, latitude, longitude, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [eventId, d.shipmentId, d.orderId || null, d.status || '', d.location || '', d.latitude || null, d.longitude || null, d.note || d.description || '']
      );
      await query(`UPDATE shipments SET current_location = ?, latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude), status = ? WHERE shipment_id = ?`,
        [d.location || '', d.latitude || null, d.longitude || null, d.status || 'IN_TRANSIT', d.shipmentId]);
      return res.status(201).json({ eventId });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/tracking]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
