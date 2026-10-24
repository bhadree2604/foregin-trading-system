import { Link } from 'react-router-dom';
import { Truck, MapPin, Calendar, ArrowRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatDate } from '../../utils/dateUtils';

export default function ShipmentCard({ shipment, role = 'buyer' }) {
  const {
    shipmentId,
    id,
    trackingNumber,
    carrier = 'Global Freight',
    origin,
    destination,
    currentLocation,
    status,
    estimatedDelivery,
  } = shipment;

  const shipKey = shipmentId || id;
  const trackRoute = role === 'logistics'
    ? `/logistics/shipments/${shipKey}`
    : `/buyer/shipments/${shipKey}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100">
        <div>
          <span className="text-2xs font-semibold text-gray-400 uppercase tracking-wider">Tracking Number</span>
          <p className="text-sm font-mono font-bold text-gray-900 mt-0.5">
            {trackingNumber || shipKey.substring(0, 12).toUpperCase()}
          </p>
          <span className="text-xs text-blue-600 font-medium">{carrier}</span>
        </div>
        <StatusBadge status={status} type="shipment" />
      </div>

      <div className="py-3 space-y-2 text-xs text-gray-600">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-gray-400">Route: </span>
            <span className="font-medium text-gray-800">{origin} → {destination}</span>
          </div>
        </div>

        {currentLocation && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-gray-400">Current location: </span>
              <span className="font-semibold text-emerald-700">{currentLocation}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>ETA: {estimatedDelivery ? formatDate(estimatedDelivery) : 'Pending Carrier Confirmation'}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
        <Link
          to={trackRoute}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
        >
          <span>Track Live</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
