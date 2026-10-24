/**
 * Currency utilities for consistent display and formatting
 */

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
];

/**
 * Format a number as currency
 * @param {number} amount
 * @param {string} currency - ISO 4217 currency code
 * @param {string} locale - BCP 47 locale tag
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

/**
 * Format a number with commas (no currency symbol)
 * @param {number} amount
 * @returns {string}
 */
export function formatNumber(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-US').format(amount);
}

/**
 * Get currency symbol for a given code
 * @param {string} code
 * @returns {string}
 */
export function getCurrencySymbol(code) {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return currency ? currency.symbol : code;
}

/**
 * Stripe requires amount in smallest currency unit (cents for USD)
 * @param {number} amount - decimal amount
 * @param {string} currency
 * @returns {number} - amount in smallest unit
 */
export function toStripeAmount(amount, currency = 'USD') {
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'CLP', 'GNF', 'ISK', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'XAF', 'XOF'];
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}
