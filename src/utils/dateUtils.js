import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Convert various timestamp types to a JS Date
 * @param {*} timestamp - Firestore Timestamp, Date, string, or number
 * @returns {Date|null}
 */
export function toDate(timestamp) {
  if (!timestamp) return null;
  // Firestore Timestamp object
  if (timestamp?.toDate) return timestamp.toDate();
  // Already a Date
  if (timestamp instanceof Date) return timestamp;
  // ISO string
  if (typeof timestamp === 'string') {
    const parsed = parseISO(timestamp);
    return isValid(parsed) ? parsed : null;
  }
  // Unix milliseconds
  if (typeof timestamp === 'number') return new Date(timestamp);
  return null;
}

/**
 * Format timestamp for display (e.g., "21 Sep 2026")
 */
export function formatDate(timestamp) {
  const date = toDate(timestamp);
  if (!date) return '—';
  return format(date, 'd MMM yyyy');
}

/**
 * Format timestamp with time (e.g., "21 Sep 2026, 16:30")
 */
export function formatDateTime(timestamp) {
  const date = toDate(timestamp);
  if (!date) return '—';
  return format(date, 'd MMM yyyy, HH:mm');
}

/**
 * Format timestamp as time only (e.g., "16:30")
 */
export function formatTime(timestamp) {
  const date = toDate(timestamp);
  if (!date) return '—';
  return format(date, 'HH:mm');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelative(timestamp) {
  const date = toDate(timestamp);
  if (!date) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format for input[type="date"] value (yyyy-MM-dd)
 */
export function formatForInput(timestamp) {
  const date = toDate(timestamp);
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

/** Alias for formatRelative */
export const formatRelativeTime = formatRelative;
