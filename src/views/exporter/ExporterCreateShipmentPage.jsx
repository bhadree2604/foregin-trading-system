import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Truck, ArrowLeft, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getOrder, updateOrderStatus } from '../../firebase/orders';
import { createShipmentLocal, addTrackingEvent } from '../../firebase/shipments';
import { createNotification } from '../../firebase/notifications';
import { writeAuditLog } from '../../firebase/auditLogs';
import toast from 'react-hot-toast';

export default function ExporterCreateShipmentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    carrier: 'Pacific Orient Container Lines',
    trackingNumber: `FTS${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
    origin: 'Chennai Port (India)',
    destination: 'Port of Hamburg (Germany)',
    estimatedDelivery: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    initialRemarks: 'Export cargo loaded and sealed under customs surveillance.',
  });

  useEffect(() => {
    async function load() {
      try {
        const ord = await getOrder(orderId);
        if (ord) {
          setOrder(ord);
          setFormData((prev) => ({
            ...prev,
            origin: ord.originCountry ? `${ord.originCountry} Major Export Port` : prev.origin,
            destination: ord.destinationCountry ? `${ord.destinationCountry} Destination Hub` : prev.destination,
          }));
        }
      } catch (err) {
        toast.error('Failed to load order.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create shipment in Firestore
      const shipmentId = await createShipmentLocal({
        orderId: order.orderId,
        buyerId: order.buyerId,
        exporterId: currentUser.uid,
        carrier: formData.carrier,
        trackingNumber: formData.trackingNumber,
        origin: formData.origin,
        destination: formData.destination,
        currentLocation: formData.origin,
        latitude: 13.0827,
        longitude: 80.2707,
        status: 'CREATED',
        estimatedDelivery: formData.estimatedDelivery,
      });

      // Add initial tracking event
      await addTrackingEvent({
        shipmentId,
        location: formData.origin,
        latitude: 13.0827,
        longitude: 80.2707,
        status: 'CREATED',
        remarks: formData.initialRemarks,
        updatedBy: currentUser.uid,
      });

      // Update Order to SHIPPED and link shipmentId
      await updateOrderStatus(orderId, 'SHIPPED', { shipmentId });

      // Notify Buyer
      if (order.buyerId) {
        await createNotification({
          userId: order.buyerId,
          title: 'Cargo Dispatched & Shipped',
          message: `Your cargo for order #${orderId.substring(0, 8)} has been handed over to ${formData.carrier}. Tracking #${formData.trackingNumber}.`,
          type: 'SHIPMENT_CREATED',
          resourceId: shipmentId,
        });
      }

      await writeAuditLog({
        actorId: currentUser.uid,
        actorRole: 'exporter',
        action: 'SHIPMENT_CREATED',
        resourceType: 'shipment',
        resourceId: shipmentId,
        result: 'SUCCESS',
        metadata: { trackingNumber: formData.trackingNumber, orderId },
      });

      toast.success('Shipment created and tracking initiated!');
      navigate(`/buyer/shipments/${shipmentId}`);
    } catch (err) {
      console.error('Shipment creation error:', err);
      toast.error(err.message || 'Failed to generate shipment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Checking order readiness..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Link
          to={`/exporter/orders/${orderId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Order Details</span>
        </Link>

        <PageHeader
          title="Dispatch Cargo & Create Shipment"
          subtitle={`Assign freight carrier, generate official tracking number, and release cargo for order #${orderId.substring(0, 8)}`}
        />

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Carrier / Freight Operator *</label>
              <select
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl bg-white focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="Pacific Orient Container Lines">Pacific Orient Container Lines (Maritime)</option>
                <option value="Maersk Line International">Maersk Line International</option>
                <option value="MSC Mediterranean Shipping">MSC Mediterranean Shipping</option>
                <option value="DHL Global Forwarding">DHL Global Forwarding (Air Cargo)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Master Bill / Tracking Number *</label>
              <input
                type="text"
                required
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl font-mono font-bold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin Port / Dispatch Berth *</label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Port / Consignee Hub *</label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Date of Arrival (ETA) *</label>
              <input
                type="date"
                required
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Initial Manifest Remarks</label>
              <textarea
                rows={3}
                value={formData.initialRemarks}
                onChange={(e) => setFormData({ ...formData, initialRemarks: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{submitting ? 'Creating Tracking Manifest...' : 'Issue Shipment & Tracking'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
