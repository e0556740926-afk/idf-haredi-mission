import { supabase } from './client';
import { getHousehold } from './household';
import type { MemberId, SafeToSpend } from '../types';

interface SafeToSpendJson {
  amount: number;
  breakdown: { key: string; label: string; amount: number }[];
}

const daysLeftInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
};

/**
 * rpc_safe_to_spend returns the total pre-summed in SQL — this function
 * only unpacks the jsonb payload, it never re-adds the breakdown itself.
 */
export async function getSafeToSpend(viewerId: MemberId): Promise<SafeToSpend> {
  const household = await getHousehold(viewerId);
  const { data, error } = await supabase
    .rpc('rpc_safe_to_spend', { p_household: household.id })
    .single<SafeToSpendJson>();
  if (error) throw error;

  return {
    amount: data.amount,
    currency: household.baseCurrency,
    breakdown: data.breakdown,
    daysLeft: daysLeftInMonth(),
  };
}
