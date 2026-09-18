export function ProgressBar({ percent, overBudget = false }: { percent: number; overBudget?: boolean }) {
  return (
    <div className="h-[6px] rounded-[10px] bg-soft overflow-hidden mt-[10px]">
      <div
        className={`block h-full rounded-[10px] ${overBudget ? 'bg-copper' : 'bg-blue'}`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}
