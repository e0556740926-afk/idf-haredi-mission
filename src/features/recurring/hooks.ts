import { useQuery } from '@tanstack/react-query';
import { getMembers, getRecurring, getRecurringMonthlyTotal } from '../../data';
import type { MemberId } from '../../data/types';

export function useRecurringScreen(viewerId: MemberId) {
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const recurring = useQuery({ queryKey: ['recurring', viewerId], queryFn: () => getRecurring(viewerId) });
  const monthlyTotal = useQuery({
    queryKey: ['recurringMonthlyTotal', viewerId],
    queryFn: () => getRecurringMonthlyTotal(viewerId),
  });
  return { members, recurring, monthlyTotal };
}
