import { useEffect, useRef, useState } from 'react';
import { useViewer } from '../../app/DevViewerContext';
import { useRitualScreen } from './hooks';
import { PageHead } from '../../components/PageHead';
import { StepHead } from '../../components/StepHead';
import { Card } from '../../components/Card';
import { WinCard } from '../../components/WinCard';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Skeleton, ErrorState } from '../../components/ScreenStates';
import { formatIsoAsDots, formatMonthLabel } from '../../lib/date';
import { formatMoney } from '../../lib/money';
import { formatTemplate, t } from '../../i18n/he';
import { useToast } from '../../app/ToastProvider';
import type { RitualDecision } from '../../data/types';

const RITUAL_SECONDS = 600;

function formatTimer(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function RitualScreen() {
  const { viewerId } = useViewer();
  const { members, ritual, saveDecision } = useRitualScreen(viewerId);
  const showToast = useToast();

  const [seconds, setSeconds] = useState(RITUAL_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [decisionModalFor, setDecisionModalFor] = useState<RitualDecision | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          showToast(t.ritual.timeUp);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, showToast]);

  if (members.isPending || ritual.isPending) return <Skeleton rows={5} />;
  if (members.isError || ritual.isError) return <ErrorState />;

  const r = ritual.data;

  const handleTimerClick = () => {
    if (running) {
      setRunning(false);
      return;
    }
    if (seconds === 0) setSeconds(RITUAL_SECONDS);
    setRunning(true);
  };

  const timerLabel = running ? t.ritual.pause : seconds === 0 ? t.ritual.resumeAfterEnd : seconds === RITUAL_SECONDS ? t.ritual.start : t.ritual.resume;

  return (
    <div>
      <PageHead
        eyebrow={formatTemplate(t.ritual.eyebrow, { month: formatMonthLabel() })}
        title={t.ritual.title}
        members={members.data}
      />

      <div className="flex justify-between border-t border-line py-3 text-muted text-[12px]">
        <span>{formatTemplate(t.ritual.streak, { count: r.streakMonths })}</span>
        <span className="text-copper tracking-[5px]" aria-label={formatTemplate(t.ritual.streak, { count: r.streakMonths })}>
          {'●'.repeat(r.streakMonths)}
        </span>
      </div>

      <Card tone="soft" className="flex items-center justify-between">
        <span className="num text-[38px] font-light" dir="ltr">
          {formatTimer(seconds)}
        </span>
        <Button onClick={handleTimerClick}>{timerLabel}</Button>
      </Card>

      <StepHead step={1} title={t.ritual.step1Title} />
      <Card>
        {r.followUps.map((f) => (
          <p key={f.label} className="text-[12px] mt-2 first:mt-0">
            {f.label} <span className={f.done ? 'text-green' : 'text-muted'}>{f.done ? t.ritual.followUpDone : t.ritual.followUpPending}</span>
          </p>
        ))}
      </Card>

      <StepHead step={2} title={t.ritual.step2Title} />
      {r.decisions.map((d) => (
        <Card key={d.index}>
          <p>{d.question}</p>
          <div className="mt-1">
            <VisibilityBadge visibility={d.visibility} />
          </div>
          <div className="flex gap-[7px] mt-3">
            <Button variant="secondary" onClick={() => setDecisionModalFor(d)}>
              {t.ritual.decideAction}
            </Button>
            <Button
              variant="text"
              onClick={() => {
                saveDecision.mutate({ index: d.index, text: '', owner: '', dueDate: '', deferred: true });
                showToast(t.ritual.decisionDeferredToast);
              }}
            >
              {t.ritual.deferAction}
            </Button>
          </div>
          {d.deferred && <div className="text-[12px] text-green mt-2">{t.ritual.deferredState}</div>}
          {!d.deferred && d.text && (
            <div className="text-[12px] text-green mt-2">{formatTemplate(t.ritual.decidedState, { text: d.text })}</div>
          )}
        </Card>
      ))}

      <StepHead step={3} title={t.ritual.step3Title} />
      <WinCard>
        <p>
          {r.winTitle}.<br />
          <b>{formatTemplate(t.ritual.winAnnualVerified, { amount: formatMoney(r.winAmount) })}</b>
        </p>
        <VisibilityBadge visibility="shared" />
      </WinCard>

      <StepHead step={4} title={t.ritual.step4Title} />
      <Card>
        <div className="text-[20px] leading-[1.7] mb-3.5">{t.ritual.question}</div>
        {members.data.map((m) => (
          <label key={m.id} className="text-[12px] text-muted block mt-2.5">
            {m.displayName}
            <textarea
              className="w-full resize-y min-h-16 mt-1.5 border border-line rounded-[9px] p-2.5 bg-white text-ink"
              placeholder={t.ritual.answerPlaceholder}
              value={answers[m.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [m.id]: e.target.value }))}
            />
          </label>
        ))}
      </Card>
      <Button full onClick={() => setShowSummary(true)}>
        {t.ritual.finish}
      </Button>
      <p className="text-[11px] text-muted leading-relaxed mt-3 text-center">{t.ritual.finishFootnote}</p>

      <Modal
        open={decisionModalFor !== null}
        onClose={() => setDecisionModalFor(null)}
      >
        {decisionModalFor && (
          <DecisionForm
            decision={decisionModalFor}
            memberNames={members.data.map((m) => m.displayName)}
            onSave={(input) => {
              saveDecision.mutate(input);
              setDecisionModalFor(null);
              showToast(t.ritual.decisionSaved);
            }}
          />
        )}
      </Modal>

      <Modal open={showSummary} onClose={() => setShowSummary(false)}>
        <h2 className="text-2xl mb-4">{t.ritual.summaryTitle}</h2>
        <p>{formatTemplate(t.ritual.summarySubtitle, { month: formatMonthLabel() })}</p>
        {r.decisions.map((d) => (
          <div key={d.index} className="bg-bg p-[15px] rounded-[10px] leading-[1.9] mt-[15px] text-[14px]">
            <b>{d.question}</b>
            <br />
            {d.deferred
              ? t.ritual.summaryDeferred
              : d.text
                ? (
                  <>
                    {d.text}
                    <br />
                    <small>{formatTemplate(t.ritual.summaryResponsibility, { owner: d.owner ?? '', date: d.dueDate ? formatIsoAsDots(d.dueDate) : '' })}</small>
                  </>
                )
                : t.ritual.summaryPending}
          </div>
        ))}
        <Button full className="mt-[18px]" onClick={() => setShowSummary(false)}>
          {t.ritual.backToHome}
        </Button>
      </Modal>
    </div>
  );
}

