import { query, rowToObject, toJson } from '../../../lib/db';

function mapProduct(o) {
  return {
    productId: o.product_id, exporterId: o.exporter_id, companyId: o.company_id,
    name: o.name, description: o.description, category: o.category, hsCode: o.hs_code,
    price: Number(o.price), currency: o.currency, quantity: o.quantity,
    minimumOrderQuantity: o.minimum_order_quantity, countryOfOrigin: o.country_of_origin,
    exporterCompany: o.exporter_company, weight: o.weight, dimensions: o.dimensions,
    status: o.status, imageUrls: o.image_urls || [], createdAt: o.created_at, updatedAt: o.updated_at,
  };
}

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const rows = await query('SELECT * FROM products WHERE product_id = ? LIMIT 1', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ product: mapProduct(rowToObject(rows[0])) });
    }
    if (req.method === 'PATCH') {
      const { action, ...data } = req.body || {};
      if (action === 'archive') await query(`UPDATE products SET status='archived' WHERE product_id=?`, [id]);
      else if (action === 'restore') await query(`UPDATE products SET status='active' WHERE product_id=?`, [id]);
      else {
        const col = { name: 'name', description: 'description', category: 'category', hsCode: 'hs_code', price: 'price', currency: 'currency', quantity: 'quantity', minimumOrderQuantity: 'minimum_order_quantity', countryOfOrigin: 'country_of_origin', exporterCompany: 'exporter_company', weight: 'weight', dimensions: 'dimensions', status: 'status' };
        const sets = []; const params = [];
        for (const [k, c] of Object.entries(col)) if (data[k] !== undefined) { sets.push(`\`${c}\` = ?`); params.push(data[k]); }
        if (data.imageUrls !== undefined) { sets.push('`image_urls` = ?'); params.push(toJson(data.imageUrls)); }
        if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
        params.push(id);
        await query(`UPDATE products SET ${sets.join(', ')} WHERE product_id = ?`, params);
      }
      const rows = await query('SELECT * FROM products WHERE product_id = ? LIMIT 1', [id]);
      return res.status(200).json({ product: rows[0] ? mapProduct(rowToObject(rows[0])) : null });
    }
    if (req.method === 'DELETE') {
      await query(`UPDATE products SET status='archived' WHERE product_id=?`, [id]);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/products/[id]]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}
