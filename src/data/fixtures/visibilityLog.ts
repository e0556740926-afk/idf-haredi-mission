export interface VisibilityLogFixture {
  id: string;
  entityType: 'account' | 'transaction';
  entityOwnerId: string;
  entityLabel: string;
  changedByMemberId: string;
  from: 'shared' | 'summary_only' | 'private';
  to: 'shared' | 'summary_only' | 'private';
  at: string;
}

/**
 * docs/03-visibility-tests.md #17: the partner sees THAT a change happened,
 * never WHAT the account contains. entityLabel is stripped for the partner
 * in src/data/mock/visibilityLog.ts, not here.
 */
export const visibilityLogFixtures: VisibilityLogFixture[] = [
  {
    id: 'vlog-1',
    entityType: 'account',
    entityOwnerId: 'dana',
    entityLabel: 'עו״ש דנה — לאומי',
    changedByMemberId: 'dana',
    from: 'private',
    to: 'summary_only',
    at: '2026-06-02T10:15:00+03:00',
  },
  {
    id: 'vlog-2',
    entityType: 'account',
    entityOwnerId: 'yoav',
    entityLabel: 'עו״ש יואב — דיסקונט',
    changedByMemberId: 'yoav',
    from: 'private',
    to: 'summary_only',
    at: '2026-06-03T19:40:00+03:00',
  },
];
