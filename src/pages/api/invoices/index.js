import { query, rowToObject, toJson } from '../../../lib/db';
import { uid } from '../../../lib/auth';

function mapInvoice(o) {
  return {
    invoiceId: o.invoice_id, invoiceNumber: o.invoice_number, orderId: o.order_id,
    buyerId: o.buyer_id, buyerCompanyId: o.buyer_company_id, exporterId: o.exporter_id,
    exporterCompanyId: o.exporter_company_id, items: o.items || [],
    subtotal: Number(o.subtotal), shippingCost: Number(o.shipping_cost),
    taxAmount: Number(o.tax_amount), totalAmount: Number(o.total_amount),
    currency: o.currency, paymentStatus: o.payment_status, paymentId: o.payment_id,
    paidAt: o.paid_at, generatedAt: o.generated_at, createdAt: o.created_at, updatedAt: o.updated_at,
  };
}

export function generateInvoiceNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${dateStr}-${rand}`;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { id, orderId, buyerId, exporterId, limit: lim = '100' } = req.query;
      if (id) {
        const rows = await query('SELECT * FROM invoices WHERE invoice_id = ? LIMIT 1', [id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ invoice: mapInvoice(rowToObject(rows[0])) });
      }
      const conds = []; const params = [];
      if (orderId) { conds.push('order_id = ?'); params.push(orderId); }
      if (buyerId) { conds.push('buyer_id = ?'); params.push(buyerId); }
      if (exporterId) { conds.push('exporter_id = ?'); params.push(exporterId); }
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
      const limitCount = Math.min(Number(lim) || 100, 200);
      const rows = await query(`SELECT * FROM invoices ${where} ORDER BY created_at DESC LIMIT ${limitCount}`, params);
      const list = rows.map((r) => mapInvoice(rowToObject(r)));
      return res.status(200).json({ invoices: list, invoice: list[0] || null });
    }
    if (req.method === 'POST') {
      const d = req.body || {};
      const invoiceId = d.invoiceId || uid();
      const invoiceNumber = d.invoiceNumber || generateInvoiceNumber();
      await query(
        `INSERT INTO invoices (invoice_id, invoice_number, order_id, buyer_id, buyer_company_id, exporter_id, exporter_company_id, items, subtotal, shipping_cost, tax_amount, total_amount, currency, payment_status, payment_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, invoiceNumber, d.orderId || null, d.buyerId || null, d.buyerCompanyId || null, d.exporterId || null, d.exporterCompanyId || null, toJson(d.items || []), Number(d.subtotal || d.totalAmount || 0), Number(d.shippingCost || 0), Number(d.taxAmount || 0), Number(d.totalAmount || 0), d.currency || 'USD', d.paymentStatus || 'PENDING', d.paymentId || null]
      );
      return res.status(201).json({ invoiceId, invoiceNumber });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/invoices]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
