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
 */
export const householdBudgets: BudgetFixture[] = [
  { key: 'housing', label: 'דיור', spent: 6350, limit: 7000 },
  { key: 'food', label: 'מזון', spent: 4940, limit: 4750 },
  { key: 'transport', label: 'תחבורה', spent: 290, limit: 1300 },
  { key: 'kids', label: 'ילדים', spent: 2450, limit: 3000 },
  { key: 'insurance', label: 'ביטוחים', spent: 312, limit: 500 },
  { key: 'communication', label: 'תקשורת', spent: 247, limit: 400 },
  { key: 'leisure', label: 'פנאי', spent: 211, limit: 1800 },
];

export const shoppingBudgetLimit = 1200;
