/**
 * Next.js API Route: /api/market/history
 * Server-side proxy for OHLC historical data from Twelve Data.
 * The TWELVE_DATA_API_KEY never reaches the browser.
 *
 * Query params:
 *   symbol    - e.g. EUR/USD
 *   interval  - 1min | 5min | 15min | 30min | 1h | 4h | 1day | 1week
 *   outputsize - number of candles (default 100)
 */

// Map our UI timeframe labels to Twelve Data interval values
const INTERVAL_MAP = {
  '1m':  '1min',
  '5m':  '5min',
  '15m': '15min',
  '30m': '30min',
  '1H':  '1h',
  '4H':  '4h',
  '1D':  '1day',
  '1W':  '1week',
  // Pass-through if already in TD format
  '1min': '1min', '5min': '5min', '15min': '15min', '30min': '30min',
  '1h': '1h', '4h': '4h', '1day': '1day', '1week': '1week',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, interval = '1h', outputsize = '100' } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: 'symbol is required' });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'MARKET_DATA_UNAVAILABLE',
      reason: 'API key not configured',
    });
  }

  const tdInterval = INTERVAL_MAP[interval] || '1h';

  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${tdInterval}&outputsize=${outputsize}&apikey=${apiKey}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ForeignTradingSystem/1.0' } });

    if (!response.ok) {
      throw new Error(`Twelve Data HTTP ${response.status}`);
    }

    const raw = await response.json();

    if (raw.status === 'error' || raw.code) {
      return res.status(200).json({
        status: 'UNAVAILABLE',
        error: raw.message || 'Provider error',
        symbol,
        candles: [],
      });
    }

    // Normalize candles: Twelve Data returns newest first, we reverse to oldest-first for charts
    const candles = (raw.values || [])
      .map((c) => ({
        time: Math.floor(new Date(c.datetime).getTime() / 1000), // Unix timestamp (seconds)
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume ?? 0),
      }))
      .reverse();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({
      symbol,
      interval: tdInterval,
      status: 'OK',
      source: 'Twelve Data',
      fetchedAt: Date.now(),
      candles,
    });
  } catch (err) {
    console.error('[/api/market/history] Error:', err.message);
    return res.status(200).json({
      symbol,
      status: 'UNAVAILABLE',
      error: err.message,
      candles: [],
      fetchedAt: Date.now(),
    });
  }
}
