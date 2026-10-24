import { query, rowToObject } from '../../../lib/db';
import { uid } from '../../../lib/auth';

function mapPayment(o) {
  return {
    paymentId: o.payment_id, orderId: o.order_id, buyerId: o.buyer_id,
    amount: Number(o.amount), currency: o.currency, provider: o.provider,
    providerPaymentId: o.provider_payment_id, status: o.status,
    failureReason: o.failure_reason, refundStatus: o.refund_status, mode: o.mode,
    paidAt: o.paid_at, createdAt: o.created_at, updatedAt: o.updated_at,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { orderId, buyerId, status, paymentId, limit: lim = '50' } = req.query;
      if (paymentId) {
        const rows = await query('SELECT * FROM payments WHERE payment_id = ? LIMIT 1', [paymentId]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ payment: mapPayment(rowToObject(rows[0])) });
      }
      const limitCount = Math.min(Number(lim) || 50, 100);
      const conds = []; const params = [];
      if (orderId) { conds.push('order_id = ?'); params.push(orderId); }
      if (buyerId) { conds.push('buyer_id = ?'); params.push(buyerId); }
      if (status) { conds.push('status = ?'); params.push(status); }
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
      const rows = await query(`SELECT * FROM payments ${where} ORDER BY created_at DESC LIMIT ${limitCount}`, params);
      const list = rows.map((r) => mapPayment(rowToObject(r)));
      if (orderId && req.query.single === '1') return res.status(200).json({ payment: list[0] || null });
      return res.status(200).json({ payments: list, payment: list[0] || null });
    }
    if (req.method === 'POST') {
      const { orderId, buyerId } = req.body || {};
      if (!orderId || !buyerId) return res.status(400).json({ error: 'orderId and buyerId required' });
      const orows = await query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [orderId]);
      if (!orows.length) return res.status(404).json({ error: 'Order not found.' });
      const order = rowToObject(orows[0]);
      if (order.buyer_id !== buyerId) return res.status(403).json({ error: 'Unauthorized: You do not own this order.' });
      if (order.status !== 'PAYMENT_PENDING' && order.status !== 'CONFIRMED') {
        return res.status(400).json({ error: `Order is not eligible for payment. Current status: ${order.status}` });
      }
      const paymentId = uid();
      await query(
        `INSERT INTO payments (payment_id, order_id, buyer_id, amount, currency, provider, provider_payment_id, status, mode)
         VALUES (?, ?, ?, ?, ?, 'AUTHORIZED_GATEWAY_SANDBOX', ?, 'PENDING', 'SANDBOX_TEST_PAYMENT')`,
        [paymentId, orderId, buyerId, Number(order.total_amount), order.currency || 'USD', `pay_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`]
      );
      return res.status(201).json({ paymentId, orderId, amount: Number(order.total_amount), currency: order.currency || 'USD', provider: 'AUTHORIZED_GATEWAY_SANDBOX' });
    }
    if (req.method === 'PATCH') {
      const { paymentId, status: st, providerPaymentId } = req.body || {};
      if (!paymentId) return res.status(400).json({ error: 'paymentId required' });
      const sets = []; const params = [];
      if (st) { sets.push('status = ?'); params.push(st); if (st === 'SUCCESSFUL') sets.push('paid_at = NOW()'); }
      if (providerPaymentId) { sets.push('provider_payment_id = ?'); params.push(providerPaymentId); }
      if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
      params.push(paymentId);
      await query(`UPDATE payments SET ${sets.join(', ')} WHERE payment_id = ?`, params);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/payments]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
