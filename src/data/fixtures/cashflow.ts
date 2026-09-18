import type { CashflowCliff, CashflowPoint } from '../types';

/**
 * 90-day projected household balance. Matches the one hard number in
 * docs/05-seed-data.md: on 2026-10-10 the credit card statement (8,740 ₪)
 * is charged against a projected balance of 7,310 ₪, leaving a 1,430 ₪
 * shortfall against the household's safety buffer floor.
 */
export const cashflowPoints: CashflowPoint[] = [
  { date: '2026-09-17', expected: 14000, low: 13000, high: 15000 },
  { date: '2026-09-21', expected: 11800, low: 10600, high: 13000 },
  { date: '2026-09-25', expected: 9600, low: 8100, high: 11100 },
  { date: '2026-09-29', expected: 8300, low: 6600, high: 10000 },
  { date: '2026-10-01', expected: 21200, low: 19200, high: 23200 },
  { date: '2026-10-05', expected: 16700, low: 14200, high: 19200 },
  { date: '2026-10-09', expected: 22400, low: 19400, high: 25400 },
  { date: '2026-10-10', expected: 7310, low: 3800, high: 10800 },
  { date: '2026-10-13', expected: 3200, low: -700, high: 7100 },
  { date: '2026-10-20', expected: 5900, low: 1400, high: 10400 },
  { date: '2026-11-01', expected: 20600, low: 15600, high: 25600 },
  { date: '2026-11-09', expected: 24100, low: 18100, high: 30100 },
  { date: '2026-11-20', expected: 18700, low: 11700, high: 25700 },
  { date: '2026-12-01', expected: 21500, low: 13500, high: 29500 },
  { date: '2026-12-15', expected: 17900, low: 8900, high: 26900 },
];

export const cashflowCliffs: CashflowCliff[] = [
  { date: '2026-10-10', label: 'חיוב אשראי 8,740 ₪', shortfall: 1430 },
];

export const cashflowFloor = 2000;
