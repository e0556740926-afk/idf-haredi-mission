import type { ReactNode } from 'react';
import { Card } from './Card';

export function PrivacyCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card tone="soft" className="mt-5">
      <h3 className="text-[16px] text-blue mb-[7px]">{title}</h3>
      <div className="text-[12px] text-blue">{children}</div>
    </Card>
  );
}
