import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const DEMO_CUSTOMS = [
  { declarationId: 'CUST-2026-001', shipmentId: 'FTS20260001', orderId: 'demo-order-001', hsCode: '9031.80.80', declaredValue: 54500, currency: 'USD', originCountry: 'India', destinationCountry: 'Germany', status: 'CLEARED', remarks: 'Tariff classification 9031 verified. Cleared for release.' },
  { declarationId: 'CUST-2026-002', shipmentId: 'FTS20260002', orderId: 'demo-order-002', hsCode: '8412.21.00', declaredValue: 74000, currency: 'USD', originCountry: 'Japan', destinationCountry: 'Singapore', status: 'UNDER_REVIEW', remarks: 'Awaiting secondary metallurgical test certificate.' },
];

export default function AdminCustomsPage() {
  const [declarations, setDeclarations] = useState(DEMO_CUSTOMS);
  const [search, setSearch] = useState('');

  const handleUpdateStatus = (id, newStatus) => {
    setDeclarations(declarations.map((d) => (d.declarationId === id ? { ...d, status: newStatus } : d)));
    toast.success(`Customs declaration ${id} updated to ${newStatus}.`);
  };

  const filtered = declarations.filter((d) => !search || d.declarationId.toLowerCase().includes(search.toLowerCase()) || d.hsCode.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Customs Clearances & Declarations" subtitle="Authorize customs declarations, manage tariff classifications, and release international freight holds" />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search declaration ID, HS code..." />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Declaration #</th>
                <th className="py-3 px-4">HS Code</th>
                <th className="py-3 px-4">Declared Value</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Customs Status</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Clearance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.declarationId} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{d.declarationId}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{d.hsCode}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(d.declaredValue, d.currency)}</td>
                  <td className="py-3.5 px-4 text-slate-600">{d.originCountry} → {d.destinationCountry}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${d.status === 'CLEARED' ? 'bg-emerald-100 text-emerald-800' : d.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{d.remarks}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button onClick={() => handleUpdateStatus(d.declarationId, 'CLEARED')} className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg cursor-pointer">
                      Release
                    </button>
                    <button onClick={() => handleUpdateStatus(d.declarationId, 'HOLD')} className="px-2 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg cursor-pointer">
                      Hold
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
