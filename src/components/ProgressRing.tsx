const CIRCUMFERENCE = 164;

export function ProgressRing({ percent, label }: { percent: number; label: string }) {
  const filled = Math.min(100, percent) * (CIRCUMFERENCE / 100);
  return (
    <svg
      className="w-[62px] h-[62px] my-[10px] mx-auto block -rotate-90"
      viewBox="0 0 64 64"
      aria-label={label}
    >
      <circle cx={32} cy={32} r={26} fill="none" strokeWidth={5} className="stroke-soft" />
      <circle
        cx={32}
        cy={32}
        r={26}
        fill="none"
        strokeWidth={5}
        strokeLinecap="round"
        className="stroke-blue"
        strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
      />
    </svg>
  );
}
