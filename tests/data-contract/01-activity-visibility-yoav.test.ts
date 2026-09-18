import { describe, expect, it } from 'vitest';
import { getActivity } from '../../src/data';
import { activityTransactions } from '../../src/data/fixtures/transactions';

describe('getActivity(yoav) — docs/05-seed-data.md test #1', () => {
  it("has zero rows owned by dana that aren't shared", async () => {
    const rows = await getActivity('yoav');
    const leaks = rows.filter((r) => r.ownerId === 'dana' && r.visibility !== 'shared');
    expect(leaks).toHaveLength(0);
  });

  it('includes every shared row from the source feed', async () => {
    const rows = await getActivity('yoav');
    const sharedIds = rows.filter((r) => r.visibility === 'shared').map((r) => r.id);
    const expectedSharedIds = activityTransactions.filter((r) => r.visibility === 'shared').map((r) => r.id);
    expect(sharedIds.sort()).toEqual(expectedSharedIds.sort());
  });
});
