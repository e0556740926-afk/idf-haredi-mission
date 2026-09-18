import { supabase } from './client';
import { categoryLabel } from './categoryLabels';
import type { ActivityRow, MemberId, Visibility } from '../types';

interface ActivityViewRow {
  id: string;
  booked_at: string;
  description: string;
  merchant_name: string | null;
  category_key: string;
  amount: number;
  currency: string;
  owner_member_id: string | null;
  visibility: Visibility;
  is_surprise: boolean;
  surprise_until: string | null;
  partner_sees: ActivityRow['partnerSees'];
}

/**
 * v_activity has already done every bit of visibility filtering — this
 * function reads it and reshapes column names, nothing else. No `.filter`,
 * no `.eq('visibility', ...)`: if a row needed hiding, it never left
 * Postgres (see docs/01-data-model.md, supabase/migrations/0002).
 */
export async function getActivity(_viewerId: MemberId): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from('v_activity')
    .select('*')
    .order('booked_at', { ascending: false })
    .returns<ActivityViewRow[]>();
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    bookedAt: row.booked_at,
    description: row.description,
    merchantName: row.merchant_name,
    categoryKey: row.category_key,
    categoryLabel: categoryLabel(row.category_key),
    amount: row.amount,
    currency: row.currency,
    ownerId: row.owner_member_id,
    visibility: row.visibility,
    isSurprise: row.is_surprise,
    surpriseUntil: row.surprise_until,
    partnerSees: row.partner_sees,
  }));
}
