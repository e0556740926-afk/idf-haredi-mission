import type { SafeToSpend } from '../types';

/**
 * Same number for both viewers, by construction — this is the whole point
 * of the visibility model (docs/00-product.md, docs/07-data-contract.md #5).
 *
 * Updated in the database-connection round to match exactly what
 * rpc_safe_to_spend computes (supabase/migrations/0002_views_and_rpcs.sql)
 * from real account balances: shared checking + savings, minus the shared
 * credit card's statement due, minus both members' remaining allowance,
 * minus the household's safety buffer. There is no "bills"/"goals" term
 * anymore — those depended on numbers that were never tied to a real row
 * (see REPORT.md "חיבור מסד נתונים" for why the old 3,180 ₪ couldn't
 * survive that move to genuine SQL computation).
 */
export const safeToSpend: SafeToSpend = {
  amount: 41020,
  currency: 'ILS',
  daysLeft: 13,
  breakdown: [
    { key: 'liquid', label: 'יתרות נזילות', amount: 53630 },
    { key: 'credit', label: 'חיוב אשראי צפוי', amount: -8740 },
    { key: 'pockets', label: 'יתרת הכיסים האישיים', amount: -1870 },
    { key: 'buffer', label: 'כרית ביטחון', amount: -2000 },
  ],
};
