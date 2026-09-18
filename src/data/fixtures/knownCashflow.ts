import type { KnownCashflowItem } from '../types';

export const knownIncomes: KnownCashflowItem[] = [
  { key: 'income-dana', label: 'משכורת דנה', dateLabel: '1 בחודש', amount: 18400, kind: 'income' },
  { key: 'income-yoav', label: 'משכורת יואב', dateLabel: '9 בחודש', amount: 14200, kind: 'income' },
];

export const knownExpenses: KnownCashflowItem[] = [
  { key: 'rent', label: 'שכר דירה', dateLabel: '1 בחודש', amount: 6200, kind: 'expense' },
  { key: 'daycare', label: 'גן ומעון', dateLabel: '5 בחודש', amount: 2450, kind: 'expense' },
  { key: 'credit-card', label: 'כאל — חיוב אשראי', dateLabel: '10 בחודש', amount: 8740, kind: 'expense' },
  { key: 'car-insurance', label: 'ביטוח רכב', dateLabel: '12 בחודש', amount: 312, kind: 'expense' },
  { key: 'gym', label: 'חדר כושר', dateLabel: '15 בחודש', amount: 231, kind: 'expense' },
  { key: 'cellphone', label: 'סלולר פרטנר', dateLabel: '18 בחודש', amount: 148, kind: 'expense' },
  { key: 'internet', label: 'אינטרנט בזק', dateLabel: '18 בחודש', amount: 99, kind: 'expense' },
  { key: 'vaad-bayit', label: 'ועד בית', dateLabel: '20 בחודש', amount: 150, kind: 'expense' },
  { key: 'netflix', label: 'נטפליקס', dateLabel: '22 בחודש', amount: 54.9, kind: 'expense' },
  { key: 'spotify', label: 'ספוטיפיי', dateLabel: '22 בחודש', amount: 34.9, kind: 'expense' },
  { key: 'electricity', label: 'חשמל', dateLabel: 'משוער', amount: 480, kind: 'expense' },
  { key: 'water', label: 'מים', dateLabel: 'משוער', amount: 180, kind: 'expense' },
  { key: 'arnona', label: 'ארנונה', dateLabel: 'דו־חודשי', amount: 640, kind: 'expense' },
];
