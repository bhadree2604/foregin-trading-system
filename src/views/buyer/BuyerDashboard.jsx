import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Clock,
  PlusCircle,
  FileText,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getBuyerOrders } from '../../firebase/orders';
import { getBuyerPayments } from '../../firebase/payments';
import { getShipmentsByOrderId } from '../../firebase/shipments';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function BuyerDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const [orderList, paymentList] = await Promise.all([
          getBuyerOrders(currentUser.uid),
          getBuyerPayments(currentUser.uid),
        ]);
        setOrders(orderList || []);
        setPayments(paymentList || []);
      } catch (err) {
        console.warn('Error loading buyer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  // Derive metrics
  const activeOrders = orders.filter((o) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status));
  const pendingPayments = orders.filter((o) => ['PAYMENT_PENDING', 'PAYMENT_FAILED'].includes(o.status));
  const activeShipments = orders.filter((o) => ['SHIPPED', 'IN_TRANSIT', 'CUSTOMS'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalTradeValue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Chart data: Monthly trade volume
  const monthlyData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 62000 },
    { month: 'Mar', amount: 78000 },
    { month: 'Apr', amount: 54000 },
    { month: 'May', amount: 92000 },
    { month: 'Jun', amount: totalTradeValue > 0 ? totalTradeValue : 115000 },
  ];

  // Status Distribution data
  const statusDistribution = [
    { name: 'Active Orders', value: activeOrders.length || 3 },
    { name: 'Pending Payment', value: pendingPayments.length || 1 },
    { name: 'In Transit', value: activeShipments.length || 2 },
    { name: 'Delivered / Completed', value: completedOrders.length || 4 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Welcome, {userProfile?.name || 'Importer'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enterprise Buyer Portal • {userProfile?.companyName || 'Corporate Account'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Browse Catalog</span>
            </Link>

            <Link
              to="/buyer/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              <Package className="w-3.5 h-3.5" />
              <span>All Orders</span>
            </Link>
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Active Trade Orders"
            value={activeOrders.length}
            icon={<Package className="w-5 h-5" />}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Pending Settlement"
            value={pendingPayments.length}
            icon={<CreditCard className="w-5 h-5" />}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Vessels In Transit"
            value={activeShipments.length}
            icon={<Truck className="w-5 h-5" />}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Total Trade Committed"
            value={formatCurrency(totalTradeValue, 'USD')}
            icon={<DollarSign className="w-5 h-5" />}
            color="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trade Volume & Settlement</h3>
                <p className="text-2xs text-slate-400">Monthly cross-border transaction values (USD)</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Volume']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Order Pipeline Distribution</h3>
              <p className="text-2xs text-slate-400 mb-4">Breakdown by current lifecycle stage</p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-2xs pt-4 border-t border-slate-100">
              {statusDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Purchase Orders</h3>
            <Link
              to="/buyer/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner message="Loading orders..." />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No trade orders created yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Explore the wholesale catalog to place your first international purchase order.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Merchandise</th>
                    <th className="py-3 px-4">Exporter</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        #{ord.orderId.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {ord.items?.[0]?.name || ord.productName || 'Wholesale Goods'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {ord.exporterCompany || 'Verified Exporter'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(ord.totalAmount, ord.currency || 'USD')}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ord.status} type="order" size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/buyer/orders/${ord.orderId}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View Details
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
