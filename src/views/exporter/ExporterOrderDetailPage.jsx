import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  CreditCard,
  FileCheck2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import ErrorState from '../../components/feedback/ErrorState';
import Modal from '../../components/feedback/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { getOrder, acceptOrder, rejectOrder, updateOrderStatus } from '../../firebase/orders';
import { createNotification } from '../../firebase/notifications';
import { writeAuditLog } from '../../firebase/auditLogs';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export default function ExporterOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    try {
      const ord = await getOrder(orderId);
      setOrder(ord);
    } catch (err) {
      console.warn('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const handleAccept = async () => {
    setUpdating(true);
    try {
      await acceptOrder(orderId, currentUser.uid);

      // Notify Buyer
      if (order.buyerId) {
        await createNotification({
          userId: order.buyerId,
          title: 'Order Confirmed by Exporter',
          message: `Your trade purchase order #${orderId.substring(0, 8)} was accepted by the exporter. Please settle payment to proceed with export dispatch.`,
          type: 'ORDER_ACCEPTED',
          resourceId: orderId,
        });
      }

      await writeAuditLog({
        actorId: currentUser.uid,
        actorRole: 'exporter',
        action: 'ORDER_ACCEPTED',
        resourceType: 'order',
        resourceId: orderId,
        result: 'SUCCESS',
      });

      toast.success('Order confirmed! Status transitioned to PAYMENT_PENDING.');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to accept order.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    setUpdating(true);
    try {
      await rejectOrder(orderId, currentUser.uid, rejectReason);

      if (order.buyerId) {
        await createNotification({
          userId: order.buyerId,
          title: 'Order Rejected',
          message: `Purchase order #${orderId.substring(0, 8)} was declined by exporter: ${rejectReason || 'Quota unavailable'}`,
          type: 'ORDER_REJECTED',
          resourceId: orderId,
        });
      }

      toast.success('Order rejected.');
      setRejectModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to reject order.');
    } finally {
      setUpdating(false);
    }
  };

  const handleProcessOrder = async () => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, 'PROCESSING');
      toast.success('Order is now in PROCESSING stage. Packaging merchandise.');
      load();
    } catch (err) {
      toast.error(err.message || 'Transition failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReadyForShipment = async () => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, 'READY_FOR_SHIPMENT');
      toast.success('Order marked READY_FOR_SHIPMENT. You may now assign a logistics carrier.');
      load();
    } catch (err) {
      toast.error(err.message || 'Transition failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Retrieving export order specifications..." />
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
            message="This trade order does not exist or has been removed."
            action={{ label: 'Back to Orders', onClick: () => navigate('/exporter/orders') }}
          />
        </div>
      </DashboardLayout>
    );
  }

  const items = order.items || [
    {
      name: order.productName || 'Industrial Micro-Sensor Modules',
      quantity: order.quantity || 100,
      unitPrice: order.unitPrice || 500,
      total: order.subtotal || order.totalAmount,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with state transitions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <Link
              to="/exporter/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Incoming Orders</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black font-mono text-slate-900">
                ORDER #{order.orderId.substring(0, 10).toUpperCase()}
              </h1>
              <StatusBadge status={order.status} type="order" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Received on {formatDateTime(order.createdAt)} • Buyer:{' '}
              <strong className="text-slate-800">{order.buyerCompanyName || 'XYZ GmbH Germany'}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.status === 'PENDING' && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={updating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Purchase Order</span>
                </button>
                <button
                  onClick={() => setRejectModalOpen(true)}
                  disabled={updating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {order.status === 'PAID' && (
              <button
                onClick={handleProcessOrder}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Begin Processing Order</span>
              </button>
            )}

            {order.status === 'PROCESSING' && (
              <button
                onClick={handleReadyForShipment}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Ready for Shipment</span>
              </button>
            )}

            {order.status === 'READY_FOR_SHIPMENT' && (
              <Link
                to={`/exporter/orders/${order.orderId}/shipment`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch & Create Shipment</span>
              </Link>
            )}

            {order.shipmentId && (
              <Link
                to={`/buyer/shipments/${order.shipmentId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Track Cargo</span>
              </Link>
            )}
          </div>
        </div>

        {/* Order Details & Settlement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Contract Items</h3>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Merchandise</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{it.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{Number(it.quantity).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatCurrency(it.unitPrice, order.currency || 'USD')}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(it.total || Number(it.unitPrice) * Number(it.quantity), order.currency || 'USD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Destination & Consignee Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider block">Buyer Enterprise</span>
                  <p className="font-bold text-slate-900 mt-1">{order.buyerCompanyName || 'XYZ GmbH Germany'}</p>
                  <p className="text-slate-500">Destination: {order.destinationCountry || 'Germany'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider block">Dispatched Port Terms</span>
                  <p className="font-bold text-slate-900 mt-1">{order.shippingMethod || 'Ocean Freight (FCL)'}</p>
                  <p className="text-slate-500 truncate">Delivery: {order.deliveryAddress || 'Port Terminal Hub'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Contract Financials
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Goods Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(order.subtotal || order.totalAmount, order.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Freight:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(order.shippingCost || 3000, order.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & Duties:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(order.taxAmount || 1500, order.currency || 'USD')}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Gross Contract Value:</span>
                  <span className="text-blue-600 font-display">
                    {formatCurrency(order.totalAmount, order.currency || 'USD')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Settlement Verification
                </span>
                {order.status === 'PAID' || order.paidAt ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment verified on {formatDateTime(order.paidAt)}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Settlement Pending from Importer</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Order Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Trade Purchase Order"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Specify the commercial or logistics justification for declining this purchase order.
          </p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Export quota limitation, raw material deficit..."
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={updating}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
            >
              {updating ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
