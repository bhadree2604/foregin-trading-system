import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Navigation, MapPin, CheckCircle2, Clock, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import TrackingMap from '../../components/tracking/TrackingMap';
import { getAllShipments } from '../../firebase/shipments';
import { formatDate } from '../../utils/dateUtils';

const DEMO_LOGISTICS_SHIPMENTS = [
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
    estimatedDelivery: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    shipmentId: 'FTS20260002',
    orderId: 'demo-order-002',
    carrier: 'Maersk Line International',
    trackingNumber: 'MSK-771920-SIN',
    origin: 'Yokohama (Japan)',
    destination: 'Port of Singapore',
    currentLocation: 'South China Sea Corridor',
    latitude: 14.5995,
    longitude: 120.9842,
    status: 'IN_TRANSIT',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
  },
];

export default function LogisticsDashboard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await getAllShipments();
        if (list && list.length > 0) setShipments(list);
        else setShipments(DEMO_LOGISTICS_SHIPMENTS);
      } catch (err) {
        setShipments(DEMO_LOGISTICS_SHIPMENTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const inTransit = shipments.filter((s) => s.status === 'IN_TRANSIT');
  const customsHold = shipments.filter((s) => s.status === 'CUSTOMS' || s.status === 'CUSTOMS_HOLD');
  const delivered = shipments.filter((s) => s.status === 'DELIVERED');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Logistics Operations & Fleet Monitoring"
          subtitle="Maritime vessel positioning, milestone updates, waypoint GPS logging, and customs clearance"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Active Consignments"
            value={shipments.length}
            icon={<Truck className="w-5 h-5" />}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="In Transit (Ocean / Air)"
            value={inTransit.length}
            icon={<Navigation className="w-5 h-5" />}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Customs Inspection"
            value={customsHold.length}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Successfully Delivered"
            value={delivered.length}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Live Overview Map */}
        <TrackingMap
          originCoords={[13.0827, 80.2707]}
          destCoords={[53.5511, 9.9937]}
          currentCoords={[25.2048, 55.2708]}
          originName="Chennai Export Hub"
          destName="Hamburg Terminal"
          currentLocationName="Dubai Transit Anchorage"
        />

        {/* Active Shipments Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Freight Shipments Monitoring</h3>
            <Link
              to="/logistics/shipments"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>View All ({shipments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Tracking #</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Origin → Destination</th>
                <th className="py-3 px-4">Current Waypoint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Logistics Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((s) => (
                <tr key={s.shipmentId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {s.trackingNumber || s.shipmentId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{s.carrier}</td>
                  <td className="py-3.5 px-4 text-slate-600">{s.origin} → {s.destination}</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-700">{s.currentLocation || 'In Transit'}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.status} type="shipment" size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      to={`/logistics/shipments/${s.shipmentId}/update`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold"
                    >
                      <span>Post Event</span>
                    </Link>
                    <Link
                      to={`/logistics/shipments/${s.shipmentId}`}
                      className="font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
