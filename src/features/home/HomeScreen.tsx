import { Link } from 'react-router-dom';
import { useViewer } from '../../app/DevViewerContext';
import { useHomeScreen, useToggleSettlementTransferred } from './hooks';
import { PageHead } from '../../components/PageHead';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { Money } from '../../components/Money';
import { ProgressBar } from '../../components/ProgressBar';
import { Card } from '../../components/Card';
import { FairnessCard, FairnessResult } from '../../components/FairnessCard';
import { Button } from '../../components/Button';
import { Skeleton, ErrorState, EmptyState } from '../../components/ScreenStates';
import { formatMonthLabel } from '../../lib/date';
import { formatMoney } from '../../lib/money';
import { formatTemplate, t } from '../../i18n/he';

export function HomeScreen() {
  const { viewerId } = useViewer();
  const { members, budgets, budgetsOverview, settlement, goals, accounts } = useHomeScreen(viewerId);
  const toggleTransferred = useToggleSettlementTransferred(viewerId);

  if (
    members.isPending ||
    budgets.isPending ||
    budgetsOverview.isPending ||
    settlement.isPending ||
    goals.isPending ||
    accounts.isPending
  ) {
    return <Skeleton rows={6} />;
  }
  if (
    members.isError ||
    budgets.isError ||
    budgetsOverview.isError ||
    settlement.isError ||
    goals.isError ||
    accounts.isError
  ) {
    return <ErrorState />;
  }

  const s = settlement.data;
  const from = s.perMember.find((m) => m.memberId === s.fromMemberId)!;
  const to = s.perMember.find((m) => m.memberId === s.toMemberId)!;

  return (
    <div>
      <PageHead
        eyebrow={formatTemplate(t.home.eyebrow, { month: formatMonthLabel() })}
        title={t.home.title}
        members={members.data}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-[17px]">{t.home.envelopesTitle}</h3>
        <Link to="/recurring" className="text-blue text-[12px] font-medium">
          {t.home.seeRecurring}
        </Link>
      </div>
      <Card className="mt-3.5">
        {budgets.data.map((b) => (
          <div key={b.key} className="py-[11px]">
            <div className="flex justify-between text-[12px]">
              <b>{b.label}</b>
              <span className="num">
                {formatMoney(b.spent)} <small>/ {formatMoney(b.limit)}</small>
              </span>
            </div>
            <ProgressBar percent={b.percent} overBudget={b.isOverBudget} />
            <div className="flex justify-between items-center mt-1">
              {b.isOverBudget ? (
                <small className="text-copper">
                  {formatTemplate(t.home.overBudget, { amount: formatMoney(b.overBy), percent: `${b.percent}%` })}
                </small>
              ) : (
                <span />
              )}
              <VisibilityBadge visibility={b.key === 'shopping' ? 'summary_only' : 'shared'} />
            </div>
          </div>
        ))}
        <p className="text-[11px] text-muted leading-relaxed mt-2">
          {formatTemplate(t.home.envelopesFootnote, { amount: formatMoney(budgetsOverview.data.totalSpent) })}
        </p>
      </Card>

      <FairnessCard>
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] text-white">{t.home.fairnessTitle}</h3>
          <VisibilityBadge visibility="shared" />
        </div>
        <p className="text-[12px] text-[#d2dfee] mt-2">
          {formatTemplate(t.home.fairnessSplit, { split: s.splitLabel })}
        </p>
        <p className="text-[12px] text-[#d2dfee]">
          {formatTemplate(t.home.fairnessSpend, { amount: formatMoney(s.householdTotal) })}
        </p>
        {s.perMember.map((m) => (
          <div key={m.memberId} className="flex justify-between text-[12px] mt-2">
            <span>{formatTemplate(t.home.fairnessPaid, { name: m.name, amount: formatMoney(m.paid) })}</span>
            <small>{formatTemplate(t.home.fairnessShare, { amount: formatMoney(m.share) })}</small>
          </div>
        ))}
        <FairnessResult>
          {s.isTransferred
            ? formatTemplate(t.home.fairnessResultDone, { amount: formatMoney(s.amount) })
            : formatTemplate(t.home.fairnessResultTransfer, {
                from: from.name,
                to: to.name,
                amount: formatMoney(s.amount),
              })}
        </FairnessResult>
        <Button variant="secondary" onClick={() => toggleTransferred(!s.isTransferred)}>
          {s.isTransferred ? t.home.undoTransfer : t.home.markTransferred}
        </Button>{' '}
        <Button variant="text" className="text-[#d6e1ed]">
          {t.home.makeStanding}
        </Button>
        <p className="text-[#d2dfee] mt-2">
          <small>{t.home.noRollingDebt}</small>
        </p>
      </FairnessCard>

      <div className="flex items-center justify-between my-6 mb-3">
        <h3 className="text-[17px]">{t.home.goalsTitle}</h3>
        <Link to="/insights" className="text-blue text-[12px] font-medium">
          {t.home.seeInsights}
        </Link>
      </div>
      {goals.data.length === 0 ? (
        <EmptyState message={t.empty.goals} />
      ) : (
        goals.data.map((goal) => (
          <Card key={goal.id}>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px]">{goal.label}</h3>
              <VisibilityBadge visibility={goal.visibility} />
            </div>
            <p className="mt-3.5">
              <Money amount={goal.currentAmount} />{' '}
              <small>{formatTemplate(t.home.goalOf, { amount: formatMoney(goal.targetAmount) })}</small>
            </p>
            <ProgressBar percent={goal.percentComplete} />
            <small>{formatTemplate(t.home.goalTarget, { date: goal.targetDateLabel })}</small>
          </Card>
        ))
      )}

      <div className="flex items-center justify-between my-6 mb-3">
        <h3 className="text-[17px]">{t.home.accountsTitle}</h3>
        <Link to="/accounts" className="text-blue text-[12px] font-medium">
          {t.home.manageVisibility}
        </Link>
      </div>
      <p className="text-[12px] text-muted -mt-2 mb-2">{t.home.accountsSub}</p>
      <Card>
        {accounts.data.map((acc) => (
          <div key={acc.id} className="py-3 border-b border-line text-[12px] last:border-b-0">
            <div className="flex justify-between">
              <b className="font-medium">{acc.displayName}</b>
              {acc.balance !== null ? <Money amount={acc.balance} /> : '—'}
            </div>
            <small>
              {acc.ownerId === null ? t.common.household : members.data.find((m) => m.id === acc.ownerId)?.displayName}
              {acc.kind === 'credit_card' ? ` · ${t.home.creditChargePending}` : ''}
            </small>
            <div className="mt-1.5">
              <VisibilityBadge visibility={acc.visibility} />
            </div>
          </div>
        ))}
        <p className="text-[11px] text-muted leading-relaxed mt-2">{t.home.accountsFootnote}</p>
      </Card>
    </div>
  );
}
