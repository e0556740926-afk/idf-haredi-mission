import { members } from '../fixtures/household';
import { accountsStore, appendVisibilityLog, visibilityLogStore } from './store';
import type { MemberId, Visibility, VisibilityEntityType, VisibilityLogEntry } from '../types';

function memberName(id: MemberId): string {
  return members.find((m) => m.id === id)?.displayName ?? id;
}

/**
 * docs/07-data-contract.md: "setVisibility throws if viewerId !== ownerId."
 * Only accounts are mutable today — transactions inherit their account's
 * visibility unless overridden, which is not yet exposed in the UI.
 */
export async function setVisibility(
  viewerId: MemberId,
  entityType: VisibilityEntityType,
  id: string,
  to: Visibility,
): Promise<void> {
  if (entityType !== 'account') {
    throw new Error('Only account visibility can be changed in this build.');
  }

  const account = accountsStore.find((a) => a.id === id);
  if (!account) throw new Error(`Unknown account ${id}`);
  if (account.ownerId !== viewerId) {
    throw new Error('Only the owner may change this account’s visibility.');
  }
  if (account.ownerId === null && to !== 'shared') {
    throw new Error('A household-owned account cannot be hidden.');
  }

  const from = account.visibility;
  account.visibility = to;

  appendVisibilityLog({
    entityType: 'account',
    entityOwnerId: viewerId,
    entityLabel: account.displayName,
    changedByMemberId: viewerId,
    from,
    to,
    at: new Date().toISOString(),
  });
}

/**
 * The partner sees THAT something changed, never WHAT it was
 * (docs/03-visibility-tests.md #17): entityLabel is nulled out unless the
 * viewer owns the entity themselves.
 */
export async function getVisibilityLog(viewerId: MemberId): Promise<VisibilityLogEntry[]> {
  return visibilityLogStore.map((entry) => ({
    id: entry.id,
    entityType: entry.entityType,
    entityLabel: entry.entityOwnerId === viewerId ? entry.entityLabel : null,
    changedByName: memberName(entry.changedByMemberId),
    from: entry.from,
    to: entry.to,
    at: entry.at,
  }));
}
