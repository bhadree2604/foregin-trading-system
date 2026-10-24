import { useState, useEffect } from 'react';
import { Building, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Search, Filter } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getAllCompanies, approveCompany, rejectCompany, suspendCompany } from '../../firebase/companies';
import { writeAuditLog } from '../../firebase/auditLogs';
import toast from 'react-hot-toast';

const DEMO_COMPANIES = [
  {
    companyId: 'comp-1',
    name: 'ABC Electronics India Ltd',
    registrationNumber: 'IN-33AAACR1234F1Z5',
    type: 'exporter',
    country: 'India',
    address: 'Industrial Tech Corridor, Chennai, India',
    verificationStatus: 'verified',
  },
  {
    companyId: 'comp-2',
    name: 'XYZ GmbH Germany',
    registrationNumber: 'DE-814592103',
    type: 'buyer',
    country: 'Germany',
    address: 'HafenCity Terminal 4, Hamburg, Germany',
    verificationStatus: 'verified',
  },
  {
    companyId: 'comp-3',
    name: 'Tokyo Advanced Bio-Pharma',
    registrationNumber: 'JP-99201948',
    type: 'exporter',
    country: 'Japan',
    address: 'Shinjuku Life Sciences Center, Tokyo',
    verificationStatus: 'pending',
  },
];

export default function AdminCompaniesPage() {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const list = await getAllCompanies();
      if (list && list.length > 0) setCompanies(list);
      else setCompanies(DEMO_COMPANIES);
    } catch (err) {
      setCompanies(DEMO_COMPANIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (companyId, actionType) => {
    try {
      if (actionType === 'approve') {
        await approveCompany(companyId, currentUser?.uid || 'admin_sys');
        toast.success('Company verified and approved for cross-border trade.');
      } else if (actionType === 'reject') {
        await rejectCompany(companyId, currentUser?.uid || 'admin_sys', 'Compliance documentation insufficient.');
        toast.success('Company registration rejected.');
      } else if (actionType === 'suspend') {
        await suspendCompany(companyId, currentUser?.uid || 'admin_sys', 'Flagged for trade compliance review.');
        toast.success('Company trading rights suspended.');
      }

      await writeAuditLog({
        actorId: currentUser?.uid || 'admin_sys',
        actorRole: 'admin',
        action: `COMPANY_${actionType.toUpperCase()}D`,
        resourceType: 'company',
        resourceId: companyId,
        result: 'SUCCESS',
      });

      load();
    } catch (err) {
      toast.success(`Demo: Company status updated (${actionType}).`);
      setCompanies(
        companies.map((c) =>
          c.companyId === companyId
            ? { ...c, verificationStatus: actionType === 'approve' ? 'verified' : actionType === 'reject' ? 'rejected' : 'suspended' }
            : c
        )
      );
    }
  };

  const filtered = companies.filter((c) => {
    if (statusFilter && c.verificationStatus !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.registrationNumber || '').toLowerCase().includes(q) ||
      (c.country || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Enterprise Verification & KYB Review"
          subtitle="Audit corporate entities, tax IDs, export licensing, and authorize cross-border trading rights"
        />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchBar value={search} onChange={setSearch} placeholder="Search enterprise name, tax ID..." />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 py-2 px-3 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="">All KYB States</option>
              <option value="pending">Pending Approval</option>
              <option value="verified">Verified & Active</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Enterprise</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Tax / Registry ID</th>
                <th className="py-3.5 px-4">Jurisdiction</th>
                <th className="py-3.5 px-4">KYB Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.companyId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 capitalize font-semibold text-blue-600">{c.type || 'Importer'}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{c.registrationNumber || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.country}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold ${
                        c.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.verificationStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.verificationStatus || 'pending'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {c.verificationStatus === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(c.companyId, 'approve')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg cursor-pointer"
                        >
                          Verify & Approve
                        </button>
                        <button
                          onClick={() => handleAction(c.companyId, 'reject')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : c.verificationStatus === 'verified' ? (
                      <button
                        onClick={() => handleAction(c.companyId, 'suspend')}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(c.companyId, 'approve')}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                      >
                        Re-instate
                      </button>
                    )}
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
