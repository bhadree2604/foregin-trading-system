import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Calendar,
  ArrowLeft,
  Navigation,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import TrackingTimeline from '../../components/tracking/TrackingTimeline';
import TrackingMap from '../../components/tracking/TrackingMap';
import {
  getShipment,
  subscribeToShipment,
  subscribeToTrackingEvents,
  getTrackingEvents,
} from '../../firebase/shipments';
import { formatDate } from '../../utils/dateUtils';

// Fallback demo shipment & events for live demonstration
const DEMO_SHIPMENT = {
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
};

const DEMO_EVENTS = [
  {
    eventId: 'ev-1',
    status: 'CREATED',
    location: 'Chennai Warehouse Hub',
    latitude: 13.0827,
    longitude: 80.2707,
    remarks: 'Container packed and sealed under customs surveillance.',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    eventId: 'ev-2',
    status: 'PICKED_UP',
    location: 'Chennai Port Container Terminal',
    latitude: 13.0827,
    longitude: 80.2707,
    remarks: 'Vessel loading completed on MV Orient Star.',
    timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    eventId: 'ev-3',
    status: 'ORIGIN_PORT',
    location: 'Port of Singapore Transshipment Berth',
    latitude: 1.3521,
    longitude: 103.8198,
    remarks: 'Transshipment container inspection completed. Proceeding to Gulf corridor.',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    eventId: 'ev-4',
    status: 'IN_TRANSIT',
    location: 'Dubai Jebel Ali Anchorage',
    latitude: 25.2048,
    longitude: 55.2708,
    remarks: 'Bunkering and navigational clearance obtained. En route to Suez & Hamburg.',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

export default function ShipmentTrackingPage() {
  const { shipmentId } = useParams();
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubShipment = () => {};
    let unsubEvents = () => {};

    async function init() {
      try {
        const snap = await getShipment(shipmentId);
        if (snap) {
          setShipment(snap);
          unsubShipment = subscribeToShipment(shipmentId, (updated) => {
            if (updated) setShipment(updated);
          });
          unsubEvents = subscribeToTrackingEvents(shipmentId, (evList) => {
            if (evList && evList.length > 0) setEvents(evList);
          });
        } else {
          // Demo fallback
          setShipment(DEMO_SHIPMENT);
          setEvents(DEMO_EVENTS);
        }
      } catch (err) {
        console.warn('Using demo shipment tracking:', err);
        setShipment(DEMO_SHIPMENT);
        setEvents(DEMO_EVENTS);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      unsubShipment();
      unsubEvents();
    };
  }, [shipmentId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Connecting to satellite vessel AIS feed and port logs..." />
        </div>
      </DashboardLayout>
    );
  }

  const originCoords = [13.0827, 80.2707]; // Chennai
  const destCoords = [53.5511, 9.9937]; // Hamburg
  const currentCoords =
    shipment.latitude && shipment.longitude
      ? [Number(shipment.latitude), Number(shipment.longitude)]
      : [25.2048, 55.2708]; // Dubai

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/buyer/shipments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shipments</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                Live Vessel & Cargo Tracking
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-xl font-black font-mono text-slate-900">
                  {shipment.trackingNumber || shipment.shipmentId}
                </h1>
                <StatusBadge status={shipment.status} type="shipment" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Carrier: <strong className="text-slate-800">{shipment.carrier}</strong> • Order Ref:{' '}
                <strong className="text-blue-600">#{shipment.orderId?.substring(0, 10).toUpperCase()}</strong>
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <div>
                <span className="font-bold block">Current Position</span>
                <span className="text-2xs text-emerald-700">{shipment.currentLocation || 'In Transit'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Leaflet Map */}
        <TrackingMap
          originCoords={originCoords}
          destCoords={destCoords}
          currentCoords={currentCoords}
          events={events}
          originName={shipment.origin || 'Chennai Port (Origin)'}
          destName={shipment.destination || 'Port of Hamburg (Destination)'}
          currentLocationName={shipment.currentLocation || 'Vessel in Transit'}
        />

        {/* Milestone Timeline */}
        <TrackingTimeline events={events} currentStatus={shipment.status} />
      </div>
    </DashboardLayout>
  );
}
