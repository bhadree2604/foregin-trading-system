import { CheckCircle2, Circle, Clock, MapPin, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';
import { SHIPMENT_STATUSES } from '../../constants/orderStatuses';

/**
 * Standard milestone progression for international trade shipments
 */
const DEFAULT_MILESTONES = [
  { key: 'CREATED', label: 'Shipment Created' },
  { key: 'PICKED_UP', label: 'Picked Up by Carrier' },
  { key: 'ORIGIN_PORT', label: 'At Origin Port' },
  { key: 'IN_TRANSIT', label: 'In Transit / Ocean Voyage' },
  { key: 'DESTINATION_PORT', label: 'At Destination Port' },
  { key: 'CUSTOMS', label: 'Customs Processing' },
  { key: 'CUSTOMS_CLEARED', label: 'Customs Cleared' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Final Delivery' },
  { key: 'DELIVERED', label: 'Delivered to Consignee' },
];

export default function TrackingTimeline({ events = [], currentStatus = 'CREATED' }) {
  // Find index of current status in milestones
  const activeIndex = DEFAULT_MILESTONES.findIndex((m) => m.key === currentStatus);
  const normalizedActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  // Map of actual events by status key
  const eventMap = events.reduce((acc, ev) => {
    acc[ev.status] = ev;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-xs">
      <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        <span>Shipment Progress & Timeline</span>
      </h3>

      {/* Vertical Stepper Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
        {DEFAULT_MILESTONES.map((milestone, idx) => {
          const isPassed = idx < normalizedActiveIndex;
          const isCurrent = idx === normalizedActiveIndex;
          const isPending = idx > normalizedActiveIndex;
          const actualEvent = eventMap[milestone.key];

          return (
            <div key={milestone.key} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 bg-white transition-colors ${
                  isPassed
                    ? 'border-emerald-500 text-emerald-600'
                    : isCurrent
                    ? 'border-blue-600 text-blue-600 ring-4 ring-blue-50'
                    : 'border-gray-300 text-gray-300'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-gray-300" />
                )}
              </div>

              {/* Milestone Details */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-blue-600'
                          : isPassed
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {milestone.label}
                    </span>
                    {isCurrent && (
                      <span className="text-2xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                        Current Status
                      </span>
                    )}
                  </div>

                  {actualEvent?.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{actualEvent.location}</span>
                    </div>
                  )}

                  {actualEvent?.remarks && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      "{actualEvent.remarks}"
                    </p>
                  )}
                </div>

                <div className="text-xs text-gray-400 sm:text-right shrink-0 mt-0.5">
                  {actualEvent?.timestamp ? (
                    <span>{formatDateTime(actualEvent.timestamp)}</span>
                  ) : isPending ? (
                    <span className="text-gray-300">Pending</span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
