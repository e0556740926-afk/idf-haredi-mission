# מודל הנתונים — מקור האמת

כל שינוי סכמה עובר דרך מיגרציה ב-`supabase/migrations/`. אין `alter table` ידני.

## עיקרון הגישה

```
client  →  v_* views  /  rpc_* functions   →  base tables (RLS)
                    ↑
          זו הגישה היחידה. אין אחרת.
```

בסוף כל מיגרציה שיוצרת טבלה עם כסף:

```sql
revoke all on table <t> from anon, authenticated;
-- grant ניתן רק ל-views ול-functions, לעולם לא לטבלה
```

## פונקציות עזר

```sql
-- החבר הנוכחי בהקשר של משק בית
create or replace function current_member_id(p_household uuid)
returns uuid language sql stable security definer as $$
  select id from members where user_id = auth.uid() and household_id = p_household limit 1;
$$;

-- הנראות האפקטיבית של עסקה: דריסה ברמת העסקה, אחרת של החשבון
create or replace function effective_visibility(p_account uuid, p_override text)
returns text language sql stable security definer as $$
  select coalesce(p_override, (select visibility from accounts where id = p_account));
$$;
```

## טבלאות

### `households`
`id` · `name` · `market_code` (ברירת מחדל `IL`) · `base_currency` · `timezone` · `locale` ·
`archetype` (`one_pot|three_pots|separate|asymmetric`) · `fairness_rule jsonb` ·
`safety_buffer numeric(14,2)` · `quiet_mode jsonb` · `created_at`

### `members`
`id` · `household_id` · `user_id` (→ `auth.users`) · `display_name` ·
`role` (`partner|dependent|advisor`, ברירת מחדל `partner`) ·
`allowance_monthly numeric(12,2)` · `income_monthly_override numeric(12,2)` ·
`locale` · `channels jsonb`
**אילוץ:** `unique (household_id, user_id)`

### `accounts`
`id` · `household_id` · `connection_id` (nullable — חשבון ידני) ·
`owner_member_id` (**NULL = בבעלות הבית**) ·
`visibility text not null default 'private'` — `shared|summary_only|private` ·
`counts_in_household boolean not null default true` ·
`kind` (`checking|savings|credit_card|loan|manual`) · `currency` ·
`display_name` · `masked_number` (4 ספרות) · `current_balance` · `available_balance` ·
`credit_limit` · `statement_day smallint` · `is_active`

**אילוצים מחייבים:**
```sql
-- חשבון של הבית לא יכול להיות מוסתר
check (owner_member_id is not null or visibility = 'shared')
-- private תמיד יוצא מהחשבון
check (visibility <> 'private' or counts_in_household = false)
check (visibility  = 'private' or counts_in_household = true)
```

### `transactions`
`id` (מזהה פנימי — **לא** של הספק) · `household_id` · `account_id` ·
`provider_txn_id` · `fingerprint` (תאריך+סכום+תיאור מנורמל, לדה-דופליקציה) ·
`state` (`pending|booked|removed`) · `booked_at date` · `value_at date` ·
`amount numeric(14,2)` (שלילי = הוצאה) · `currency` ·
`original_amount` · `original_currency` · `fx_rate numeric(14,8)` ·
`raw_description` · `merchant_id` · `mcc` ·
`category_id` · `category_source` · `category_confidence numeric(3,2)` ·
`kind` (`expense|income|internal_transfer|fee|refund`) · `is_counted boolean default true` ·
`transfer_pair_id` · `statement_id` · `installment_plan_id` · `refund_of_txn_id` · `recurring_series_id` ·
`owner_member_id` · `visibility_override text` (NULL = לרשת מהחשבון) ·
`surprise_until date` · `note` · `tags text[]`

**אינדקסים:** `(household_id, booked_at desc)` · `(household_id, fingerprint)` · `unique (account_id, provider_txn_id)`

### שאר הטבלאות
`connections` · `merchants` · `merchant_aliases` · `categories` · `category_rules` ·
`recurring_series` · `card_statements` · `installment_plans` · `budgets` · `goals` ·
`settlements` · `insights` · `rituals` · `ritual_decisions` · `automations` ·
`visibility_log` · `audit_log`

מבנה מלא — פרק 17 באפיון המוצר. **לא לממש את כולן באבן דרך 1** — רק מה שמופיע ב-`docs/02-milestones.md`.

## מדיניות RLS

```sql
alter table transactions enable row level security;

create policy household_isolation on transactions for select
  using ( household_id in (select household_id from members where user_id = auth.uid()) );

create policy visibility_enforcement on transactions for select
  using (
    effective_visibility(account_id, visibility_override) = 'shared'
    or owner_member_id = current_member_id(household_id)
  );
```

שתי המדיניות מצטברות (AND) ב-Postgres כשהן על אותה פעולה — זו ההתנהגות הרצויה.
מדיניות מקבילה על `accounts`: הצופה רואה שורה אם היא `shared`, או שהיא שלו.
לגבי `private` של הצד השני — הוא צריך לדעת שהחשבון קיים, אבל לא יתרה. זה נעשה ב-view נפרד שמחזיר רק `display_name` ו-`owner_member_id`, בלי סכומים.

## Views ו-RPCs

כולם `security invoker` (ברירת המחדל ב-PG15+) כדי שה-RLS יחול.

| שם | מחזיר | הערה |
|---|---|---|
| `v_activity` | פיד עסקאות של הצופה | רק שורות שעברו RLS |
| `v_allowance_summary` | `household_id, owner_member_id, period, total, n` | **בלי** `merchant_id`, `raw_description`, `category_id` |
| `v_accounts_visible` | חשבונות עם יתרה | רק `shared` + של הצופה |
| `v_accounts_existence` | `display_name, owner_member_id` בלבד | לחשבונות `private` של הצד השני |
| `rpc_safe_to_spend(p_household)` | סכום + פירוק רכיבים | מחשב ב-SQL, כולל גריעת כיסים |
| `rpc_cashflow(p_household, p_days)` | נקודות + רצועת אי-ודאות + צוקים | |
| `rpc_budget_status(p_household)` | מעטפות | |
| `rpc_settlement(p_household, p_period)` | מי מעביר כמה | |
| `rpc_set_visibility(p_entity_type, p_id, p_to)` | מעדכן + כותב ל-`visibility_log` | **רק הבעלים** |

**כלל ה-`summary_only`:** כל view או RPC שמחזיר אגרגציה חייב לחשב אותה על הנתונים **שהצופה רשאי לראות**, ואז להוסיף בנפרד את הסכומים מ-`v_allowance_summary`. לעולם לא לחשב אגרגציה על הטבלה הגולמית ואז "לצנזר" את הפלט.

## מה שאסור

- `grant select` על טבלה שיש בה כסף.
- `security definer` על view או פונקציה שמחזירה שורות עסקה.
- אגרגציה שמחושבת על טבלה גולמית ומוצגת לצופה שאינו הבעלים.
- `select *` מהקליינט.
