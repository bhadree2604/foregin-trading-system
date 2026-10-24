import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import WatchlistPanel from '../../components/fx/WatchlistPanel';
import OrderPanel from '../../components/fx/OrderPanel';
import MarketStatusBadge from '../../components/fx/MarketStatusBadge';
import PositionRow from '../../components/fx/PositionRow';
import { useMarketData } from '../../contexts/MarketDataContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  getPaperAccount, openPaperPosition, createPaperOrder,
  updatePaperBalance, getOpenPaperPositions, closePaperPosition,
} from '../../firebase/market';
import { DEFAULT_PAIRS } from '../../services/marketDataService';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaperTradingPage() {
  const { quotes, subscribe } = useMarketData();
  const { currentUser } = useAuth();

  const [selectedSymbol, setSelectedSymbol] = useState('EUR/USD');
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    const [acc, pos] = await Promise.all([
      getPaperAccount(currentUser.uid),
      getOpenPaperPositions(currentUser.uid),
    ]);
    setAccount(acc);
    setPositions(pos);
    // Subscribe to all position symbols
    pos.forEach((p) => subscribe(p.symbol));
  }, [currentUser, subscribe]);

  useEffect(() => {
    loadData();
    DEFAULT_PAIRS.forEach((s) => subscribe(s));
  }, [loadData, subscribe]);

  const currentQuote = quotes[selectedSymbol];
  const decimals = selectedSymbol.includes('JPY') ? 3 : 5;

  const totalUnrealizedPL = positions.reduce((sum, pos) => {
    const q = quotes[pos.symbol];
    if (!q || !q.last) return sum;
    const diff = pos.side === 'BUY'
      ? (q.last - pos.entryPrice) * pos.quantity
      : (pos.entryPrice - q.last) * pos.quantity;
    return sum + diff;
  }, 0);

  const handlePlaceOrder = async (orderData) => {
    if (!currentUser) { toast.error('Please log in.'); return; }
    setOrderLoading(true);
    try {
      const acc = await getPaperAccount(currentUser.uid);
      const cost = orderData.quantity * orderData.executionPrice;

      if (orderData.side === 'BUY' && acc.balance < cost) {
        toast.error(`Insufficient virtual balance. Need $${cost.toFixed(2)}, have $${acc.balance.toFixed(2)}`);
        return;
      }

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

      await createPaperOrder(currentUser.uid, {
        ...orderData,
        positionId,
        status: 'FILLED',
        filledAt: Date.now(),
      });

      if (orderData.side === 'BUY') {
        const newBalance = acc.balance - cost;
        await updatePaperBalance(currentUser.uid, newBalance);
        setAccount((prev) => prev ? { ...prev, balance: newBalance } : prev);
      }

      toast.success(`✅ PAPER ${orderData.side} filled @ ${Number(orderData.executionPrice).toFixed(decimals)}`);
      await loadData();
    } catch (err) {
      toast.error('Order failed: ' + err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleClosePosition = async (position, currentPrice, realizedPL) => {
    try {
      await closePaperPosition(position.id, {
        closePrice: currentPrice,
        realizedPL,
        closedByUser: true,
      });

      if (position.side === 'BUY') {
        const proceeds = position.quantity * currentPrice;
        const acc = await getPaperAccount(currentUser.uid);
        await updatePaperBalance(currentUser.uid, acc.balance + proceeds);
        setAccount((prev) => prev ? { ...prev, balance: acc.balance + proceeds } : prev);
      }

      toast.success(`Position closed. P/L: ${realizedPL >= 0 ? '+' : ''}$${realizedPL.toFixed(2)}`);
      await loadData();
    } catch (err) {
      toast.error('Close failed: ' + err.message);
    }
  };

  return (
    <DashboardLayout>
      {/* PAPER TRADING warning banner */}
      <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-700">PAPER TRADING MODE</p>
          <p className="text-xs text-amber-600">
            Virtual funds only · Simulated execution · Not real money · Prices may be delayed up to 15 minutes
          </p>
        </div>
      </div>

      {/* Account summary */}
      {account && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Virtual Balance</p>
            <p className="text-2xl font-bold font-mono text-slate-900">
              ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">USD · Paper Account</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Unrealized P/L</p>
            <p className={`text-2xl font-bold font-mono ${totalUnrealizedPL >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {totalUnrealizedPL >= 0 ? '+' : ''}${Math.abs(totalUnrealizedPL).toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{positions.length} open position{positions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Starting Capital</p>
            <p className="text-2xl font-bold font-mono text-slate-400">
              ${Number(account.initialBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Virtual USD</p>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-4">
        {/* Watchlist */}
        <div>
          <WatchlistPanel
            symbols={DEFAULT_PAIRS}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={(s) => { setSelectedSymbol(s); subscribe(s); }}
          />
        </div>

        {/* Open positions table */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">Open Positions</h2>
            </div>
            {positions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                <p className="text-sm">No open positions</p>
                <p className="text-xs mt-1">Use the order panel to open a paper trade</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      {['Symbol', 'Qty', 'Entry', 'Current', 'Unreal. P/L', 'SL', 'TP', 'Opened', ''].map((h) => (
                        <th key={h} className="px-4 py-2 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {positions.map((pos) => (
                      <PositionRow
                        key={pos.id}
                        position={pos}
                        currentQuote={quotes[pos.symbol]}
                        onClose={handleClosePosition}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Order panel */}
        <div>
          <OrderPanel
            symbol={selectedSymbol}
            currentQuote={currentQuote}
            onSubmit={handlePlaceOrder}
            loading={orderLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
