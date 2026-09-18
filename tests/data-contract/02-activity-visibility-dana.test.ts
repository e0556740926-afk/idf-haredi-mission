import { describe, expect, it } from 'vitest';
import { getActivity } from '../../src/data';

describe('getActivity(dana) — docs/05-seed-data.md test #2', () => {
  it("has zero rows owned by yoav that aren't shared", async () => {
    const rows = await getActivity('dana');
    const leaks = rows.filter((r) => r.ownerId === 'yoav' && r.visibility !== 'shared');
    expect(leaks).toHaveLength(0);
  });
});
