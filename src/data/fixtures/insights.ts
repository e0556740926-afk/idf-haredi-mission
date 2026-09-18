import type { Insight } from '../types';

export const insights: Insight[] = [
  {
    id: 'ins-cancelled-1',
    title: 'ביטלתם מנוי לחדר כושר שני שלא נוצל',
    detail: 'המנוי לא נוצל שלושה חודשים ברצף לפני הביטול.',
    annualImpactAbs: 828,
    annualImpactDirection: 'saving',
    impact: 'high',
    isVerified: true,
  },
  {
    id: 'ins-cancelled-2',
    title: 'ביטלתם מנוי סטרימינג כפול',
    detail: 'שני מנויים לאותו שירות משתי כרטיסים שונות.',
    annualImpactAbs: 600,
    annualImpactDirection: 'saving',
    impact: 'medium',
    isVerified: true,
  },
  {
    id: 'ins-gym-price',
    title: 'חדר הכושר עלה מ־189 ל־231 ₪',
    detail: 'עלייה של 42 ₪ בחודש — 504 ₪ בשנה, אם לא ינוהל מו״מ.',
    annualImpactAbs: 504,
    annualImpactDirection: 'cost',
    impact: 'medium',
    isVerified: false,
  },
  {
    id: 'ins-netflix-price',
    title: 'נטפליקס עלה ב־22%',
    detail: 'מ־44.90 ל־54.90 ₪ בחודש — 120 ₪ בשנה.',
    annualImpactAbs: 120,
    annualImpactDirection: 'cost',
    impact: 'low',
    isVerified: false,
  },
];

/** 1,428 ₪ — the verified annual saving from docs/00-product.md / the ritual "win" card. */
export const verifiedAnnualSaving = 1428;
