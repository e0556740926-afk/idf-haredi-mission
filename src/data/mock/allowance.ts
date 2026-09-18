import { allowanceSummaries } from '../fixtures/allowance';
import { otherMemberId } from '../fixtures/household';
import type { AllowanceSummary, MemberId } from '../types';

/**
 * Returns the PARTNER's summary_only aggregate — not the viewer's own. A
 * viewer already sees full detail of their own accounts, so there is
 * nothing to "summarize" for themselves; this is what powers the
 * aggregate card on the Activity screen ("הכיס האישי של X").
 */
export async function getAllowanceSummaries(
  viewerId: MemberId,
  _period: string,
): Promise<AllowanceSummary[]> {
  const partnerId = otherMemberId(viewerId);
  const summary = allowanceSummaries[partnerId];
  return summary ? [summary] : [];
}
