import { activityTransactions } from '../fixtures/transactions';
import { isRowVisibleTo } from '../visibility';
import type { ActivityRow, MemberId } from '../types';

export interface GetActivityOptions {
  /** Reserved for future filtering (category, search, date range). */
  limit?: number;
}

export async function getActivity(
  viewerId: MemberId,
  _opts: GetActivityOptions = {},
): Promise<ActivityRow[]> {
  return activityTransactions.filter((row) => isRowVisibleTo(row, viewerId));
}

/** Every row the viewer owns that is not visible in full to their partner. */
export async function getOwnRestrictedActivity(viewerId: MemberId): Promise<ActivityRow[]> {
  return activityTransactions.filter(
    (row) => row.ownerId === viewerId && row.visibility !== 'shared',
  );
}
