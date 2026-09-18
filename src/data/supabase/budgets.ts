import { supabase } from './client';
import { getHousehold } from './household';
import { categoryLabel } from './categoryLabels';
import type { BudgetEnvelope, MemberId } from '../types';

interface BudgetStatusRow {
  category_key: string;
  spent: number;
  limit_amount: number;
  percent: number;
  is_over_budget: boolean;
  over_by: number;
}

/** rpc_budget_status already computed percent/isOverBudget/overBy — this is a reshape, not a calculation. */
export async function getBudgets(viewerId: MemberId, _period: string): Promise<BudgetEnvelope[]> {
  const household = await getHousehold(viewerId);
  const { data, error } = await supabase.rpc('rpc_budget_status', { p_household: household.id });
  if (error) throw error;
  const rows = (data ?? []) as BudgetStatusRow[];

  return rows.map((row) => ({
    key: row.category_key,
    label: categoryLabel(row.category_key),
    spent: row.spent,
    limit: row.limit_amount,
    percent: row.percent,
    isOverBudget: row.is_over_budget,
    overBy: row.over_by,
  }));
}
