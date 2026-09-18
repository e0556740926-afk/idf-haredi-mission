import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccounts, getMembers, setVisibility } from '../../data';
import type { MemberId, Visibility } from '../../data/types';

export function useAccountsScreen(viewerId: MemberId) {
  const queryClient = useQueryClient();
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const accounts = useQuery({ queryKey: ['accounts', viewerId], queryFn: () => getAccounts(viewerId) });

  const changeVisibility = useMutation({
    mutationFn: (input: { accountId: string; to: Visibility }) =>
      setVisibility(viewerId, 'account', input.accountId, input.to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['visibilityLog'] });
    },
  });

  return { members, accounts, changeVisibility };
}
