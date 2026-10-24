import { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import { formatCurrency } from '../../utils/currency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

const REPORT_DATA = [
  { country: 'Germany', orders: 24, volume: 1250000 },
  { country: 'United States', orders: 18, volume: 980000 },
  { country: 'Singapore', orders: 14, volume: 640000 },
  { country: 'India', orders: 11, volume: 520000 },
  { country: 'UAE', orders: 8, volume: 390000 },
];

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState('country_volume');

  const handleExportCSV = () => {
    let csv = 'Destination Country,Order Count,Gross Trade Volume (USD)\n';
    REPORT_DATA.forEach((r) => {
      csv += `"${r.country}",${r.orders},${r.volume}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FTS_Trade_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Trade analytics report downloaded.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="International Trade Analytics & Reports"
          subtitle="Generate aggregated cross-border volume breakdowns, country distributions, and export compliance audits"
          action={
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Audit Report</span>
            </button>
          }
        />

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Country-Wise Gross Trade Volume</h3>
          <p className="text-2xs text-slate-400 mb-4">Contract settlement values by destination jurisdiction (USD)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REPORT_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="country" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Volume']} />
                <Bar dataKey="volume" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Jurisdiction Summary Table</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Market Jurisdiction</th>
                <th className="py-3 px-4">Completed Trade Contracts</th>
                <th className="py-3 px-4 text-right">Gross Realized Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {REPORT_DATA.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.country}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.orders} orders</td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">{formatCurrency(r.volume, 'USD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
