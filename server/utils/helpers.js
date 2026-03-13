/**
 * Shared utility helpers for the Mr Smoothy server.
 */

/**
 * Generate a valid 10-digit Indian mobile phone number for walk-in customers.
 * Indian mobile numbers begin with 7, 8, or 9 followed by 9 more digits.
 *
 * @returns {string} A 10-digit phone number string.
 */
function generateWalkinPhone() {
  const validPrefixes = [7, 8, 9];
  const prefix =
    validPrefixes[Math.floor(Math.random() * validPrefixes.length)];
  // Generate the remaining 9 digits (0–999999999), zero-padded to 9 chars
  const remaining = Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, '0');
  return `${prefix}${remaining}`;
}

/**
 * Generate a unique order number based on the current date and a sequence.
 * Format: ORD-YYYYMMDD-NNNN
 *
 * @param {number} count - Current order count from DB (used for sequence).
 * @returns {string}
 */
function buildOrderNumber(count) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(count + 1).padStart(4, '0');
  return `ORD-${dateStr}-${seq}`;
}

module.exports = { generateWalkinPhone, buildOrderNumber };
