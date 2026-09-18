import type { Household, Member } from '../types';

export const household: Household = {
  id: 'hh-dana-yoav',
  name: 'דנה ויואב',
  marketCode: 'IL',
  baseCurrency: 'ILS',
  timezone: 'Asia/Jerusalem',
  archetype: 'three_pots',
  fairnessRule: { type: 'income' },
  safetyBuffer: 2000,
  quietModeEnabled: true,
};

export const members: Member[] = [
  {
    id: 'dana',
    displayName: 'דנה',
    initial: 'ד',
    allowanceMonthly: 2500,
    incomeMonthly: 18400,
    incomeDay: 1,
  },
  {
    id: 'yoav',
    displayName: 'יואב',
    initial: 'י',
    allowanceMonthly: 2500,
    incomeMonthly: 14200,
    incomeDay: 9,
  },
];

export function otherMemberId(viewerId: string): string {
  const other = members.find((m) => m.id !== viewerId);
  if (!other) throw new Error(`No partner found for viewer ${viewerId}`);
  return other.id;
}

export function memberById(id: string): Member {
  const member = members.find((m) => m.id === id);
  if (!member) throw new Error(`Unknown member ${id}`);
  return member;
}
