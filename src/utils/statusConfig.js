import { ORDER_STATUS, PAYMENT_STATUS, SHIPMENT_STATUS, CUSTOMS_STATUS } from '../constants/orderStatuses';

// Order status display configuration
export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700',
    dotColor: 'bg-gray-400',
    icon: '📝',
  },
  [ORDER_STATUS.PENDING]: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800',
    dotColor: 'bg-yellow-400',
    icon: '⏳',
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    dotColor: 'bg-blue-400',
    icon: '✅',
  },
  [ORDER_STATUS.PAYMENT_PENDING]: {
    label: 'Payment Pending',
    color: 'bg-orange-100 text-orange-800',
    dotColor: 'bg-orange-400',
    icon: '💳',
  },
  [ORDER_STATUS.PAID]: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800',
    dotColor: 'bg-green-500',
    icon: '💰',
  },
  [ORDER_STATUS.PROCESSING]: {
    label: 'Processing',
    color: 'bg-purple-100 text-purple-800',
    dotColor: 'bg-purple-400',
    icon: '⚙️',
  },
  [ORDER_STATUS.READY_FOR_SHIPMENT]: {
    label: 'Ready for Shipment',
    color: 'bg-indigo-100 text-indigo-800',
    dotColor: 'bg-indigo-400',
    icon: '📦',
  },
  [ORDER_STATUS.SHIPPED]: {
    label: 'Shipped',
    color: 'bg-cyan-100 text-cyan-800',
    dotColor: 'bg-cyan-400',
    icon: '🚢',
  },
  [ORDER_STATUS.IN_TRANSIT]: {
    label: 'In Transit',
    color: 'bg-teal-100 text-teal-800',
    dotColor: 'bg-teal-400',
    icon: '✈️',
  },
  [ORDER_STATUS.CUSTOMS]: {
    label: 'Customs Clearance',
    color: 'bg-amber-100 text-amber-800',
    dotColor: 'bg-amber-400',
    icon: '🛃',
  },
  [ORDER_STATUS.CUSTOMS_HOLD]: {
    label: 'Customs Hold',
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500',
    icon: '🚫',
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-800',
    dotColor: 'bg-emerald-500',
    icon: '🎉',
  },
  [ORDER_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-200 text-green-900',
    dotColor: 'bg-green-600',
    icon: '🏆',
  },
  [ORDER_STATUS.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500',
    icon: '❌',
  },
  [ORDER_STATUS.PAYMENT_FAILED]: {
    label: 'Payment Failed',
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500',
    icon: '❌',
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-600',
    dotColor: 'bg-gray-400',
    icon: '🚫',
  },
};

export const PAYMENT_STATUS_CONFIG = {
  [PAYMENT_STATUS.CREATED]: {
    label: 'Created',
    color: 'bg-gray-100 text-gray-700',
    dotColor: 'bg-gray-400',
  },
  [PAYMENT_STATUS.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    dotColor: 'bg-yellow-400',
  },
  [PAYMENT_STATUS.PROCESSING]: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
    dotColor: 'bg-blue-400',
  },
  [PAYMENT_STATUS.SUCCESSFUL]: {
    label: 'Successful',
    color: 'bg-green-100 text-green-800',
    dotColor: 'bg-green-500',
  },
  [PAYMENT_STATUS.FAILED]: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500',
  },
  [PAYMENT_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-600',
    dotColor: 'bg-gray-400',
  },
  [PAYMENT_STATUS.REFUNDED]: {
    label: 'Refunded',
    color: 'bg-purple-100 text-purple-800',
    dotColor: 'bg-purple-400',
  },
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: {
    label: 'Partially Refunded',
    color: 'bg-purple-100 text-purple-700',
    dotColor: 'bg-purple-300',
  },
  [PAYMENT_STATUS.DISPUTED]: {
    label: 'Disputed',
    color: 'bg-orange-100 text-orange-800',
    dotColor: 'bg-orange-400',
  },
};

export const SHIPMENT_STATUS_CONFIG = {
  [SHIPMENT_STATUS.CREATED]: { label: 'Created', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  [SHIPMENT_STATUS.PICKUP_SCHEDULED]: { label: 'Pickup Scheduled', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-400' },
  [SHIPMENT_STATUS.PICKED_UP]: { label: 'Picked Up', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-500' },
  [SHIPMENT_STATUS.AT_ORIGIN_WAREHOUSE]: { label: 'At Origin Warehouse', color: 'bg-indigo-100 text-indigo-800', dotColor: 'bg-indigo-400' },
  [SHIPMENT_STATUS.AT_ORIGIN_PORT]: { label: 'At Origin Port', color: 'bg-purple-100 text-purple-800', dotColor: 'bg-purple-400' },
  [SHIPMENT_STATUS.IN_TRANSIT]: { label: 'In Transit', color: 'bg-cyan-100 text-cyan-800', dotColor: 'bg-cyan-400' },
  [SHIPMENT_STATUS.AT_INTERMEDIATE_PORT]: { label: 'At Intermediate Port', color: 'bg-teal-100 text-teal-800', dotColor: 'bg-teal-400' },
  [SHIPMENT_STATUS.AT_DESTINATION_PORT]: { label: 'At Destination Port', color: 'bg-emerald-100 text-emerald-800', dotColor: 'bg-emerald-400' },
  [SHIPMENT_STATUS.CUSTOMS_CLEARANCE]: { label: 'Customs Clearance', color: 'bg-amber-100 text-amber-800', dotColor: 'bg-amber-400' },
  [SHIPMENT_STATUS.CUSTOMS_CLEARED]: { label: 'Customs Cleared', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
  [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: { label: 'Out for Delivery', color: 'bg-lime-100 text-lime-800', dotColor: 'bg-lime-500' },
  [SHIPMENT_STATUS.DELIVERED]: { label: 'Delivered', color: 'bg-green-200 text-green-900', dotColor: 'bg-green-600' },
  [SHIPMENT_STATUS.DELAYED]: { label: 'Delayed', color: 'bg-orange-100 text-orange-800', dotColor: 'bg-orange-400' },
  [SHIPMENT_STATUS.ON_HOLD]: { label: 'On Hold', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
};

export const CUSTOMS_STATUS_CONFIG = {
  [CUSTOMS_STATUS.PENDING]: { label: 'Pending', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  [CUSTOMS_STATUS.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-400' },
  [CUSTOMS_STATUS.UNDER_REVIEW]: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-400' },
  [CUSTOMS_STATUS.CLEARED]: { label: 'Cleared', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
  [CUSTOMS_STATUS.HOLD]: { label: 'Hold', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
  [CUSTOMS_STATUS.REJECTED]: { label: 'Rejected', color: 'bg-red-200 text-red-900', dotColor: 'bg-red-600' },
};
