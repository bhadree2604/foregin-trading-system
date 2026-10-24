import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PositionRow from '../../components/fx/PositionRow';
import { useMarketData } from '../../contexts/MarketDataContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOpenPaperPositions, getClosedPaperPositions,
  closePaperPosition, getPaperAccount, updatePaperBalance,
} from '../../firebase/market';
import { Activity, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PositionsPage() {
  const { quotes, subscribe } = useMarketData();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('open');
  const [openPositions, setOpenPositions] = useState([]);
  const [closedPositions, setClosedPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPositions = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const [open, closed] = await Promise.all([
      getOpenPaperPositions(currentUser.uid),
      getClosedPaperPositions(currentUser.uid),
    ]);
    setOpenPositions(open);
    setClosedPositions(closed);
    // Subscribe to all symbols
    open.forEach((p) => subscribe(p.symbol));
    setLoading(false);
  }, [currentUser, subscribe]);

  useEffect(() => { loadPositions(); }, [loadPositions]);

  const handleClosePosition = async (position, currentPrice, realizedPL) => {
    try {
      await closePaperPosition(position.id, {
        closePrice: currentPrice,
        realizedPL,
        closedByUser: true,
      });
      if (position.side === 'BUY' && currentUser) {
        const proceeds = position.quantity * currentPrice;
        const acc = await getPaperAccount(currentUser.uid);
        await updatePaperBalance(currentUser.uid, acc.balance + proceeds);
      }
      toast.success(`Closed. P/L: ${realizedPL >= 0 ? '+' : ''}$${realizedPL.toFixed(2)}`);
      await loadPositions();
    } catch (err) {
      toast.error('Close failed: ' + err.message);
    }
  };

  const totalOpenPL = openPositions.reduce((sum, pos) => {
    const q = quotes[pos.symbol];
    if (!q?.last) return sum;
    const diff = pos.side === 'BUY'
      ? (q.last - pos.entryPrice) * pos.quantity
      : (pos.entryPrice - q.last) * pos.quantity;
    return sum + diff;
  }, 0);

  const totalClosedPL = closedPositions.reduce((sum, pos) => sum + (pos.realizedPL || 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Positions</h1>
        <span className="text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full">
          PAPER TRADING · VIRTUAL FUNDS
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Unrealized P/L (Open)</p>
          <p className={`text-xl font-bold font-mono mt-1 ${totalOpenPL >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalOpenPL >= 0 ? '+' : ''}${Math.abs(totalOpenPL).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Realized P/L (Closed)</p>
          <p className={`text-xl font-bold font-mono mt-1 ${totalClosedPL >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalClosedPL >= 0 ? '+' : ''}${Math.abs(totalClosedPL).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5 w-fit mb-4">
        {[
          { id: 'open', label: `Open (${openPositions.length})`, Icon: Activity },
          { id: 'closed', label: `Closed (${closedPositions.length})`, Icon: CheckCircle2 },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              activeTab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Positions table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading positions…
          </div>
        ) : activeTab === 'open' ? (
          openPositions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No open positions</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {['Symbol', 'Qty', 'Entry', 'Current', 'Unreal. P/L', 'SL', 'TP', 'Opened', ''].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {openPositions.map((pos) => (
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
          )
        ) : (
          closedPositions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No closed positions</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {['Symbol', 'Side', 'Qty', 'Entry', 'Close', 'Realized P/L', 'Opened', 'Closed'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {closedPositions.map((pos) => {
                    const pl = pos.realizedPL || 0;
                    const dec = (pos.symbol || '').includes('JPY') ? 3 : 5;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-sm">{pos.symbol}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pos.side === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                            {pos.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">{Number(pos.quantity).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-mono">{Number(pos.entryPrice).toFixed(dec)}</td>
                        <td className="px-4 py-3 text-sm font-mono">{pos.closePrice ? Number(pos.closePrice).toFixed(dec) : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold font-mono ${pl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {pl >= 0 ? '+' : ''}${Math.abs(pl).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {pos.openedAt?.toDate?.() ? pos.openedAt.toDate().toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {pos.closedAt?.toDate?.() ? pos.closedAt.toDate().toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
