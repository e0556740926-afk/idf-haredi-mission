-- Test-only shim that stands in for what Supabase's own platform provides
-- at runtime (GoTrue's auth.uid()/auth.jwt(), the anon/authenticated/
-- service_role roles). NEVER goes into supabase/migrations/ — a real
-- Supabase project already has all of this; this file only exists so the
-- leak matrix can run against plain Postgres in an environment where
-- `supabase start` itself is blocked (see REPORT.md "חיבור מסד נתונים").

create schema if not exists auth;

-- Extended slightly beyond the bare {id, email} Duet asked for: this
-- session's supabase/seed.sql (written before this test shim existed)
-- inserts into auth.users/auth.identities with the columns a real GoTrue
-- instance provides, so the shim grows just enough columns (all
-- nullable/defaulted) for that same, unmodified seed.sql to run — it does
-- not change what auth.uid()/auth.jwt() do or add any new authorization
-- surface.
create table if not exists auth.users (
  id uuid primary key,
  instance_id uuid,
  aud text,
  role text,
  email text unique,
  encrypted_password text,
  email_confirmed_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  confirmation_token text,
  recovery_token text,
  email_change_token_new text,
  email_change text
);

create table if not exists auth.identities (
  id uuid primary key default gen_random_uuid(),
  provider_id text,
  user_id uuid references auth.users (id) on delete cascade,
  identity_data jsonb,
  provider text,
  last_sign_in_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (provider, provider_id)
);

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
$$;

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb, '{}'::jsonb)
$$;

-- Role creation needs CREATEROLE (superuser locally). In a real Supabase
-- project these three roles already exist before any migration runs; here
-- a one-time `create role` as the cluster superuser stands in for that —
-- see REPORT.md "חיבור מסד נתונים" for the exact command. Re-running this
-- file is safe either way (the DO block below is idempotent when the
-- roles already exist).
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon')
    then create role anon nologin noinherit; end if;
  if not exists (select from pg_roles where rolname = 'authenticated')
    then create role authenticated nologin noinherit; end if;
  if not exists (select from pg_roles where rolname = 'service_role')
    then create role service_role nologin noinherit bypassrls; end if;
exception when insufficient_privilege then
  raise notice 'Skipping role creation (no CREATEROLE) — assuming anon/authenticated/service_role already exist.';
end $$;

grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant execute on function auth.jwt() to anon, authenticated;
