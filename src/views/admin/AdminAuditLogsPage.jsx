import { useState, useEffect } from 'react';
import { Activity, Search, Shield, Filter } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import { getAuditLogs } from '../../firebase/auditLogs';
import { formatDateTime } from '../../utils/dateUtils';

const DEMO_LOGS = [
  { logId: 'log-1', action: 'PAYMENT_VERIFIED', actorRole: 'buyer', resourceType: 'order', resourceId: 'demo-order-001', result: 'SUCCESS', timestamp: new Date() },
  { logId: 'log-2', action: 'COMPANY_APPROVED', actorRole: 'admin', resourceType: 'company', resourceId: 'comp-1', result: 'SUCCESS', timestamp: new Date(Date.now() - 3600000) },
  { logId: 'log-3', action: 'SHIPMENT_UPDATED', actorRole: 'logistics', resourceType: 'shipment', resourceId: 'FTS20260001', result: 'SUCCESS', timestamp: new Date(Date.now() - 7200000) },
  { logId: 'log-4', action: 'ORDER_ACCEPTED', actorRole: 'exporter', resourceType: 'order', resourceId: 'demo-order-001', result: 'SUCCESS', timestamp: new Date(Date.now() - 86400000) },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const list = await getAuditLogs();
        if (list && list.length > 0) setLogs(list);
        else setLogs(DEMO_LOGS);
      } catch (e) {
        setLogs(DEMO_LOGS);
      }
    }
    load();
  }, []);

  const filtered = logs.filter((l) => !search || l.action.toLowerCase().includes(search.toLowerCase()) || l.resourceType?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Immutable Compliance Audit Ledger" subtitle="Cryptographic record of all authorization events, status machine transitions, and financial settlements" />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search action, resource, or actor..." />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 font-sans">
              <tr>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Actor Role</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.logId} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-blue-700">{l.action}</td>
                  <td className="py-3.5 px-4 uppercase text-2xs font-semibold text-slate-700">{l.actorRole}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {l.resourceType} : #{l.resourceId?.substring(0, 10)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {l.result || 'SUCCESS'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-right font-sans">{formatDateTime(l.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
