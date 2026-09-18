import { formatMoney } from '../lib/money';

export function Money({
  amount,
  currency = 'ILS',
  size,
  className = '',
}: {
  amount: number;
  currency?: string;
  size?: 'lg';
  className?: string;
}) {
  if (size === 'lg') {
    // The 57px hero amount: docs/08-design-system.md. The currency sign
    // inside gets its own smaller size.
    const [value, sign] = formatMoney(amount, currency).split(' ');
    return (
      <span className={`num ${className}`}>
        {value} <span className="text-[29px]">{sign}</span>
      </span>
    );
  }
  return <span className={`num ${className}`}>{formatMoney(amount, currency)}</span>;
}
