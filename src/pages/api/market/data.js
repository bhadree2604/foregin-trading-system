import { query } from '../../../lib/db';
import { uid } from '../../../lib/auth';

const DEFAULTS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/INR'];

function parseSymbols(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });
      if (req.query.scope === 'alerts') {
        const rows = await query(`SELECT * FROM market_alerts WHERE user_id = ? AND active = 1 ORDER BY created_at DESC`, [userId]);
        return res.status(200).json({ alerts: rows.map((r) => ({ id: String(r.alert_id), alertId: String(r.alert_id), userId: r.user_id, symbol: r.symbol, condition: r.condition_type, conditionType: r.condition_type, targetPrice: Number(r.target_price), active: Boolean(r.active), triggered: Boolean(r.triggered), createdAt: r.created_at })) });
      }
      if (req.query.scope === 'account') {
        const rows = await query('SELECT * FROM paper_accounts WHERE user_id = ? LIMIT 1', [userId]);
        if (!rows.length) {
          await query(`INSERT INTO paper_accounts (user_id, balance, initial_balance, currency) VALUES (?, 100000, 100000, 'USD')`, [userId]);
          return res.status(200).json({ account: { id: userId, userId, balance: 100000, initialBalance: 100000, currency: 'USD' } });
        }
        const a = rows[0];
        return res.status(200).json({ account: { id: a.user_id, userId: a.user_id, balance: Number(a.balance), initialBalance: Number(a.initial_balance), currency: a.currency, createdAt: a.created_at } });
      }
      if (req.query.scope === 'paper-orders') {
        const rows = await query(`SELECT * FROM paper_orders WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
        return res.status(200).json({ orders: rows.map((r) => ({ id: String(r.paper_order_id), userId: r.user_id, symbol: r.symbol, side: r.side, quantity: Number(r.quantity), price: Number(r.price), status: r.status, createdAt: r.created_at })) });
      }
      if (req.query.scope === 'positions-open') {
        const rows = await query(`SELECT * FROM paper_positions WHERE user_id = ? AND status = 'OPEN' ORDER BY opened_at DESC`, [userId]);
        return res.status(200).json({ positions: rows.map(mapPos) });
      }
      if (req.query.scope === 'positions-closed') {
        const rows = await query(`SELECT * FROM paper_positions WHERE user_id = ? AND status = 'CLOSED' ORDER BY closed_at DESC`, [userId]);
        return res.status(200).json({ positions: rows.map(mapPos) });
      }
      // default: watchlist
      const rows = await query('SELECT symbols FROM watchlists WHERE user_id = ? LIMIT 1', [userId]);
      if (!rows.length) return res.status(200).json({ symbols: DEFAULTS });
      return res.status(200).json({ symbols: parseSymbols(rows[0].symbols) });
    }
    if (req.method === 'POST') {
      const { userId, symbols, alert, order, position, balance, scope } = req.body || {};
      if (!userId) return res.status(400).json({ error: 'userId required' });
      if (scope === 'watchlist' || symbols) {
        await query(`INSERT INTO watchlists (user_id, symbols) VALUES (?, ?) ON DUPLICATE KEY UPDATE symbols = VALUES(symbols)`, [userId, JSON.stringify(symbols || DEFAULTS)]);
        return res.status(200).json({ success: true });
      }
      if (scope === 'alert' || alert) {
        const a = alert || {};
        const alertId = uid();
        await query(`INSERT INTO market_alerts (alert_id, user_id, symbol, condition_type, target_price, active, triggered) VALUES (?, ?, ?, ?, ?, 1, 0)`,
          [alertId, userId, a.symbol || '', a.condition || a.conditionType || '', a.targetPrice != null ? Number(a.targetPrice) : null]);
        return res.status(201).json({ alertId, id: alertId });
      }
      if (scope === 'paper-order' || order) {
        const o = order || {};
        const pid = uid();
        await query(`INSERT INTO paper_orders (paper_order_id, user_id, symbol, side, quantity, price, status) VALUES (?, ?, ?, ?, ?, ?, 'FILLED')`,
          [pid, userId, o.symbol || '', o.side || 'BUY', Number(o.quantity || 0), Number(o.price || 0)]);
        return res.status(201).json({ paperOrderId: pid, id: pid });
      }
      if (scope === 'paper-position-open' || position) {
        const p = position || {};
        const posId = uid();
        await query(`INSERT INTO paper_positions (position_id, user_id, symbol, side, quantity, entry_price, current_price, unrealized_pl, status) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'OPEN')`,
          [posId, userId, p.symbol || '', p.side || 'BUY', Number(p.quantity || 0), Number(p.entryPrice || p.price || 0), Number(p.currentPrice || p.entryPrice || p.price || 0)]);
        return res.status(201).json({ positionId: posId, id: posId });
      }
      if (scope === 'paper-position-close') {
        const { positionId, closeData = {} } = req.body;
        await query(`UPDATE paper_positions SET status='CLOSED', closed_at=NOW(), current_price=COALESCE(?, current_price), realized_pl=? WHERE position_id=?`,
          [closeData.closePrice != null ? Number(closeData.closePrice) : null, closeData.realizedPL != null ? Number(closeData.realizedPL) : 0, positionId]);
        return res.status(200).json({ success: true });
      }
      if (scope === 'paper-position-pl') {
        const { positionId: pid2, unrealizedPL, currentPrice } = req.body;
        await query(`UPDATE paper_positions SET unrealized_pl=?, current_price=? WHERE position_id=?`, [Number(unrealizedPL || 0), currentPrice != null ? Number(currentPrice) : null, pid2]);
        return res.status(200).json({ success: true });
      }
      if (scope === 'paper-balance') {
        await query(`UPDATE paper_accounts SET balance=? WHERE user_id=?`, [Number(balance), userId]);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Unknown market scope' });
    }
    if (req.method === 'PATCH') {
      const { scope, userId, symbols, alertId, triggered } = req.body || {};
      if (scope === 'watchlist' && userId) {
        await query(`INSERT INTO watchlists (user_id, symbols) VALUES (?, ?) ON DUPLICATE KEY UPDATE symbols = VALUES(symbols)`, [userId, JSON.stringify(symbols || [])]);
        return res.status(200).json({ success: true });
      }
      if (scope === 'alert-triggered' && alertId) {
        await query(`UPDATE market_alerts SET triggered=1, active=0, triggered_at=NOW() WHERE alert_id=?`, [alertId]);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Unknown patch scope' });
    }
    if (req.method === 'DELETE') {
      const { scope, alertId, positionId } = req.query;
      if (scope === 'alert' && alertId) {
        await query(`DELETE FROM market_alerts WHERE alert_id = ?`, [alertId]);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Unknown delete scope' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[/api/market/data]', err);
    return res.status(500).json({ error: 'Request failed' });
  }
}

function mapPos(r) {
  return { id: String(r.position_id), positionId: String(r.position_id), userId: r.user_id, symbol: r.symbol, side: r.side, quantity: Number(r.quantity), entryPrice: Number(r.entry_price), currentPrice: r.current_price != null ? Number(r.current_price) : null, unrealizedPL: Number(r.unrealized_pl), realizedPL: r.realized_pl != null ? Number(r.realized_pl) : null, status: r.status, openedAt: r.opened_at, closedAt: r.closed_at };
}
