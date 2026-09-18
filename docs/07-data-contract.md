# חוזה הנתונים — גבול ההחלפה

**זה הקובץ שמאפשר לבנות עכשיו את כל הפרונט על נתוני דמה, ולחבר מסד נתונים אחר כך בלי לגעת באף מסך.**

## הכלל היחיד

```
components / screens  →  src/data/*.ts  →  (עכשיו) fixtures   →  (אחר כך) Supabase
                              ↑
                    רק כאן יודעים מאיפה מגיעים נתונים
```

- **אף רכיב, מסך או hook לא מייבא מ-`src/data/fixtures/` ישירות.** לעולם.
- כל פונקציה ב-`src/data/` מקבלת `viewerId` כארגומנט **ראשון**. אין פונקציה שמחזירה "את הנתונים של הבית" — רק "את מה שהצופה הזה רשאי לראות".
- **סינון הנראות מתבצע בתוך `src/data/`, כבר עכשיו.** המסכים לעולם לא מקבלים שורה שאסור להם לראות, גם בשלב הדמה. זה מה שמונע מהמסכים להיבנות על הנחה שגויה.
- הטיפוסים ב-`src/data/types.ts` הם מקור האמת. כשנחבר את Supabase, המימוש מתחלף — **הטיפוסים לא**.

## הממשק

```ts
// src/data/types.ts
export type Visibility = 'shared' | 'summary_only' | 'private';
export type MemberId = string;

export interface ActivityRow {
  id: string;
  bookedAt: string;              // YYYY-MM-DD
  description: string;
  merchantName: string | null;
  categoryKey: string;
  amount: number;                // שלילי = הוצאה
  currency: string;
  ownerId: MemberId | null;      // null = הבית
  visibility: Visibility;
  isSurprise: boolean;
  /** מה הצד השני רואה מהשורה הזו. מוצג רק לבעלים. */
  partnerSees: 'all' | 'amount_only' | 'nothing';
}

export interface AllowanceSummary {
  ownerId: MemberId;
  ownerName: string;
  period: string;                // YYYY-MM
  total: number;                 // סכום מצטבר
  count: number;                 // מספר פעולות
  // אין merchantName, אין categoryKey, אין תאריכים. בכוונה.
}

export interface SafeToSpend {
  amount: number;
  currency: string;
  breakdown: { key: string; label: string; amount: number }[];
  daysLeft: number;
}

export interface AccountRow {
  id: string; displayName: string; maskedNumber: string | null;
  kind: 'checking' | 'savings' | 'credit_card' | 'loan' | 'manual';
  ownerId: MemberId | null;
  visibility: Visibility;
  balance: number | null;        // null כשהצופה לא רשאי לראות יתרה
  currency: string;
  statementDay: number | null;
  syncState: 'ok' | 'stale' | 'broken' | 'manual';
  lastSyncedAt: string | null;
}

export interface Settlement {
  periodLabel: string; ruleLabel: string;
  householdTotal: number;
  perMember: { memberId: MemberId; name: string; paid: number; share: number }[];
  fromMemberId: MemberId; toMemberId: MemberId; amount: number;
}

export interface CashflowPoint { date: string; expected: number; low: number; high: number; }
export interface CashflowCliff { date: string; label: string; shortfall: number; }
```

## הפונקציות

```ts
// src/data/index.ts — כל מה שהאפליקציה מותר לה לקרוא
getHousehold(viewerId): Promise<Household>
getMembers(viewerId): Promise<Member[]>

getActivity(viewerId, opts?): Promise<ActivityRow[]>
getAllowanceSummaries(viewerId, period): Promise<AllowanceSummary[]>
getAccounts(viewerId): Promise<AccountRow[]>
getPrivateAccountsExistence(viewerId): Promise<{ id: string; ownerId: MemberId; displayName: string }[]>

getSafeToSpend(viewerId): Promise<SafeToSpend>
getCashflow(viewerId, days): Promise<{ points: CashflowPoint[]; cliffs: CashflowCliff[] }>
getBudgets(viewerId, period): Promise<BudgetEnvelope[]>
getRecurring(viewerId): Promise<RecurringSeries[]>
getInsights(viewerId): Promise<Insight[]>
getGoals(viewerId): Promise<Goal[]>
getSettlement(viewerId, period): Promise<Settlement>

getRitual(viewerId, id?): Promise<Ritual>
saveRitualDecision(viewerId, input): Promise<void>
setVisibility(viewerId, entity, id, to): Promise<void>   // נכשל אם viewer אינו הבעלים
getVisibilityLog(viewerId): Promise<VisibilityLogEntry[]>
```

## כללי הסינון שהמימוש חייב לקיים

1. `getActivity` מחזיר: כל שורות ה-`shared` + שורות שה-`ownerId` שלהן הוא הצופה. **לא** שורות `summary_only` של אחר, ולא `private` של אחר.
2. שורה עם `isSurprise` ו-`surpriseUntil` בעתיד **לא** מוחזרת לצד השני — **אבל הסכום שלה כן נכלל** ב-`AllowanceSummary.total`.
3. `getAccounts` מחזיר `balance: null` לחשבון שהצופה אינו רשאי לראות את יתרתו.
4. `getSafeToSpend` מחזיר **את אותו מספר בדיוק** לשני החברים, ואת אותו `breakdown`.
5. `setVisibility` זורק שגיאה אם `viewerId !== ownerId`.
6. סכומי קטגוריה ותקציב מחושבים **רק** על מה שהצופה רשאי לראות, ואז מוסיפים בנפרד את סכום הכיס.

## בדיקות — כבר עכשיו

`tests/data-contract/` עם הבדיקות האלה על המימוש המדומה:

| # | בדיקה | נדרש |
|---|---|---|
| 1 | `getActivity('yoav')` | 5 שורות. אף שורה עם `ownerId === 'dana'` שאינה `shared` |
| 2 | `getActivity('dana')` | 8 שורות |
| 3 | `getAllowanceSummaries('yoav', ...)` | שורה אחת: `total 1290`, `count 3`. הטיפוס **לא** כולל merchant/category |
| 4 | עסקת ההפתעה | לא ב-`getActivity('yoav')`, **כן** בתוך ה-`total` |
| 5 | `getSafeToSpend` | זהה לדנה וליואב, והרכיבים מסתכמים לסכום |
| 6 | `getAccounts('yoav')` | חשבון פרטי של דנה לא מופיע; `getPrivateAccountsExistence` מחזיר אותו בלי יתרה |
| 7 | `setVisibility('yoav', 'account', <של דנה>, 'shared')` | זורק |
| 8 | `getBudgets('yoav')` | "קניות" אינו כולל את 390 ₪ של דנה |

**כשמחליפים ל-Supabase, אותן בדיקות בדיוק רצות מול המימוש האמיתי.** זו כל הנקודה.

## מה קורה בשלב החיבור

1. נכתב `src/data/supabase/*.ts` שמממש את אותו ממשק.
2. `src/data/index.ts` מחליף ייבוא אחד לפי משתנה סביבה.
3. בדיקות חוזה הנתונים רצות מול שני המימושים.
4. **אף מסך לא משתנה.**
