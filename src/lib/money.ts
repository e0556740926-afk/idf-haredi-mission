const CURRENCY_SYMBOLS: Record<string, string> = {
  ILS: '₪',
  USD: '$',
  EUR: '€',
};

const numberFormatter = new Intl.NumberFormat('he-IL', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * The only place amounts are formatted. Sign is rendered after the currency
 * symbol so it reads correctly in RTL: formatMoney(-412, 'ILS') => "412 ₪-".
 */
export function formatMoney(amount: number, currency = 'ILS'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const isNegative = amount < 0;
  const formatted = numberFormatter.format(Math.abs(amount));
  return isNegative ? `${formatted} ${symbol}-` : `${formatted} ${symbol}`;
}

export function formatMoneyPlain(amount: number): string {
  return numberFormatter.format(Math.abs(amount));
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
