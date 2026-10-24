import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function formatPL(val) {
  if (val === null || val === undefined) return '—';
  const n = parseFloat(val);
  const isPos = n >= 0;
  return `${isPos ? '+' : ''}$${Math.abs(n).toFixed(2)}`;
}

export default function PositionRow({ position, currentQuote, onClose }) {
  const { symbol, side, quantity, entryPrice, stopLoss, takeProfit, openedAt } = position;

  const currentPrice =
    currentQuote?.last || currentQuote?.bid || entryPrice;
  const isUnavailable = !currentQuote || currentQuote.status === 'UNAVAILABLE';

  // Calculate unrealized P/L
  const priceDiff =
    side === 'BUY'
      ? (currentPrice - entryPrice) * quantity
      : (entryPrice - currentPrice) * quantity;

  const isPLPositive = priceDiff >= 0;
  const decimals = (symbol || '').includes('JPY') ? 3 : 5;

  const openedDate =
    openedAt?.toDate?.() ? openedAt.toDate() : openedAt ? new Date(openedAt) : null;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {/* Symbol + Side */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              side === 'BUY'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {side === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {side}
          </span>
          <span className="font-bold text-sm text-slate-800">{symbol}</span>
        </div>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-sm font-mono text-slate-600 whitespace-nowrap">
        {Number(quantity).toLocaleString()}
      </td>

      {/* Entry Price */}
      <td className="px-4 py-3 text-sm font-mono text-slate-600 whitespace-nowrap">
        {Number(entryPrice).toFixed(decimals)}
      </td>

      {/* Current Price */}
      <td className="px-4 py-3 text-sm font-mono whitespace-nowrap">
        {isUnavailable ? (
          <span className="text-red-400 text-xs">N/A</span>
        ) : (
          <span className="text-slate-800 font-semibold">{Number(currentPrice).toFixed(decimals)}</span>
        )}
      </td>

      {/* Unrealized P/L */}
      <td className="px-4 py-3 whitespace-nowrap">
        {isUnavailable ? (
          <span className="text-slate-300 text-xs">—</span>
        ) : (
          <span
            className={`text-sm font-bold font-mono ${
              isPLPositive ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {formatPL(priceDiff)}
          </span>
        )}
      </td>

      {/* Stop Loss */}
      <td className="px-4 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
        {stopLoss ? Number(stopLoss).toFixed(decimals) : '—'}
      </td>

      {/* Take Profit */}
      <td className="px-4 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
        {takeProfit ? Number(takeProfit).toFixed(decimals) : '—'}
      </td>

      {/* Opened At */}
      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
        {openedDate ? openedDate.toLocaleString() : '—'}
      </td>

      {/* Close button */}
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          onClick={() => onClose?.(position, currentPrice, priceDiff)}
          className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
        >
          Close
        </button>
      </td>
    </tr>
  );
}
