import React from 'react';
import { useMarketData } from '../../contexts/MarketDataContext';
import { TrendingUp, TrendingDown, X, Plus } from 'lucide-react';

function formatPrice(val, symbol) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const d = (symbol || '').includes('JPY') ? 3 : 5;
  return Number(val).toFixed(d);
}

function ChangeChip({ changePercent }) {
  if (changePercent === null || changePercent === undefined) return null;
  const isPos = changePercent >= 0;
  return (
    <span className={`text-xs font-bold ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
      {isPos ? '+' : ''}{Number(changePercent).toFixed(2)}%
    </span>
  );
}

export default function WatchlistPanel({
  symbols,
  onSelectSymbol,
  selectedSymbol,
  onRemoveSymbol,
  onAddSymbol,
}) {
  const { quotes } = useMarketData();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-700">Watchlist</h3>
        {onAddSymbol && (
          <button
            onClick={onAddSymbol}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {symbols.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400">
            No pairs in watchlist. Add some above.
          </div>
        )}
        {symbols.map((symbol) => {
          const q = quotes[symbol];
          const isSelected = symbol === selectedSymbol;
          const isUp = q?.change >= 0;
          const isUnavailable = !q || q.status === 'UNAVAILABLE' || q.freshness === 'OFFLINE';

          return (
            <div
              key={symbol}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors group ${
                isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
              onClick={() => onSelectSymbol?.(symbol)}
            >
              {/* Symbol + price */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{symbol}</span>
                  {q?.freshness === 'DELAYED' && (
                    <span className="text-[9px] bg-amber-100 text-amber-600 font-bold rounded px-1">D</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {isUnavailable ? (
                    <span className="text-xs text-red-400">N/A</span>
                  ) : (
                    <>
                      <span className="font-mono text-xs text-slate-600">{formatPrice(q?.last || q?.bid, symbol)}</span>
                      <ChangeChip changePercent={q?.changePercent} />
                    </>
                  )}
                </div>
              </div>

              {/* Trend icon + remove */}
              <div className="flex items-center gap-1 ml-2">
                {!isUnavailable && q && (
                  isUp
                    ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    : <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                {onRemoveSymbol && (
                  <button
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all"
                    onClick={(e) => { e.stopPropagation(); onRemoveSymbol(symbol); }}
                    title="Remove from watchlist"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
