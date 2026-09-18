import type { ReactNode } from 'react';
import { Card } from './Card';

export function FairnessCard({ children }: { children: ReactNode }) {
  return <Card tone="blue">{children}</Card>;
}

export function FairnessResult({ children }: { children: ReactNode }) {
  return (
    <div className="text-[23px] font-normal pt-[18px] pb-[15px] border-t border-white/[0.17] mt-4">
      {children}
    </div>
  );
}
