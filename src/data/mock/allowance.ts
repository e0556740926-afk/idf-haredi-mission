import { activityTransactions, additionalPersonalLedgerEntries } from '../fixtures/transactions';
import { memberById, otherMemberId } from '../fixtures/household';
import type { AllowanceSummary, MemberId } from '../types';

/**
 * docs/05-seed-data.md: the activity feed shows a recent window, but the
 * pocket total is the sum of every summary_only transaction the owner made
 * this month — including ones outside that window. Computed here from the
 * full ledger rather than stored as a flat constant, so the total can never
 * drift out of sync with the transactions that make it up.
 */
export function personalMonthTotal(ownerId: MemberId): { total: number; count: number } {
  const amounts = [
    ...activityTransactions
      .filter((t) => t.ownerId === ownerId && t.visibility === 'summary_only')
      .map((t) => Math.abs(t.amount)),
    ...additionalPersonalLedgerEntries
      .filter((entry) => entry.ownerId === ownerId)
      .map((entry) => Math.abs(entry.amount)),
  ];
  return { total: amounts.reduce((sum, a) => sum + a, 0), count: amounts.length };
}

/**
 * Returns the PARTNER's summary_only aggregate — not the viewer's own. A
 * viewer already sees full detail of their own accounts, so there is
 * nothing to "summarize" for themselves; this is what powers the
 * aggregate card on the Activity screen ("הכיס האישי של X").
 */
export async function getAllowanceSummaries(
  viewerId: MemberId,
  period: string,
): Promise<AllowanceSummary[]> {
  const partnerId = otherMemberId(viewerId);
  const partner = memberById(partnerId);
  const { total, count } = personalMonthTotal(partnerId);
  return [{ ownerId: partnerId, ownerName: partner.displayName, period, total, count }];
}
