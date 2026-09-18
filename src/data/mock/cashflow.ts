import { cashflowCliffs, cashflowFloor, cashflowPoints } from '../fixtures/cashflow';
import { knownExpenses, knownIncomes } from '../fixtures/knownCashflow';
import type { CashflowResult, KnownCashflowItem, MemberId } from '../types';

/** Same projection for both viewers — the household forecast isn't personal. */
export async function getCashflow(_viewerId: MemberId, _days: number): Promise<CashflowResult> {
  return { points: cashflowPoints, cliffs: cashflowCliffs, floor: cashflowFloor };
}

export async function getKnownCashflowItems(
  _viewerId: MemberId,
): Promise<{ incomes: KnownCashflowItem[]; expenses: KnownCashflowItem[] }> {
  return { incomes: knownIncomes, expenses: knownExpenses };
}
