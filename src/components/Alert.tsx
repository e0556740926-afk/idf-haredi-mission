import type { ReactNode } from 'react';

export function Alert({
  children,
  tone = 'copper',
  className = '',
}: {
  children: ReactNode;
  tone?: 'copper' | 'blue';
  className?: string;
}) {
  const borderColor = tone === 'blue' ? 'border-r-blue' : 'border-r-alertbar';
  return (
    <div className={`rounded-card border border-line bg-white p-[17px] mb-3 border-r-[3px] ${borderColor} ${className}`}>
      {children}
    </div>
  );
}
