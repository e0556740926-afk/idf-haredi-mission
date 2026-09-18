import { useQuery } from '@tanstack/react-query';
import { getActivity, getAllowanceSummaries, getMembers, getPrivateAccountsExistence, getSafeToSpend } from '../../data';
import { currentPeriod } from '../../lib/date';
import type { MemberId } from '../../data/types';

export function useActivityScreen(viewerId: MemberId) {
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const activity = useQuery({ queryKey: ['activity', viewerId], queryFn: () => getActivity(viewerId) });
  const allowanceSummaries = useQuery({
    queryKey: ['allowanceSummaries', viewerId],
    queryFn: () => getAllowanceSummaries(viewerId, currentPeriod()),
  });
  const privateAccounts = useQuery({
    queryKey: ['privateAccountsExistence', viewerId],
    queryFn: () => getPrivateAccountsExistence(viewerId),
  });
  const safeToSpend = useQuery({ queryKey: ['safeToSpend', viewerId], queryFn: () => getSafeToSpend(viewerId) });

  return { members, activity, allowanceSummaries, privateAccounts, safeToSpend };
}
