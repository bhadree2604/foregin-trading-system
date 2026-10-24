import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, SHIPMENT_STATUS_CONFIG } from '../../utils/statusConfig';

/**
 * Displays a colored dot + label badge for order/payment/shipment status.
 * @param {string} status - The status value
 * @param {'order'|'payment'|'shipment'} type - Which config to use
 * @param {'sm'|'md'} size
 */
export default function StatusBadge({ status, type = 'order', size = 'md' }) {
  const configs = {
    order: ORDER_STATUS_CONFIG,
    payment: PAYMENT_STATUS_CONFIG,
    shipment: SHIPMENT_STATUS_CONFIG,
  };
  const config = configs[type] || ORDER_STATUS_CONFIG;
  const cfg = config[status] || {
    label: status || 'Unknown',
    color: 'bg-gray-100 text-gray-700',
    dotColor: 'bg-gray-400',
  };

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.color} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}
