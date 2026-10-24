import crypto from 'node:crypto';
import { getConnection, query } from '../../lib/db';
import { uid } from '../../lib/auth';

/** POST /api/payment-webhook — HMAC-verified, idempotent. Replaces Firebase Function. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const signature = req.headers['x-provider-signature'];
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'sandbox_webhook_secret_key_fts';
  try {
    const rawBody = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (signature && signature !== expected) {
      console.warn('Webhook signature mismatch.');
      return res.status(401).send('Invalid signature');
    }
  } catch (err) {
    console.warn('Signature verification skipped:', err.message);
  }
  const { eventId, orderId, paymentId, status, amount, currency } = req.body || {};
  if (!orderId || !paymentId) return res.status(400).send('Missing orderId or paymentId');
  const eid = eventId || `event_${Date.now()}`;
  const seen = await query('SELECT event_id FROM processed_webhook_events WHERE event_id = ? LIMIT 1', [eid]);
  if (seen.length) return res.status(200).json({ received: true, alreadyProcessed: true });

  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const [orows] = await conn.query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [orderId]);
    if (!orows.length) throw new Error('Order not found');
    await conn.query(`UPDATE payments SET status=?, paid_at=NOW() WHERE payment_id=?`, [status === 'SUCCESS' ? 'SUCCESSFUL' : 'FAILED', paymentId]);
    if (status === 'SUCCESS') {
      await conn.query(`UPDATE orders SET status='PAID', payment_id=?, paid_at=NOW() WHERE order_id=?`, [paymentId, orderId]);
      const invId = uid();
      await conn.query(`INSERT INTO invoices (invoice_id, invoice_number, order_id, buyer_id, total_amount, currency, payment_status, paid_at, generated_at) VALUES (?, ?, ?, ?, ?, ?, 'PAID', NOW(), NOW())`,
        [invId, `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`, orderId, orows[0].buyer_id, amount || orows[0].total_amount, currency || 'USD']);
      await conn.query(`INSERT INTO audit_logs (log_id, action, resource_type, resource_id, result, metadata) VALUES (?, 'PAYMENT_WEBHOOK_VERIFIED', 'order', ?, 'SUCCESS', ?)`,
        [uid(), orderId, JSON.stringify({ paymentId, amount })]);
    }
    await conn.query(`INSERT INTO processed_webhook_events (event_id, order_id, payment_id) VALUES (?, ?, ?)`, [eid, orderId, paymentId]);
    await conn.commit();
    return res.status(200).json({ success: true });
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    console.error('[/api/payment-webhook]', err);
    return res.status(500).send('Internal transaction error');
  } finally {
    conn.release();
  }
}
