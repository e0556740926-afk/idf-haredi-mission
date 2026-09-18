-- Manual run of docs/03-visibility-tests.md's 22-row leak matrix against a
-- real (non-superuser-owned, FORCE ROW LEVEL SECURITY) Postgres instance.
-- Connect as app_owner; each test impersonates a real seeded user via
-- SET LOCAL ROLE authenticated + SET LOCAL request.jwt.claims, inside its
-- own transaction, rolled back after (docs/03: never service_role).

\set ON_ERROR_STOP off
\pset pager off

-- Real ids from this database, per REPORT.md §7.
\set dana_user '\'11111111-1111-1111-1111-111111111111\''
\set yoav_user '\'22222222-2222-2222-2222-222222222222\''
\set stranger_user '\'33333333-3333-3333-3333-333333333333\''

\echo '=== #1: select * from transactions as yoav -> expect permission error ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select * from transactions;
rollback;

\echo '=== #2: select * from accounts as yoav -> expect permission error ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select * from accounts;
rollback;

\echo '=== #3: v_activity as yoav -> 5 rows, none of danas non-shared ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select count(*) as row_count from v_activity;
select id, description, owner_member_id, visibility from v_activity order by booked_at desc;
select count(*) as leaked_dana_rows from v_activity
  where owner_member_id = (select id from v_members where display_name = 'דנה') and visibility <> 'shared';
rollback;

\echo '=== #4: v_activity as dana ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select count(*) as row_count from v_activity;
select count(*) as leaked_yoav_rows from v_activity
  where owner_member_id = (select id from v_members where display_name = 'יואב') and visibility <> 'shared';
rollback;

\echo '=== #5: v_allowance_summary as yoav -> total 1290, n 5; schema has no forbidden columns ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select * from v_allowance_summary;
rollback;
select count(*) as forbidden_columns_in_view
from information_schema.columns
where table_name = 'v_allowance_summary'
  and column_name in ('merchant_id', 'raw_description', 'category_id');

\echo '=== #6: rpc_budget_status as yoav -> shopping excludes danas 390 ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select category_key, spent, limit_amount from rpc_budget_status(
  (select household_id from v_members where display_name='יואב')
);
rollback;

\echo '=== #7: rpc_safe_to_spend as dana and yoav -> identical, pockets = -1870 ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select rpc_safe_to_spend((select id from v_household)) as dana_result;
rollback;
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select rpc_safe_to_spend((select id from v_household)) as yoav_result;
rollback;

\echo '=== #8: search analog for "זארה" as yoav (timing) ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
\timing on
select count(*) from v_activity where description ilike '%זארה%';
select count(*) from v_activity where description ilike '%לא-קיים-בכלל-xyz%';
\timing off
rollback;

\echo '=== #9: rpc_cashflow as yoav -> smoothed drag, not a lump sum ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select day, expected, expected - lag(expected) over (order by day) as day_over_day_change
from rpc_cashflow((select id from v_household), 14)
order by day;
rollback;

\echo '=== #10/#11: surprise gift — hidden from yoav, counted in total; visible to dana ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select count(*) as should_be_zero from v_activity where description = 'מתנת יום הולדת ליואב';
select total from v_allowance_summary where total = 1290;
rollback;
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select count(*) as should_be_one from v_activity where description = 'מתנת יום הולדת ליואב';
rollback;

\echo '=== #12/#13: private account — absent from v_accounts_visible, existence-only elsewhere ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select count(*) as should_be_zero from v_accounts_visible where display_name = 'חשבון מלפני הזוגיות';
select * from v_accounts_existence where display_name = 'חשבון מלפני הזוגיות';
rollback;

\echo '=== #14: private balance not counted in Safe to Spend ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select rpc_safe_to_spend((select id from v_household)) as result_should_not_reference_9400;
rollback;

\echo '=== #15: rpc_set_visibility on danas account as yoav -> expect failure ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select rpc_set_visibility('account', (select id from v_accounts_visible where display_name = 'עו״ש דנה — לאומי'), 'shared');
rollback;

\echo '=== #16: same call as dana -> success + visibility_log row ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select rpc_set_visibility('account', (select id from v_accounts_visible where display_name = 'עו״ש דנה — לאומי'), 'shared');
select entity_type, from_visibility, to_visibility from v_visibility_log order by changed_at desc limit 1;
rollback;

\echo '=== #17: visibility_log as yoav -> sees change happened, not the label ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select rpc_set_visibility('account', (select id from v_accounts_visible where display_name = 'עו״ש דנה — לאומי'), 'shared');
rollback;
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select rpc_set_visibility('account', (select id from v_accounts_visible where display_name = 'עו״ש דנה — לאומי'), 'shared');
commit;
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select entity_type, entity_label, to_visibility from v_visibility_log order by changed_at desc limit 1;
rollback;
-- revert the committed change so re-running this file is idempotent
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select rpc_set_visibility('account', (select id from v_accounts_visible where display_name = 'עו״ש דנה — לאומי'), 'summary_only');
commit;

\echo '=== #18: household isolation — every view/RPC as a stranger returns zero ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
select
  (select count(*) from v_activity) as activity,
  (select count(*) from v_allowance_summary) as allowance,
  (select count(*) from v_accounts_visible) as accounts_visible,
  (select count(*) from v_accounts_existence) as accounts_existence,
  (select count(*) from v_visibility_log) as visibility_log;
rollback;

\echo '=== #19/#20/#21/#22: not applicable — no export/alerts/AI/ritual-agenda feature exists in this build ==='
select 'not applicable, see REPORT.md' as note;
