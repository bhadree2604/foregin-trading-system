import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, ArrowLeft, MapPin, Calendar, Edit, Navigation, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import TrackingTimeline from '../../components/tracking/TrackingTimeline';
import TrackingMap from '../../components/tracking/TrackingMap';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { getShipment, getTrackingEvents } from '../../firebase/shipments';

const DEMO_EVENTS = [
  {
    eventId: 'e-1',
    status: 'CREATED',
    location: 'Chennai Port Container Berth',
    latitude: 13.0827,
    longitude: 80.2707,
    remarks: 'Container locked, ISO seal #9923 verified.',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    eventId: 'e-2',
    status: 'IN_TRANSIT',
    location: 'Dubai Jebel Ali Anchorage',
    latitude: 25.2048,
    longitude: 55.2708,
    remarks: 'Vessel bunkering and customs manifest verified.',
    timestamp: new Date().toISOString(),
  },
];

export default function LogisticsShipmentDetailPage() {
  const { shipmentId } = useParams();
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, evs] = await Promise.all([
          getShipment(shipmentId),
          getTrackingEvents(shipmentId),
        ]);
        if (s) {
          setShipment(s);
          setEvents(evs || []);
        } else {
          setShipment({
            shipmentId: shipmentId || 'FTS20260001',
            trackingNumber: 'POCL-9920194-HAM',
            carrier: 'Pacific Orient Container Lines',
            origin: 'Chennai Port (India)',
            destination: 'Port of Hamburg (Germany)',
            currentLocation: 'Dubai Jebel Ali Anchorage',
            status: 'IN_TRANSIT',
          });
          setEvents(DEMO_EVENTS);
        }
      } catch (err) {
        setEvents(DEMO_EVENTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shipmentId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Retrieving shipment route data..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/logistics/shipments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shipments</span>
          </Link>

          <Link
            to={`/logistics/shipments/${shipmentId}/update`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Post New Tracking Waypoint</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Consignment</span>
            <h1 className="text-xl font-black font-mono text-slate-900 mt-0.5">
              {shipment.trackingNumber || shipment.shipmentId}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Carrier: {shipment.carrier} • Route: {shipment.origin} → {shipment.destination}</p>
          </div>
          <StatusBadge status={shipment.status} type="shipment" />
        </div>

        <TrackingMap
          originCoords={[13.0827, 80.2707]}
          destCoords={[53.5511, 9.9937]}
          currentCoords={[25.2048, 55.2708]}
          events={events}
          originName={shipment.origin}
          destName={shipment.destination}
          currentLocationName={shipment.currentLocation}
        />

        <TrackingTimeline events={events} currentStatus={shipment.status} />
      </div>
    </DashboardLayout>
  );
}
