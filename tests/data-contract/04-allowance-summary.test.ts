import { describe, expect, it } from 'vitest';
import { getAllowanceSummaries } from '../../src/data';

describe('getAllowanceSummaries — docs/05-seed-data.md test #4', () => {
  it("returns exactly dana's summary (total 1290, count 5) to yoav", async () => {
    const rows = await getAllowanceSummaries('yoav', '2026-09');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ ownerId: 'dana', total: 1290, count: 5 });
  });

  it('never includes merchant, category, or exact-date fields', async () => {
    const rows = await getAllowanceSummaries('yoav', '2026-09');
    const keys = Object.keys(rows[0]);
    expect(keys).not.toContain('merchantName');
    expect(keys).not.toContain('description');
    expect(keys).not.toContain('categoryKey');
    expect(keys).not.toContain('bookedAt');
  });
});
