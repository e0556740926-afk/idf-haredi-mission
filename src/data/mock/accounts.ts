import { accountsStore } from './store';
import { isAccountBalanceVisibleTo } from '../visibility';
import type { AccountRow, MemberId, PrivateAccountExistence } from '../types';

export async function getAccounts(viewerId: MemberId): Promise<AccountRow[]> {
  return accountsStore
    .filter((a) => a.visibility !== 'private' || a.ownerId === viewerId)
    .map((a) => ({
      ...a,
      balance: isAccountBalanceVisibleTo(a, viewerId) ? a.balance : null,
    }));
}

export async function getPrivateAccountsExistence(
  viewerId: MemberId,
): Promise<PrivateAccountExistence[]> {
  return accountsStore
    .filter((a) => a.visibility === 'private' && a.ownerId !== viewerId && a.ownerId !== null)
    .map((a) => ({ id: a.id, ownerId: a.ownerId as string, displayName: a.displayName }));
}