function DecisionForm({
  decision,
  memberNames,
  onSave,
}: {
  decision: RitualDecision;
  memberNames: string[];
  onSave: (input: { index: number; text: string; owner: string; dueDate: string; deferred: boolean }) => void;
}) {
  const [text, setText] = useState(decision.text ?? '');
  const [owner, setOwner] = useState(decision.owner ?? t.ritual.ownerBoth);
  const [dueDate, setDueDate] = useState(decision.dueDate ?? '');

  return (
    <div>
      <h2 className="text-2xl mb-4">{t.ritual.decisionModalTitle}</h2>
      <p>{decision.question}</p>
      <label className="text-[12px] text-muted block mt-2.5">
        {t.ritual.decisionLabel}
        <textarea
          className="w-full resize-y min-h-16 mt-1.5 border border-line rounded-[9px] p-2.5 bg-white text-ink"
          placeholder={t.ritual.decisionPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="flex gap-2.5 mt-2.5">
        <label className="flex-1 text-[12px] text-muted">
          {t.ritual.ownerLabel}
          <select
            className="w-full text-[12px] p-[7px] mt-1.5 border border-line rounded-[9px] bg-white text-ink"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option>{t.ritual.ownerBoth}</option>
            {memberNames.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-[12px] text-muted">
          {t.ritual.dueDateLabel}
          <input
            type="date"
            required
            className="w-full text-[12px] p-[7px] mt-1.5 border border-line rounded-[9px] bg-white text-ink"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
      </div>
      <Button
        full
        className="mt-[18px]"
        onClick={() => {
          if (!text.trim() || !dueDate) return;
          onSave({ index: decision.index, text: text.trim(), owner, dueDate, deferred: false });
        }}
      >
        {t.ritual.saveDecision}
      </Button>
    </div>
  );
}
