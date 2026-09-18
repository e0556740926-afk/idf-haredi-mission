import type { ActivityRow, MemberId } from './types';
import { DEMO_TODAY, parseIsoDate } from '../lib/date';

/**
 * The one place that decides whether a row may reach a given viewer.
 * Every mock data function funnels through this instead of re-implementing
 * the rule — see docs/07-data-contract.md.
 */
export function isRowVisibleTo(row: ActivityRow, viewerId: MemberId): boolean {
  if (row.ownerId === viewerId) return true;
  if (row.visibility !== 'shared') return false;
  if (row.isSurprise && row.surpriseUntil && row.ownerId !== viewerId) {
    const revealDate = parseIsoDate(row.surpriseUntil);
    if (DEMO_TODAY < revealDate) return false;
  }
  return true;
}

export function isAccountBalanceVisibleTo(
  account: { ownerId: MemberId | null; visibility: 'shared' | 'summary_only' | 'private' },
  viewerId: MemberId,
): boolean {
  if (account.visibility === 'shared') return true;
  return account.ownerId === viewerId;
}
