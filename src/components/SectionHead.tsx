import type { ReactNode } from 'react';

export function SectionHead({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between my-6 mb-3">
      <h3 className="text-[17px]">{title}</h3>
      {aside}
    </div>
  );
}
