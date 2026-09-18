#!/usr/bin/env bash
# Rebuilds a throwaway local Postgres database and runs the full RLS/leak
# suite against it directly via psql — no Docker, no PostgREST, no GoTrue.
#
# Why this exists: `supabase start` needs Docker to pull postgres/gotrue/
# postgrest/kong images, which is blocked in this sandbox (see REPORT.md
# §8). Everything the 22-row leak matrix (docs/03-visibility-tests.md)
# actually needs — real RLS, real REVOKEs, real `SET LOCAL ROLE` +
# `SET LOCAL request.jwt.claims` impersonation — works against a plain
# local Postgres cluster. `supabase/test/00_auth_shim.sql` stands in for
# GoTrue/PostgREST just enough to make that true; it is test-only and must
# never be copied into supabase/migrations/.
#
# One-time setup this script assumes already happened (documented in
# REPORT.md §8, not repeated here since it needs a superuser once):
#   sudo -u postgres createuser -s ... is NOT what we did — we created a
#   plain (non-superuser) app_owner role so FORCE ROW LEVEL SECURITY would
#   have been tested honestly had it stayed. See REPORT.md for the exact
#   `createuser`/`createdb`/`grant` commands.
set -euo pipefail
cd "$(dirname "$0")/../.."

DB=duet_test
export PGPASSWORD=app_owner

dropdb -h 127.0.0.1 -U app_owner --if-exists "$DB"
createdb -h 127.0.0.1 -U app_owner "$DB"

psql -h 127.0.0.1 -U app_owner -d "$DB" -v ON_ERROR_STOP=1 -f supabase/test/00_auth_shim.sql
psql -h 127.0.0.1 -U app_owner -d "$DB" -v ON_ERROR_STOP=1 -f supabase/migrations/0001_core_schema.sql
psql -h 127.0.0.1 -U app_owner -d "$DB" -v ON_ERROR_STOP=1 -f supabase/migrations/0002_views_and_rpcs.sql
# seed.sql inserts into auth.users/households/... with elevated privilege,
# exactly like a real Supabase seed does — app_owner alone can't (no
# INSERT policy on RLS-enabled tables), so this one step needs superuser.
# `postgres` only has peer auth locally (see pg_hba.conf), not a TCP
# password, so this runs over the unix socket via sudo instead of -h/-U.
sudo -u postgres psql -d "$DB" -v ON_ERROR_STOP=1 -f supabase/seed.sql

sudo -u postgres psql -d "$DB" -c "grant anon, authenticated, service_role to app_owner;"

echo "--- running 22-row leak matrix ---"
psql -h 127.0.0.1 -U app_owner -d "$DB" -f supabase/test/run_leak_matrix.sql
