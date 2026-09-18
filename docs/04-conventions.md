# מוסכמות

## מבנה תיקיות

```
src/
  app/            ניתוב, layout, providers
  features/       לפי דומיין — activity/ household/ ritual/ cashflow/ accounts/
    <feature>/
      api.ts      קריאות ל-views/RPCs בלבד
      hooks.ts    TanStack Query
      components/
  components/     רכיבים משותפים (VisibilityBadge, Money, Sheet...)
  lib/            supabase client, format, date, money
  i18n/he.ts      כל מחרוזת שמוצגת למשתמש
  styles/tokens.css
supabase/
  migrations/     NNNN_description.sql
  functions/      Edge Functions
  seed.sql
tests/
  leak/           מטריצת הדליפה
  unit/
  e2e/
docs/
```

## שמות

- טבלאות ועמודות: `snake_case`, רבים לטבלאות.
- Views: `v_`. פונקציות שנקראות מהקליינט: `rpc_`. פונקציות פנימיות: בלי קידומת.
- TypeScript: `camelCase` למשתנים, `PascalCase` לרכיבים וטיפוסים.
- מיגרציות: `0007_add_settlements.sql` — מספר רץ + תיאור באנגלית.
- טסטים: `tests/leak/03-allowance-summary.test.ts` — ממוספר לפי המטריצה.

## כסף ומספרים

```ts
// lib/money.ts — הפורמט היחיד. אין Intl ישירות ברכיבים.
formatMoney(1290, 'ILS')   // "1,290 ₪"
formatMoney(-412, 'ILS')   // "412 ₪-"  ← סימן בצד הנכון ל-RTL
```

- אין חישוב כספי ב-TypeScript. סכומים מגיעים מוכנים מ-SQL.
- כל אלמנט שמציג מספר מקבל `font-variant-numeric: tabular-nums`.

## הרכיב `VisibilityBadge`

מופיע ליד **כל** תצוגת כסף. שלושה מצבים: `shared` · `summary_only` · `private`.
אם רכיב חדש מציג סכום ולא מציג את המחוון — זו טעות, לא בחירה.

## טיפוסים

טיפוסי ה-DB נוצרים אוטומטית: `npm run db:types` → `src/lib/database.types.ts`.
**אין לערוך את הקובץ הזה ידנית.**

## i18n

```ts
// i18n/he.ts
export const t = {
  activity: { title: 'פעילות', viewAs: 'התצוגה של {name}' },
  visibility: { shared: 'משותף', summary: 'סכום בלבד', private: 'פרטי' },
} as const;
```
אין מחרוזת עברית בתוך JSX. אין.

## Git

- ענף לכל אבן דרך: `m1-visibility-contract`.
- commit קטן. הודעה: מה השתנה ולמה.
- PR נדחה אם: הוא מוסיף גישה לנתונים בלי בדיקת דליפה, מוסיף grant לטבלת בסיס, מחשב כסף ב-TS, או מוסיף מחרוזת קשיחה.

## איסורים

- אין ORM. SQL כתוב ומיגרציות.
- אין ספריית UI חיצונית.
- אין ספריית גרפים — SVG ידני.
- אין `any` ב-TypeScript, למעט בקוד בדיקות ועם הערה.
- אין `console.log` בקוד שנכנס ל-main.
