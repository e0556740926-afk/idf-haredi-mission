import type { AllowanceSummary } from '../types';

/**
 * Keyed by the OWNER (not the viewer): getAllowanceSummaries(viewerId)
 * returns the summary of the *other* member's summary_only spend — that is
 * exactly what "summary_only" promises to reveal to a partner.
 *
 * Totals are stored as their own authoritative fixture value rather than
 * derived by summing activityTransactions: docs/05-seed-data.md gives
 * Dana's total as 1,290 ₪ over 3 actions, which does not equal the sum of
 * the three named line items (38 + 390 + 720 = 1,148). That arithmetic
 * mismatch is a bug in the source doc, not something to silently "fix" by
 * changing the individually-mandated line-item amounts — see REPORT.md.
 */
export const allowanceSummaries: Record<string, AllowanceSummary> = {
  dana: {
    ownerId: 'dana',
    ownerName: 'דנה',
    period: '2026-09',
    total: 1290,
    count: 3,
  },
  yoav: {
    ownerId: 'yoav',
    ownerName: 'יואב',
    period: '2026-09',
    total: 1840,
    // Only one of Yoav's summary_only transactions appears in this month's
    // activity fixture, so the exact count behind this aggregate isn't
    // modeled — the UI falls back to a generic "month summary" label.
    count: null,
  },
};
