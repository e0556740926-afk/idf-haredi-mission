export interface SwitchOption<T extends string> {
  value: T;
  label: string;
}

export function Switch<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SwitchOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="flex rounded-[11px] bg-soft p-1 gap-[3px] mb-[15px]" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-lg text-[12px] py-[11px] px-[5px] ${
            opt.value === value ? 'bg-white text-blue shadow-[0_2px_5px_#1c3a5e12]' : 'text-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
