// Strict order state machine - only allowed transitions
export const ORDER_TRANSITIONS = {
  DRAFT: ['PENDING'],
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['PAYMENT_PENDING'],
  PAYMENT_PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAID: ['PROCESSING'],
  PROCESSING: ['READY_FOR_SHIPMENT'],
  READY_FOR_SHIPMENT: ['SHIPPED'],
  SHIPPED: ['IN_TRANSIT'],
  IN_TRANSIT: ['CUSTOMS', 'DELIVERED'],
  CUSTOMS: ['DELIVERED', 'CUSTOMS_HOLD'],
  CUSTOMS_HOLD: ['CUSTOMS'],
  DELIVERED: ['COMPLETED'],
  // Terminal states - no further transitions
  COMPLETED: [],
  REJECTED: [],
  PAYMENT_FAILED: [],
  CANCELLED: [],
};

/**
 * Check if a status transition is valid
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {boolean}
 */
export function isValidTransition(currentStatus, newStatus) {
  const allowed = ORDER_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

/**
 * Get allowed next statuses from current status
 * @param {string} currentStatus
 * @returns {string[]}
 */
export function getAllowedTransitions(currentStatus) {
  return ORDER_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if an order is in a terminal state
 * @param {string} status
 * @returns {boolean}
 */
export function isTerminalStatus(status) {
  const terminals = ['COMPLETED', 'REJECTED', 'PAYMENT_FAILED', 'CANCELLED'];
  return terminals.includes(status);
}

/**
 * Check if an order can be paid
 * @param {string} status
 * @returns {boolean}
 */
export function canPay(status) {
  return status === 'PAYMENT_PENDING';
}

/**
 * Check if a shipment can be created
 * @param {string} status
 * @returns {boolean}
 */
export function canCreateShipment(status) {
  return status === 'READY_FOR_SHIPMENT';
}
