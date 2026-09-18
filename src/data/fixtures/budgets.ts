export interface BudgetFixture {
  key: string;
  label: string;
  spent: number;
  limit: number;
}

/**
 * Household-wide budget envelopes. These are shared spend categories, so the
 * spent amount is the same for every viewer — it comes straight from a
 * (future) household-level aggregate, not from summing the activity fixture.
 * "קניות" (shopping) is deliberately absent here: it mixes shared and
 * summary_only spend, so its per-viewer total is computed in
 * src/data/mock/budgets.ts instead of stored as a flat constant.
 *
 * Updated in the database-connection round to match exactly what
 * rpc_budget_status computes from the real seeded transactions
 * (supabase/seed.sql, supabase/migrations/0002_views_and_rpcs.sql) — the
 * old numbers here were never actually tied to any individual transaction,
 * so once a real per-category sum was needed for D3 parity, they had to
 * change. See REPORT.md "חיבור מסד נתונים". Categories still sum to the
 * same 14,800 ₪ household total either way.
 */
export const householdBudgets: BudgetFixture[] = [
  { key: 'housing', label: 'דיור', spent: 7650, limit: 7000 },
  { key: 'food', label: 'מזון', spent: 3530.2, limit: 4750 },
  { key: 'transport', label: 'תחבורה', spent: 290, limit: 1300 },
  { key: 'kids', label: 'ילדים', spent: 2450, limit: 3000 },
  { key: 'insurance', label: 'ביטוחים', spent: 312, limit: 500 },
  { key: 'communication', label: 'תקשורת', spent: 247, limit: 400 },
  { key: 'leisure', label: 'פנאי', spent: 320.8, limit: 1800 },
];

export const shoppingBudgetLimit = 1200;

/**
 * docs/05-seed-data.md: "סה״כ הוצאות הבית ששויכו לתקציב: 14,800 ₪" — the sum
 * of the seven household categories above (שoping excluded, since it isn't
 * one of the budgeted envelopes the seed doc totals). Stored literally
 * rather than derived by summing householdBudgets in TypeScript.
 */
export const householdBudgetedTotal = 14800;

/**
 * design/prototype.html's Today screen shows "68% נוצלו" for the shared
 * budget bar — a number that doesn't reduce out of the category table above
 * (its categories' totals don't add up to a clean 68%), so it's its own
 * literal fixture value rather than something computed from householdBudgets.
 */
export const sharedBudgetUtilizationPercent = 68;
