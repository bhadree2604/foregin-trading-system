import { getConnection } from '../../../lib/db';
import { uid } from '../../../lib/auth';

/**
 * POST /api/payments/process
 * Transactional: payment -> order PAID -> invoice -> notifications -> audit log
 * Replaces Firestore runTransaction in paymentService.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { paymentId, orderId, buyerId, providerTransactionId, actorRole = 'buyer' } = req.body || {};
  if (!paymentId || !orderId) return res.status(400).json({ error: 'paymentId and orderId required' });

  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const [orows] = await conn.query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [orderId]);
    if (!orows.length) { await conn.rollback(); return res.status(404).json({ error: 'Order record not found during payment processing.' }); }
    const order = orows[0];
    if (order.status === 'PAID') { await conn.rollback(); return res.status(200).json({ success: true, alreadyPaid: true, orderId }); }

    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceId = uid();
    const items = order.items || JSON.stringify([{ name: order.product_name || 'Trade Goods', quantity: order.quantity || 1, unitPrice: Number(order.unit_price), total: Number(order.subtotal || order.total_amount) }]);

    await conn.query(`UPDATE payments SET status='SUCCESSFUL', provider_payment_id=?, paid_at=NOW() WHERE payment_id=?`, [providerTransactionId || `txn_${Date.now()}`, paymentId]);
    await conn.query(`UPDATE orders SET status='PAID', payment_id=?, paid_at=NOW() WHERE order_id=?`, [paymentId, orderId]);
    await conn.query(
      `INSERT INTO invoices (invoice_id, invoice_number, order_id, buyer_id, buyer_company_id, exporter_id, exporter_company_id, items, subtotal, shipping_cost, tax_amount, total_amount, currency, payment_status, payment_id, paid_at, generated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', ?, NOW(), NOW())`,
      [invoiceId, invoiceNum, orderId, order.buyer_id, order.buyer_company_id, order.exporter_id, order.exporter_company_id, typeof items === 'string' ? items : JSON.stringify(items), order.subtotal || order.total_amount, order.shipping_cost || 0, order.tax_amount || 0, order.total_amount, order.currency || 'USD', paymentId]
    );
    const n1 = uid();
    await conn.query(`INSERT INTO notifications (notification_id, user_id, title, message, type, resource_id, is_read) VALUES (?, ?, 'Payment Confirmed', ?, 'PAYMENT_SUCCESS', ?, 0)`,
      [n1, order.buyer_id, `Your payment of ${order.currency} ${Number(order.total_amount).toLocaleString()} for order #${String(orderId).slice(0, 8)} was successful. Invoice ${invoiceNum} generated.`, orderId]);
    if (order.exporter_id) {
      const n2 = uid();
      await conn.query(`INSERT INTO notifications (notification_id, user_id, title, message, type, resource_id, is_read) VALUES (?, ?, 'Order Paid & Confirmed', ?, 'PAYMENT_SUCCESS', ?, 0)`,
        [n2, order.exporter_id, `Buyer settled payment for order #${String(orderId).slice(0, 8)}. Please prepare cargo for shipment.`, orderId]);
    }
    const logId = uid();
    await conn.query(`INSERT INTO audit_logs (log_id, actor_id, actor_role, action, resource_type, resource_id, result, metadata) VALUES (?, ?, ?, 'PAYMENT_VERIFIED', 'order', ?, 'SUCCESS', ?)`,
      [logId, buyerId || order.buyer_id, actorRole, orderId, JSON.stringify({ paymentId, amount: Number(order.total_amount), currency: order.currency, invoiceNumber: invoiceNum })]);

    await conn.commit();
    return res.status(200).json({ success: true, orderId, invoiceNumber: invoiceNum });
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    console.error('[/api/payments/process]', err);
    return res.status(500).json({ error: 'Payment processing failed' });
  } finally {
    conn.release();
  }
}
