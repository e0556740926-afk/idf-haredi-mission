import { supabase } from './client';
import { getMembers } from './household';
import type { AllowanceSummary, MemberId } from '../types';

interface AllowanceSummaryRow {
  owner_member_id: string;
  period: string;
  total: number;
  n: number;
}

/**
 * v_allowance_summary returns every summary_only owner's aggregate the
 * caller's household allows (both members', by design — see
 * supabase/migrations/0002). Picking out "the partner's" row is a plain
 * equality filter on an id, the same kind of filter the mock adapter does
 * against its own already-authorized data — not a visibility decision.
 */
export async function getAllowanceSummaries(
  viewerId: MemberId,
  period: string,
): Promise<AllowanceSummary[]> {
  const members = await getMembers(viewerId);
  const partner = members.find((m) => m.id !== viewerId);
  if (!partner) return [];

  const { data, error } = await supabase
    .from('v_allowance_summary')
    .select('*')
    .eq('owner_member_id', partner.id)
    .eq('period', period)
    .returns<AllowanceSummaryRow[]>();
  if (error) throw error;

  const row = data[0];
  if (!row) return [];
  return [{ ownerId: row.owner_member_id, ownerName: partner.displayName, period: row.period, total: row.total, count: row.n }];
}
