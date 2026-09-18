import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/**
 * Lazy on purpose: this whole module is statically imported by
 * src/data/index.ts regardless of VITE_DATA_SOURCE (so the mock/supabase
 * choice can be a simple ternary there), so importing it must never throw
 * — only calling it should, and only when supabase mode is actually
 * selected without the env vars it needs.
 */
function client(): SupabaseClient {
  if (cached) return cached;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required when VITE_DATA_SOURCE=supabase. ' +
        'Run `npx supabase start` and copy its printed API URL / anon key into .env.local.',
    );
  }
  cached = createClient(url, anonKey);
  return cached;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(client(), prop, receiver);
  },
});
