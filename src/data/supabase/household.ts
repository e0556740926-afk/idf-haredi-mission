import { supabase } from './client';
import type { Household, Member, MemberId } from '../types';

interface HouseholdRow {
  id: string;
  name: string;
  market_code: string;
  base_currency: string;
  timezone: string;
  archetype: Household['archetype'];
  fairness_rule: Household['fairnessRule'];
  safety_buffer: number;
  quiet_mode: Record<string, unknown>;
}

interface MemberRow {
  id: string;
  display_name: string;
  allowance_monthly: number | null;
  income_monthly_override: number | null;
}

/**
 * RLS (household_isolation on households/members) already scopes every
 * query to the caller's own household — there is no `viewerId` filter to
 * apply here in TypeScript. viewerId is kept only so this adapter matches
 * the mock adapter's signature exactly (docs/07-data-contract.md).
 */
export async function getHousehold(_viewerId: MemberId): Promise<Household> {
  const { data, error } = await supabase.from('v_household').select('*').single<HouseholdRow>();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    marketCode: data.market_code,
    baseCurrency: data.base_currency,
    timezone: data.timezone,
    archetype: data.archetype,
    fairnessRule: data.fairness_rule,
    safetyBuffer: data.safety_buffer,
    quietModeEnabled: Object.keys(data.quiet_mode ?? {}).length > 0,
  };
}

export async function getMembers(_viewerId: MemberId): Promise<Member[]> {
  const { data, error } = await supabase.from('v_members').select('*').returns<MemberRow[]>();
  if (error) throw error;
  return data.map((m) => ({
    id: m.id,
    displayName: m.display_name,
    initial: m.display_name.charAt(0),
    allowanceMonthly: m.allowance_monthly ?? 0,
    incomeMonthly: m.income_monthly_override,
    incomeDay: null, // no income schedule table in M1
  }));
}
