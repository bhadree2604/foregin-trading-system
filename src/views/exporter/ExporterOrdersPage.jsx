import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, ArrowRight, Check, X, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import EmptyState from '../../components/feedback/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { getExporterOrders, acceptOrder, rejectOrder } from '../../firebase/orders';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export default function ExporterOrdersPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await getExporterOrders(currentUser.uid);
      setOrders(list || []);
    } catch (err) {
      console.warn('Failed to load exporter orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentUser]);

  const handleQuickAccept = async (orderId) => {
    try {
      await acceptOrder(orderId, currentUser.uid);
      toast.success('Order accepted! Status updated to PAYMENT_PENDING.');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to accept order.');
    }
  };

  const handleQuickReject = async (orderId) => {
    try {
      await rejectOrder(orderId, currentUser.uid, 'Export quota unavailable.');
      toast.success('Order rejected.');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to reject order.');
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.orderId || '').toLowerCase().includes(q) ||
      (o.buyerCompanyName || '').toLowerCase().includes(q) ||
      (o.productName || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Incoming Purchase Orders"
          subtitle="Review buyer procurement orders, confirm wholesale terms, and process export dispatches"
        />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by Order ID, Buyer, or Product..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 py-2 px-3 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50/50 text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="PAYMENT_PENDING">Awaiting Settlement</option>
              <option value="PAID">Paid (Ready to Process)</option>
              <option value="READY_FOR_SHIPMENT">Ready for Shipment</option>
              <option value="SHIPPED">Shipped</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Retrieving incoming purchase orders..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No orders found"
                description={
                  search || statusFilter
                    ? 'No orders matched your filter.'
                    : 'You have not received any purchase orders yet.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Importer / Buyer</th>
                    <th className="py-3.5 px-4">Merchandise</th>
                    <th className="py-3.5 px-4">Qty</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        #{ord.orderId.substring(0, 10).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {ord.buyerCompanyName || 'International Importer'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {ord.items?.[0]?.name || ord.productName || 'Wholesale Merchandise'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{ord.quantity || 100}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(ord.totalAmount, ord.currency || 'USD')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ord.status} type="order" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {ord.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleQuickAccept(ord.orderId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleQuickReject(ord.orderId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : null}

                        <Link
                          to={`/exporter/orders/${ord.orderId}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Manage
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
