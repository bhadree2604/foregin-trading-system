import React from 'react';
import MarketStatusBadge from './MarketStatusBadge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMarketData } from '../../contexts/MarketDataContext';

function formatPrice(val, decimals = 4) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toFixed(decimals);
}

function ChangeDisplay({ change, changePercent }) {
  if (change === null || change === undefined) return <span className="text-slate-400 text-xs">—</span>;
  const isPos = change > 0;
  const isNeg = change < 0;
  const color = isPos ? 'text-emerald-600' : isNeg ? 'text-red-500' : 'text-slate-400';
  const Icon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus;

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs font-semibold">
        {isPos ? '+' : ''}{formatPrice(change, 5)}{' '}
        ({isPos ? '+' : ''}{Number(changePercent).toFixed(2)}%)
      </span>
    </div>
  );
}

/**
 * LiveQuoteCard — displays real-time bid/ask/spread/change for one FX pair.
 * Reads from MarketDataContext or accepts an explicit `quote` prop.
 */
export default function LiveQuoteCard({ symbol, quote: quoteProp, onClick, compact = false }) {
  const { quotes } = useMarketData();
  const quote = quoteProp || quotes[symbol] || null;

  const isLoading = !quote;
  const isUnavailable = quote?.status === 'UNAVAILABLE' || quote?.freshness === 'OFFLINE';

  const pairLabel = symbol || quote?.symbol || '—';
  const [base, counter] = pairLabel.split('/');

  const decimals = pairLabel.includes('JPY') ? 3 : 4;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-900">{base}</span>
            <span className="text-xs text-slate-400 font-medium">/{counter}</span>
          </div>
          {!compact && (
            <p className="text-xs text-slate-400 mt-0.5">{quote?.name || pairLabel}</p>
          )}
        </div>
        <MarketStatusBadge status={isLoading ? 'LOADING' : quote?.freshness || quote?.status} />
      </div>

      {/* Price */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-6 bg-slate-100 rounded w-24" />
          <div className="h-3 bg-slate-100 rounded w-32" />
        </div>
      ) : isUnavailable ? (
        <div className="text-xs text-red-500 font-semibold py-1">MARKET DATA UNAVAILABLE</div>
      ) : (
        <>
          <div className={`font-mono font-bold text-slate-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
            {formatPrice(quote?.last || quote?.bid, decimals)}
          </div>
          <ChangeDisplay change={quote?.change} changePercent={quote?.changePercent} />

          {!compact && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs border-t border-slate-100 pt-2">
              <div>
                <p className="text-slate-400">BID</p>
                <p className="font-mono font-semibold text-slate-700">{formatPrice(quote?.bid, decimals)}</p>
              </div>
              <div>
                <p className="text-slate-400">ASK</p>
                <p className="font-mono font-semibold text-slate-700">{formatPrice(quote?.ask, decimals)}</p>
              </div>
              <div>
                <p className="text-slate-400">SPREAD</p>
                <p className="font-mono font-semibold text-slate-700">{formatPrice(quote?.spread, 5)}</p>
              </div>
            </div>
          )}

          {!compact && (
            <p className="text-[10px] text-slate-300 mt-2 truncate">
              {quote?.source} · {quote?.timestampIso ? new Date(quote.timestampIso).toLocaleTimeString() : ''}
            </p>
          )}
        </>
      )}
    </button>
  );
}
