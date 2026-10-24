import { query, rowToObject, getConnection } from '../../../lib/db';

const VALID = {
  PENDING: ['CONFIRMED', 'PAYMENT_PENDING', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
  PAYMENT_PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAID: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED'], SHIPPED: ['DELIVERED'], DELIVERED: ['COMPLETED'],
  COMPLETED: [], REJECTED: [], CANCELLED: [],
};

function mapOrder(o) {
  return {
    orderId: o.order_id, buyerId: o.buyer_id, buyerCompanyId: o.buyer_company_id,
    buyerCompanyName: o.buyer_company_name, exporterId: o.exporter_id,
    exporterCompanyId: o.exporter_company_id, exporterCompany: o.exporter_company,
    productId: o.product_id, productName: o.product_name, quantity: o.quantity,
    unitPrice: Number(o.unit_price), subtotal: Number(o.subtotal),
    shippingCost: Number(o.shipping_cost), taxAmount: Number(o.tax_amount),
    otherFees: Number(o.other_fees), totalAmount: Number(o.total_amount),
    currency: o.currency, status: o.status, paymentId: o.payment_id, shipmentId: o.shipment_id,
    originCountry: o.origin_country, destinationCountry: o.destination_country,
    deliveryAddress: o.delivery_address, shippingMethod: o.shipping_method,
    rejectionReason: o.rejection_reason, cancellationReason: o.cancellation_reason,
    items: o.items || [], acceptedAt: o.accepted_at, paidAt: o.paid_at,
    shippedAt: o.shipped_at, deliveredAt: o.delivered_at, completedAt: o.completed_at,
    createdAt: o.created_at, updatedAt: o.updated_at,
  };
}

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const rows = await query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Order not found' });
      return res.status(200).json({ order: mapOrder(rowToObject(rows[0])) });
    }
    if (req.method === 'PATCH' || req.method === 'POST') {
      const { action, newStatus, status, exporterId, buyerId, reason, additionalData = {} } = req.body || {};
      const rows = await query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Order not found' });
      const order = rowToObject(rows[0]);

      if (action === 'accept') {
        if (order.exporter_id !== exporterId) return res.status(403).json({ error: 'Unauthorized.' });
        if (order.status !== 'PENDING') return res.status(400).json({ error: `Cannot accept order in status: ${order.status}` });
        await query(`UPDATE orders SET status='PAYMENT_PENDING', accepted_at=NOW() WHERE order_id=?`, [id]);
      } else if (action === 'reject') {
        if (order.exporter_id !== exporterId) return res.status(403).json({ error: 'Unauthorized.' });
        if (order.status !== 'PENDING') return res.status(400).json({ error: `Cannot reject order in status: ${order.status}` });
        await query(`UPDATE orders SET status='REJECTED', rejection_reason=? WHERE order_id=?`, [reason || '', id]);
      } else if (action === 'cancel') {
        if (order.buyer_id !== buyerId) return res.status(403).json({ error: 'Unauthorized.' });
        const cancellable = ['PENDING', 'CONFIRMED', 'PAYMENT_PENDING', 'PAYMENT_FAILED'];
        if (!cancellable.includes(order.status)) return res.status(400).json({ error: `Cannot cancel order in status: ${order.status}` });
        await query(`UPDATE orders SET status='CANCELLED', cancellation_reason=? WHERE order_id=?`, [reason || '', id]);
      } else {
        const target = newStatus || status;
        if (!target) return res.status(400).json({ error: 'newStatus required' });
        const allowed = VALID[order.status] || [];
        if (!allowed.includes(target)) return res.status(400).json({ error: `Invalid status transition: ${order.status} → ${target}` });
        const extra = [];
        if (target === 'CONFIRMED' || target === 'PAYMENT_PENDING') extra.push('accepted_at=NOW()');
        if (target === 'PAID') extra.push('paid_at=NOW()');
        if (target === 'SHIPPED') extra.push('shipped_at=NOW()');
        if (target === 'DELIVERED') extra.push('delivered_at=NOW()');
        if (target === 'COMPLETED') extra.push('completed_at=NOW()');
        const addCols = [];
        const addParams = [];
        for (const [k, v] of Object.entries(additionalData)) {
          const colMap = { paymentId: 'payment_id', shipmentId: 'shipment_id' };
          if (colMap[k]) { addCols.push(`\`${colMap[k]}\` = ?`); addParams.push(v); }
        }
        const setClause = [`status = ?`, ...extra, ...addCols].join(', ');
        await query(`UPDATE orders SET ${setClause} WHERE order_id = ?`, [target, ...addParams, id]);
      }
      const updated = await query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [id]);
      return res.status(200).json({ order: mapOrder(rowToObject(updated[0])) });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/orders/[id]]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
