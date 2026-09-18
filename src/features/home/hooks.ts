import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccounts, getBudgets, getGoals, getMembers, getSettlement, markSettlementTransferred } from '../../data';
import { currentPeriod } from '../../lib/date';
import type { MemberId } from '../../data/types';

export function useHomeScreen(viewerId: MemberId) {
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const budgets = useQuery({
    queryKey: ['budgets', viewerId, currentPeriod()],
    queryFn: () => getBudgets(viewerId, currentPeriod()),
  });
  const settlement = useQuery({
    queryKey: ['settlement', viewerId, currentPeriod()],
    queryFn: () => getSettlement(viewerId, currentPeriod()),
  });
  const goals = useQuery({ queryKey: ['goals', viewerId], queryFn: () => getGoals(viewerId) });
  const accounts = useQuery({ queryKey: ['accounts', viewerId], queryFn: () => getAccounts(viewerId) });

  return { members, budgets, settlement, goals, accounts };
}

export function useToggleSettlementTransferred(viewerId: MemberId) {
  const queryClient = useQueryClient();
  return async (transferred: boolean) => {
    const result = await markSettlementTransferred(viewerId, transferred);
    queryClient.setQueryData(['settlement', viewerId, currentPeriod()], result);
  };
}
