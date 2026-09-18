import { useState } from 'react';
import { useViewer } from '../../app/DevViewerContext';
import { useCashflowScreen } from './hooks';
import { PageHead } from '../../components/PageHead';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { Card } from '../../components/Card';
import { ForecastChart } from '../../components/ForecastChart';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Skeleton, ErrorState } from '../../components/ScreenStates';
import { formatDayMonth } from '../../lib/date';
import { formatMoney } from '../../lib/money';
import { formatTemplate, t } from '../../i18n/he';

type ScenarioModal = 'savings' | 'postpone' | 'installments' | null;

export function CashflowScreen() {
  const { viewerId } = useViewer();
  const { members, cashflow, known } = useCashflowScreen(viewerId);
  const [modal, setModal] = useState<ScenarioModal>(null);

  if (members.isPending || cashflow.isPending || known.isPending) return <Skeleton rows={5} />;
  if (members.isError || cashflow.isError || known.isError) return <ErrorState />;

  const cliff = cashflow.data.cliffs[0];
  const balanceBeforeCliff = cashflow.data.points.find((p) => p.date === cliff?.date)?.expected ?? 0;
  const needed = cliff ? cliff.shortfall + cashflow.data.floor : 0;
  const creditChargeAmount = known.data.expenses.find((e) => e.key === 'credit-card')?.amount ?? 0;

  return (
    <div>
      <PageHead eyebrow={formatTemplate(t.flow.eyebrow, { days: 90 })} title={t.flow.title} members={members.data} />

      <div className="flex items-center justify-between">
        <h3 className="text-[17px]">{t.flow.balanceTitle}</h3>
        <VisibilityBadge visibility="shared" />
      </div>
      <Card className="mt-4 p-3">
        <ForecastChart points={cashflow.data.points} cliffs={cashflow.data.cliffs} floor={cashflow.data.floor} />
        <p className="text-[11px] text-muted leading-relaxed px-2.5 pb-2">{t.flow.uncertaintyFootnote}</p>
      </Card>

      {cliff && (
        <Card tone="warm">
          <h3 className="text-[16px]">{t.flow.forecastTitle}</h3>
          <p className="mt-2.5">
            {formatTemplate(t.flow.forecastBody, {
              date: formatDayMonth(cliff.date),
              amount: formatMoney(creditChargeAmount),
              balance: formatMoney(balanceBeforeCliff),
            })}
          </p>
          <div className="text-copper text-[24px] font-medium my-2">
            {formatTemplate(t.flow.shortage, { amount: formatMoney(cliff.shortfall) })}
          </div>
          <VisibilityBadge visibility="shared" />
          <div className="mt-2 flex flex-col gap-2">
            <button
              onClick={() => setModal('savings')}
              className="block w-full bg-forecastBtnBg text-copper p-[11px] rounded-[9px] text-right text-[12px]"
            >
              {t.flow.fromSavings}
            </button>
            <button
              onClick={() => setModal('postpone')}
              className="block w-full bg-forecastBtnBg text-copper p-[11px] rounded-[9px] text-right text-[12px]"
            >
              {t.flow.postpone}
            </button>
            <button
              onClick={() => setModal('installments')}
              className="block w-full bg-forecastBtnBg text-copper p-[11px] rounded-[9px] text-right text-[12px]"
            >
              {t.flow.installments}
            </button>
          </div>
          <p className="text-[11px] text-muted leading-relaxed mt-2">{t.flow.alertSentFootnote}</p>
        </Card>
      )}

      {cliff && (
        <p className="text-[11px] text-muted leading-relaxed">
          {formatTemplate(t.flow.scenarioFootnote, {
            floor: formatMoney(cashflow.data.floor),
            needed: formatMoney(needed),
          })}
        </p>
      )}

      <div className="flex items-center justify-between my-6 mb-3">
        <h3 className="text-[17px]">{t.flow.knownVsForecastTitle}</h3>
      </div>
      <Card>
        <small>{t.flow.knownIncomeLabel}</small>
        {known.data.incomes.map((item) => (
          <KnownRow key={item.key} label={item.label} dateLabel={item.dateLabel} amount={item.amount} />
        ))}
        <div className="mt-4">
          <small>{t.flow.knownExpenseLabel}</small>
        </div>
        {known.data.expenses.map((item) => (
          <KnownRow key={item.key} label={item.label} dateLabel={item.dateLabel} amount={item.amount} />
        ))}
        <p className="text-[11px] text-muted leading-relaxed mt-2">{t.flow.creditLineNote}</p>
      </Card>

      <Card>
        <h3 className="text-[16px]">{t.flow.variableTitle}</h3>
        <p className="text-[11px] text-muted leading-relaxed mt-2">{t.flow.variableFootnote}</p>
      </Card>

      <Modal open={modal === 'savings'} onClose={() => setModal(null)}>
        <h2 className="text-2xl mb-4">{t.flow.savingsModalTitle}</h2>
        <p>
          {formatTemplate(t.flow.savingsModalBody, {
            shortfall: formatMoney(cliff?.shortfall ?? 0),
            floor: formatMoney(cashflow.data.floor),
            needed: formatMoney(needed),
          })}
        </p>
        <Button full className="mt-[18px]" onClick={() => setModal(null)}>
          {t.common.understood}
        </Button>
      </Modal>

      <Modal open={modal === 'postpone'} onClose={() => setModal(null)}>
        <h2 className="text-2xl mb-4">{t.flow.postponeModalTitle}</h2>
        <p>
          {formatTemplate(t.flow.postponeModalBody, {
            shortfall: formatMoney(cliff?.shortfall ?? 0),
            date: cliff ? formatDayMonth(cliff.date) : '',
          })}
        </p>
        <p className="text-[11px] text-muted leading-relaxed mt-2">{t.flow.postponeModalFootnote}</p>
        <Button full className="mt-[18px]" onClick={() => setModal(null)}>
          {t.common.understood}
        </Button>
      </Modal>

      <Modal open={modal === 'installments'} onClose={() => setModal(null)}>
        <h2 className="text-2xl mb-4">{t.flow.installmentsModalTitle}</h2>
        <p>{formatTemplate(t.flow.installmentsModalBody, { amount: formatMoney(creditChargeAmount) })}</p>
        <p className="text-[11px] text-muted leading-relaxed mt-2">{t.flow.installmentsModalFootnote}</p>
        <Button full className="mt-[18px]" onClick={() => setModal(null)}>
          {t.common.understood}
        </Button>
      </Modal>
    </div>
  );
}

function KnownRow({ label, dateLabel, amount }: { label: string; dateLabel: string; amount: number }) {
  return (
    <div className="py-3 border-b border-line last:border-b-0">
      <div className="flex justify-between">
        <span>{label}</span>
        {formatMoney(amount)}
      </div>
      <div className="flex justify-between mt-0.5">
        <small>{dateLabel}</small>
        <VisibilityBadge visibility="shared" />
      </div>
    </div>
  );
}
