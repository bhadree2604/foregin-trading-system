import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getUserWatchlist, saveUserWatchlist } from '../../firebase/market';
import { useMarketData } from '../../contexts/MarketDataContext';
import MarketStatusBadge from '../../components/fx/MarketStatusBadge';
import { Star, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SUGGESTED_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/INR', 'EUR/GBP',
  'GBP/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'EUR/JPY',
  'NZD/USD', 'USD/SGD',
];

export default function WatchlistPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { quotes, subscribe } = useMarketData();
  const [watchlist, setWatchlist] = useState([]);
  const [addInput, setAddInput] = useState('');
  const [loading, setLoading] = useState(true);

  const loadWatchlist = useCallback(async () => {
    if (!currentUser) return;
    const list = await getUserWatchlist(currentUser.uid);
    setWatchlist(list);
    list.forEach((s) => subscribe(s));
    setLoading(false);
  }, [currentUser, subscribe]);

  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  const handleAdd = async (sym) => {
    const symbol = sym || addInput.toUpperCase().trim().replace('', '/');
    if (!symbol || watchlist.includes(symbol)) { setAddInput(''); return; }
    const formatted = symbol.includes('/') ? symbol : symbol.length === 6 ? `${symbol.slice(0,3)}/${symbol.slice(3)}` : symbol;
    const newList = [...watchlist, formatted];
    setWatchlist(newList);
    subscribe(formatted);
    await saveUserWatchlist(currentUser.uid, newList);
    toast.success(`Added ${formatted}`);
    setAddInput('');
  };

  const handleRemove = async (sym) => {
    const newList = watchlist.filter((s) => s !== sym);
    setWatchlist(newList);
    await saveUserWatchlist(currentUser.uid, newList);
    toast.success(`Removed ${sym}`);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Star className="w-5 h-5 text-yellow-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">My Watchlist</h1>
      </div>

      {/* Add pair */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex gap-3">
        <input
          type="text"
          value={addInput}
          onChange={(e) => setAddInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add pair e.g. EUR/USD or EURUSD"
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleAdd()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Watchlist table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : watchlist.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Star className="w-8 h-8 mx-auto mb-2 text-slate-200" />
            <p className="text-sm">Your watchlist is empty. Add pairs above or below.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Pair', 'Last', 'Bid', 'Ask', 'Spread', 'Change %', 'Status', 'Source', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {watchlist.map((sym) => {
                const q = quotes[sym];
                const dec = sym.includes('JPY') ? 3 : 5;
                const isUp = q?.change >= 0;
                return (
                  <tr key={sym} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/markets/${sym.replace('/', '')}`)}
                        className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        {sym} <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                      </button>
                    </td>
                    {[
                      { val: q?.last },
                      { val: q?.bid },
                      { val: q?.ask },
                      { val: q?.spread, d: 5 },
                    ].map(({ val, d }, i) => (
                      <td key={i} className="px-4 py-3 text-sm font-mono text-slate-600">
                        {val !== undefined && val !== null && !isNaN(val) ? Number(val).toFixed(d || dec) : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {q?.changePercent !== undefined ? (
                        <span className={`text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                          {isUp ? '+' : ''}{Number(q.changePercent).toFixed(2)}%
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <MarketStatusBadge status={q?.freshness || 'LOADING'} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{q?.source || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleRemove(sym)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Suggested pairs */}
      <h2 className="text-sm font-bold text-slate-500 mb-2">Suggested Pairs</h2>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PAIRS.filter((p) => !watchlist.includes(p)).map((p) => (
          <button
            key={p}
            onClick={() => handleAdd(p)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-3 h-3" /> {p}
          </button>
        ))}
      </div>
    </DashboardLayout>
  );
}
