import { useQuery } from '@tanstack/react-query';
import { getInsights, getMembers, getVerifiedAnnualSaving } from '../../data';
import type { MemberId } from '../../data/types';

export function useInsightsScreen(viewerId: MemberId) {
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const insights = useQuery({ queryKey: ['insights', viewerId], queryFn: () => getInsights(viewerId) });
  const verifiedSaving = useQuery({
    queryKey: ['verifiedSaving', viewerId],
    queryFn: () => getVerifiedAnnualSaving(viewerId),
  });
  return { members, insights, verifiedSaving };
}
