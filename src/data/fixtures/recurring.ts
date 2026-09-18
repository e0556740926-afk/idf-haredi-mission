import type { RecurringSeries } from '../types';

export const recurringSeries: RecurringSeries[] = [
  {
    id: 'rec-rent',
    label: 'שכר דירה',
    amount: 6200,
    dayOfMonth: 1,
    priceHistory: [{ date: '2025-09-01', amount: 6200 }],
  },
  {
    id: 'rec-daycare',
    label: 'גן ומעון',
    amount: 2450,
    dayOfMonth: 5,
    priceHistory: [{ date: '2025-09-05', amount: 2450 }],
  },
  {
    id: 'rec-car-insurance',
    label: 'ביטוח רכב',
    amount: 312,
    dayOfMonth: 12,
    priceHistory: [{ date: '2025-09-12', amount: 312 }],
  },
  {
    id: 'rec-gym',
    label: 'חדר כושר',
    amount: 231,
    dayOfMonth: 15,
    priceHistory: [
      { date: '2026-01-15', amount: 189 },
      { date: '2026-08-15', amount: 231 },
    ],
  },
  {
    id: 'rec-cellphone',
    label: 'סלולר פרטנר',
    amount: 148,
    dayOfMonth: 18,
    priceHistory: [{ date: '2025-09-18', amount: 148 }],
  },
  {
    id: 'rec-internet',
    label: 'אינטרנט בזק',
    amount: 99,
    dayOfMonth: 18,
    priceHistory: [{ date: '2025-09-18', amount: 99 }],
  },
  {
    id: 'rec-vaad-bayit',
    label: 'ועד בית',
    amount: 150,
    dayOfMonth: 20,
    priceHistory: [{ date: '2025-09-20', amount: 150 }],
  },
  {
    id: 'rec-netflix',
    label: 'נטפליקס',
    amount: 54.9,
    dayOfMonth: 22,
    priceHistory: [
      { date: '2026-02-22', amount: 44.9 },
      { date: '2026-08-22', amount: 54.9 },
    ],
  },
  {
    id: 'rec-spotify',
    label: 'ספוטיפיי',
    amount: 34.9,
    dayOfMonth: 22,
    priceHistory: [{ date: '2025-09-22', amount: 34.9 }],
  },
];
