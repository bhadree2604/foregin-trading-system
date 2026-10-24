import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getMarketStatus } from '../../services/marketDataService';
import { useMarketData } from '../../contexts/MarketDataContext';
import MarketStatusBadge from '../../components/fx/MarketStatusBadge';
import {
  Activity, Wifi, WifiOff, AlertCircle, RefreshCw, Clock, Server,
} from 'lucide-react';

export default function AdminMarketDataPage() {
  const { quotes, watchedSymbols, providerStatus } = useMarketData();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    const result = await getMarketStatus();
    setStatus(result);
    setLastChecked(new Date());
    setLoading(false);
  };

  useEffect(() => { checkStatus(); }, []);

  const activeSymbols = Object.keys(quotes);
  const freshCount = activeSymbols.filter((s) => quotes[s]?.freshness === 'LIVE' || quotes[s]?.freshness === 'DELAYED').length;
  const staleCount = activeSymbols.filter((s) => quotes[s]?.freshness === 'STALE').length;
  const offlineCount = activeSymbols.filter((s) => quotes[s]?.freshness === 'OFFLINE' || quotes[s]?.status === 'UNAVAILABLE').length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Server className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Market Data Monitor</h1>
            <p className="text-sm text-slate-500">Provider health and data feed status</p>
          </div>
        </div>
        <button
          onClick={checkStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Provider status card */}
      <div className={`rounded-2xl border p-5 mb-6 ${
        status?.connected
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-4">
          {status?.connected
            ? <Wifi className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            : <WifiOff className="w-8 h-8 text-red-600 flex-shrink-0" />}
          <div>
            <p className="font-bold text-slate-800 text-lg">
              {status?.provider || 'Twelve Data'}
            </p>
            <p className={`text-sm font-semibold ${status?.connected ? 'text-emerald-700' : 'text-red-600'}`}>
              {status?.status || 'Checking…'}
            </p>
            {status?.message && (
              <p className="text-xs text-slate-500 mt-1">{status.message}</p>
            )}
          </div>
          <div className="ml-auto text-right">
            {status?.latencyMs && (
              <p className="text-sm font-mono text-slate-600">{status.latencyMs}ms</p>
            )}
            <p className="text-xs text-slate-400">
              {lastChecked ? `Checked ${lastChecked.toLocaleTimeString()}` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Subscriptions', val: activeSymbols.length, color: 'text-blue-600' },
          { label: 'Fresh / Delayed', val: freshCount, color: 'text-emerald-600' },
          { label: 'Stale', val: staleCount, color: 'text-orange-500' },
          { label: 'Offline / Unavailable', val: offlineCount, color: 'text-red-500' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Tier note */}
      {status?.tier === 'FREE' && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <p className="font-bold mb-1">Free Tier Active</p>
            <p>{status.note}</p>
          </div>
        </div>
      )}

      {/* Per-symbol table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700">Symbol Feed Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Symbol', 'Last Price', 'Bid', 'Ask', 'Freshness', 'Provider', 'Last Updated'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeSymbols.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-xs">
                    No active subscriptions yet. Navigate to /markets to start data feeds.
                  </td>
                </tr>
              ) : (
                activeSymbols.map((sym) => {
                  const q = quotes[sym];
                  const dec = sym.includes('JPY') ? 3 : 5;
                  return (
                    <tr key={sym} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">{sym}</td>
                      <td className="px-4 py-3 font-mono">{q?.last ? Number(q.last).toFixed(dec) : '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{q?.bid ? Number(q.bid).toFixed(dec) : '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{q?.ask ? Number(q.ask).toFixed(dec) : '—'}</td>
                      <td className="px-4 py-3"><MarketStatusBadge status={q?.freshness || 'LOADING'} /></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{q?.source || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {q?.timestampIso ? new Date(q.timestampIso).toLocaleTimeString() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
