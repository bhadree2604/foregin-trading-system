import { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, UserCheck, UserX, Building } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const DEMO_USERS = [
  { uid: 'u-1', name: 'Dr. Klaus Becker', email: 'buyer@demo.example', role: 'buyer', companyName: 'XYZ GmbH Germany', country: 'Germany', status: 'active', createdAt: new Date() },
  { uid: 'u-2', name: 'Rajesh Sharma', email: 'exporter@demo.example', role: 'exporter', companyName: 'ABC Electronics India Ltd', country: 'India', status: 'active', createdAt: new Date() },
  { uid: 'u-3', name: 'Sven Lindqvist', email: 'logistics@demo.example', role: 'logistics', companyName: 'Nordic Freight Alliance', country: 'Singapore', status: 'active', createdAt: new Date() },
  { uid: 'u-4', name: 'Master Compliance Officer', email: 'admin@demo.example', role: 'admin', companyName: 'Foreign Trading System Admin', country: 'Singapore', status: 'active', createdAt: new Date() },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?limit=50');
      const data = await res.json();
      const list = data.users || [];
      if (list.length > 0) setUsers(list);
      else setUsers(DEMO_USERS);
    } catch (err) {
      setUsers(DEMO_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async (uid, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, status: nextStatus }),
      });
      toast.success(`User status updated to ${nextStatus}.`);
      load();
    } catch (err) {
      toast.success(`Demo status changed to ${nextStatus}.`);
      setUsers(users.map((u) => (u.uid === uid ? { ...u, status: nextStatus } : u)));
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.companyName || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="User Account Management & RBAC"
          subtitle="Directory of authenticated traders, role assignments, corporate affiliations, and account statuses"
        />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, company..." />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-44 py-2 px-3 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyer (Importer)</option>
              <option value="exporter">Exporter (Seller)</option>
              <option value="logistics">Logistics Provider</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Affiliated Company</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-slate-400 text-2xs">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold uppercase text-2xs text-blue-600 tracking-wider">
                    {u.role}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{u.companyName || 'Registered Entity'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{u.country || 'Global'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleStatus(u.uid, u.status)}
                        className={`text-xs font-semibold cursor-pointer ${
                          u.status === 'active'
                            ? 'text-rose-600 hover:text-rose-800'
                            : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
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
