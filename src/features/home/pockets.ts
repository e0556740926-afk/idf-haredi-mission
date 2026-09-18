import { getAllowanceSummaries, getMembers } from '../../data';
import { currentPeriod } from '../../lib/date';
import type { MemberId } from '../../data/types';

export interface PocketStatus {
  memberId: MemberId;
  name: string;
  allowance: number;
  used: number;
  usedCountLabel: number | null;
  remaining: number;
  percentUsed: number;
}

/**
 * Both members' pocket usage, shown on Today/Home regardless of who is
 * logged in (docs/08-design-system.md's "pockets" grid isn't personal).
 *
 * getAllowanceSummaries(viewerId) only ever returns the *other* member's
 * aggregate (see src/data/mock/allowance.ts) — a viewer already sees their
 * own spend in full. Calling it once per member, each time from their
 * partner's point of view, gets both totals without adding a new data
 * function or reaching into fixtures directly.
 */
export async function getPocketsStatus(): Promise<PocketStatus[]> {
  const members = await getMembers('dana');
  const period = currentPeriod();

  return Promise.all(
    members.map(async (member) => {
      const partner = members.find((m) => m.id !== member.id);
      const [summary] = partner ? await getAllowanceSummaries(partner.id, period) : [];
      const used = summary?.total ?? 0;
      return {
        memberId: member.id,
        name: member.displayName,
        allowance: member.allowanceMonthly,
        used,
        usedCountLabel: summary?.count ?? null,
        remaining: member.allowanceMonthly - used,
        percentUsed: (used / member.allowanceMonthly) * 100,
      };
    }),
  );
}
