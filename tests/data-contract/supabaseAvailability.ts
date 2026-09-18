/**
 * D5 (dual-adapter contract tests) needs a live local Supabase instance —
 * `npx supabase start` — to run the supabase/ side at all. This sandboxed
 * session could not run that (its Docker registry access is blocked by
 * organization policy; see REPORT.md "חיבור מסד נתונים" gate result), so
 * this probe exists to make the dual-adapter tests SKIP with a clear
 * reason when no instance is reachable, rather than silently reporting a
 * false green or hard-failing CI on machines that also don't have Docker.
 * On a machine with `supabase start` actually running, this resolves true
 * and the exact same test bodies run for real against Postgres.
 */
export async function isSupabaseReachable(): Promise<boolean> {
  const url = import.meta.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
  try {
    const response = await fetch(`${url}/auth/v1/health`, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}
