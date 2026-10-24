import React, { useState, useEffect, useCallback } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  ReferenceLine,
} from 'recharts';
import { getHistoricalData, TIMEFRAMES } from '../../services/marketDataService';
import MarketStatusBadge from './MarketStatusBadge';
import { RefreshCw, ZoomIn } from 'lucide-react';

// Custom candlestick bar for recharts
function CandlestickBar(props) {
  const { x, y, width, height, open, close, high, low, index, data } = props;
  if (!data || !data[index]) return null;
  const candle = data[index];

  const isUp = candle.close >= candle.open;
  const color = isUp ? '#10b981' : '#ef4444';

  // Calculate pixel positions within chart domain
  const { yAxis } = props;
  if (!yAxis) return null;

  return null; // recharts ComposedChart Bar handles rendering - see CustomTooltip
}

function formatTime(timestamp, interval) {
  if (!timestamp) return '';
  const d = new Date(timestamp * 1000);
  if (interval === '1D' || interval === '1W' || interval === '1day' || interval === '1week') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function CustomTooltip({ active, payload, label, interval }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const isUp = d.close >= d.open;

  return (
    <div className="bg-slate-900 text-white rounded-lg shadow-xl p-3 text-xs border border-slate-700">
      <p className="text-slate-400 mb-1">{formatTime(d.time, interval)}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-slate-400">O:</span><span className="font-mono">{Number(d.open).toFixed(5)}</span>
        <span className="text-slate-400">H:</span><span className="font-mono text-emerald-400">{Number(d.high).toFixed(5)}</span>
        <span className="text-slate-400">L:</span><span className="font-mono text-red-400">{Number(d.low).toFixed(5)}</span>
        <span className="text-slate-400">C:</span>
        <span className={`font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {Number(d.close).toFixed(5)}
        </span>
      </div>
    </div>
  );
}

export default function FxCandleChart({ symbol, currentPrice }) {
  const [interval, setInterval] = useState('1H');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('LOADING');

  const loadData = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setStatus('LOADING');
    const result = await getHistoricalData(symbol, interval, 100);
    if (result.status === 'UNAVAILABLE' || result.candles.length === 0) {
      setStatus('UNAVAILABLE');
      setData([]);
    } else {
      setStatus(result.status || 'OK');
      // Add computed fields for chart rendering
      const processed = result.candles.map((c) => ({
        ...c,
        // For recharts Bar we encode OHLC as y-ranges
        candleBody: [Math.min(c.open, c.close), Math.max(c.open, c.close)],
        wickHigh: c.high,
        wickLow: c.low,
        isUp: c.close >= c.open,
      }));
      setData(processed);
    }
    setLoading(false);
  }, [symbol, interval]);

  useEffect(() => { loadData(); }, [loadData]);

  const priceMin = data?.length ? Math.min(...data.map((d) => d.low)) * 0.9999 : undefined;
  const priceMax = data?.length ? Math.max(...data.map((d) => d.high)) * 1.0001 : undefined;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div>
            <span className="font-bold text-slate-900 text-sm">{symbol}</span>
            {currentPrice && (
              <span className="ml-2 font-mono text-sm text-blue-600 font-bold">{Number(currentPrice).toFixed(5)}</span>
            )}
          </div>
          <MarketStatusBadge status={status === 'OK' ? 'DELAYED' : status} />
        </div>
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setInterval(tf.value)}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                  interval === tf.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Refresh chart data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart body */}
      <div className="p-4">
        {status === 'UNAVAILABLE' && (
          <div className="h-80 flex flex-col items-center justify-center gap-3 text-center">
            <div className="text-4xl">📡</div>
            <p className="text-sm font-bold text-red-600">MARKET DATA UNAVAILABLE</p>
            <p className="text-xs text-slate-400">Could not load historical data from Twelve Data.</p>
            <button
              onClick={loadData}
              className="text-xs text-blue-600 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {(status === 'LOADING' || loading) && (
          <div className="h-80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading {interval} chart data…</p>
            </div>
          </div>
        )}

        {data && data.length > 0 && !loading && (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) => formatTime(t, interval)}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[priceMin, priceMax]}
                  tickFormatter={(v) => Number(v).toFixed(symbol?.includes('JPY') ? 2 : 4)}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  orientation="right"
                />
                <Tooltip content={<CustomTooltip interval={interval} />} />

                {/* Current price reference line */}
                {currentPrice && (
                  <ReferenceLine
                    y={currentPrice}
                    stroke="#2563eb"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: Number(currentPrice).toFixed(4), position: 'insideTopRight', fill: '#2563eb', fontSize: 10 }}
                  />
                )}

                {/* Wick lines (high-low) rendered as thin bars */}
                <Bar
                  dataKey="wickHigh"
                  fill="transparent"
                  stroke="transparent"
                  barSize={1}
                />

                {/* Candle bodies */}
                <Bar
                  dataKey="candleBody"
                  barSize={6}
                  shape={(props) => {
                    const { x, y, width, height, payload } = props;
                    if (!payload) return null;
                    const color = payload.isUp ? '#10b981' : '#ef4444';
                    return (
                      <g>
                        {/* Wick */}
                        <line
                          x1={x + width / 2}
                          y1={props.yAxis ? props.yAxis.scale(payload.high) : y - 4}
                          x2={x + width / 2}
                          y2={props.yAxis ? props.yAxis.scale(payload.low) : y + height + 4}
                          stroke={color}
                          strokeWidth={1}
                        />
                        {/* Body */}
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={Math.max(height, 1)}
                          fill={color}
                          fillOpacity={0.85}
                          rx={1}
                        />
                      </g>
                    );
                  }}
                />

                {/* Close price line */}
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#2563eb"
                  strokeWidth={1.5}
                  dot={false}
                  strokeOpacity={0.4}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-300 mt-2 text-right">
              Source: Twelve Data · {interval} · Data may be delayed up to 15 min (free tier)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
