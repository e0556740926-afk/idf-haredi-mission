import { household, members } from '../fixtures/household';
import type { Household, Member, MemberId } from '../types';

export async function getHousehold(_viewerId: MemberId): Promise<Household> {
  return household;
}

export async function getMembers(_viewerId: MemberId): Promise<Member[]> {
  return members;
}
