/**
 * marketDataService.js
 *
 * Provider-agnostic market data service.
 * All calls route through Next.js API routes so API keys stay server-side.
 *
 * Freshness thresholds:
 *   LIVE    < 5 minutes old
 *   DELAYED 5-60 minutes old
 *   STALE   > 60 minutes old
 *   OFFLINE provider unreachable / API error
 */

const BASE = '/api/market';

// In-memory subscription registry: symbol -> { intervalId, callbacks[] }
const subscriptions = new Map();

// In-memory quote cache: symbol -> normalized quote
const quoteCache = new Map();

/** Default list of FX pairs the dashboard shows */
export const DEFAULT_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/INR',
  'EUR/GBP',
  'GBP/JPY',
];

/** Supported chart timeframes */
export const TIMEFRAMES = [
  { label: '1m',  value: '1m',  tdInterval: '1min' },
  { label: '5m',  value: '5m',  tdInterval: '5min' },
  { label: '15m', value: '15m', tdInterval: '15min' },
  { label: '30m', value: '30m', tdInterval: '30min' },
  { label: '1H',  value: '1H',  tdInterval: '1h' },
  { label: '4H',  value: '4H',  tdInterval: '4h' },
  { label: '1D',  value: '1D',  tdInterval: '1day' },
  { label: '1W',  value: '1W',  tdInterval: '1week' },
];

/**
 * Fetch a single normalized quote for a symbol.
 * Returns null if unavailable.
 */
export async function getQuote(symbol) {
  try {
    const res = await fetch(`${BASE}/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status === 'UNAVAILABLE') return { ...data, symbol, freshness: 'OFFLINE' };
    quoteCache.set(symbol, data);
    return data;
  } catch (err) {
    console.warn(`[marketDataService] getQuote(${symbol}) failed:`, err.message);
    // Return stale cached value if available
    const cached = quoteCache.get(symbol);
    if (cached) return { ...cached, freshness: 'STALE', status: 'STALE_CACHE' };
    return {
      symbol,
      status: 'UNAVAILABLE',
      freshness: 'OFFLINE',
      error: err.message,
      fetchedAt: Date.now(),
    };
  }
}

/**
 * Fetch multiple quotes in parallel.
 * Returns array of normalized quotes (nulls replaced with UNAVAILABLE stubs).
 */
export async function getQuotes(symbols) {
  const results = await Promise.allSettled(symbols.map((s) => getQuote(s)));
  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { symbol: symbols[i], status: 'UNAVAILABLE', freshness: 'OFFLINE' }
  );
}

/**
 * Fetch historical OHLC candles.
 * Returns { candles, symbol, interval, status, source, fetchedAt }
 */
export async function getHistoricalData(symbol, timeframe = '1H', outputsize = 100) {
  try {
    const url = `${BASE}/history?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(timeframe)}&outputsize=${outputsize}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[marketDataService] getHistoricalData(${symbol}, ${timeframe}) failed:`, err.message);
    return {
      symbol,
      interval: timeframe,
      status: 'UNAVAILABLE',
      error: err.message,
      candles: [],
      fetchedAt: Date.now(),
    };
  }
}

/**
 * Subscribe to live quote updates for a symbol.
 * Polls the /api/market/quote endpoint at the given interval.
 *
 * @param {string} symbol - FX pair e.g. EUR/USD
 * @param {Function} callback - called with normalized quote on each update
 * @param {number} pollMs - polling interval in ms (default 30000 = 30s)
 * @returns {Function} unsubscribe function
 */
export function subscribeToMarket(symbol, callback, pollMs = 30000) {
  const key = symbol;

  if (!subscriptions.has(key)) {
    subscriptions.set(key, { callbacks: new Set(), intervalId: null });
  }

  const sub = subscriptions.get(key);
  sub.callbacks.add(callback);

  // Immediate first fetch
  getQuote(symbol).then((q) => {
    if (q) sub.callbacks.forEach((cb) => cb(q));
  });

  // Start polling if not already running
  if (!sub.intervalId) {
    sub.intervalId = setInterval(async () => {
      const q = await getQuote(symbol);
      if (q) sub.callbacks.forEach((cb) => cb(q));
    }, pollMs);
  }

  // Return unsubscribe function
  return () => unsubscribeFromMarket(symbol, callback);
}

/**
 * Remove a specific callback from market subscription.
 * Cleans up the polling interval when no callbacks remain.
 */
export function unsubscribeFromMarket(symbol, callback) {
  const sub = subscriptions.get(symbol);
  if (!sub) return;

  sub.callbacks.delete(callback);

  if (sub.callbacks.size === 0) {
    if (sub.intervalId) {
      clearInterval(sub.intervalId);
    }
    subscriptions.delete(symbol);
  }
}

/**
 * Fetch market data provider status.
 */
export async function getMarketStatus() {
  try {
    const res = await fetch(`${BASE}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      provider: 'Twelve Data',
      connected: false,
      status: 'UNREACHABLE',
      message: err.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

/**
 * Convert an amount from one currency to another using live FX data.
 * Returns { rate, convertedAmount, timestamp, source, freshness }
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  const symbol = `${fromCurrency}/${toCurrency}`;
  const quote = await getQuote(symbol);

  if (!quote || quote.status === 'UNAVAILABLE' || !quote.last) {
    return {
      symbol,
      rate: null,
      convertedAmount: null,
      status: 'UNAVAILABLE',
      freshness: 'OFFLINE',
    };
  }

  return {
    symbol,
    fromCurrency,
    toCurrency,
    inputAmount: amount,
    rate: quote.last,
    convertedAmount: parseFloat((amount * quote.last).toFixed(4)),
    timestamp: quote.timestamp,
    timestampIso: quote.timestampIso,
    source: quote.source,
    freshness: quote.freshness,
    status: 'OK',
  };
}
