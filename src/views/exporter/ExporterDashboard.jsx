import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Truck,
  Plus,
  ArrowRight,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getExporterOrders } from '../../firebase/orders';
import { getExporterProducts } from '../../firebase/products';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ExporterDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      try {
        const [ordList, prodList] = await Promise.all([
          getExporterOrders(currentUser.uid),
          getExporterProducts(currentUser.uid),
        ]);
        setOrders(ordList || []);
        setProducts(prodList || []);
      } catch (err) {
        console.warn('Exporter dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  // Derived metrics
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const confirmedOrders = orders.filter((o) => ['CONFIRMED', 'PAYMENT_PENDING', 'PAID', 'PROCESSING'].includes(o.status));
  const activeShipments = orders.filter((o) => ['READY_FOR_SHIPMENT', 'SHIPPED', 'IN_TRANSIT', 'CUSTOMS'].includes(o.status));
  const totalRevenue = orders
    .filter((o) => ['PAID', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(o.status))
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const monthlySales = [
    { month: 'Jan', revenue: 65000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 110000 },
    { month: 'Apr', revenue: 84000 },
    { month: 'May', revenue: 145000 },
    { month: 'Jun', revenue: totalRevenue > 0 ? totalRevenue : 178000 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Exporter Operations • {userProfile?.companyName || 'ABC Electronics India Ltd'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cross-border export pipeline, purchase order reviews, and cargo dispatches
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/exporter/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>

            <Link
              to="/exporter/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              <span>Manage Orders ({pendingOrders.length} pending)</span>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Pending Action Orders"
            value={pendingOrders.length}
            icon={<Clock className="w-5 h-5" />}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Active Orders Processing"
            value={confirmedOrders.length}
            icon={<Package className="w-5 h-5" />}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Cargo In Transit"
            value={activeShipments.length}
            icon={<Truck className="w-5 h-5" />}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Realized Revenue"
            value={formatCurrency(totalRevenue, 'USD')}
            icon={<DollarSign className="w-5 h-5" />}
            color="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Export Sales & Contract Value</h3>
              <p className="text-2xs text-slate-400">Monthly gross sales volume (USD)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Sales']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Purchase Orders</h3>
            <Link
              to="/exporter/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner message="Loading incoming trade orders..." />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No orders received yet. Active products in the catalog will attract international buyers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Buyer Entity</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Trade Value</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        #{ord.orderId.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {ord.buyerCompanyName || 'International Importer'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {ord.items?.[0]?.name || ord.productName || 'Industrial Wholesale Goods'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {ord.quantity || 100} units
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(ord.totalAmount, ord.currency || 'USD')}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ord.status} type="order" size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/exporter/orders/${ord.orderId}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Review & Accept
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
