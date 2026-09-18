import { useQuery } from '@tanstack/react-query';
import {
  getAccounts,
  getBudgetsOverview,
  getHousehold,
  getMembers,
  getPockets,
  getSafeToSpend,
} from '../../data';
import { currentPeriod } from '../../lib/date';
import type { MemberId } from '../../data/types';

export function useTodayScreen(viewerId: MemberId) {
  const household = useQuery({ queryKey: ['household', viewerId], queryFn: () => getHousehold(viewerId) });
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const safeToSpend = useQuery({ queryKey: ['safeToSpend', viewerId], queryFn: () => getSafeToSpend(viewerId) });
  const budgetsOverview = useQuery({
    queryKey: ['budgetsOverview', viewerId, currentPeriod()],
    queryFn: () => getBudgetsOverview(viewerId, currentPeriod()),
  });
  const pockets = useQuery({
    queryKey: ['pockets'],
    queryFn: () => getPockets(),
  });
  const accounts = useQuery({ queryKey: ['accounts', viewerId], queryFn: () => getAccounts(viewerId) });

  return { household, members, safeToSpend, budgetsOverview, pockets, accounts };
}
