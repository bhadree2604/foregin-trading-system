import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import WatchlistPanel from '../../components/fx/WatchlistPanel';
import FxCandleChart from '../../components/fx/FxCandleChart';
import LiveQuoteCard from '../../components/fx/LiveQuoteCard';
import MarketStatusBadge from '../../components/fx/MarketStatusBadge';
import { useMarketData } from '../../contexts/MarketDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserWatchlist, saveUserWatchlist } from '../../firebase/market';
import { DEFAULT_PAIRS } from '../../services/marketDataService';
import {
  TrendingUp, TrendingDown, Activity, Globe, ChevronRight, RefreshCw
} from 'lucide-react';

const ALL_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/INR',
  'EUR/GBP', 'GBP/JPY', 'AUD/USD', 'USD/CAD',
  'USD/CHF', 'EUR/JPY', 'NZD/USD', 'USD/SGD',
];

export default function MarketsPage() {
  const router = useRouter();
  const { quotes, providerStatus, subscribe } = useMarketData();
  const { currentUser } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState('EUR/USD');
  const [watchlist, setWatchlist] = useState(DEFAULT_PAIRS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addInput, setAddInput] = useState('');

  // Load user watchlist
  useEffect(() => {
    if (currentUser) {
      getUserWatchlist(currentUser.uid).then(setWatchlist);
    }
  }, [currentUser]);

  // Subscribe to all watchlist symbols
  useEffect(() => {
    watchlist.forEach((s) => subscribe(s));
  }, [watchlist, subscribe]);

  const currentQuote = quotes[selectedSymbol];

  const handleAddSymbol = async () => {
    const sym = addInput.toUpperCase().trim();
    if (!sym || watchlist.includes(sym)) { setShowAddModal(false); return; }
    const newList = [...watchlist, sym];
    setWatchlist(newList);
    subscribe(sym);
    if (currentUser) await saveUserWatchlist(currentUser.uid, newList);
    setAddInput('');
    setShowAddModal(false);
  };

  const handleRemoveSymbol = async (sym) => {
    const newList = watchlist.filter((s) => s !== sym);
    setWatchlist(newList);
    if (currentUser) await saveUserWatchlist(currentUser.uid, newList);
  };

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">FX Markets</h1>
            <p className="text-xs text-slate-500">
              Live foreign exchange market data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {providerStatus && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span>{providerStatus.provider}</span>
              <MarketStatusBadge status={providerStatus.connected ? 'DELAYED' : 'OFFLINE'} />
            </div>
          )}
        </div>
      </div>

      {/* Main 3-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-4">

        {/* LEFT: Watchlist */}
        <div className="h-[calc(100vh-200px)] min-h-[400px]">
          <WatchlistPanel
            symbols={watchlist}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={(sym) => {
              setSelectedSymbol(sym);
              subscribe(sym);
            }}
            onRemoveSymbol={handleRemoveSymbol}
            onAddSymbol={() => setShowAddModal(true)}
          />
        </div>

        {/* CENTER: Chart + quote bar */}
        <div className="space-y-4 min-w-0">
          {/* Quote bar */}
          {currentQuote ? (
            <div className="bg-slate-900 rounded-xl px-5 py-4 text-white flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Symbol</p>
                <button
                  onClick={() => router.push(`/markets/${selectedSymbol.replace('/', '')}`)}
                  className="text-lg font-bold hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  {selectedSymbol} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {[
                { label: 'BID', val: currentQuote.bid },
                { label: 'ASK', val: currentQuote.ask },
                { label: 'SPREAD', val: currentQuote.spread, decimals: 5 },
                { label: 'LAST', val: currentQuote.last },
                { label: 'HIGH', val: currentQuote.high },
                { label: 'LOW', val: currentQuote.low },
              ].map(({ label, val, decimals }) => {
                const d = decimals || (selectedSymbol.includes('JPY') ? 3 : 4);
                return (
                  <div key={label}>
                    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                    <p className="font-mono font-semibold text-sm">
                      {val !== undefined && val !== null && !isNaN(val) ? Number(val).toFixed(d) : '—'}
                    </p>
                  </div>
                );
              })}
              <div>
                <p className="text-xs text-slate-400 mb-0.5">CHANGE</p>
                <p className={`text-sm font-bold ${currentQuote.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentQuote.change >= 0 ? '+' : ''}{Number(currentQuote.changePercent).toFixed(2)}%
                </p>
              </div>
              <div className="ml-auto">
                <MarketStatusBadge status={currentQuote.freshness} size="md" />
                <p className="text-[10px] text-slate-500 mt-1">
                  {currentQuote.timestampIso ? new Date(currentQuote.timestampIso).toLocaleTimeString() : ''}
                </p>
                <p className="text-[10px] text-slate-500">{currentQuote.source}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-xl px-5 py-4 text-white flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-400">Loading {selectedSymbol}…</span>
            </div>
          )}

          {/* Candlestick chart */}
          <FxCandleChart
            symbol={selectedSymbol}
            currentPrice={currentQuote?.last || currentQuote?.bid}
          />
        </div>

        {/* RIGHT: Market details grid */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Market Details
            </h3>
            {currentQuote ? (
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Open', val: currentQuote.open },
                  { label: 'High', val: currentQuote.high },
                  { label: 'Low', val: currentQuote.low },
                  { label: 'Prev. Close', val: currentQuote.previousClose },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {val ? Number(val).toFixed(selectedSymbol.includes('JPY') ? 3 : 5) : '—'}
                    </span>
                  </div>
                ))}
                <hr className="border-slate-100 my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Source</span>
                  <span className="text-slate-600 text-xs">{currentQuote.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <MarketStatusBadge status={currentQuote.freshness} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Updated</span>
                  <span className="text-xs text-slate-500">
                    {currentQuote.timestampIso
                      ? new Date(currentQuote.timestampIso).toLocaleTimeString()
                      : '—'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-slate-100 rounded" />
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Quick Actions</h3>
            <button
              onClick={() => router.push(`/markets/${selectedSymbol.replace('/', '')}`)}
              className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
            >
              <span>Full Pair Analysis</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/paper-trading')}
              className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
            >
              <span>Paper Trade</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/converter')}
              className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
            >
              <span>Currency Converter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/markets/alerts')}
              className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
            >
              <span>Set Price Alert</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* All pairs mini-grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">All Pairs</h3>
            <div className="space-y-1">
              {ALL_PAIRS.map((sym) => {
                const q = quotes[sym];
                const isUp = q?.change >= 0;
                return (
                  <button
                    key={sym}
                    onClick={() => { setSelectedSymbol(sym); subscribe(sym); }}
                    className={`w-full flex items-center justify-between text-xs rounded-lg px-2 py-1.5 transition-colors ${
                      selectedSymbol === sym ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="font-semibold">{sym}</span>
                    <div className="flex items-center gap-1">
                      {q?.last ? (
                        <>
                          <span className="font-mono">{Number(q.last).toFixed(sym.includes('JPY') ? 3 : 4)}</span>
                          <span className={isUp ? 'text-emerald-600' : 'text-red-500'}>
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add pair modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-slate-900 mb-4">Add to Watchlist</h2>
            <input
              type="text"
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
              placeholder="e.g. EUR/USD or EURUSD"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSymbol}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Add Pair
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
