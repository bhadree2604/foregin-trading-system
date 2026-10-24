import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import { getAllOrders } from '../../firebase/orders';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const list = await getAllOrders();
        setOrders(list || []);
      } catch (e) {}
    }
    load();
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (o.orderId || '').toLowerCase().includes(q) ||
      (o.buyerCompanyName || '').toLowerCase().includes(q) ||
      (o.exporterCompany || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="All International Trade Orders" subtitle="End-to-end lifecycle inspection of global procurement contracts" />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchBar value={search} onChange={setSearch} placeholder="Search order, buyer, exporter..." />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
            <option value="PAID">PAID</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Buyer Entity</th>
                <th className="py-3 px-4">Exporter</th>
                <th className="py-3 px-4">Contract Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => (
                <tr key={o.orderId} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">#{o.orderId.substring(0, 10).toUpperCase()}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{o.buyerCompanyName || 'Importer'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{o.exporterCompany || 'Exporter'}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(o.totalAmount, o.currency || 'USD')}</td>
                  <td className="py-3.5 px-4"><StatusBadge status={o.status} type="order" size="sm" /></td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(o.createdAt)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link to={`/buyer/orders/${o.orderId}`} className="font-semibold text-blue-600 hover:text-blue-800">
                      Audit
                    </Link>
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
