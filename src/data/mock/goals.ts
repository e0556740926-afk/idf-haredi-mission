import { goals } from '../fixtures/goals';
import type { Goal, MemberId } from '../types';

export async function getGoals(_viewerId: MemberId): Promise<Goal[]> {
  return goals;
}
