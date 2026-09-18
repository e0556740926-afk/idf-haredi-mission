import { supabase } from './client';
import { getHousehold } from './household';
import type { MemberId, Settlement } from '../types';

interface SettlementJson {
  householdTotal: number;
  perMember: { memberId: string; name: string; paid: number; share: number }[];
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

/**
 * The transfer direction/amount and each member's share are already
 * computed by rpc_settlement — this only reshapes the jsonb payload.
 * `isTransferred` isn't tracked yet: there's no `settlements` table in
 * this migration (M4 scope per docs/02-milestones.md), so it always comes
 * back false. See REPORT.md.
 */
export async function getSettlement(viewerId: MemberId, period: string): Promise<Settlement> {
  const household = await getHousehold(viewerId);
  const { data, error } = await supabase
    .rpc('rpc_settlement', { p_household: household.id, p_period: period })
    .single<SettlementJson>();
  if (error) throw error;

  return {
    periodLabel: period,
    ruleLabel: household.fairnessRule.type === 'income' ? 'לפי ההכנסות' : household.fairnessRule.type,
    splitLabel: '',
    householdTotal: data.householdTotal,
    perMember: data.perMember,
    fromMemberId: data.fromMemberId,
    toMemberId: data.toMemberId,
    amount: data.amount,
    isTransferred: false,
  };
}
