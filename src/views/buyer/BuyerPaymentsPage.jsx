import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, DollarSign, Calendar, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import EmptyState from '../../components/feedback/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { getBuyerPayments } from '../../firebase/payments';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/dateUtils';

export default function BuyerPaymentsPage() {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      try {
        const list = await getBuyerPayments(currentUser.uid);
        setPayments(list || []);
      } catch (err) {
        console.warn('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Payment Settlement History"
          subtitle="Review cryptographic settlement records, transaction IDs, and payment verification events"
        />

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Retrieving authorized payment transactions..." />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No payment records found"
                description="When you settle purchase orders, verified transactions and payment provider IDs will be recorded here."
                action={{
                  label: 'View Orders',
                  onClick: () => (window.location.href = '/buyer/orders'),
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Order Reference</th>
                    <th className="py-3.5 px-4">Settlement Amount</th>
                    <th className="py-3.5 px-4">Gateway Provider</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.paymentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.providerPaymentId ? p.providerPaymentId.substring(0, 16) : `#${p.paymentId.substring(0, 8)}`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-600 font-semibold">
                        #{p.orderId ? p.orderId.substring(0, 10).toUpperCase() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(p.amount, p.currency || 'USD')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.provider || 'Authorized Gateway'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status} type="payment" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDateTime(p.paidAt || p.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/buyer/orders/${p.orderId}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View Order
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
