import { supabase } from './client';
import type { AccountRow, MemberId, PrivateAccountExistence } from '../types';

interface AccountVisibleRow {
  id: string;
  display_name: string;
  masked_number: string | null;
  kind: AccountRow['kind'];
  owner_member_id: string | null;
  visibility: AccountRow['visibility'];
  balance: number | null;
  currency: string;
  statement_day: number | null;
  statement_amount_due: number | null;
}

interface AccountExistenceRow {
  id: string;
  display_name: string;
  owner_member_id: string;
}

/** v_accounts_visible already excludes the partner's private accounts. */
export async function getAccounts(_viewerId: MemberId): Promise<AccountRow[]> {
  const { data, error } = await supabase.from('v_accounts_visible').select('*').returns<AccountVisibleRow[]>();
  if (error) throw error;
  return data.map((a) => ({
    id: a.id,
    displayName: a.display_name,
    maskedNumber: a.masked_number,
    kind: a.kind,
    ownerId: a.owner_member_id,
    visibility: a.visibility,
    balance: a.balance,
    currency: a.currency,
    statementDay: a.statement_day,
    statementAmountDue: a.statement_amount_due,
    // No connections table in M1 — sync state isn't modeled yet (see REPORT.md).
    syncState: 'manual',
    lastSyncedAt: null,
  }));
}

export async function getPrivateAccountsExistence(_viewerId: MemberId): Promise<PrivateAccountExistence[]> {
  const { data, error } = await supabase.from('v_accounts_existence').select('*').returns<AccountExistenceRow[]>();
  if (error) throw error;
  return data.map((a) => ({ id: a.id, ownerId: a.owner_member_id, displayName: a.display_name }));
}
