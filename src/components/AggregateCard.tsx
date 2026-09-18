import { Card } from './Card';
import { Money } from './Money';
import { VisibilityBadge } from './VisibilityBadge';
import { t, formatTemplate } from '../i18n/he';

export function AggregateCard({
  name,
  amount,
  countLabel,
}: {
  name: string;
  amount: number;
  countLabel: string;
}) {
  return (
    <Card tone="warm">
      <strong>{formatTemplate(t.activity.aggregateTitle, { name })}</strong>
      <b className="block text-[26px] font-normal my-[9px]">
        <Money amount={amount} />
      </b>
      <div className="flex items-center justify-between gap-2">
        <small>{countLabel}</small>
        <VisibilityBadge visibility="summary_only" />
      </div>
      <p className="text-[11px] text-muted leading-relaxed mt-2">{t.activity.aggregateFootnote}</p>
    </Card>
  );
}
