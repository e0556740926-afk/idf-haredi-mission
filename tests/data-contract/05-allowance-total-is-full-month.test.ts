import { describe, expect, it } from 'vitest';
import { getAllowanceSummaries } from '../../src/data';
import { activityTransactions, additionalPersonalLedgerEntries } from '../../src/data/fixtures/transactions';

describe('allowance total covers the whole month, not just the feed window — test #5', () => {
  it("dana's total equals the sum of ALL her summary_only transactions this month", async () => {
    const inFeed = activityTransactions
      .filter((t) => t.ownerId === 'dana' && t.visibility === 'summary_only')
      .map((t) => Math.abs(t.amount));
    const notInFeed = additionalPersonalLedgerEntries
      .filter((e) => e.ownerId === 'dana')
      .map((e) => Math.abs(e.amount));
    const expectedTotal = [...inFeed, ...notInFeed].reduce((sum, a) => sum + a, 0);

    // Sanity: the "not in feed" set must be non-empty, or this test would
    // not actually distinguish "whole month" from "feed window".
    expect(notInFeed.length).toBeGreaterThan(0);

    const [summary] = await getAllowanceSummaries('yoav', '2026-09');
    expect(summary.total).toBe(expectedTotal);
    expect(summary.total).toBe(1290);
  });
});
