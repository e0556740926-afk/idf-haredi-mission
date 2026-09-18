import { useQuery } from '@tanstack/react-query';
import {
  getBudgets,
  getHousehold,
  getMembers,
  getRecurring,
  getSafeToSpend,
} from '../../data';
import { currentPeriod } from '../../lib/date';
import { getPocketsStatus } from '../home/pockets';
import type { MemberId } from '../../data/types';

export function useTodayScreen(viewerId: MemberId) {
  const household = useQuery({ queryKey: ['household', viewerId], queryFn: () => getHousehold(viewerId) });
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const safeToSpend = useQuery({ queryKey: ['safeToSpend', viewerId], queryFn: () => getSafeToSpend(viewerId) });
  const budgets = useQuery({
    queryKey: ['budgets', viewerId, currentPeriod()],
    queryFn: () => getBudgets(viewerId, currentPeriod()),
  });
  const recurring = useQuery({ queryKey: ['recurring', viewerId], queryFn: () => getRecurring(viewerId) });
  const pockets = useQuery({
    queryKey: ['pockets'],
    queryFn: () => getPocketsStatus(),
  });

  return { household, members, safeToSpend, budgets, recurring, pockets };
}
