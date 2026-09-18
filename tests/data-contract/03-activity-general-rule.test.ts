import { describe, expect, it } from 'vitest';
import { getActivity } from '../../src/data';

describe('getActivity(x) — docs/05-seed-data.md test #3', () => {
  it.each(['dana', 'yoav'] as const)(
    "every row returned to %s satisfies visibility === 'shared' || ownerId === viewer",
    async (viewerId) => {
      const rows = await getActivity(viewerId);
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.visibility === 'shared' || row.ownerId === viewerId).toBe(true);
      }
    },
  );
});
