import { useViewer } from '../../app/DevViewerContext';
import { useRecurringScreen } from './hooks';
import { PageHead } from '../../components/PageHead';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { Money } from '../../components/Money';
import { Card } from '../../components/Card';
import { Skeleton, ErrorState, EmptyState } from '../../components/ScreenStates';
import { formatMoney } from '../../lib/money';
import { formatTemplate, t } from '../../i18n/he';

export function RecurringScreen() {
  const { viewerId } = useViewer();
  const { members, recurring, monthlyTotal } = useRecurringScreen(viewerId);

  if (members.isPending || recurring.isPending || monthlyTotal.isPending) return <Skeleton rows={4} />;
  if (members.isError || recurring.isError || monthlyTotal.isError) return <ErrorState />;

  return (
    <div>
      <PageHead eyebrow={t.recurring.eyebrow} title={t.recurring.title} members={members.data} />

      <Card tone="warm">
        <small>{t.recurring.monthlyTotal}</small>
        <b className="block text-[26px] font-normal my-[9px]">
          <Money amount={-monthlyTotal.data} />
        </b>
        <VisibilityBadge visibility="shared" />
      </Card>

      {recurring.data.length === 0 ? (
        <EmptyState message={t.empty.recurring} />
      ) : (
        recurring.data.map((series) => {
          const hasHistory = series.priceHistory.length > 1;
          const [first, ...rest] = series.priceHistory;
          const last = rest.at(-1) ?? first;
          return (
            <Card key={series.id}>
              <div className="flex justify-between">
                <b className="font-medium">{series.label}</b>
                <Money amount={-series.amount} />
              </div>
              <div className="flex justify-between mt-1">
                <small>{formatTemplate(t.recurring.dayOfMonth, { day: series.dayOfMonth })}</small>
                <VisibilityBadge visibility="shared" />
              </div>
              {hasHistory && (
                <div className="mt-2 pt-2 border-t border-line text-[11px] text-muted">
                  {t.recurring.priceHistoryTitle}:{' '}
                  {formatTemplate(t.recurring.priceChange, {
                    from: formatMoney(first.amount),
                    to: formatMoney(last.amount),
                  })}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
