import { supabase } from './client';
import type { MemberId, Visibility, VisibilityEntityType, VisibilityLogEntry } from '../types';

interface VisibilityLogRow {
  id: string;
  entity_type: VisibilityEntityType;
  entity_label: string | null;
  changed_by_name: string;
  from_visibility: Visibility;
  to_visibility: Visibility;
  changed_at: string;
}

/**
 * rpc_set_visibility does the owner check and writes visibility_log itself
 * (supabase/migrations/0002) — this just calls it and surfaces its error.
 */
export async function setVisibility(
  _viewerId: MemberId,
  entityType: VisibilityEntityType,
  id: string,
  to: Visibility,
): Promise<void> {
  const { error } = await supabase.rpc('rpc_set_visibility', { p_entity_type: entityType, p_id: id, p_to: to });
  if (error) throw error;
}

/** v_visibility_log already nulls entity_label for anyone but the entity's owner. */
export async function getVisibilityLog(_viewerId: MemberId): Promise<VisibilityLogEntry[]> {
  const { data, error } = await supabase.from('v_visibility_log').select('*').returns<VisibilityLogRow[]>();
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityLabel: row.entity_label,
    changedByName: row.changed_by_name,
    from: row.from_visibility,
    to: row.to_visibility,
    at: row.changed_at,
  }));
}
