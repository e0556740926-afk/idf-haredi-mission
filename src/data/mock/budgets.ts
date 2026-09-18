import { householdBudgets, shoppingBudgetLimit } from '../fixtures/budgets';
import { activityTransactions } from '../fixtures/transactions';
import type { BudgetEnvelope, MemberId } from '../types';

function toEnvelope(key: string, label: string, spent: number, limit: number): BudgetEnvelope {
  const percent = Math.round((spent / limit) * 100);
  return {
    key,
    label,
    spent,
    limit,
    percent,
    isOverBudget: spent > limit,
    overBy: Math.max(0, spent - limit),
  };
}

/**
 * docs/07-data-contract.md rule 6: category sums are computed only on what
 * the viewer may see. The seven household categories are entirely shared,
 * so every viewer gets the same numbers. "קניות" (shopping) mixes shared
 * spend with Dana's summary_only Zara purchase — only Dana's own view
 * includes it; Yoav's does not (docs/07-data-contract.md test #8).
 */
export async function getBudgets(viewerId: MemberId, _period: string): Promise<BudgetEnvelope[]> {
  const shoppingSpent = activityTransactions
    .filter((t) => t.categoryKey === 'shopping')
    .filter((t) => t.visibility === 'shared' || t.ownerId === viewerId)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return [
    ...householdBudgets.map((b) => toEnvelope(b.key, b.label, b.spent, b.limit)),
    toEnvelope('shopping', 'קניות', shoppingSpent, shoppingBudgetLimit),
  ];
}
