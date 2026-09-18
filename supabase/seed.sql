-- Duet — local seed data. Mirrors src/data/fixtures/* and docs/05-seed-data.md
-- as closely as the M1 schema (households/members/accounts/transactions/
-- visibility_log only) allows. See REPORT.md "חיבור מסד נתונים" for the
-- handful of places where a number had to change because it depended on a
-- table (budgets/goals/recurring_series) that doesn't exist yet.

do $$
declare
  v_household_id uuid;
  v_dana_user_id uuid := '11111111-1111-1111-1111-111111111111';
  v_yoav_user_id uuid := '22222222-2222-2222-2222-222222222222';
  v_stranger_user_id uuid := '33333333-3333-3333-3333-333333333333';
  v_dana_id uuid;
  v_yoav_id uuid;
  v_stranger_household_id uuid;
  v_stranger_member_id uuid;
  v_joint_checking uuid;
  v_joint_credit uuid;
  v_joint_savings uuid;
  v_dana_checking uuid;
  v_yoav_checking uuid;
  v_dana_private uuid;
begin
  -- ---------------------------------------------------------------------
  -- auth.users — docs/05-seed-data.md: dana@duet.test / yoav@duet.test,
  -- password duet1234 for both. Local-dev-only password hashing via
  -- pgcrypto's bf (bcrypt) — never done this way against a real project.
  -- ---------------------------------------------------------------------
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values
    (v_dana_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'dana@duet.test', crypt('duet1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}',
     '{}', now(), now(), '', '', '', ''),
    (v_yoav_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'yoav@duet.test', crypt('duet1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}',
     '{}', now(), now(), '', '', '', ''),
    (v_stranger_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'stranger@duet.test', crypt('duet1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}',
     '{}', now(), now(), '', '', '', '')
  on conflict (id) do nothing;

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values
    (gen_random_uuid(), v_dana_user_id::text, v_dana_user_id,
     jsonb_build_object('sub', v_dana_user_id::text, 'email', 'dana@duet.test'), 'email', now(), now(), now()),
    (gen_random_uuid(), v_yoav_user_id::text, v_yoav_user_id,
     jsonb_build_object('sub', v_yoav_user_id::text, 'email', 'yoav@duet.test'), 'email', now(), now(), now()),
    (gen_random_uuid(), v_stranger_user_id::text, v_stranger_user_id,
     jsonb_build_object('sub', v_stranger_user_id::text, 'email', 'stranger@duet.test'), 'email', now(), now(), now())
  on conflict (provider, provider_id) do nothing;

  -- ---------------------------------------------------------------------
  -- households + members
  -- ---------------------------------------------------------------------
  insert into households (name, market_code, base_currency, timezone, archetype, fairness_rule, safety_buffer)
  values ('דנה ויואב', 'IL', 'ILS', 'Asia/Jerusalem', 'three_pots', '{"type":"income"}'::jsonb, 2000)
  returning id into v_household_id;

  insert into members (household_id, user_id, display_name, allowance_monthly, income_monthly_override)
  values (v_household_id, v_dana_user_id, 'דנה', 2500, 18400)
  returning id into v_dana_id;

  insert into members (household_id, user_id, display_name, allowance_monthly, income_monthly_override)
  values (v_household_id, v_yoav_user_id, 'יואב', 2500, 14200)
  returning id into v_yoav_id;

  -- A second, unrelated household so leak test #18 (isolation) has someone
  -- to try to see across the boundary.
  insert into households (name, market_code, base_currency, timezone, archetype, fairness_rule, safety_buffer)
  values ('בית זר', 'IL', 'ILS', 'Asia/Jerusalem', 'one_pot', '{"type":"none"}'::jsonb, 0)
  returning id into v_stranger_household_id;

  insert into members (household_id, user_id, display_name, allowance_monthly)
  values (v_stranger_household_id, v_stranger_user_id, 'זרה', 0)
  returning id into v_stranger_member_id;

  -- ---------------------------------------------------------------------
  -- accounts — docs/05-seed-data.md
  -- ---------------------------------------------------------------------
  insert into accounts (household_id, owner_member_id, visibility, counts_in_household, kind, currency, display_name, masked_number, current_balance, statement_day)
  values (v_household_id, null, 'shared', true, 'checking', 'ILS', 'עו״ש משותף — הפועלים', '4471', 12430, null)
  returning id into v_joint_checking;

  insert into accounts (household_id, owner_member_id, visibility, counts_in_household, kind, currency, display_name, masked_number, current_balance, statement_day)
  values (v_household_id, null, 'shared', true, 'credit_card', 'ILS', 'כרטיס אשראי משותף — כאל', '8820', -8740, 10)
  returning id into v_joint_credit;

  insert into accounts (household_id, owner_member_id, visibility, counts_in_household, kind, currency, display_name, masked_number, current_balance, statement_day)
  values (v_household_id, null, 'shared', true, 'savings', 'ILS', 'חיסכון משותף', '2015', 41200, null)
  returning id into v_joint_savings;

  insert into accounts (household_id, owner_member_id, visibility, counts_in_household, kind, currency, display_name, masked_number, current_balance, statement_day)
  values (v_household_id, v_dana_id, 'summary_only', true, 'checking', 'ILS', 'עו״ש דנה — לאומי', '3390', 6120, null)
  returning id into v_dana_checking;

  insert into accounts (household_id, owner_member_id, visibility, counts_in_household, kind, currency, display_name, masked_number, current_balance, statement_day)
  values (v_household_id, v_yoav_id, 'summary_only', true, 'checking', 'ILS', 'עו״ש יואב — דיסקונט', '7702', 4980, null)
  returning id into v_yoav_checking;

  insert into accounts (household_id, owner_member_id, visibility, counts_in_household, kind, currency, display_name, masked_number, current_balance, statement_day)
  values (v_household_id, v_dana_id, 'private', false, 'checking', 'ILS', 'חשבון מלפני הזוגיות', '1187', 9400, null)
  returning id into v_dana_private;

  -- ---------------------------------------------------------------------
  -- transactions — the eight "key" shared/summary_only rows from
  -- docs/05-seed-data.md, at face value.
  --
  -- owner_member_id on a SHARED transaction means "who personally paid it"
  -- (the schema allows this: only a NON-shared row is required to have an
  -- owner). It powers rpc_settlement's "who paid" figures without needing
  -- a separate ledger. It has no bearing on visibility for shared rows.
  -- ---------------------------------------------------------------------

  -- Shared, in the activity feed for both.
  insert into transactions (household_id, account_id, state, booked_at, amount, raw_description, category_id, kind, owner_member_id)
  values
    (v_household_id, v_joint_credit, 'booked', '2026-09-16', -412, 'שופרסל דיל', 'food', 'expense', v_dana_id),
    (v_household_id, v_joint_credit, 'booked', '2026-09-15', -290, 'דלק — פז', 'transport', 'expense', v_yoav_id),
    (v_household_id, v_joint_credit, 'booked', '2026-09-15', -231, 'חדר כושר', 'leisure', 'expense', v_yoav_id),
    (v_household_id, v_joint_credit, 'booked', '2026-09-14', -168, 'משלוח אוכל — וולט', 'food', 'expense', v_dana_id);

  -- Dana's summary_only pocket — 3 in the feed, 2 earlier in the month
  -- (docs/05: 5 actions, 1,290 ₪ total). The feed is simply a booked_at
  -- window query (see v_activity); nothing marks these as "hidden".
  insert into transactions (household_id, account_id, state, booked_at, amount, raw_description, category_id, kind, owner_member_id, surprise_until)
  values
    (v_household_id, v_dana_checking, 'booked', '2026-09-16', -38, 'בית קפה', 'leisure', 'expense', v_dana_id, null),
    (v_household_id, v_dana_checking, 'booked', '2026-09-12', -390, 'זארה', 'shopping', 'expense', v_dana_id, null),
    (v_household_id, v_dana_checking, 'booked', '2026-09-05', -720, 'מתנת יום הולדת ליואב', 'gifts', 'expense', v_dana_id, '2026-10-08'),
    (v_household_id, v_dana_checking, 'booked', '2026-09-03', -64, 'מונית', 'transport', 'expense', v_dana_id, null),
    (v_household_id, v_dana_checking, 'booked', '2026-09-07', -78, 'פארם', 'leisure', 'expense', v_dana_id, null);

  -- Yoav's summary_only pocket — 1 in the feed, 5 earlier (docs/05: 6
  -- actions, 1,840 ₪ total).
  insert into transactions (household_id, account_id, state, booked_at, amount, raw_description, category_id, kind, owner_member_id)
  values
    (v_household_id, v_yoav_checking, 'booked', '2026-09-13', -220, 'ארוחה עם חברים', 'leisure', 'expense', v_yoav_id),
    (v_household_id, v_yoav_checking, 'booked', '2026-09-04', -549, 'אוזניות', 'shopping', 'expense', v_yoav_id),
    (v_household_id, v_yoav_checking, 'booked', '2026-09-06', -320, 'דלק לטיול', 'transport', 'expense', v_yoav_id),
    (v_household_id, v_yoav_checking, 'booked', '2026-09-08', -264, 'מסעדה עם עמיתים', 'leisure', 'expense', v_yoav_id),
    (v_household_id, v_yoav_checking, 'booked', '2026-09-10', -300, 'ציוד ריצה', 'shopping', 'expense', v_yoav_id),
    (v_household_id, v_yoav_checking, 'booked', '2026-09-11', -187, 'ספרים', 'shopping', 'expense', v_yoav_id);

  -- ---------------------------------------------------------------------
  -- Shared household bills and variable spend, booked earlier this month.
  -- Amounts for the individually-named commitments are exactly
  -- docs/05-seed-data.md's list; the three grocery-style "filler" rows
  -- below exist to make the category totals and rpc_settlement's paid
  -- amounts land on real, disclosed numbers (see REPORT.md) rather than
  -- inventing unexplained totals — every category and paid-by total
  -- traces back to a real row here.
  -- ---------------------------------------------------------------------
  insert into transactions (household_id, account_id, state, booked_at, amount, raw_description, category_id, kind, owner_member_id)
  values
    (v_household_id, v_joint_checking, 'booked', '2026-09-01', -6200, 'שכר דירה', 'housing', 'expense', v_dana_id),
    (v_household_id, v_joint_checking, 'booked', '2026-09-05', -2450, 'גן ומעון', 'kids', 'expense', v_yoav_id),
    (v_household_id, v_joint_checking, 'booked', '2026-09-12', -312, 'ביטוח רכב', 'insurance', 'expense', v_dana_id),
    (v_household_id, v_joint_checking, 'booked', '2026-09-05', -650, 'רמי לוי', 'food', 'expense', v_dana_id),
    (v_household_id, v_joint_checking, 'booked', '2026-09-09', -600, 'מעדניה', 'food', 'expense', v_dana_id),
    (v_household_id, v_joint_credit, 'booked', '2026-09-12', -608, 'שופרסל אונליין', 'food', 'expense', v_dana_id),
    (v_household_id, v_joint_credit, 'booked', '2026-09-20', -520, 'ויקטורי', 'food', 'expense', v_yoav_id),
    (v_household_id, v_joint_credit, 'booked', '2026-09-22', -400, 'יינות ביתן', 'food', 'expense', v_yoav_id),
    (v_household_id, v_joint_credit, 'booked', '2026-09-24', -172.2, 'מכולת השכונה', 'food', 'expense', v_yoav_id);

  -- Pending shared bills — dated in the remainder of the month/quarter,
  -- state='pending' (they haven't posted yet as of "today", 2026-09-17).
  -- These are what rpc_cashflow projects forward; there is no separate
  -- "recurring_series" or "future transaction" concept needed for that.
  insert into transactions (household_id, account_id, state, booked_at, amount, raw_description, category_id, kind, owner_member_id)
  values
    (v_household_id, v_joint_checking, 'pending', '2026-09-18', -148, 'סלולר פרטנר', 'communication', 'expense', v_yoav_id),
    (v_household_id, v_joint_checking, 'pending', '2026-09-18', -99, 'אינטרנט בזק', 'communication', 'expense', v_yoav_id),
    (v_household_id, v_joint_checking, 'pending', '2026-09-20', -150, 'ועד בית', 'housing', 'expense', v_dana_id),
    (v_household_id, v_joint_credit, 'pending', '2026-09-22', -54.90, 'נטפליקס', 'leisure', 'expense', v_yoav_id),
    (v_household_id, v_joint_credit, 'pending', '2026-09-22', -34.90, 'ספוטיפיי', 'leisure', 'expense', v_yoav_id),
    (v_household_id, v_joint_checking, 'pending', '2026-09-25', -480, 'חשמל', 'housing', 'expense', v_yoav_id),
    (v_household_id, v_joint_checking, 'pending', '2026-09-27', -180, 'מים', 'housing', 'expense', v_yoav_id),
    (v_household_id, v_joint_checking, 'pending', '2026-09-28', -640, 'ארנונה', 'housing', 'expense', v_dana_id),
    -- Estimated variable spend for the rest of the projection window, so
    -- the balance right before the 10/10 credit-card charge lands on the
    -- 7,310 ₪ docs/05-seed-data.md's cashflow section names explicitly.
    (v_household_id, v_joint_checking, 'pending', '2026-10-05', -1463.2, 'הוצאות משתנות (אומדן)', 'variable', 'expense', v_dana_id),
    (v_household_id, v_joint_credit, 'pending', '2026-10-10', -8740, 'כאל — חיוב אשראי', 'housing', 'fee', null);

end $$;
