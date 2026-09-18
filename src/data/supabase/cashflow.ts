import { supabase } from './client';
import { getHousehold } from './household';
import type { CashflowResult, MemberId } from '../types';

interface CashflowRow {
  day: string;
  expected: number;
  low: number;
  high: number;
  is_cliff: boolean;
  shortfall: number;
}

/**
 * rpc_cashflow already applies the smoothed allowance drag, the pending
 * shared transactions day by day (docs/03 test #9), and flags cliff days
 * against the household's safety buffer — this only reshapes rows.
 */
export async function getCashflow(viewerId: MemberId, days: number): Promise<CashflowResult> {
  const household = await getHousehold(viewerId);
  const { data, error } = await supabase.rpc('rpc_cashflow', { p_household: household.id, p_days: days });
  if (error) throw error;
  const rows = (data ?? []) as CashflowRow[];

  const points = rows.map((row) => ({ date: row.day, expected: row.expected, low: row.low, high: row.high }));
  const cliffs = rows
    .filter((row) => row.is_cliff)
    .slice(0, 1)
    .map((row) => ({ date: row.day, label: '', shortfall: row.shortfall }));

  return { points, cliffs, floor: household.safetyBuffer };
}
