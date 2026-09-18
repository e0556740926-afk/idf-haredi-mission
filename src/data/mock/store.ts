import { accounts as accountsFixture } from '../fixtures/accounts';
import { visibilityLogFixtures, type VisibilityLogFixture } from '../fixtures/visibilityLog';
import type { AccountRow } from '../types';

/**
 * The mutable slice of the mock backend: what setVisibility() and friends
 * are allowed to change during a session. Everything else stays as static
 * fixtures. This is the only module that mutates state, so it is the
 * single thing that needs replacing with real writes once Supabase lands.
 */
export const accountsStore: AccountRow[] = structuredClone(accountsFixture);
export const visibilityLogStore: VisibilityLogFixture[] = structuredClone(visibilityLogFixtures);

let nextLogId = visibilityLogStore.length + 1;

export function appendVisibilityLog(entry: Omit<VisibilityLogFixture, 'id'>): void {
  visibilityLogStore.unshift({ id: `vlog-${nextLogId++}`, ...entry });
}
