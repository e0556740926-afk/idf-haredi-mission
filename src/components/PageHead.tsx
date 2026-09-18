import { Avatars } from './Avatars';
import type { Member } from '../data/types';

export function PageHead({
  eyebrow,
  title,
  members,
}: {
  eyebrow: string;
  title: string;
  members: Member[];
}) {
  return (
    <div className="flex items-center justify-between mb-[22px]">
      <div>
        <div className="text-[12px] text-muted mb-1">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      <Avatars members={members} ariaLabel={members.map((m) => m.displayName).join(' ו')} />
    </div>
  );
}
