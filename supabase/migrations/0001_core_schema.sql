-- Duet — core schema (M1: households, members, accounts, transactions, visibility_log)
-- docs/01-data-model.md is the source of truth for every column and constraint here.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  market_code text not null default 'IL',
  base_currency text not null default 'ILS',
  timezone text not null default 'Asia/Jerusalem',
  locale text not null default 'he-IL',
  archetype text not null check (archetype in ('one_pot', 'three_pots', 'separate', 'asymmetric')),
  fairness_rule jsonb not null default '{"type":"none"}'::jsonb,
  safety_buffer numeric(14, 2) not null default 0,
  quiet_mode jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
create table members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  display_name text not null,
  role text not null default 'partner' check (role in ('partner', 'dependent', 'advisor')),
  allowance_monthly numeric(12, 2),
  income_monthly_override numeric(12, 2),
  locale text default 'he-IL',
  channels jsonb default '{}'::jsonb,
  unique (household_id, user_id)
);

create index members_household_id_idx on members (household_id);

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------
create table accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  connection_id uuid, -- nullable: manual account. connections table is out of M1 scope.
  owner_member_id uuid references members (id) on delete set null,
  visibility text not null default 'private' check (visibility in ('shared', 'summary_only', 'private')),
  counts_in_household boolean not null default true,
  kind text not null check (kind in ('checking', 'savings', 'credit_card', 'loan', 'manual')),
  currency text not null default 'ILS',
  display_name text not null,
  masked_number text,
  current_balance numeric(14, 2),
  available_balance numeric(14, 2),
  credit_limit numeric(14, 2),
  statement_day smallint,
  is_active boolean not null default true,

  -- A household-owned account cannot be hidden.
  check (owner_member_id is not null or visibility = 'shared'),
  -- private always drops out of the household total, and only private does.
  check (visibility <> 'private' or counts_in_household = false),
  check (visibility = 'private' or counts_in_household = true)
);

create index accounts_household_id_idx on accounts (household_id);
create index accounts_owner_member_id_idx on accounts (owner_member_id);

-- ---------------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------------
create table transactions (
  id uuid primary key default gen_random_uuid(), -- internal id, never the provider's
  household_id uuid not null references households (id) on delete cascade,
  account_id uuid not null references accounts (id) on delete cascade,
  provider_txn_id text,
  fingerprint text, -- normalized date+amount+description, for dedup (M6)
  state text not null default 'booked' check (state in ('pending', 'booked', 'removed')),
  booked_at date not null,
  value_at date,
  amount numeric(14, 2) not null, -- negative = expense
  currency text not null default 'ILS',
  original_amount numeric(14, 2),
  original_currency text,
  fx_rate numeric(14, 8),
  raw_description text not null,
  merchant_id uuid,
  mcc text,
  category_id text, -- simplified to a text key; the full categories table is out of M1 scope.
  category_source text,
  category_confidence numeric(3, 2),
  kind text not null default 'expense' check (kind in ('expense', 'income', 'internal_transfer', 'fee', 'refund')),
  is_counted boolean not null default true,
  transfer_pair_id uuid,
  statement_id uuid,
  installment_plan_id uuid,
  refund_of_txn_id uuid,
  recurring_series_id uuid,
  owner_member_id uuid references members (id) on delete set null,
  visibility_override text check (visibility_override in ('shared', 'summary_only', 'private')), -- null = inherit from account
  surprise_until date,
  note text,
  tags text[],

  unique (account_id, provider_txn_id)
);

create index transactions_household_booked_at_idx on transactions (household_id, booked_at desc);
create index transactions_household_fingerprint_idx on transactions (household_id, fingerprint);
create index transactions_account_id_idx on transactions (account_id);

-- ---------------------------------------------------------------------------
-- visibility_log
-- ---------------------------------------------------------------------------
create table visibility_log (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  entity_type text not null check (entity_type in ('account', 'transaction')),
  entity_id uuid not null,
  entity_owner_member_id uuid not null references members (id) on delete cascade,
  -- Captured at write time (by rpc_set_visibility) so the redaction in
  -- v_visibility_log never has to join back to accounts/transactions —
  -- see docs/03-visibility-tests.md #17.
  entity_label text not null,
  changed_by_member_id uuid not null references members (id) on delete cascade,
  from_visibility text not null check (from_visibility in ('shared', 'summary_only', 'private')),
  to_visibility text not null check (to_visibility in ('shared', 'summary_only', 'private')),
  changed_at timestamptz not null default now()
);

create index visibility_log_household_id_idx on visibility_log (household_id, changed_at desc);

-- ---------------------------------------------------------------------------
-- helper functions (docs/01-data-model.md)
-- ---------------------------------------------------------------------------

-- The current member in the context of a household.
create or replace function current_member_id(p_household uuid)
returns uuid language sql stable security definer
set search_path = public, pg_temp
as $$
  select id from members where user_id = auth.uid() and household_id = p_household limit 1;
$$;

-- All household ids the caller belongs to. security definer so that RLS
-- policies can use it without re-triggering RLS on members recursively.
create or replace function my_household_ids()
returns setof uuid language sql stable security definer
set search_path = public, pg_temp
as $$
  select household_id from members where user_id = auth.uid();
