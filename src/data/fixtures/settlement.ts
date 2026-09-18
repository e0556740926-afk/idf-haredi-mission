import type { Settlement } from '../types';

/**
 * The fairness math itself lives here as a canned result, not computed in
 * TypeScript — see docs/05-seed-data.md's "הוגנות" section for the numbers.
 * Income split 56.4% / 43.6%, household spend 14,800 ₪, so Dana's share is
 * 8,353 ₪ and Yoav's is 6,447 ₪; Dana actually paid 9,100 ₪ and Yoav 5,700 ₪.
 */
export const settlement: Settlement = {
  periodLabel: 'ספטמבר',
  ruleLabel: 'לפי ההכנסות',
  splitLabel: '56/44',
  householdTotal: 14800,
  perMember: [
    { memberId: 'dana', name: 'דנה', paid: 9100, share: 8353 },
    { memberId: 'yoav', name: 'יואב', paid: 5700, share: 6447 },
  ],
  fromMemberId: 'yoav',
  toMemberId: 'dana',
  amount: 747,
  isTransferred: false,
};
