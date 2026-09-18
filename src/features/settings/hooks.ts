import { useQuery } from '@tanstack/react-query';
import { getHousehold, getMembers, getVisibilityLog } from '../../data';
import type { MemberId } from '../../data/types';

export function useSettingsScreen(viewerId: MemberId) {
  const household = useQuery({ queryKey: ['household', viewerId], queryFn: () => getHousehold(viewerId) });
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const visibilityLog = useQuery({
    queryKey: ['visibilityLog', viewerId],
    queryFn: () => getVisibilityLog(viewerId),
  });
  return { household, members, visibilityLog };
}
