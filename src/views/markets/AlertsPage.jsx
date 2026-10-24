import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useMarketData } from '../../contexts/MarketDataContext';
import { getAlerts, createAlert, deleteAlert, markAlertTriggered } from '../../firebase/market';
import MarketStatusBadge from '../../components/fx/MarketStatusBadge';
import { Bell, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const PAIR_OPTIONS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/INR', 'EUR/GBP', 'GBP/JPY', 'AUD/USD', 'USD/CAD'];

export default function AlertsPage() {
  const { currentUser } = useAuth();
  const { quotes, subscribe } = useMarketData();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symbol: 'EUR/USD', condition: 'ABOVE', price: '' });

  const loadAlerts = useCallback(async () => {
    if (!currentUser) return;
    const data = await getAlerts(currentUser.uid);
    setAlerts(data);
    data.forEach((a) => subscribe(a.symbol));
    setLoading(false);
  }, [currentUser, subscribe]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  // Check alerts against live data every time quotes update
  useEffect(() => {
    alerts.forEach(async (alert) => {
      if (alert.triggered) return;
      const q = quotes[alert.symbol];
      if (!q || !q.last) return;
      if (q.freshness === 'OFFLINE' || q.freshness === 'STALE') return; // don't trigger on stale data

      const current = q.last;
      const triggered =
        alert.condition === 'ABOVE' ? current > alert.price :
        alert.condition === 'BELOW' ? current < alert.price : false;

      if (triggered) {
        await markAlertTriggered(alert.id);
        toast.success(`🔔 Alert: ${alert.symbol} ${alert.condition === 'ABOVE' ? '>' : '<'} ${alert.price} (current: ${current.toFixed(5)})`);
        await loadAlerts();
      }
    });
  }, [quotes, alerts, loadAlerts]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!form.price) return;
    try {
      await createAlert(currentUser.uid, {
        symbol: form.symbol,
        condition: form.condition,
        price: parseFloat(form.price),
        note: `${form.symbol} ${form.condition === 'ABOVE' ? '>' : '<'} ${form.price}`,
      });
      subscribe(form.symbol);
      toast.success('Alert created');
      setShowForm(false);
      setForm({ symbol: 'EUR/USD', condition: 'ABOVE', price: '' });
      await loadAlerts();
    } catch (err) {
      toast.error('Failed to create alert: ' + err.message);
    }
  };

  const handleDelete = async (alertId) => {
    await deleteAlert(alertId);
    toast.success('Alert deleted');
    await loadAlerts();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Market Alerts</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> New Alert
        </button>
      </div>

      <p className="text-sm text-slate-500 mb-6">
        Alert engine uses live provider data only. Alerts will not trigger from stale or cached data.
      </p>

      {/* Create alert form */}
      {showForm && (
        <form onSubmit={handleCreateAlert} className="bg-white rounded-2xl border border-slate-200 p-5 mb-5 space-y-4">
          <h2 className="font-bold text-slate-700">Create Price Alert</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Currency Pair</label>
              <select
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {PAIR_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="ABOVE">Price Above (›)</option>
                <option value="BELOW">Price Below (‹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Target Price
                {quotes[form.symbol]?.last && (
                  <span className="ml-2 text-slate-400 font-normal">
                    (current: {Number(quotes[form.symbol].last).toFixed(5)})
                  </span>
                )}
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                step="0.00001"
                required
                placeholder="1.10000"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Create Alert</button>
          </div>
        </form>
      )}

      {/* Alerts list */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Bell className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm">No active alerts. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const q = quotes[alert.symbol];
            const isFresh = q && q.freshness !== 'OFFLINE' && q.freshness !== 'STALE';
            return (
              <div key={alert.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-800">{alert.symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {alert.condition === 'ABOVE' ? '›' : '‹'} {Number(alert.price).toFixed(5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {q?.last && (
                      <span>Current: <span className="font-mono text-slate-600">{Number(q.last).toFixed(5)}</span></span>
                    )}
                    {q && <MarketStatusBadge status={q.freshness} />}
                    {!isFresh && (
                      <span className="text-orange-500 font-semibold">Alert paused (stale data)</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
