import { supabase } from './client';
import type { MemberId } from '../types';

/**
 * docs/05-seed-data.md: both seeded users share the password `duet1234`.
 * Real production sign-in obviously wouldn't hardcode a password lookup
 * like this — this exists only so the dev-only viewer switch (D7) can
 * become a real sign-out/sign-in instead of a fake local id swap once
 * VITE_DATA_SOURCE=supabase. There is no such switch in production
 * (src/app/AppLayout.tsx already gates it on import.meta.env.DEV).
 */
const DEV_EMAILS: Record<MemberId, string> = {
  dana: 'dana@duet.test',
  yoav: 'yoav@duet.test',
};
const DEV_PASSWORD = 'duet1234';

export async function signInAsDevMember(memberId: MemberId): Promise<void> {
  const email = DEV_EMAILS[memberId];
  if (!email) throw new Error(`No seeded auth user for member ${memberId}`);
  const { error } = await supabase.auth.signInWithPassword({ email, password: DEV_PASSWORD });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentSessionMemberId(): Promise<MemberId | null> {
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email) return null;
  const entry = Object.entries(DEV_EMAILS).find(([, e]) => e === email);
  return entry ? entry[0] : null;
}
