import { useViewer } from '../../app/DevViewerContext';
import { useActivityScreen } from './hooks';
import { PageHead } from '../../components/PageHead';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { Money } from '../../components/Money';
import { TxIcon } from '../../components/TxIcon';
import { AggregateCard } from '../../components/AggregateCard';
import { PrivacyCard } from '../../components/PrivacyCard';
import { Card } from '../../components/Card';
import { Skeleton, ErrorState, EmptyState } from '../../components/ScreenStates';
import { formatDayMonth, formatMonthLabel } from '../../lib/date';
import { formatMoney } from '../../lib/money';
import { formatTemplate, t } from '../../i18n/he';
import type { ActivityRow } from '../../data/types';
import type { IconName } from '../../components/Icon';

function iconFor(row: ActivityRow): IconName {
  return row.categoryKey === 'gifts' ? 'gift' : 'bag';
}

export function ActivityScreen() {
  const { viewerId } = useViewer();
  const { members, activity, allowanceSummaries, privateAccounts, safeToSpend } = useActivityScreen(viewerId);

  if (
    members.isPending ||
    activity.isPending ||
    allowanceSummaries.isPending ||
    privateAccounts.isPending ||
    safeToSpend.isPending
  ) {
    return <Skeleton rows={6} />;
  }
  if (members.isError || activity.isError || allowanceSummaries.isError || privateAccounts.isError || safeToSpend.isError) {
    return <ErrorState />;
  }

  const self = members.data.find((m) => m.id === viewerId)!;
  const partner = members.data.find((m) => m.id !== viewerId)!;
  const partnerSummary = allowanceSummaries.data[0];

  return (
    <div>
      <PageHead
        eyebrow={formatTemplate(t.activity.eyebrow, { month: formatMonthLabel() })}
        title={t.activity.title}
        members={members.data}
      />
      <p className="text-[12px] text-muted mb-2.5">{t.activity.intro}</p>

      <div className="flex gap-[7px] mb-5">
        <input
          disabled
          aria-label={t.activity.searchDisabledLabel}
          placeholder={t.activity.searchPlaceholder}
          className="min-w-0 w-full p-2.5 border border-line rounded-[9px] bg-white text-[12px]"
        />
        <button
          disabled
          className="whitespace-nowrap rounded-[9px] bg-white border border-line text-weak text-[12px] px-3"
        >
          {t.activity.allCategories}
        </button>
      </div>

      {activity.data.length === 0 ? (
        <EmptyState message={t.empty.activity} />
      ) : (
        <div className="animate-[appear_.25s_ease]">
          <div className="text-[11px] text-weak py-3 pb-1">
            {formatTemplate(t.activity.dayLabelSelf, { date: formatDayMonth(activity.data[0].bookedAt) })}
          </div>

          {activity.data.map((row) => (
            <div key={row.id} className="py-[13px] border-b border-line flex gap-2.5 items-start">
              <TxIcon icon={iconFor(row)} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <strong className="text-[13px] font-medium">{row.description}</strong>
                  <strong className="text-[13px] font-medium">
                    <Money amount={row.amount} />
                  </strong>
                </div>
                <div className="flex justify-between items-start">
                  <small className="text-[11px]">
                    {row.categoryLabel} ·{' '}
                    {row.ownerId === null ? t.common.household : row.ownerId === viewerId ? self.displayName : partner.displayName}
                  </small>
                  <VisibilityBadge visibility={row.visibility} />
                </div>
                <div className="text-[10px] text-muted mt-[5px]">
                  {row.partnerSees === 'all'
                    ? formatTemplate(t.activity.partnerSeesAll, { name: partner.displayName })
                    : formatTemplate(t.activity.partnerSeesAmountOnly, { name: partner.displayName })}
                </div>
              </div>
            </div>
          ))}

          {partnerSummary && (
            <AggregateCard
              name={partnerSummary.ownerName}
              amount={partnerSummary.total}
              countLabel={
                partnerSummary.count !== null
                  ? formatTemplate(t.activity.aggregateCountActions, { count: partnerSummary.count })
                  : t.activity.aggregateCountGeneric
              }
            />
          )}

          {privateAccounts.data.map((acc) => {
            const owner = members.data.find((m) => m.id === acc.ownerId);
            return (
              <Card key={acc.id} className="bg-privateBg">
                <small>{formatTemplate(t.activity.privateAccountLine, { name: owner?.displayName ?? '' })}</small>
                <div className="mt-1.5">
                  <VisibilityBadge visibility="private" />
                </div>
              </Card>
            );
          })}

          <p className="text-[11px] text-muted leading-relaxed mt-2">{t.activity.feedFootnote}</p>
        </div>
      )}

      <PrivacyCard title={t.activity.privacyCardTitle}>
        <p>{t.activity.privacyCardSub}</p>
        <span className="num text-[24px] font-medium block my-[9px]">
          <Money amount={safeToSpend.data.amount} />
        </span>
        <VisibilityBadge visibility="shared" />
        <p className="mt-2">
          {formatTemplate(t.activity.privacyCardNote, {
            amount: formatMoney(partnerSummary?.total ?? 0),
          })}
        </p>
      </PrivacyCard>
    </div>
  );
}
