import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Navigation, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import { getAllShipments } from '../../firebase/shipments';
import { formatDate } from '../../utils/dateUtils';

const DEMO_SHIPS = [
  { shipmentId: 'FTS20260001', trackingNumber: 'POCL-9920194-HAM', carrier: 'Pacific Orient Container Lines', origin: 'Chennai', destination: 'Hamburg', currentLocation: 'Dubai Jebel Ali Anchorage', status: 'IN_TRANSIT' },
];

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const list = await getAllShipments();
        if (list && list.length > 0) setShipments(list);
        else setShipments(DEMO_SHIPS);
      } catch (e) {
        setShipments(DEMO_SHIPS);
      }
    }
    load();
  }, []);

  const filtered = shipments.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.trackingNumber?.toLowerCase().includes(q) || s.carrier?.toLowerCase().includes(q) || s.origin?.toLowerCase().includes(q) || s.destination?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Global Cargo Shipments Oversight" subtitle="Complete tracking registry across maritime carriers, ports, and customs clearance hubs" />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search tracking #, port, carrier..." />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Last Position</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">View Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.shipmentId} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{s.trackingNumber || s.shipmentId}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.carrier}</td>
                  <td className="py-3.5 px-4 text-slate-600">{s.origin} → {s.destination}</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-700">{s.currentLocation || 'In Transit'}</td>
                  <td className="py-3.5 px-4"><StatusBadge status={s.status} type="shipment" size="sm" /></td>
                  <td className="py-3.5 px-4 text-right">
                    <Link to={`/buyer/shipments/${s.shipmentId}`} className="font-semibold text-blue-600 hover:text-blue-800">
                      Live AIS Map
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
