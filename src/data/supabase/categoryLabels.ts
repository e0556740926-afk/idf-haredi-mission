/**
 * Static category-key → Hebrew label lookup. Not a data or filtering
 * concern — categories aren't modeled as a table in M1 (docs/01), so this
 * is the same kind of static UI copy as src/i18n/he.ts, not money math.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  food: 'מזון',
  transport: 'תחבורה',
  leisure: 'פנאי',
  shopping: 'קניות',
  gifts: 'מתנות',
  housing: 'דיור',
  kids: 'ילדים',
  insurance: 'ביטוחים',
  communication: 'תקשורת',
  variable: 'הוצאות משתנות',
  other: 'אחר',
};

export function categoryLabel(key: string): string {
  return CATEGORY_LABELS[key] ?? CATEGORY_LABELS.other;
}
