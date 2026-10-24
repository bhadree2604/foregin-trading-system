import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  CreditCard,
  Truck,
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import ErrorState from '../../components/feedback/ErrorState';
import Modal from '../../components/feedback/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { getOrder, cancelOrder, subscribeToOrder } from '../../firebase/orders';
import { getPaymentByOrderId } from '../../firebase/payments';
import { createPaymentSession, processPaymentSuccess } from '../../services/paymentService';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export default function BuyerOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment checkout modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [processingPay, setProcessingPay] = useState(false);

  // Cancel order modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const unsub = subscribeToOrder(orderId, (ord) => {
      if (ord) {
        setOrder(ord);
        getPaymentByOrderId(orderId).then((p) => setPayment(p));
      }
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  const handleInitiatePayment = async () => {
    try {
      setProcessingPay(true);
      const session = await createPaymentSession(orderId, currentUser.uid);
      setActiveSession(session);
      setPaymentModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Could not initiate payment session.');
    } finally {
      setProcessingPay(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setProcessingPay(true);
      const result = await processPaymentSuccess({
        paymentId: activeSession.paymentId,
        orderId: order.orderId,
        buyerId: currentUser.uid,
        providerTransactionId: `txn_live_${Date.now()}`,
        actorRole: 'buyer',
      });
      toast.success(`Payment settled successfully! Invoice #${result.invoiceNumber} generated.`);
      setPaymentModalOpen(false);
      navigate('/buyer/payment/success', {
        state: { orderId: order.orderId, invoiceNumber: result.invoiceNumber },
      });
    } catch (err) {
      toast.error(err.message || 'Payment processing failed.');
    } finally {
      setProcessingPay(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await cancelOrder(orderId, currentUser.uid, cancelReason);
      toast.success('Order cancelled.');
      setCancelModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Retrieving order details and financial terms..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <ErrorState
            title="Order Not Found"
            message="This trade order does not exist or you do not have permission to view it."
            action={{ label: 'Back to Orders', onClick: () => navigate('/buyer/orders') }}
          />
        </div>
      </DashboardLayout>
    );
  }

  const isPaymentPending = order.status === 'PAYMENT_PENDING';
  const isCancellable = ['PENDING', 'CONFIRMED', 'PAYMENT_PENDING'].includes(order.status);
  const items = order.items || [
    {
      name: order.productName || 'Wholesale Merchandise',
      quantity: order.quantity || 1,
      unitPrice: order.unitPrice || order.subtotal || order.totalAmount,
      total: order.subtotal || order.totalAmount,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <Link
              to="/buyer/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-slate-900 font-mono">
                ORDER #{order.orderId.substring(0, 10).toUpperCase()}
              </h1>
              <StatusBadge status={order.status} type="order" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isPaymentPending && (
              <button
                onClick={handleInitiatePayment}
                disabled={processingPay}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>PAY NOW ({formatCurrency(order.totalAmount, order.currency || 'USD')})</span>
              </button>
            )}

            {order.shipmentId && (
              <Link
                to={`/buyer/shipments/${order.shipmentId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Cargo</span>
              </Link>
            )}

            {isCancellable && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Details + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Line Items & Logistics */}
          <div className="lg:col-span-8 space-y-6">
            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Merchandise Line Items</h3>
                <span className="text-xs text-slate-500">{items.length} items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Item Description</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Unit Price</th>
                      <th className="py-3 px-4 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{Number(item.quantity).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatCurrency(item.unitPrice, order.currency || 'USD')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(item.total || Number(item.unitPrice) * Number(item.quantity), order.currency || 'USD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trade & Delivery Routing */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Routing & Delivery Terms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-2xs">Origin</span>
                  <p className="font-bold text-slate-900">{order.originCountry || 'India'}</p>
                  <p className="text-slate-500">Exporter: {order.exporterCompany || 'Verified Exporter'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-2xs">Destination</span>
                  <p className="font-bold text-slate-900">{order.destinationCountry || 'Germany'}</p>
                  <p className="text-slate-500">Consignee Address: {order.deliveryAddress || 'Standard Warehouse Terminal'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-2xs">Shipping Method</span>
                  <p className="font-bold text-slate-900">{order.shippingMethod || 'Ocean Freight (FCL)'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-2xs">Fulfillment Carrier</span>
                  <p className="font-bold text-slate-900">{order.carrier || 'Global Maritime Freight Alliance'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Financial Settlement Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Financial Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Merchandise Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(order.subtotal || order.totalAmount, order.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Freight & Logistics:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(order.shippingCost || 0, order.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Customs Tariffs & Fees:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(order.taxAmount || 0, order.currency || 'USD')}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-blue-600 font-display">
                    {formatCurrency(order.totalAmount, order.currency || 'USD')}
                  </span>
                </div>
              </div>

              {/* Payment Settlement Status */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Settlement Verification
                </span>
                {order.status === 'PAID' || order.paidAt ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Settled on {formatDateTime(order.paidAt)}</span>
                  </div>
                ) : isPaymentPending ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Awaiting settlement by importer.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    Status: {order.status}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authorized Payment Session Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Authorized Payment Gateway — Sandbox Checkout"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
            <span className="font-bold block mb-1">Sandbox Mode: Authorized Test Session</span>
            This payment session connects directly to the authorized test gateway with cryptographic signature validation. No live bank credentials or PINs are ever requested or stored.
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Reference:</span>
              <span className="font-mono font-bold text-slate-900">#{order.orderId.substring(0, 12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Beneficiary (Exporter):</span>
              <span className="font-bold text-slate-900">{order.exporterCompany || 'ABC Electronics India Ltd'}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>Amount Due:</span>
              <span className="text-emerald-600 font-display">
                {formatCurrency(order.totalAmount, order.currency || 'USD')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-2xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted SSL session with automated webhook idempotency verification.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={processingPay}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {processingPay ? 'Verifying with Provider...' : 'Authorize Sandbox Settlement'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Trade Order"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to cancel trade order #{order.orderId.substring(0, 8)}?
            This will update the order state to CANCELLED and notify the exporter.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Cancellation</label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule changes, altered quantity specifications..."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