$$;

-- The effective visibility of a transaction: its own override, else the account's.
create or replace function effective_visibility(p_account uuid, p_override text)
returns text language sql stable security definer
set search_path = public, pg_temp
as $$
  select coalesce(p_override, (select visibility from accounts where id = p_account));
$$;

grant execute on function current_member_id(uuid) to authenticated;
grant execute on function my_household_ids() to authenticated;
grant execute on function effective_visibility(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- RLS is the LAST line of defense here, not the only one (CLAUDE.md). The
-- PRIMARY defense is that anon/authenticated have ZERO grants on these
-- tables at all (see the revokes at the bottom) — a raw `select` fails
-- with a permission error before RLS is ever evaluated, regardless of
-- what the policies below say. Every v_*/rpc_* object also does its own
-- explicit `household_id in (select my_household_ids())` (+ visibility)
-- filtering in its body, so it is correct on its own terms independent of
-- RLS too.
--
-- None of these tables use FORCE ROW LEVEL SECURITY, and that is
-- deliberate, not an oversight — two real bugs, found only by actually
-- running this against Postgres (this schema could not be exercised
-- against a live database until this round; see REPORT.md "חיבור מסד
-- נתונים"), are why:
--
--   1. my_household_ids()/current_member_id() are security definer
--      functions, owned by the table owner, that read `members` to
--      answer "who am I". FORCEing RLS on `members` makes even the
--      owner subject to its household_isolation policy — which itself
--      calls my_household_ids() — so evaluating the policy calls the
--      function calls the policy calls the function... "stack depth
--      limit exceeded" inside my_household_ids(), 100% reproducible.
--   2. v_allowance_summary_rows(), v_accounts_existence_rows(), and
--      every rpc_* below are ALSO security definer, and each needs to
--      read past the per-row `visibility_enforcement` restriction on
--      purpose (that IS the point of an aggregate/RPC: summary_only's
--      total is visible household-wide, and Safe to Spend/settlement
--      need every member's numbers to produce one shared answer). FORCE
--      would apply that restrictive policy to these functions too, since
--      they're owned by the same table-owning role — silently dropping
--      the partner's rows out of the aggregate instead of erroring, an
--      even worse failure mode than the recursion (a real leak in the
--      opposite direction: not "shows too much" but "the summary_only
--      promise breaks and Safe to Spend stops being the same number for
--      both partners"). Confirmed live: v_allowance_summary queried as
--      Yoav returned only his own row instead of Dana's summary until
--      FORCE was removed.
--
-- Without FORCE, the table-owning role's own queries — i.e. exactly
-- these functions, and nothing a client can reach, since authenticated/
-- anon have no grant on the tables regardless — bypass RLS as normal
-- Postgres owner semantics, which is what both problems needed. RLS
-- stays ENABLED on every table below as real, live protection for the
-- day a future migration adds a narrower direct grant to a table (a
-- non-owner role would still be fully subject to these policies then);
-- it just isn't the mechanism doing the enforcement work today.

alter table households enable row level security;
alter table members enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table visibility_log enable row level security;

create policy household_isolation on households for select
  using (id in (select my_household_ids()));

create policy household_isolation on members for select
  using (household_id in (select my_household_ids()));

create policy household_isolation on accounts for select
  using (household_id in (select my_household_ids()));

-- RESTRICTIVE: standard (permissive) policies for the same command OR
-- together in Postgres, which would let household_isolation alone grant
-- access to every row regardless of visibility. A restrictive policy is
-- ANDed with the permissive ones instead, which is what actually enforces
-- "shared, or yours" — docs/01-data-model.md's "שתי המדיניות מצטברות (AND)"
-- is only true with `as restrictive`; two plain policies would OR.
create policy visibility_enforcement on accounts as restrictive for select
  using (
    visibility = 'shared'
    or owner_member_id = current_member_id(household_id)
  );

create policy household_isolation on transactions for select
  using (household_id in (select my_household_ids()));

create policy visibility_enforcement on transactions as restrictive for select
  using (
    effective_visibility(account_id, visibility_override) = 'shared'
    or owner_member_id = current_member_id(household_id)
  );

-- rpc_set_visibility is the only writer; it runs security definer, so no
-- INSERT/UPDATE/DELETE policies are needed here for normal app use.

-- The partner sees THAT something changed, never WHAT (docs/03 test #17).
-- No visibility restriction is needed at the RLS layer: every row here is
-- already limited to "an account or transaction visibility flip happened",
-- never the account's contents. The WHAT-was-it redaction (entity_label)
-- happens in v_visibility_log, not here.
create policy household_isolation on visibility_log for select
  using (household_id in (select my_household_ids()));

-- ---------------------------------------------------------------------------
-- Revoke everything on tables that hold money or PII. The only path in is
-- v_* views and rpc_* functions (docs/01-data-model.md, CLAUDE.md rule 1).
-- ---------------------------------------------------------------------------
revoke all on table households from anon, authenticated;
revoke all on table members from anon, authenticated;
revoke all on table accounts from anon, authenticated;
revoke all on table transactions from anon, authenticated;
revoke all on table visibility_log from anon, authenticated;
