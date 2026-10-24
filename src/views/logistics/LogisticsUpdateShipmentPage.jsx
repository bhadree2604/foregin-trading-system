import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Truck, Navigation, ArrowLeft, Save, MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getShipment, addTrackingEvent, updateShipment } from '../../firebase/shipments';
import { updateOrderStatus } from '../../firebase/orders';
import { createNotification } from '../../firebase/notifications';
import { writeAuditLog } from '../../firebase/auditLogs';
import toast from 'react-hot-toast';

export default function LogisticsUpdateShipmentPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    status: 'IN_TRANSIT',
    location: '',
    latitude: '',
    longitude: '',
    estimatedDelivery: '',
    remarks: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const s = await getShipment(shipmentId);
        if (s) {
          setShipment(s);
          setFormData({
            status: s.status || 'IN_TRANSIT',
            location: s.currentLocation || '',
            latitude: s.latitude || '25.2048',
            longitude: s.longitude || '55.2708',
            estimatedDelivery: s.estimatedDelivery ? s.estimatedDelivery.slice(0, 10) : '',
            remarks: '',
          });
        } else {
          setShipment({ shipmentId, trackingNumber: 'POCL-9920194-HAM' });
          setFormData({
            status: 'IN_TRANSIT',
            location: 'Singapore Malacca Strait Transit',
            latitude: '1.3521',
            longitude: '103.8198',
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().slice(0, 10),
            remarks: 'Navigating through Singapore transshipment corridor.',
          });
        }
      } catch (err) {
        toast.error('Failed to load shipment data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shipmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location) {
      toast.error('Location name is required.');
      return;
    }

    setSaving(true);
    try {
      // 1. Add tracking event
      await addTrackingEvent({
        shipmentId,
        location: formData.location.trim(),
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        status: formData.status,
        remarks: formData.remarks.trim(),
        updatedBy: currentUser.uid,
      });

      // 2. Update shipment summary
      await updateShipment(shipmentId, {
        currentLocation: formData.location.trim(),
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        status: formData.status,
        estimatedDelivery: formData.estimatedDelivery,
      });

      // 3. If delivered, cascade to order
      if (formData.status === 'DELIVERED' && shipment?.orderId) {
        await updateOrderStatus(shipment.orderId, 'DELIVERED');
      }

      // 4. Notify buyer
      if (shipment?.buyerId) {
        await createNotification({
          userId: shipment.buyerId,
          title: `Shipment Milestone: ${formData.status.replace(/_/g, ' ')}`,
          message: `Consignment ${shipment.trackingNumber || shipmentId} updated: ${formData.location}. "${formData.remarks}"`,
          type: 'SHIPMENT_UPDATED',
          resourceId: shipmentId,
        });
      }

      // 5. Audit Log
      await writeAuditLog({
        actorId: currentUser.uid,
        actorRole: 'logistics',
        action: 'SHIPMENT_UPDATED',
        resourceType: 'shipment',
        resourceId: shipmentId,
        result: 'SUCCESS',
        metadata: { status: formData.status, location: formData.location },
      });

      toast.success('Tracking event published and real-time subscribers updated.');
      navigate(`/logistics/shipments/${shipmentId}`);
    } catch (err) {
      console.error('Error posting tracking update:', err);
      toast.error(err.message || 'Failed to update shipment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Accessing AIS manifest..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <Link
          to={`/logistics/shipments/${shipmentId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Consignment</span>
        </Link>

        <PageHeader
          title="Post Tracking Milestone Event"
          subtitle={`Submit real-time location coordinate and status update for cargo #${shipment?.trackingNumber || shipmentId}`}
        />

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Milestone Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full py-2 px-3 border border-slate-300 rounded-xl bg-white focus:border-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="CREATED">Shipment Created & Manifested</option>
              <option value="PICKED_UP">Picked Up by Vessel / Carrier</option>
              <option value="ORIGIN_PORT">At Origin Port</option>
              <option value="IN_TRANSIT">In Transit (Open Sea / Airway)</option>
              <option value="DESTINATION_PORT">At Destination Port of Discharge</option>
              <option value="CUSTOMS">Customs Processing Inspection</option>
              <option value="CUSTOMS_CLEARED">Customs Cleared & Tariffs Settled</option>
              <option value="OUT_FOR_DELIVERY">Out for Inland Terminal Delivery</option>
              <option value="DELIVERED">Delivered to Consignee Warehouse</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Geographic Waypoint / Port *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Dubai Jebel Ali Anchorage Berth 14"
              className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Latitude (Decimal GPS)</label>
              <input
                type="text"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="25.2048"
                className="w-full py-2 px-3 border border-slate-300 rounded-xl font-mono focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Longitude (Decimal GPS)</label>
              <input
                type="text"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="55.2708"
                className="w-full py-2 px-3 border border-slate-300 rounded-xl font-mono focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Revised Estimated Delivery (ETA)</label>
            <input
              type="date"
              value={formData.estimatedDelivery}
              onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
              className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Operational Remarks / Manifest Notes</label>
            <textarea
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Vessel bunkering complete; sea weather favorable; all reefer container temperatures nominal."
              className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Event...' : 'Broadcast Tracking Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
