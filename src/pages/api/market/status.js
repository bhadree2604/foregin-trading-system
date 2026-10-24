/**
 * Next.js API Route: /api/market/status
 * Returns the current market data provider health status.
 */
export default async function handler(req, res) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      provider: 'Twelve Data',
      connected: false,
      status: 'NO_API_KEY',
      message: 'TWELVE_DATA_API_KEY is not set in environment variables.',
      checkedAt: new Date().toISOString(),
    });
  }

  try {
    // Use a lightweight endpoint to test connectivity
    const url = `https://api.twelvedata.com/quote?symbol=EUR/USD&apikey=${apiKey}`;
    const start = Date.now();
    const response = await fetch(url, { headers: { 'User-Agent': 'ForeignTradingSystem/1.0' } });
    const latencyMs = Date.now() - start;
    const data = await response.json();

    if (data.status === 'error' || data.code === 429) {
      return res.status(200).json({
        provider: 'Twelve Data',
        connected: false,
        status: 'RATE_LIMITED',
        message: data.message || 'Rate limit reached',
        latencyMs,
        checkedAt: new Date().toISOString(),
      });
    }

    if (data.code && data.code !== 200) {
      return res.status(200).json({
        provider: 'Twelve Data',
        connected: false,
        status: 'PROVIDER_ERROR',
        message: data.message || 'Unknown provider error',
        errorCode: data.code,
        latencyMs,
        checkedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      provider: 'Twelve Data',
      connected: true,
      status: 'OK',
      tier: 'FREE',
      note: 'Free tier provides delayed data (up to 15 minutes). Upgrade for real-time.',
      latencyMs,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(200).json({
      provider: 'Twelve Data',
      connected: false,
      status: 'UNREACHABLE',
      message: err.message,
      checkedAt: new Date().toISOString(),
    });
  }
}
