/**
 * Tests for walk-in customer phone generation and order number utilities.
 */

const { generateWalkinPhone, buildOrderNumber } = require('../utils/helpers');

describe('generateWalkinPhone', () => {
  it('generates a 10-digit string', () => {
    const phone = generateWalkinPhone();
    expect(phone).toHaveLength(10);
    expect(/^\d{10}$/.test(phone)).toBe(true);
  });

  it('starts with 7, 8, or 9 (valid Indian mobile prefixes)', () => {
    for (let i = 0; i < 50; i++) {
      const phone = generateWalkinPhone();
      expect(['7', '8', '9']).toContain(phone[0]);
    }
  });

  it('produces unique phones across multiple calls (probabilistic)', () => {
    const phones = new Set();
    for (let i = 0; i < 20; i++) {
      phones.add(generateWalkinPhone());
    }
    // With 20 calls over a 3-billion range, collisions are essentially impossible
    expect(phones.size).toBe(20);
  });
});

describe('buildOrderNumber', () => {
  it('returns a string matching ORD-YYYYMMDD-NNNN format', () => {
    const num = buildOrderNumber(41);
    expect(/^ORD-\d{8}-\d{4}$/.test(num)).toBe(true);
  });

  it('pads the sequence with leading zeros', () => {
    const num = buildOrderNumber(0);
    expect(num.endsWith('-0001')).toBe(true);
  });

  it('increments the count by 1', () => {
    const num = buildOrderNumber(99);
    expect(num.endsWith('-0100')).toBe(true);
  });
});
