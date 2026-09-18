/**
 * D3 — the mandatory comparison gate: run the same call against both
 * adapters and require identical numbers for Safe to Spend, pocket sums,
 * the settlement transfer, and budgets, before moving on to D4+.
 *
 * This sandbox could not actually run `npx supabase start` (Docker
 * registry access is blocked by organization policy here — see
 * REPORT.md "חיבור מסד נתונים" §1), so this gate could not be executed for
 * real. It's written to run for real the moment a local Supabase instance
 * is reachable; until then it reports a clearly-labeled SKIP rather than a
 * fabricated pass.
 */
import { describe, expect, it } from 'vitest';
import { isSupabaseReachable } from './supabaseAvailability';
import { getSafeToSpend as mockSafeToSpend } from '../../src/data/mock/safeToSpend';
import { getAllowanceSummaries as mockAllowance } from '../../src/data/mock/allowance';
import { getSettlement as mockSettlement } from '../../src/data/mock/settlement';
import { getBudgets as mockBudgets } from '../../src/data/mock/budgets';
import { getSafeToSpend as supaSafeToSpend } from '../../src/data/supabase/safeToSpend';
import { getAllowanceSummaries as supaAllowance } from '../../src/data/supabase/allowance';
import { getSettlement as supaSettlement } from '../../src/data/supabase/settlement';
import { getBudgets as supaBudgets } from '../../src/data/supabase/budgets';
import { signInAsDevMember } from '../../src/data/supabase/auth';

describe('D3 parity gate — mock vs. supabase', async () => {
  const available = await isSupabaseReachable();

  it.skipIf(!available)('Safe to Spend matches for dana', async () => {
    await signInAsDevMember('dana');
    const [mockResult, supaResult] = await Promise.all([mockSafeToSpend('dana'), supaSafeToSpend('dana')]);
    expect(supaResult.amount).toBe(mockResult.amount);
  });

  it.skipIf(!available)("pocket sums (getAllowanceSummaries) match — dana's total as seen by yoav", async () => {
    await signInAsDevMember('yoav');
    const [mockResult, supaResult] = await Promise.all([
      mockAllowance('yoav', '2026-09'),
      supaAllowance('yoav', '2026-09'),
    ]);
    expect(supaResult[0]?.total).toBe(mockResult[0]?.total);
    expect(supaResult[0]?.count).toBe(mockResult[0]?.count);
  });

  it.skipIf(!available)('settlement transfer amount matches', async () => {
    await signInAsDevMember('dana');
    const [mockResult, supaResult] = await Promise.all([
      mockSettlement('dana', '2026-09'),
      supaSettlement('dana', '2026-09'),
    ]);
    expect(supaResult.amount).toBe(mockResult.amount);
    expect(supaResult.fromMemberId).toBe(mockResult.fromMemberId);
    expect(supaResult.toMemberId).toBe(mockResult.toMemberId);
  });

  it.skipIf(!available)('budgets (shopping category) match', async () => {
    await signInAsDevMember('yoav');
    const [mockResult, supaResult] = await Promise.all([
      mockBudgets('yoav', '2026-09'),
      supaBudgets('yoav', '2026-09'),
    ]);
    const mockShopping = mockResult.find((b) => b.key === 'shopping')?.spent ?? 0;
    const supaShopping = supaResult.find((b) => b.key === 'shopping')?.spent ?? 0;
    expect(supaShopping).toBe(mockShopping);
  });

  if (!available) {
    // eslint-disable-next-line no-console
    console.warn(
      '[D3 parity gate] SKIPPED — no local Supabase instance reachable in this environment. ' +
        'Run `npx supabase start && npm run test:data` on a machine with normal Docker registry access to execute this gate for real.',
    );
  }
});
