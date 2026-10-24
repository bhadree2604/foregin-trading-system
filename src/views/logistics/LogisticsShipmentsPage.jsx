import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Search, Filter, ArrowRight, Navigation, Edit } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
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

export default function LogisticsShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = shipments.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.trackingNumber || '').toLowerCase().includes(q) ||
      (s.carrier || '').toLowerCase().includes(q) ||
      (s.origin || '').toLowerCase().includes(q) ||
      (s.destination || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Assigned Cargo Consignments"
          subtitle="Manage international bills of lading, assign waypoints, and record vessel coordinates"
        />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs max-w-sm">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search tracking #, carrier, port..."
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Tracking Number</th>
                  <th className="py-3.5 px-4">Carrier</th>
                  <th className="py-3.5 px-4">Corridor (Origin → Dest)</th>
                  <th className="py-3.5 px-4">Current Waypoint</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">ETA</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.shipmentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {s.trackingNumber || s.shipmentId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{s.carrier}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.origin} → {s.destination}</td>
                    <td className="py-3.5 px-4 font-medium text-emerald-700">{s.currentLocation || 'In Transit'}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} type="shipment" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(s.estimatedDelivery)}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/logistics/shipments/${s.shipmentId}/update`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Update Event</span>
                      </Link>
                      <Link
                        to={`/logistics/shipments/${s.shipmentId}`}
                        className="font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Route
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
