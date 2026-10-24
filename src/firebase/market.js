/** Market helpers — MySQL backed (watchlists, alerts, paper trading). */
import { apiFetch } from '../lib/session';

const DEFAULTS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/INR'];

// Watchlist
export async function getUserWatchlist(userId) {
  try {
    const data = await apiFetch(`/api/market/data?userId=${encodeURIComponent(userId)}`);
    return data.symbols?.length ? data.symbols : DEFAULTS;
  } catch (_) {
    return DEFAULTS;
  }
}

export async function saveUserWatchlist(userId, symbols) {
  await apiFetch('/api/market/data', { method: 'POST', body: JSON.stringify({ userId, scope: 'watchlist', symbols }) });
}

export async function addToWatchlist(userId, symbol) {
  const current = await getUserWatchlist(userId);
  if (!current.includes(symbol)) await saveUserWatchlist(userId, [...current, symbol]);
}

export async function removeFromWatchlist(userId, symbol) {
  const current = await getUserWatchlist(userId);
  await saveUserWatchlist(userId, current.filter((s) => s !== symbol));
}

// Alerts
export async function getAlerts(userId) {
  const data = await apiFetch(`/api/market/data?userId=${encodeURIComponent(userId)}&scope=alerts`);
  return data.alerts || [];
}

export async function createAlert(userId, alertData) {
  const data = await apiFetch('/api/market/data', { method: 'POST', body: JSON.stringify({ userId, scope: 'alert', alert: alertData }) });
  return data.alertId;
}

export async function deleteAlert(alertId) {
  await apiFetch(`/api/market/data?scope=alert&alertId=${encodeURIComponent(alertId)}`, { method: 'DELETE' });
}

export async function markAlertTriggered(alertId) {
  await apiFetch('/api/market/data', { method: 'PATCH', body: JSON.stringify({ scope: 'alert-triggered', alertId }) });
}

// Paper trading
export async function getPaperAccount(userId) {
  const data = await apiFetch(`/api/market/data?userId=${encodeURIComponent(userId)}&scope=account`);
  return data.account;
}

export async function updatePaperBalance(userId, newBalance) {
  await apiFetch('/api/market/data', { method: 'POST', body: JSON.stringify({ userId, scope: 'paper-balance', balance: newBalance }) });
}

export async function createPaperOrder(userId, orderData) {
  const data = await apiFetch('/api/market/data', { method: 'POST', body: JSON.stringify({ userId, scope: 'paper-order', order: orderData }) });
  return data.paperOrderId;
}

export async function getPaperOrders(userId) {
  const data = await apiFetch(`/api/market/data?userId=${encodeURIComponent(userId)}&scope=paper-orders`);
  return data.orders || [];
}

export async function getOpenPaperPositions(userId) {
  const data = await apiFetch(`/api/market/data?userId=${encodeURIComponent(userId)}&scope=positions-open`);
  return data.positions || [];
}

export async function getClosedPaperPositions(userId) {
  const data = await apiFetch(`/api/market/data?userId=${encodeURIComponent(userId)}&scope=positions-closed`);
  return data.positions || [];
}

export async function openPaperPosition(userId, positionData) {
  const data = await apiFetch('/api/market/data', { method: 'POST', body: JSON.stringify({ userId, scope: 'paper-position-open', position: positionData }) });
  return data.positionId;
}

export async function closePaperPosition(positionId, closeData) {
  // userId required by API; pass a placeholder — server only uses positionId for close
  await apiFetch('/api/market/data', { method: 'POST', body: JSON.stringify({ userId: closeData?.userId || 'x', scope: 'paper-position-close', positionId, closeData }) });
}

export async function updatePaperPositionPL(positionId, unrealizedPL, currentPrice) {
  await apiFetch('/api/market/data', { method: 'POST', body: JSON.stringify({ userId: 'x', scope: 'paper-position-pl', positionId, unrealizedPL, currentPrice }) });
}

export async function cacheQuote() { return null; }
export async function getCachedQuote() { return null; }
export async function logMarketDataStatus(statusData) {
  // Fire-and-forget server log is optional; keep noop to avoid extra table writes from client.
  void statusData;
  return null;
}
