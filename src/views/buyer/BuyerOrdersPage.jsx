import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, Plus, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import EmptyState from '../../components/feedback/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { getBuyerOrders } from '../../firebase/orders';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { ORDER_STATUSES } from '../../constants/orderStatuses';

export default function BuyerOrdersPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      try {
        const list = await getBuyerOrders(currentUser.uid);
        setOrders(list || []);
      } catch (err) {
        console.warn('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = (o.orderId || '').toLowerCase().includes(q);
      const matchProd = (o.productName || o.items?.[0]?.name || '').toLowerCase().includes(q);
      const matchExp = (o.exporterCompany || '').toLowerCase().includes(q);
      return matchId || matchProd || matchExp;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Trade Purchase Orders"
          subtitle="Manage your international wholesale orders, payments, and delivery fulfillment"
          action={
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Order</span>
            </Link>
          }
        />

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by Order ID, Product, or Exporter..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 py-2 px-3 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {Object.keys(ORDER_STATUSES).map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Retrieving your trade purchase orders..." />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No purchase orders found"
                description={
                  search || statusFilter
                    ? 'No orders matched your filter criteria.'
                    : 'You have not placed any trade orders yet.'
                }
                action={{
                  label: 'Browse Wholesale Catalog',
                  onClick: () => (window.location.href = '/products'),
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Merchandise Item</th>
                    <th className="py-3.5 px-4">Exporter</th>
                    <th className="py-3.5 px-4">Trade Value</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        #{ord.orderId.substring(0, 10).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {ord.items?.[0]?.name || ord.productName || 'Industrial Wholesale Goods'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {ord.exporterCompany || 'Verified Exporter'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(ord.totalAmount, ord.currency || 'USD')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ord.status} type="order" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/buyer/orders/${ord.orderId}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
