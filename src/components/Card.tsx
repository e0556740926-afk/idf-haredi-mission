import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  tone,
}: {
  children: ReactNode;
  className?: string;
  tone?: 'warm' | 'soft' | 'blue' | 'win';
}) {
  const toneClass =
    tone === 'warm'
      ? 'bg-warm border-aggregateBorder'
      : tone === 'soft'
        ? 'bg-soft border-transparent'
        : tone === 'blue'
          ? 'bg-blue border-transparent text-white'
          : tone === 'win'
            ? 'bg-winBg border-transparent text-green'
            : 'bg-white border-line';
  return (
    <div className={`rounded-card border p-[17px] mb-3 ${toneClass} ${className}`}>{children}</div>
  );
}
