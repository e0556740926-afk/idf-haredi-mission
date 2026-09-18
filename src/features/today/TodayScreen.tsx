import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useViewer } from '../../app/DevViewerContext';
import { useTodayScreen } from './hooks';
import { PageHead } from '../../components/PageHead';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { Money } from '../../components/Money';
import { ProgressBar } from '../../components/ProgressBar';
import { ProgressRing } from '../../components/ProgressRing';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Skeleton, ErrorState } from '../../components/ScreenStates';
import { formatWeekdayDayMonth, daysLeftInMonth } from '../../lib/date';
import { formatMoney } from '../../lib/money';
import { formatTemplate, t } from '../../i18n/he';
import { useToast } from '../../app/ToastProvider';

export function TodayScreen() {
  const { viewerId } = useViewer();
  const { household, members, safeToSpend, budgets, pockets } = useTodayScreen(viewerId);
  const [modal, setModal] = useState<'gym' | 'netflix' | null>(null);
  const showToast = useToast();

  if (household.isPending || members.isPending || safeToSpend.isPending || budgets.isPending || pockets.isPending) {
    return <Skeleton rows={5} />;
  }
  if (household.isError || members.isError || safeToSpend.isError || budgets.isError || pockets.isError) {
    return <ErrorState />;
  }

  const overallBudget = budgets.data.reduce(
    (acc, b) => ({ spent: acc.spent + b.spent, limit: acc.limit + b.limit }),
    { spent: 0, limit: 0 },
  );
  const overallPercent = Math.round((overallBudget.spent / overallBudget.limit) * 100);
  const creditCard = { amount: 8740, day: 10 };

  return (
    <div>
      <PageHead
        eyebrow={formatTemplate(t.today.eyebrow, { household: household.data.name })}
        title={formatWeekdayDayMonth()}
        members={members.data}
      />

      <section className="text-center pt-[7px] pb-5">
        <div className="text-[12px] text-muted mb-1">{t.today.safeIntro}</div>
        <div className="my-[10px] leading-tight">
          <Money amount={safeToSpend.data.amount} size="lg" className="text-blue text-[57px] font-light tracking-[-2px]" />
        </div>
        <p className="text-[13px]">
          {formatTemplate(t.today.safeCaption, { days: daysLeftInMonth() })}
        </p>
        <div className="mt-2">
          <VisibilityBadge visibility="shared" />
        </div>
      </section>
      <div className="text-center border-t border-line pt-3 text-[11px] text-muted">
        {formatTemplate(t.today.creditLine, {
          amount: formatMoney(creditCard.amount),
          day: creditCard.day,
        })}
      </div>

      <div className="mt-[21px]">
        <div className="flex justify-between text-[12px]">
          <small>{t.today.budgetLabel}</small>
          <small className="num">{formatTemplate(t.today.budgetUsed, { percent: `${overallPercent}%` })}</small>
        </div>
        <ProgressBar percent={overallPercent} overBudget={overallBudget.spent > overallBudget.limit} />
      </div>

      <div className="flex items-center justify-between my-6 mb-3">
        <h3 className="text-[17px]">{t.today.pocketsTitle}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {pockets.data.map((pocket) => (
          <Card key={pocket.memberId} className="text-center p-[15px_10px]">
            <span>{formatTemplate(t.today.pocketOf, { name: pocket.name })}</span>
            <ProgressRing percent={pocket.percentUsed} label={`${Math.round(pocket.percentUsed)}%`} />
            <b className="block text-[20px] font-medium">
              <Money amount={pocket.remaining} />
            </b>
            <small>{t.today.pocketRemaining}</small>
            <div className="mt-2">
              <VisibilityBadge visibility="summary_only" />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between my-6 mb-3">
        <h3 className="text-[17px]">{t.today.onTheTableTitle}</h3>
        <small>{formatTemplate(t.today.onTheTableCount, { count: 3 })}</small>
      </div>

      <Alert>
        <h4 className="text-[13px] font-medium mb-1">{t.today.gymAlertTitle}</h4>
        <small className="block">
          {formatTemplate(t.today.gymAlertSub, { amount: formatMoney(504) })} · <VisibilityBadge visibility="shared" />
        </small>
        <Button variant="text" className="pt-2.5" onClick={() => setModal('gym')}>
          {t.today.gymAlertAction}
        </Button>
      </Alert>

      <Alert>
        <h4 className="text-[13px] font-medium mb-1">{t.today.netflixAlertTitle}</h4>
        <Button variant="text" className="pt-2.5" onClick={() => setModal('netflix')}>
          {t.today.netflixAlertAction}
        </Button>
      </Alert>

      <Alert tone="blue">
        <h4 className="text-[13px] font-medium mb-1">{t.today.ritualAlertTitle}</h4>
        <small className="block">{t.today.ritualAlertSub}</small>
        <Link to="/ritual" className="inline-block text-blue text-[12px] font-medium pt-2.5">
          {t.today.ritualAlertAction}
        </Link>
      </Alert>

      <Modal open={modal === 'gym'} onClose={() => setModal(null)}>
        <h2 className="text-2xl mb-4">{t.today.gymModalTitle}</h2>
        <p>{t.today.gymModalIntro}</p>
        <div className="bg-bg p-[15px] rounded-[10px] leading-[1.9] mt-[15px] text-[14px]" id="gym-draft">
          {t.today.gymModalDraft}
        </div>
        <Button
          full
          className="mt-[18px]"
          onClick={async () => {
            const text = document.getElementById('gym-draft')?.textContent?.trim() ?? '';
            try {
              await navigator.clipboard.writeText(text);
              showToast(t.today.copySuccessToast);
            } catch {
              showToast(t.today.copyFallbackToast);
            }
          }}
        >
          {t.today.copyDraft}
        </Button>
      </Modal>

      <Modal open={modal === 'netflix'} onClose={() => setModal(null)}>
        <h2 className="text-2xl mb-4">{t.today.netflixModalTitle}</h2>
        <p>{t.today.netflixModalBody}</p>
        <div className="bg-bg p-[15px] rounded-[10px] leading-[1.9] mt-[15px] text-[14px]">
          {t.today.netflixModalDraft}
        </div>
        <Button full className="mt-[18px]" onClick={() => setModal(null)}>
          {t.common.understood}
        </Button>
      </Modal>
    </div>
  );
}
