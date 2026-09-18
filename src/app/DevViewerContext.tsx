import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMembers } from '../data';
import type { Member, MemberId } from '../data/types';

interface DevViewerContextValue {
  viewerId: MemberId;
  setViewerId: (id: MemberId) => void;
}

const DevViewerContext = createContext<DevViewerContextValue | null>(null);

const STORAGE_KEY = 'duet.dev.viewerId';
const BOOTSTRAP_VIEWER_ID: MemberId = 'dana';
const USE_SUPABASE = import.meta.env.VITE_DATA_SOURCE === 'supabase';

function readStoredViewerId(): MemberId | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * There is no real auth in mock mode (fixtures only). This dev-only global
 * switch stands in for "which member is signed in" and swaps viewerId
 * across the whole app — see PROMPT-FULL-BUILD.md point 2. It is not the
 * same thing as the prototype's in-screen "Dana / Yoav" toggle, which only
 * ever affected the Activity screen.
 *
 * D7 (supabase mode): the switch becomes a real sign-out/sign-in against
 * Supabase Auth (src/data/supabase/auth.ts) — viewerId then tracks whoever
 * the GoTrue session actually belongs to, not a locally-trusted string.
 * There is no such switch in production; src/app/AppLayout.tsx only renders
 * it under import.meta.env.DEV.
 *
 * Like every other consumer, this only reaches the household's member list
 * through src/data (getMembers) — never src/data/fixtures or
 * src/data/supabase directly.
 */
export function DevViewerProvider({ children }: { children: ReactNode }) {
  const [viewerId, setViewerIdState] = useState<MemberId>(
    () => readStoredViewerId() ?? BOOTSTRAP_VIEWER_ID,
  );

  const { data: members } = useQuery({
    queryKey: ['members', 'bootstrap'],
    queryFn: () => getMembers(BOOTSTRAP_VIEWER_ID),
  });

  useEffect(() => {
    if (members && !members.some((m: Member) => m.id === viewerId)) {
      setViewerIdState(members[0].id);
    }
  }, [members, viewerId]);

  // Supabase mode: nothing works until a real session exists. Sign in as
  // whichever member was last selected (or the bootstrap default) so the
  // app isn't stuck showing empty RLS results with no way in — this is the
  // same convenience the mock's "no auth yet" default gave for free.
  useEffect(() => {
    if (!USE_SUPABASE) return;
    (async () => {
      const { getCurrentSessionMemberId, signInAsDevMember } = await import('../data/supabase/auth');
      const current = await getCurrentSessionMemberId();
      if (current !== viewerId) {
        await signInAsDevMember(viewerId);
      }
    })();
  }, [viewerId]);

  const setViewerId = (id: MemberId) => {
    setViewerIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // best-effort only
    }
    if (USE_SUPABASE) {
      import('../data/supabase/auth').then(({ signInAsDevMember }) => signInAsDevMember(id));
    }
  };

  return (
    <DevViewerContext.Provider value={{ viewerId, setViewerId }}>
      {children}
    </DevViewerContext.Provider>
  );
}

export function useViewer(): DevViewerContextValue {
  const ctx = useContext(DevViewerContext);
  if (!ctx) throw new Error('useViewer must be used within DevViewerProvider');
  return ctx;
}
