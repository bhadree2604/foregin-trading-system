import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import MarketStatusBadge from './MarketStatusBadge';

/**
 * OrderPanel — Paper trading buy/sell panel.
 * Uses real market price but executes simulated trades only.
 */
export default function OrderPanel({ symbol, currentQuote, onSubmit, loading }) {
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState('10000');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const isUnavailable = !currentQuote || currentQuote.status === 'UNAVAILABLE';
  const price = side === 'BUY' ? currentQuote?.ask : currentQuote?.bid;
  const decimals = (symbol || '').includes('JPY') ? 3 : 5;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    onSubmit({
      symbol,
      side,
      orderType,
      quantity: parseFloat(quantity),
      executionPrice: orderType === 'MARKET' ? price : parseFloat(limitPrice),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      timestamp: Date.now(),
      freshness: currentQuote?.freshness,
      priceSource: currentQuote?.source,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-700">Paper Order</h3>
          <p className="text-xs text-amber-600 font-semibold mt-0.5">⚠ SIMULATED · VIRTUAL FUNDS ONLY</p>
        </div>
        <MarketStatusBadge status={isUnavailable ? 'UNAVAILABLE' : currentQuote?.freshness} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {/* Symbol display */}
        <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
          <span className="text-sm font-bold text-slate-700">{symbol || '—'}</span>
          <div className="text-right">
            {isUnavailable ? (
              <span className="text-xs text-red-400">Data unavailable</span>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  Bid <span className="font-mono text-slate-600">{Number(currentQuote?.bid).toFixed(decimals)}</span>{' '}
                  · Ask <span className="font-mono text-slate-600">{Number(currentQuote?.ask).toFixed(decimals)}</span>
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {currentQuote?.source} · {currentQuote?.timestampIso ? new Date(currentQuote.timestampIso).toLocaleTimeString() : ''}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Buy / Sell toggle */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-bold transition-colors ${
              side === 'BUY'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-bold transition-colors ${
              side === 'SELL'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" /> SELL
          </button>
        </div>

        {/* Order Type */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quantity (Units)</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10000"
          />
        </div>

        {/* Limit price (conditional) */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Limit Price</label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              step="0.00001"
              className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={price ? Number(price).toFixed(decimals) : ''}
            />
          </div>
        )}

        {/* Stop Loss */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stop Loss (optional)</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            step="0.00001"
            className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 1.0800"
          />
        </div>

        {/* Take Profit */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Take Profit (optional)</label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            step="0.00001"
            className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 1.1200"
          />
        </div>

        {/* Execution price display */}
        {!isUnavailable && price && (
          <div className={`rounded-lg p-3 text-center ${side === 'BUY' ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <p className="text-xs text-slate-500 mb-0.5">Execution Price</p>
            <p className={`text-xl font-mono font-bold ${side === 'BUY' ? 'text-emerald-700' : 'text-red-600'}`}>
              {Number(price).toFixed(decimals)}
            </p>
            <p className="text-[10px] text-slate-400">{side === 'BUY' ? 'ASK (buy at ask)' : 'BID (sell at bid)'}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isUnavailable || loading || !symbol}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            isUnavailable || loading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : side === 'BUY'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {loading
            ? 'Placing order…'
            : isUnavailable
            ? 'Data unavailable'
            : `${side === 'BUY' ? '▲ BUY' : '▼ SELL'} ${symbol || ''}`}
        </button>

        <p className="text-[10px] text-slate-300 text-center">
          Paper trading only · Virtual funds · Not real money
        </p>
      </form>
    </div>
  );
}
