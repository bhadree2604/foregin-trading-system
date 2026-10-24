import { Link } from 'react-router-dom';
import { Calendar, Package, ArrowRight, DollarSign, Truck } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

export default function OrderCard({ order, role = 'buyer' }) {
  const {
    orderId,
    id,
    status,
    totalAmount,
    currency = 'USD',
    createdAt,
    items = [],
    originCountry,
    destinationCountry,
  } = order;

  const orderKey = orderId || id;
  const firstItem = items && items.length > 0 ? items[0] : null;
  const itemName = firstItem?.name || order.productName || 'Trade Order Item';
  const itemCount = items?.length || 1;
  const baseRoute = role === 'exporter' ? '/exporter/orders' : role === 'admin' ? '/admin/orders' : '/buyer/orders';

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <span className="text-xs font-mono font-semibold text-blue-600">
            #{orderKey.substring(0, 10).toUpperCase()}
          </span>
          <h4 className="text-base font-bold text-gray-900 mt-1">
            {itemName} {itemCount > 1 && <span className="text-xs font-normal text-gray-500">+{itemCount - 1} more</span>}
          </h4>
        </div>
        <StatusBadge status={status} type="order" />
      </div>

      <div className="py-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Placed: {formatDate(createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{originCountry || 'N/A'} → {destinationCountry || 'N/A'}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-2xs uppercase tracking-wider text-gray-400 font-semibold">Total Trade Value</span>
          <p className="text-base font-black text-gray-900">
            {formatCurrency(totalAmount, currency)}
          </p>
        </div>

        <Link
          to={`${baseRoute}/${orderKey}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <span>View Order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
