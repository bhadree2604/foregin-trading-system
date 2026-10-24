import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Calendar, ArrowRight, Navigation } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import EmptyState from '../../components/feedback/EmptyState';
import { getAllShipments } from '../../firebase/shipments';
import { formatDate } from '../../utils/dateUtils';

const DEMO_SHIPMENTS = [
  {
    shipmentId: 'FTS20260001',
    orderId: 'demo-order-001',
    carrier: 'Pacific Orient Container Lines',
    trackingNumber: 'POCL-9920194-HAM',
    origin: 'Chennai Port (India)',
    destination: 'Port of Hamburg (Germany)',
    currentLocation: 'Dubai Jebel Ali Anchorage',
    status: 'IN_TRANSIT',
    estimatedDelivery: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
  },
];

export default function ExporterShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await getAllShipments();
        if (list && list.length > 0) setShipments(list);
        else setShipments(DEMO_SHIPMENTS);
      } catch (err) {
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
          title="Outbound Freight Shipments"
          subtitle="Monitor active cargo dispatches, port handovers, and maritime tracking milestones"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shipments.map((s) => (
            <div
              key={s.shipmentId}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                      Tracking Number
                    </span>
                    <h3 className="text-base font-mono font-bold text-slate-900 mt-0.5">
                      {s.trackingNumber || s.shipmentId}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold">{s.carrier}</p>
                  </div>
                  <StatusBadge status={s.status} type="shipment" />
                </div>

                <div className="py-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Route: <strong>{s.origin} → {s.destination}</strong></span>
                  </div>
                  {s.currentLocation && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                      <span className="text-emerald-700 font-semibold">Location: {s.currentLocation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>ETA: {s.estimatedDelivery ? formatDate(s.estimatedDelivery) : 'Under Review'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-2xs font-mono text-slate-400">
                  Order: #{s.orderId?.substring(0, 8).toUpperCase()}
                </span>
                <Link
                  to={`/buyer/shipments/${s.shipmentId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View Route Map</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
