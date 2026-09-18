import type { Member } from '../data/types';

export function Avatars({ members, ariaLabel }: { members: Member[]; ariaLabel: string }) {
  return (
    <div className="flex pl-1.5" aria-label={ariaLabel}>
      {members.map((m, i) => (
        <span
          key={m.id}
          className={`grid place-items-center border-2 border-bg w-[33px] h-[33px] rounded-full text-[12px] ${
            i === 0 ? 'bg-soft text-blue' : 'bg-warm text-copper -mr-[7px]'
          }`}
        >
          {m.initial}
        </span>
      ))}
    </div>
  );
}
