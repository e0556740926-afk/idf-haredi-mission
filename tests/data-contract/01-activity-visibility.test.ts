import { describe, expect, it } from 'vitest';
import { getActivity } from '../../src/data';

describe('getActivity — visibility contract (docs/07-data-contract.md #1, #2)', () => {
  it("returns 5 rows for yoav, none of dana's non-shared rows", async () => {
    const rows = await getActivity('yoav');
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      if (row.ownerId === 'dana') {
        expect(row.visibility).toBe('shared');
      }
    }
  });

  it("returns 7 rows for dana (4 shared + her own 3 summary_only rows)", async () => {
    // docs/05-seed-data.md and docs/07-data-contract.md both say "8 rows for
    // dana", but the seed table's own 8th row ("ארוחה עם חברים") is owned by
    // Yoav and marked summary_only — by the same symmetric rule that hides
    // Dana's summary_only rows from Yoav, that row must NOT be visible to
    // Dana either. Treating "8" literally would mean the privacy promise
    // only protects one partner. Resolved in favor of the symmetric
    // invariant (docs/00-product.md, CLAUDE.md); documented in REPORT.md.
    const rows = await getActivity('dana');
    expect(rows).toHaveLength(7);
    for (const row of rows) {
      if (row.ownerId === 'yoav') {
        expect(row.visibility).toBe('shared');
      }
    }
  });
});
