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

function readStoredViewerId(): MemberId | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * There is no real auth yet (docs stage: fixtures only). This dev-only
 * global switch stands in for "which member is signed in" and swaps
 * viewerId across the whole app — see PROMPT-FULL-BUILD.md point 2. It is
 * not the same thing as the prototype's in-screen "Dana / Yoav" toggle,
 * which only ever affected the Activity screen.
 *
 * Like every other consumer, this only reaches the household's member list
 * through src/data (getMembers) — never src/data/fixtures directly. Because
 * that call is async and a viewerId is needed before it can resolve, state
 * bootstraps from BOOTSTRAP_VIEWER_ID (or whatever was already stored) and
 * self-corrects once the real member list loads.
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

  const setViewerId = (id: MemberId) => {
    setViewerIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // best-effort only
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
