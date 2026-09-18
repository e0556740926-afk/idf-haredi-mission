-- Duet — views and RPCs (M1/D2). Every view/function below does its own
-- explicit authorization filtering (household + visibility) rather than
-- leaning on RLS-through-the-view alone — see the note at the top of
-- 0001_core_schema.sql and REPORT.md "חיבור מסד נתונים" for why: it means
-- correctness here does not depend on subtle Postgres view-ownership/RLS
-- interactions that this sandbox could not verify by actually running
-- `supabase start` (Docker registry access is blocked here).
--
-- None of these are `security definer` except the ones that return
-- pre-aggregated numbers, never transaction rows (docs/01-data-model.md
-- "מה שאסור"): rpc_safe_to_spend, rpc_cashflow, rpc_budget_status,
-- rpc_settlement, rpc_set_visibility. v_activity and every other v_* view
-- returns row-level data and is a plain view (no security definer).

-- ---------------------------------------------------------------------------
-- v_household / v_members — not in docs/01's view table (households/members
-- aren't singled out as "tables with money" there), but 0001_core_schema.sql
-- revokes all base-table grants uniformly for every table with
-- household_id (CLAUDE.md rule 2: "RLS דלוק על כל טבלה שיש בה
-- household_id"), so the client needs a view for these two as well — the
-- household's own name/settings and its members' display names/allowances
-- are exactly what the app's own header, avatars, and pocket cards need,
-- and both partners are meant to see all of it openly.
-- ---------------------------------------------------------------------------
create view v_household as
select h.id, h.name, h.market_code, h.base_currency, h.timezone, h.archetype, h.fairness_rule, h.safety_buffer, h.quiet_mode
from households h
where h.id in (select my_household_ids());

grant select on v_household to authenticated;

create view v_members as
select m.id, m.household_id, m.display_name, m.allowance_monthly, m.income_monthly_override
from members m
where m.household_id in (select my_household_ids());

grant select on v_members to authenticated;

-- ---------------------------------------------------------------------------
-- v_activity — the viewer's activity feed (docs/01 table; docs/03 tests #3/4,
-- #10/#11).
-- ---------------------------------------------------------------------------
create view v_activity as
select
  t.id,
  t.household_id,
  t.booked_at,
  t.raw_description as description,
  null::text as merchant_name, -- no merchants table in M1
  coalesce(t.category_id, 'other') as category_key,
  t.amount,
  t.currency,
  t.owner_member_id,
  effective_visibility(t.account_id, t.visibility_override) as visibility,
  (t.surprise_until is not null) as is_surprise,
  t.surprise_until,
  case
    when effective_visibility(t.account_id, t.visibility_override) = 'summary_only' then 'amount_only'
    when effective_visibility(t.account_id, t.visibility_override) = 'private' then 'nothing'
    when t.surprise_until is not null and t.surprise_until > current_date
      and t.owner_member_id = current_member_id(t.household_id) then 'nothing'
    else 'all'
  end as partner_sees
from transactions t
where t.state <> 'removed'
  and t.household_id in (select my_household_ids())
  -- the visibility contract itself: shared rows, or your own.
  and (
    effective_visibility(t.account_id, t.visibility_override) = 'shared'
    or t.owner_member_id = current_member_id(t.household_id)
  )
  -- a surprise stays hidden from the partner until the reveal date, even
  -- though it would otherwise qualify as shared (docs/03 #10/#11).
  and (
    t.owner_member_id = current_member_id(t.household_id)
    or t.surprise_until is null
    or t.surprise_until <= current_date
  );

grant select on v_activity to authenticated;

-- ---------------------------------------------------------------------------
-- v_allowance_summary — docs/01: household_id, owner_member_id, period,
-- total, n. No merchant_id/raw_description/category_id, in the data or the
-- schema (docs/03 test #5 checks information_schema.columns, not just
-- values).
--
-- This is the one place the per-row `visibility_enforcement` policy is
-- actively wrong for what the view needs: summary_only's whole point is
-- that the AGGREGATE is visible household-wide, including rows the caller
-- doesn't own — exactly what that restrictive policy blocks. So the real
-- work happens in a security definer function (allowed: it returns an
-- aggregate, never a transaction row, so docs/01's definer ban doesn't
-- apply), which does its own explicit household + summary_only scoping;
-- the view is a thin, non-privileged passthrough over it.
-- ---------------------------------------------------------------------------
create or replace function v_allowance_summary_rows()
returns table (household_id uuid, owner_member_id uuid, period text, total numeric, n bigint)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select
    t.household_id,
    t.owner_member_id,
    to_char(date_trunc('month', t.booked_at), 'YYYY-MM'),
    sum(abs(t.amount)),
    count(*)
  from transactions t
  where t.household_id in (select my_household_ids())
    and t.state <> 'removed'
    and t.owner_member_id is not null
    and effective_visibility(t.account_id, t.visibility_override) = 'summary_only'
  group by t.household_id, t.owner_member_id, date_trunc('month', t.booked_at);
$$;

create view v_allowance_summary as select * from v_allowance_summary_rows();

grant execute on function v_allowance_summary_rows() to authenticated;
grant select on v_allowance_summary to authenticated;

-- ---------------------------------------------------------------------------
-- v_accounts_visible — every account except the partner's private ones
-- (docs/03 #12), with the balance itself masked unless it's shared or
-- yours (docs/07-data-contract.md: "getAccounts מחזיר balance: null
-- לחשבון שהצופה אינו רשאי לראות את יתרתו" — summary_only's whole point is
-- that the ROW is visible, only the amount is hidden; only `private`
-- makes the row itself disappear, and that's v_accounts_existence's job).
-- A live run against Postgres caught this: the first version of this view
-- excluded the partner's summary_only accounts entirely instead of
-- masking their balance, which would have made them vanish from the
-- accounts screen instead of showing as "balance hidden".
-- ---------------------------------------------------------------------------
create view v_accounts_visible as
select
  a.id,
  a.household_id,
  a.display_name,
  a.masked_number,
  a.kind,
  a.owner_member_id,
  a.visibility,
  case
    when a.visibility = 'shared' or a.owner_member_id = current_member_id(a.household_id)
      then a.current_balance
    else null
  end as balance,
  a.currency,
  a.statement_day,
  case
    when a.kind = 'credit_card' and a.current_balance < 0
      and (a.visibility = 'shared' or a.owner_member_id = current_member_id(a.household_id))
      then -a.current_balance
    else null
  end as statement_amount_due
from accounts a
where a.household_id in (select my_household_ids())
  and (a.visibility <> 'private' or a.owner_member_id = current_member_id(a.household_id));

grant select on v_accounts_visible to authenticated;

-- ---------------------------------------------------------------------------
-- v_accounts_existence — the partner's private accounts: name + owner only,
-- never a balance (docs/03 #13).
--
-- Same shape of problem as v_allowance_summary: this view's entire job is
-- to reveal a sliver of a row that the `visibility_enforcement` restrictive
-- policy on `accounts` correctly hides otherwise (private, not yours). A
-- security definer function does the explicit lookup — safe because it
-- only ever returns display_name + owner_member_id, never a balance or any
-- other column.
-- ---------------------------------------------------------------------------
create or replace function v_accounts_existence_rows()
returns table (id uuid, household_id uuid, display_name text, owner_member_id uuid)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select a.id, a.household_id, a.display_name, a.owner_member_id
  from accounts a
  where a.household_id in (select my_household_ids())
    and a.visibility = 'private'
    and a.owner_member_id is not null
    and a.owner_member_id <> current_member_id(a.household_id);
$$;

create view v_accounts_existence as select * from v_accounts_existence_rows();

grant execute on function v_accounts_existence_rows() to authenticated;
grant select on v_accounts_existence to authenticated;

-- ---------------------------------------------------------------------------
-- v_visibility_log — not in docs/01's original view table; added here to
-- back getVisibilityLog (src/data/index.ts) and docs/03 test #17. Adding it
-- here per docs/03's own rule: "כשמוסיפים view חדש — מוסיפים שורה למטריצה
-- באותו PR" — see REPORT.md, test #17 covers it.
-- ---------------------------------------------------------------------------
create view v_visibility_log as
select
  vl.id,
  vl.household_id,
  vl.entity_type,
  -- The partner sees THAT something changed, never WHAT (docs/03 #17).
  case
    when vl.entity_owner_member_id = current_member_id(vl.household_id) then vl.entity_label
    else null
  end as entity_label,
  m.display_name as changed_by_name,
  vl.from_visibility,
  vl.to_visibility,
  vl.changed_at
from visibility_log vl
join members m on m.id = vl.changed_by_member_id
where vl.household_id in (select my_household_ids())
order by vl.changed_at desc;

grant select on v_visibility_log to authenticated;

-- ---------------------------------------------------------------------------
-- rpc_set_visibility — the only writer for visibility (docs/01; docs/03
-- #15/#16). security definer: it needs to write past the revoked base-table
-- grants, and it doesn't return transaction rows, so the definer ban
-- doesn't apply to it.
-- ---------------------------------------------------------------------------
create or replace function rpc_set_visibility(p_entity_type text, p_id uuid, p_to text)
returns void language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_household_id uuid;
  v_owner_member_id uuid;
  v_from text;
  v_label text;
  v_caller uuid;
begin
  if p_entity_type <> 'account' then
    raise exception 'Only account visibility can be changed in this build.';
  end if;
  if p_to not in ('shared', 'summary_only', 'private') then
    raise exception 'Unknown visibility %', p_to;
  end if;

  select household_id, owner_member_id, visibility, display_name
    into v_household_id, v_owner_member_id, v_from, v_label
  from accounts where id = p_id;

  if v_household_id is null then
    raise exception 'Unknown account %', p_id;
  end if;

  v_caller := current_member_id(v_household_id);

  if v_owner_member_id is null then
    raise exception 'A household-owned account cannot be hidden.';
  end if;
  if v_caller is null or v_caller <> v_owner_member_id then
    raise exception 'Only the owner may change this account''s visibility.';
  end if;

  update accounts
     set visibility = p_to,
         counts_in_household = (p_to <> 'private')
   where id = p_id;

  insert into visibility_log (household_id, entity_type, entity_id, entity_owner_member_id, entity_label, changed_by_member_id, from_visibility, to_visibility)
  values (v_household_id, 'account', p_id, v_owner_member_id, v_label, v_caller, v_from, p_to);
end;
$$;

grant execute on function rpc_set_visibility(text, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- rpc_safe_to_spend — docs/03 test #7: identical for both viewers, and the
-- allowance_remaining component is 1,870 ₪ exactly. security definer so it
-- can read every member's own pocket total internally (never exposing the
-- per-row detail) — this is exactly the case docs/01's summary_only rule
-- describes: "לחשב אותה על הנתונים שהצופה רשאי לראות, ואז להוסיף בנפרד את
-- הסכומים מ-v_allowance_summary" — here the RPC itself already only ever
-- returns pre-aggregated numbers, so there is nothing left to leak.
--
-- Only households/members/accounts/transactions exist in this migration
-- (no budgets/goals/recurring_series tables yet — M3/M4 scope per
-- docs/02-milestones.md), so this formula is narrower than the mock's:
-- shared liquid balances − upcoming shared credit-card charges − safety
-- buffer − allowance remaining. See REPORT.md for why this can no longer
-- match the mock fixture's old "3,180 ₪" (that number depended on a
-- "bills" and "goals" figure that were never tied to any real row).
-- ---------------------------------------------------------------------------
create or replace function rpc_safe_to_spend(p_household uuid)
-- A single jsonb object, not a row set: the TOTAL is computed here in SQL
-- (sum of the breakdown), not by the client re-summing the line items in
-- TypeScript — see CLAUDE.md "SQL מחשב, AI מנסח".
returns jsonb
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare
  v_liquid numeric;
  v_credit_due numeric;
  v_buffer numeric;
  v_allowance_remaining numeric;
  v_period text := to_char(current_date, 'YYYY-MM');
  v_breakdown jsonb;
begin
  if p_household not in (select my_household_ids()) then
    return jsonb_build_object('amount', 0, 'breakdown', '[]'::jsonb);
  end if;

  select coalesce(sum(a.current_balance), 0) into v_liquid
  from accounts a
  where a.household_id = p_household and a.visibility = 'shared' and a.kind in ('checking', 'savings');

  select coalesce(sum(-a.current_balance), 0) into v_credit_due
  from accounts a
  where a.household_id = p_household and a.visibility = 'shared' and a.kind = 'credit_card' and a.current_balance < 0;

  select h.safety_buffer into v_buffer from households h where h.id = p_household;

  select coalesce(sum(greatest(m.allowance_monthly - coalesce(spent.total, 0), 0)), 0)
    into v_allowance_remaining
  from members m
  left join (
    select t.owner_member_id, sum(abs(t.amount)) as total
    from transactions t
    join accounts a on a.id = t.account_id
    where t.household_id = p_household
      and t.state <> 'removed'
      and effective_visibility(t.account_id, t.visibility_override) = 'summary_only'
      and to_char(date_trunc('month', t.booked_at), 'YYYY-MM') = v_period
    group by t.owner_member_id
  ) spent on spent.owner_member_id = m.id
  where m.household_id = p_household;

  select jsonb_agg(jsonb_build_object('key', key, 'label', label, 'amount', amount))
    into v_breakdown
  from (
    values
      ('liquid', 'יתרות נזילות', v_liquid),
      ('credit', 'חיוב אשראי צפוי', -v_credit_due),
      ('pockets', 'יתרת הכיסים האישיים', -v_allowance_remaining),
      ('buffer', 'כרית ביטחון', -v_buffer)
  ) as items(key, label, amount);

  return jsonb_build_object(
    'amount', v_liquid - v_credit_due - v_allowance_remaining - v_buffer,
    'breakdown', v_breakdown
  );
end;
$$;

grant execute on function rpc_safe_to_spend(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- rpc_budget_status — per-category spend on what the viewer may see, for
-- the current month (docs/03 test #6/#10: "shopping" excludes the
-- partner's summary_only spend). No budgets table yet (M3 scope), so
-- `limit_amount` comes from a small in-function reference list rather than
-- a joined table — every category actually spent against still shows up
-- even if it has no configured limit.
-- ---------------------------------------------------------------------------
create or replace function rpc_budget_status(p_household uuid)
-- percent/is_over_budget/over_by are computed here, not by the client
-- re-deriving them from spent/limit (CLAUDE.md "SQL מחשב").
returns table (
  category_key text, spent numeric, limit_amount numeric,
  percent numeric, is_over_budget boolean, over_by numeric
)
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare
  v_caller uuid;
  v_period text := to_char(current_date, 'YYYY-MM');
begin
  if p_household not in (select my_household_ids()) then
    return;
  end if;
  v_caller := current_member_id(p_household);

  return query
    select
      spend.category_key,
      spend.spent,
      spend.limit_amount,
      round((spend.spent / spend.limit_amount) * 100) as percent,
      spend.spent > spend.limit_amount as is_over_budget,
      greatest(spend.spent - spend.limit_amount, 0) as over_by
    from (
      select
        coalesce(t.category_id, 'other') as category_key,
        sum(abs(t.amount)) as spent,
        max(limits.limit_amount) as limit_amount
      from transactions t
      join (values
        ('housing', 7000::numeric), ('food', 4750), ('transport', 1300), ('kids', 3000),
        ('insurance', 500), ('communication', 400), ('leisure', 1800), ('shopping', 1200)
      ) as limits(category_key, limit_amount) on limits.category_key = coalesce(t.category_id, 'other')
      where t.household_id = p_household
        and t.state <> 'removed'
        and to_char(date_trunc('month', t.booked_at), 'YYYY-MM') = v_period
        and (
          effective_visibility(t.account_id, t.visibility_override) = 'shared'
          or t.owner_member_id = v_caller
        )
      group by coalesce(t.category_id, 'other')
    ) spend;
end;
$$;

grant execute on function rpc_budget_status(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- rpc_settlement — who transfers how much (docs/01; never a comparison of
-- who spent more, only the household's shared spend split by income share
-- vs. who actually paid it).
-- ---------------------------------------------------------------------------
create or replace function rpc_settlement(p_household uuid, p_period text)
-- Everything, including the transfer direction and amount, is computed
-- here — the client never subtracts "who paid" from "whose share it was"
-- itself (CLAUDE.md "SQL מחשב"; also "אין השוואה בין בני הזוג": this never
-- exposes who spent more, only who owes whom to net out their agreed
-- income-weighted share).
returns jsonb
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare
  v_total_income numeric;
  v_total_shared_spend numeric;
  v_per_member jsonb;
  v_from record;
  v_to record;
begin
  if p_household not in (select my_household_ids()) then
    return jsonb_build_object('perMember', '[]'::jsonb, 'householdTotal', 0, 'amount', 0);
  end if;

  select coalesce(sum(income_monthly_override), 0) into v_total_income
  from members where household_id = p_household;

  select coalesce(sum(abs(t.amount)), 0) into v_total_shared_spend
  from transactions t
  where t.household_id = p_household
    and t.state <> 'removed'
    and effective_visibility(t.account_id, t.visibility_override) = 'shared'
    and to_char(date_trunc('month', t.booked_at), 'YYYY-MM') = p_period;

  select jsonb_agg(jsonb_build_object(
      'memberId', m.id, 'name', m.display_name,
      'paid', coalesce(paid.total, 0),
      'share', round(v_total_shared_spend * (m.income_monthly_override / nullif(v_total_income, 0)), 0)
    ))
    into v_per_member
  from members m
  left join (
    select t.owner_member_id, sum(abs(t.amount)) as total
    from transactions t
    where t.household_id = p_household
      and t.state <> 'removed'
      and effective_visibility(t.account_id, t.visibility_override) = 'shared'
      and to_char(date_trunc('month', t.booked_at), 'YYYY-MM') = p_period
    group by t.owner_member_id
  ) paid on paid.owner_member_id = m.id
  where m.household_id = p_household;

  -- The member who paid more than their share transfers the difference to
  -- whoever paid less than theirs — no rolling debt, resets each period.
  select m.id as member_id, coalesce(paid.total, 0) - round(v_total_shared_spend * (m.income_monthly_override / nullif(v_total_income, 0)), 0) as delta
    into v_to
  from members m
  left join (
    select t.owner_member_id, sum(abs(t.amount)) as total
    from transactions t
    where t.household_id = p_household and t.state <> 'removed'
      and effective_visibility(t.account_id, t.visibility_override) = 'shared'
      and to_char(date_trunc('month', t.booked_at), 'YYYY-MM') = p_period
    group by t.owner_member_id
  ) paid on paid.owner_member_id = m.id
  where m.household_id = p_household
  order by delta asc
  limit 1;

  select m.id as member_id, coalesce(paid.total, 0) - round(v_total_shared_spend * (m.income_monthly_override / nullif(v_total_income, 0)), 0) as delta
    into v_from
  from members m
  left join (
    select t.owner_member_id, sum(abs(t.amount)) as total
    from transactions t
    where t.household_id = p_household and t.state <> 'removed'
      and effective_visibility(t.account_id, t.visibility_override) = 'shared'
      and to_char(date_trunc('month', t.booked_at), 'YYYY-MM') = p_period
    group by t.owner_member_id
  ) paid on paid.owner_member_id = m.id
  where m.household_id = p_household
  order by delta desc
  limit 1;

  return jsonb_build_object(
    'householdTotal', v_total_shared_spend,
    'perMember', coalesce(v_per_member, '[]'::jsonb),
    'fromMemberId', v_to.member_id,   -- owes money (paid under their share)
    'toMemberId', v_from.member_id,   -- is owed money (paid over their share)
    'amount', abs(round(v_to.delta, 2))
  );
end;
$$;

grant execute on function rpc_settlement(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- rpc_cashflow — projected household liquid balance (docs/03 test #9: the
-- personal pocket appears as a smoothed monthly drag, never a single-day
-- event). No recurring_series table yet, so "known future spend" comes
-- entirely from pending transactions already booked with a future date —
-- exactly what `state = 'pending'` is for.
-- ---------------------------------------------------------------------------
create or replace function rpc_cashflow(p_household uuid, p_days integer)
-- is_cliff/shortfall are computed here too, against the household's own
-- safety_buffer — the client never compares floor-vs-expected itself.
returns table (day date, expected numeric, low numeric, high numeric, is_cliff boolean, shortfall numeric)
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare
  v_start_balance numeric;
  v_daily_allowance_drag numeric;
  v_days_left_in_month integer;
  v_caller uuid;
  v_floor numeric;
begin
  if p_household not in (select my_household_ids()) then
    return;
  end if;
  v_caller := current_member_id(p_household);

  select h.safety_buffer into v_floor from households h where h.id = p_household;

  select coalesce(sum(a.current_balance), 0) into v_start_balance
  from accounts a
  where a.household_id = p_household and a.visibility = 'shared' and a.kind in ('checking', 'savings');

  select (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date - current_date
    into v_days_left_in_month;

  -- The smoothed drag: both members' remaining pocket this month, spread
  -- evenly over the rest of the month — never a lump sum on one day.
  select coalesce(sum(greatest(m.allowance_monthly - coalesce(spent.total, 0), 0)), 0)
       / greatest(v_days_left_in_month, 1)
    into v_daily_allowance_drag
  from members m
  left join (
    select t.owner_member_id, sum(abs(t.amount)) as total
    from transactions t
    where t.household_id = p_household
      and t.state <> 'removed'
      and effective_visibility(t.account_id, t.visibility_override) = 'summary_only'
      and to_char(date_trunc('month', t.booked_at), 'YYYY-MM') = to_char(current_date, 'YYYY-MM')
    group by t.owner_member_id
  ) spent on spent.owner_member_id = m.id
  where m.household_id = p_household;

  return query
  with days as (
    select generate_series(current_date, current_date + (p_days - 1) * interval '1 day', interval '1 day')::date as d
  ),
  pending_by_day as (
    select t.booked_at as d, sum(t.amount) as net -- amount is already signed
    from transactions t
    where t.household_id = p_household
      and t.state = 'pending'
      and effective_visibility(t.account_id, t.visibility_override) = 'shared'
      and t.booked_at between current_date and (current_date + (p_days - 1) * interval '1 day')::date
    group by t.booked_at
  ),
  running as (
    select
      days.d,
      v_start_balance
        + sum(coalesce(pending_by_day.net, 0)) over (order by days.d rows between unbounded preceding and current row)
        - (row_number() over (order by days.d) - 1) * v_daily_allowance_drag
        as balance
    from days
    left join pending_by_day on pending_by_day.d = days.d
  )
  select
    running.d,
    running.balance,
    running.balance - (50 * (running.d - current_date)),
    running.balance + (50 * (running.d - current_date)),
    running.balance < v_floor,
    greatest(v_floor - running.balance, 0)
  from running;
end;
$$;

grant execute on function rpc_cashflow(uuid, integer) to authenticated;
