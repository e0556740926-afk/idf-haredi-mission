import { createContext, useContext, useState, type ReactNode } from 'react';
import { members } from '../data/fixtures/household';
import type { MemberId } from '../data/types';

interface DevViewerContextValue {
  viewerId: MemberId;
  setViewerId: (id: MemberId) => void;
}

const DevViewerContext = createContext<DevViewerContextValue | null>(null);

const STORAGE_KEY = 'duet.dev.viewerId';

function initialViewerId(): MemberId {
  if (typeof window === 'undefined') return members[0].id;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return members.some((m) => m.id === stored) ? (stored as MemberId) : members[0].id;
}

/**
 * There is no real auth yet (docs stage: fixtures only). This dev-only
 * global switch stands in for "which member is signed in" and swaps
 * viewerId across the whole app — see PROMPT-FULL-BUILD.md point 2. It is
 * not the same thing as the prototype's in-screen "Dana / Yoav" toggle,
 * which only ever affected the Activity screen.
 */
export function DevViewerProvider({ children }: { children: ReactNode }) {
  const [viewerId, setViewerIdState] = useState<MemberId>(initialViewerId);

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
