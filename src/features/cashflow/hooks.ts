import { useQuery } from '@tanstack/react-query';
import { getCashflow, getKnownCashflowItems, getMembers } from '../../data';
import type { MemberId } from '../../data/types';

export function useCashflowScreen(viewerId: MemberId, days = 90) {
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const cashflow = useQuery({ queryKey: ['cashflow', viewerId, days], queryFn: () => getCashflow(viewerId, days) });
  const known = useQuery({ queryKey: ['knownCashflow', viewerId], queryFn: () => getKnownCashflowItems(viewerId) });

  return { members, cashflow, known };
}
