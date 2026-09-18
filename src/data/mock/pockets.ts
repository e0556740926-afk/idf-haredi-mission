import { members } from '../fixtures/household';
import { personalMonthTotal } from './allowance';
import type { PocketStatus } from '../types';

/**
 * Both members' pocket usage, shown on Today/Home regardless of who is
 * logged in — the "pockets" grid in docs/08-design-system.md isn't
 * personal, both partners see the same two cards.
 *
 * used/remaining/percentUsed are money math (docs/00-product.md: "אין
 * חישוב כספי ב-TypeScript... הכול ב-SQL"), so they're computed here in
 * src/data rather than in a component or feature hook.
 */
export async function getPockets(): Promise<PocketStatus[]> {
  return members.map((member) => {
    const { total: used, count: usedCount } = personalMonthTotal(member.id);
    return {
      memberId: member.id,
      name: member.displayName,
      allowance: member.allowanceMonthly,
      used,
      usedCount,
      remaining: member.allowanceMonthly - used,
      percentUsed: Math.round((used / member.allowanceMonthly) * 100),
    };
  });
}
