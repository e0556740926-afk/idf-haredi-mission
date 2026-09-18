import type { SafeToSpend } from '../types';

/**
 * Same number for both viewers, by construction — this is the whole point
 * of the visibility model (docs/00-product.md, docs/07-data-contract.md #5).
 * Breakdown items follow the formula in docs/00-product.md: liquid balances
 * + expected income − uncommitted liabilities − expected credit charge −
 * goal reserve − personal pocket balances − safety buffer.
 */
export const safeToSpend: SafeToSpend = {
  amount: 3180,
  currency: 'ILS',
  daysLeft: 13,
  breakdown: [
    { key: 'liquid', label: 'יתרות נזילות', amount: 24700 },
    { key: 'bills', label: 'התחייבויות שטרם חויבו', amount: -4710 },
    { key: 'credit', label: 'חיוב אשראי צפוי', amount: -8740 },
    { key: 'goals', label: 'הפרשה ליעדים', amount: -4200 },
    { key: 'pockets', label: 'יתרת הכיסים האישיים', amount: -1870 },
    { key: 'buffer', label: 'כרית ביטחון', amount: -2000 },
  ],
};
