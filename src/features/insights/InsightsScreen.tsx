import { useViewer } from '../../app/DevViewerContext';
import { useInsightsScreen } from './hooks';
import { PageHead } from '../../components/PageHead';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { WinCard } from '../../components/WinCard';
import { Card } from '../../components/Card';
import { Skeleton, ErrorState, EmptyState } from '../../components/ScreenStates';
import { formatMoney } from '../../lib/money';
import { formatTemplate, t } from '../../i18n/he';
import type { InsightImpact } from '../../data/types';

const IMPACT_LABEL: Record<InsightImpact, string> = {
  high: t.insights.impactHigh,
  medium: t.insights.impactMedium,
  low: t.insights.impactLow,
};

export function InsightsScreen() {
  const { viewerId } = useViewer();
  const { members, insights, verifiedSaving } = useInsightsScreen(viewerId);

  if (members.isPending || insights.isPending || verifiedSaving.isPending) return <Skeleton rows={4} />;
  if (members.isError || insights.isError || verifiedSaving.isError) return <ErrorState />;

  return (
    <div>
      <PageHead eyebrow={t.insights.eyebrow} title={t.insights.title} members={members.data} />

      <WinCard>
        <small className="text-green">{t.insights.verifiedSavingsTitle}</small>
        <b className="block text-[26px] font-normal my-[9px]">{formatMoney(verifiedSaving.data)}</b>
        <p>{t.insights.verifiedSavingsCaption}</p>
        <VisibilityBadge visibility="shared" />
      </WinCard>

      {insights.data.length === 0 ? (
        <EmptyState message={t.empty.insights} />
      ) : (
        insights.data.map((insight) => (
          <Card key={insight.id}>
            <div className="flex justify-between items-start">
              <b className="font-medium text-[13px]">{insight.title}</b>
              <VisibilityBadge visibility="shared" />
            </div>
            <p className="text-[12px] text-muted mt-1">{insight.detail}</p>
            <div className="flex justify-between items-center mt-2 text-[12px]">
              <span className={insight.annualImpactDirection === 'saving' ? 'text-green' : 'text-copper'}>
                {formatTemplate(
                  insight.annualImpactDirection === 'saving'
                    ? t.insights.annualImpactPositive
                    : t.insights.annualImpactNegative,
                  { amount: formatMoney(insight.annualImpactAbs) },
                )}
              </span>
              <small className="text-muted">
                {IMPACT_LABEL[insight.impact]}
                {insight.isVerified ? ` · ${t.insights.verified}` : ''}
              </small>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
