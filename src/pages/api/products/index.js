import { query, rowToObject, toJson } from '../../../lib/db';
import { uid } from '../../../lib/auth';

function mapProduct(o) {
  return {
    productId: o.product_id,
    exporterId: o.exporter_id,
    companyId: o.company_id,
    name: o.name,
    description: o.description,
    category: o.category,
    hsCode: o.hs_code,
    price: Number(o.price),
    currency: o.currency,
    quantity: o.quantity,
    minimumOrderQuantity: o.minimum_order_quantity,
    countryOfOrigin: o.country_of_origin,
    exporterCompany: o.exporter_company,
    weight: o.weight,
    dimensions: o.dimensions,
    status: o.status,
    imageUrls: o.image_urls || [],
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { exporterId, category, country, status = 'active', limit: lim = '20' } = req.query;
      const limitCount = Math.min(Number(lim) || 20, 100);
      const conds = [];
      const params = [];
      if (exporterId) { conds.push('exporter_id = ?'); params.push(exporterId); }
      else if (status) { conds.push('status = ?'); params.push(status); }
      if (category) { conds.push('category = ?'); params.push(category); }
      if (country) { conds.push('country_of_origin = ?'); params.push(country); }
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
      const rows = await query(`SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ${limitCount}`, params);
      return res.status(200).json({ products: rows.map((r) => mapProduct(rowToObject(r))) });
    }
    if (req.method === 'POST') {
      const { exporterId, companyId, ...data } = req.body || {};
      if (!exporterId) return res.status(400).json({ error: 'exporterId required' });
      const productId = data.productId || uid();
      await query(
        `INSERT INTO products (product_id, exporter_id, company_id, name, description, category, hs_code, price, currency, quantity, minimum_order_quantity, country_of_origin, exporter_company, weight, dimensions, status, image_urls)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        [productId, exporterId, companyId || null, data.name || 'Untitled', data.description || '', data.category || '', data.hsCode || '', Number(data.price || 0), data.currency || 'USD', Number(data.quantity ?? 0), Number(data.minimumOrderQuantity ?? 1), data.countryOfOrigin || '', data.exporterCompany || '', data.weight || '', data.dimensions || '', toJson(data.imageUrls || [])]
      );
      return res.status(201).json({ productId });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/products]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
