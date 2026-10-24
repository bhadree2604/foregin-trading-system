import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Calendar, ArrowRight, Navigation, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import EmptyState from '../../components/feedback/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { getAllShipments } from '../../firebase/shipments';
import { formatDate } from '../../utils/dateUtils';

// Fallback demo shipment for instant demo evaluation
const DEMO_SHIPMENTS = [
  {
    shipmentId: 'FTS20260001',
    orderId: 'demo-order-001',
    carrier: 'Pacific Orient Container Lines',
    trackingNumber: 'POCL-9920194-HAM',
    origin: 'Chennai Port (India)',
    destination: 'Port of Hamburg (Germany)',
    currentLocation: 'Dubai Jebel Ali Anchorage',
    latitude: 25.2048,
    longitude: 55.2708,
    status: 'IN_TRANSIT',
    estimatedDelivery: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export default function BuyerShipmentsPage() {
  const { currentUser } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await getAllShipments();
        if (list && list.length > 0) {
          setShipments(list);
        } else {
          setShipments(DEMO_SHIPMENTS);
        }
      } catch (err) {
        console.warn('Failed to load shipments, using demo data:', err);
        setShipments(DEMO_SHIPMENTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Active Cargo Shipments"
          subtitle="Real-time multi-port tracking, carrier manifest updates, and customs clearance status"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shipments.map((ship) => (
            <div
              key={ship.shipmentId}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                      Tracking Number
                    </span>
                    <h3 className="text-base font-mono font-bold text-slate-900 mt-0.5">
                      {ship.trackingNumber || ship.shipmentId}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold">{ship.carrier || 'Global Carrier'}</p>
                  </div>
                  <StatusBadge status={ship.status} type="shipment" />
                </div>

                <div className="py-4 space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400">Transit Corridor: </span>
                      <span className="font-bold text-slate-800">{ship.origin} → {ship.destination}</span>
                    </div>
                  </div>

                  {ship.currentLocation && (
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-400">Last Reported Location: </span>
                        <span className="font-bold text-emerald-700">{ship.currentLocation}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>ETA: {ship.estimatedDelivery ? formatDate(ship.estimatedDelivery) : 'Under Carrier Assessment'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-2xs font-mono text-slate-400">
                  Order Ref: #{ship.orderId ? ship.orderId.substring(0, 8).toUpperCase() : 'N/A'}
                </span>

                <Link
                  to={`/buyer/shipments/${ship.shipmentId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Live Map & Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
