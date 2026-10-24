import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FxCandleChart from '../../components/fx/FxCandleChart';
import MarketStatusBadge from '../../components/fx/MarketStatusBadge';
import OrderPanel from '../../components/fx/OrderPanel';
import { useMarketData } from '../../contexts/MarketDataContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  openPaperPosition, createPaperOrder, getPaperAccount, updatePaperBalance,
} from '../../firebase/market';
import { ArrowLeft, RefreshCw, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

// Convert URL slug (EURUSD) to display symbol (EUR/USD)
function slugToSymbol(slug) {
  if (!slug) return '';
  if (slug.includes('/')) return slug.toUpperCase();
  // Try common 6-char pairs
  if (slug.length === 6) return `${slug.slice(0, 3).toUpperCase()}/${slug.slice(3).toUpperCase()}`;
  return slug.toUpperCase();
}

export default function CurrencyPairPage() {
  const router = useRouter();
  const { symbol: slugParam } = router.query;
  const symbol = slugToSymbol(slugParam);

  const { quotes, subscribe, refreshQuote } = useMarketData();
  const { currentUser } = useAuth();
  const [orderLoading, setOrderLoading] = useState(false);

  const quote = quotes[symbol] || null;

  // Subscribe to this pair on mount
  useEffect(() => {
    if (symbol) subscribe(symbol);
  }, [symbol, subscribe]);

  const decimals = symbol.includes('JPY') ? 3 : 5;

  const handlePlaceOrder = async (orderData) => {
    if (!currentUser) { toast.error('Please log in to paper trade.'); return; }
    setOrderLoading(true);
    try {
      const account = await getPaperAccount(currentUser.uid);
      const cost = orderData.quantity * orderData.executionPrice;
      if (account.balance < cost && orderData.side === 'BUY') {
        toast.error('Insufficient paper balance.');
        return;
      }

      // Create position
      const positionId = await openPaperPosition(currentUser.uid, {
        symbol: orderData.symbol,
        side: orderData.side,
        quantity: orderData.quantity,
        entryPrice: orderData.executionPrice,
        stopLoss: orderData.stopLoss,
        takeProfit: orderData.takeProfit,
        priceSource: orderData.priceSource,
        priceFreshness: orderData.freshness,
      });

      // Create order log
      await createPaperOrder(currentUser.uid, {
        ...orderData,
        positionId,
        status: 'FILLED',
        filledAt: Date.now(),
      });

      // Update balance
      if (orderData.side === 'BUY') {
        await updatePaperBalance(currentUser.uid, account.balance - cost);
      }

      toast.success(`✅ Paper ${orderData.side} order filled @ ${Number(orderData.executionPrice).toFixed(decimals)}`);
      router.push('/positions');
    } catch (err) {
      toast.error('Order failed: ' + err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">{symbol || '—'}</h1>
          {quote && <MarketStatusBadge status={quote.freshness} size="md" />}
        </div>
        <button
          onClick={() => refreshQuote(symbol)}
          className="ml-auto p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Top quote bar */}
      {!quote ? (
        <div className="bg-slate-900 rounded-xl p-5 mb-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading market data for {symbol}…</span>
        </div>
      ) : quote.status === 'UNAVAILABLE' ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-4 text-center">
          <p className="text-red-600 font-bold">MARKET DATA UNAVAILABLE</p>
          <p className="text-sm text-red-400 mt-1">{quote.error || 'Could not fetch data from provider.'}</p>
        </div>
      ) : (
        <div className="bg-slate-900 text-white rounded-xl p-5 mb-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'BID', val: quote.bid },
            { label: 'ASK', val: quote.ask },
            { label: 'SPREAD', val: quote.spread, d: 5 },
            { label: 'LAST', val: quote.last, bold: true },
            { label: 'CHANGE', val: quote.change, sign: true },
            { label: 'CHANGE %', val: quote.changePercent, sign: true, pct: true },
            { label: 'OPEN', val: quote.open },
            { label: 'HIGH', val: quote.high, color: 'text-emerald-400' },
            { label: 'LOW', val: quote.low, color: 'text-red-400' },
            { label: 'PREV CLOSE', val: quote.previousClose },
            { label: 'SOURCE', text: quote.source },
            { label: 'UPDATED', text: quote.timestampIso ? new Date(quote.timestampIso).toLocaleTimeString() : '—' },
          ].map(({ label, val, d, bold, sign, pct, color, text }) => (
            <div key={label}>
              <p className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wide">{label}</p>
              {text ? (
                <p className="text-xs text-slate-300">{text}</p>
              ) : (
                <p className={`font-mono text-sm ${bold ? 'font-bold text-white' : ''} ${color || ''} ${
                  sign ? (val >= 0 ? 'text-emerald-400' : 'text-red-400') : ''
                }`}>
                  {val !== null && val !== undefined && !isNaN(val)
                    ? `${sign && val >= 0 ? '+' : ''}${Number(val).toFixed(d || decimals)}${pct ? '%' : ''}`
                    : '—'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chart + Order Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <FxCandleChart symbol={symbol} currentPrice={quote?.last || quote?.bid} />

        <div className="space-y-4">
          <OrderPanel
            symbol={symbol}
            currentQuote={quote}
            onSubmit={handlePlaceOrder}
            loading={orderLoading}
          />
          {/* Data disclosure */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-bold mb-1">Data Disclosure</p>
                <p>All prices sourced from Twelve Data (free tier). Data may be delayed up to 15 minutes. This is not investment advice. Paper trading uses virtual funds only.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
