import { query, rowToObject, toJson } from '../../../lib/db';
import { uid } from '../../../lib/auth';

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

const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'PAYMENT_PENDING', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
  PAYMENT_PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAID: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [], REJECTED: [], CANCELLED: [],
};

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { buyerId, exporterId, status, limit: lim = '50' } = req.query;
      const limitCount = Math.min(Number(lim) || 50, 100);
      const conds = []; const params = [];
      if (buyerId) { conds.push('buyer_id = ?'); params.push(buyerId); }
      if (exporterId) { conds.push('exporter_id = ?'); params.push(exporterId); }
      if (status) { conds.push('status = ?'); params.push(status); }
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
      const rows = await query(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ${limitCount}`, params);
      return res.status(200).json({ orders: rows.map((r) => mapOrder(rowToObject(r))) });
    }
    if (req.method === 'POST') {
      const d = req.body || {};
      const orderId = d.orderId || uid();
      await query(
        `INSERT INTO orders (order_id, buyer_id, buyer_company_id, buyer_company_name, exporter_id, exporter_company_id, exporter_company, product_id, product_name, quantity, unit_price, subtotal, shipping_cost, tax_amount, other_fees, total_amount, currency, status, origin_country, destination_country, delivery_address, shipping_method, items)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
        [orderId, d.buyerId || null, d.buyerCompanyId || null, d.buyerCompanyName || '', d.exporterId || null, d.exporterCompanyId || null, d.exporterCompany || '', d.productId || null, d.productName || '', Number(d.quantity || 1), Number(d.unitPrice || 0), Number(d.subtotal || 0), Number(d.shippingCost || 0), Number(d.taxAmount || 0), Number(d.otherFees || 0), Number(d.totalAmount || 0), d.currency || 'USD', d.originCountry || '', d.destinationCountry || '', d.deliveryAddress || '', d.shippingMethod || '', toJson(d.items || null)]
      );
      const rows = await query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [orderId]);
      return res.status(201).json({ orderId, order: mapOrder(rowToObject(rows[0])) });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/orders]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}

export { VALID_TRANSITIONS };
