/**
 * Next.js API Route: /api/market/quote
 * Server-side proxy to Twelve Data API.
 * The TWELVE_DATA_API_KEY never reaches the browser.
 *
 * Query params:
 *   symbol - e.g. EUR/USD  (will be URL-encoded as EUR%2FUSD)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol } = req.query;
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

  try {
    // Fetch quote from Twelve Data
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ForeignTradingSystem/1.0' } });

    if (!response.ok) {
      throw new Error(`Twelve Data HTTP ${response.status}`);
    }

    const raw = await response.json();

    // Twelve Data error format
    if (raw.status === 'error' || raw.code) {
      return res.status(200).json({
        status: 'UNAVAILABLE',
        error: raw.message || 'Provider error',
        symbol,
      });
    }

    // Normalize to our standard format
    const now = Date.now();
    const providerTs = raw.timestamp ? raw.timestamp * 1000 : now;
    const ageMs = now - providerTs;

    // Freshness classification
    let freshness = 'LIVE';
    if (ageMs > 60 * 60 * 1000) freshness = 'STALE';
    else if (ageMs > 20 * 60 * 1000) freshness = 'DELAYED';
    else if (ageMs > 5 * 60 * 1000) freshness = 'DELAYED';

    const bid = parseFloat(raw.bid ?? raw.close ?? raw.price ?? 0);
    const ask = parseFloat(raw.ask ?? (raw.close ? (parseFloat(raw.close) + 0.0002).toFixed(4) : 0));
    const last = parseFloat(raw.close ?? raw.price ?? 0);
    const open = parseFloat(raw.open ?? 0);
    const high = parseFloat(raw.high ?? 0);
    const low = parseFloat(raw.low ?? 0);
    const prevClose = parseFloat(raw.previous_close ?? 0);
    const change = parseFloat(raw.change ?? 0);
    const changePercent = parseFloat(raw.percent_change ?? 0);

    const normalized = {
      symbol: raw.symbol || symbol,
      name: raw.name || symbol,
      baseCurrency: symbol.split('/')[0]?.split(':')[0] || '',
      quoteCurrency: symbol.split('/')[1] || '',
      bid,
      ask,
      spread: parseFloat((ask - bid).toFixed(5)),
      last,
      open,
      high,
      low,
      previousClose: prevClose,
      change,
      changePercent,
      timestamp: providerTs,
      timestampIso: new Date(providerTs).toISOString(),
      source: 'Twelve Data',
      freshness,
      status: 'OK',
      fetchedAt: now,
    };

    // Cache-control: 30 seconds max-age for client, 60s stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(normalized);
  } catch (err) {
    console.error('[/api/market/quote] Error:', err.message);
    return res.status(200).json({
      symbol,
      status: 'UNAVAILABLE',
      error: err.message,
      fetchedAt: Date.now(),
    });
  }
}
