import { describe, expect, it } from 'vitest';
import { getActivity, getAllowanceSummaries } from '../../src/data';

describe('surprise transaction — docs/07-data-contract.md #4', () => {
  it("is absent from yoav's activity feed", async () => {
    const rows = await getActivity('yoav');
    expect(rows.find((r) => r.id === 'tx-7')).toBeUndefined();
  });

  it("is present in dana's own activity feed (she is the owner)", async () => {
    const rows = await getActivity('dana');
    expect(rows.find((r) => r.id === 'tx-7')).toBeDefined();
  });

  it("still counts toward dana's allowance total shown to yoav", async () => {
    const [summary] = await getAllowanceSummaries('yoav', '2026-09');
    // 1290 is only reachable if the 720 ₪ surprise gift is included.
    expect(summary.total).toBe(1290);
  });
});
