import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMembers, getRitual, saveRitualDecision } from '../../data';
import type { MemberId, RitualDecisionInput } from '../../data/types';

export function useRitualScreen(viewerId: MemberId) {
  const queryClient = useQueryClient();
  const members = useQuery({ queryKey: ['members', viewerId], queryFn: () => getMembers(viewerId) });
  const ritual = useQuery({ queryKey: ['ritual', viewerId], queryFn: () => getRitual(viewerId) });

  const saveDecision = useMutation({
    mutationFn: (input: RitualDecisionInput) => saveRitualDecision(viewerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ritual', viewerId] }),
  });

  return { members, ritual, saveDecision };
}
