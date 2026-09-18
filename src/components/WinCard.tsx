import type { ReactNode } from 'react';
import { Card } from './Card';

export function WinCard({ children }: { children: ReactNode }) {
  return (
    <Card tone="win" className="text-[14px]">
      {children}
    </Card>
  );
}
