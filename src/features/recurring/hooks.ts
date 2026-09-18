import { useQuery } from '@tanstack/react-query';
import { getMembers, getRecurring } from '../../data';
import type { MemberId } from '../../data/types';

export function useRecurringScreen(viewerId: MemberId) {
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const recurring = useQuery({ queryKey: ['recurring', viewerId], queryFn: () => getRecurring(viewerId) });
  return { members, recurring };
}
