/**
 * Form validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength (min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit)
 */
export function isStrongPassword(password) {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
}

/**
 * Validate required field (not empty or whitespace)
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Validate phone number (basic E.164-ish check)
 */
export function isValidPhone(phone) {
  return /^[+]?[\d\s\-().]{7,20}$/.test(phone);
}

/**
 * Validate file type
 * @param {File} file
 * @param {string[]} allowedTypes - MIME types e.g. ['image/jpeg', 'application/pdf']
 */
export function isValidFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param {File} file
 * @param {number} maxSizeMB
 */
export function isValidFileSize(file, maxSizeMB) {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Validate order quantity against product constraints
 */
export function validateOrderQuantity(quantity, minOrderQty, availableQty) {
  const errors = [];
  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    errors.push('Quantity must be a positive number.');
  } else {
    if (qty < minOrderQty) {
      errors.push(`Minimum order quantity is ${minOrderQty} units.`);
    }
    if (qty > availableQty) {
      errors.push(`Only ${availableQty} units available.`);
    }
  }
  return errors;
}

/**
 * Generic form validator
 * Returns an object of { field: errorMessage }
 * @param {object} values - form values
 * @param {object} rules - validation rules per field
 * @returns {object} errors
 */
export function validateForm(values, rules) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = values[field];
    for (const rule of fieldRules) {
      const error = rule(value, values);
      if (error) {
        errors[field] = error;
        break; // only first error per field
      }
    }
  }
  return errors;
}

// Common validation rules
export const required = (msg = 'This field is required.') =>
  (value) => !isRequired(value) ? msg : undefined;

export const email = (msg = 'Enter a valid email address.') =>
  (value) => value && !isValidEmail(value) ? msg : undefined;

export const minLength = (min, msg) =>
  (value) => value && value.length < min ? (msg || `Minimum ${min} characters required.`) : undefined;

export const maxLength = (max, msg) =>
  (value) => value && value.length > max ? (msg || `Maximum ${max} characters allowed.`) : undefined;

export const positiveNumber = (msg = 'Must be a positive number.') =>
  (value) => value !== '' && value !== undefined && !isPositiveNumber(value) ? msg : undefined;

export const passwordStrength = (msg = 'Password must be at least 8 characters with uppercase, lowercase, and a number.') =>
  (value) => value && !isStrongPassword(value) ? msg : undefined;

export const passwordMatch = (msg = 'Passwords do not match.') =>
  (value, values) => value !== values.password ? msg : undefined;
