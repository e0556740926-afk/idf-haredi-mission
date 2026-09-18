import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepHead } from '../../components/StepHead';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { t } from '../../i18n/he';
import type { Archetype } from '../../data/types';

const ARCHETYPES: { value: Archetype; title: string; desc: string }[] = [
  { value: 'one_pot', title: t.onboarding.archetypeOnePotTitle, desc: t.onboarding.archetypeOnePotDesc },
  { value: 'three_pots', title: t.onboarding.archetypeThreePotsTitle, desc: t.onboarding.archetypeThreePotsDesc },
  { value: 'separate', title: t.onboarding.archetypeSeparateTitle, desc: t.onboarding.archetypeSeparateDesc },
  { value: 'asymmetric', title: t.onboarding.archetypeAsymmetricTitle, desc: t.onboarding.archetypeAsymmetricDesc },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [allowance, setAllowance] = useState(2500);

  const startConnecting = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1200);
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <StepHead step={1} title={t.onboarding.step1Title} />
          {ARCHETYPES.map((a) => (
            <Card
              key={a.value}
              className={archetype === a.value ? 'border-blue border-2' : ''}
            >
              <button type="button" className="text-right w-full" onClick={() => setArchetype(a.value)}>
                <b className="font-medium">{a.title}</b>
                <p className="text-[12px] text-muted mt-1">{a.desc}</p>
              </button>
            </Card>
          ))}
          <Button full disabled={!archetype} onClick={() => setStep(2)}>
            {t.common.next}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <StepHead step={2} title={t.onboarding.step2Title} />
          <Card>
            <label className="text-[12px] text-muted block">
              {t.onboarding.inviteNameLabel}
              <input className="w-full border border-line rounded-[9px] p-2.5 mt-1.5 bg-white text-ink" />
            </label>
            <label className="text-[12px] text-muted block mt-2.5">
              {t.onboarding.inviteEmailLabel}
              <input type="email" className="w-full border border-line rounded-[9px] p-2.5 mt-1.5 bg-white text-ink" />
            </label>
            <p className="text-[11px] text-muted leading-relaxed mt-2.5">{t.onboarding.inviteSentNote}</p>
          </Card>
          <Button full onClick={() => setStep(3)}>
            {t.onboarding.inviteSend}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div>
          <StepHead step={3} title={t.onboarding.step3Title} />
          <Card>
            {connected ? (
              <p className="text-green text-[13px]">{t.onboarding.connectedLabel}</p>
            ) : connecting ? (
              <>
                <p className="text-[13px]">{t.onboarding.connectingLabel}</p>
                <ProgressBar percent={70} />
              </>
            ) : (
              <div className="flex gap-2.5">
                <Button variant="secondary" onClick={startConnecting}>
                  {t.onboarding.connectManual}
                </Button>
                <Button variant="secondary" onClick={startConnecting}>
                  {t.onboarding.connectCsv}
                </Button>
              </div>
            )}
          </Card>
          <Button full onClick={() => setStep(4)}>
            {t.common.next}
          </Button>
        </div>
      )}

      {step === 4 && (
        <div>
          <StepHead step={4} title={t.onboarding.step4Title} />
          <Card>
            <label className="text-[12px] text-muted block">
              {t.onboarding.allowanceLabel}
              <input
                type="number"
                value={allowance}
                onChange={(e) => setAllowance(Number(e.target.value))}
                className="w-full border border-line rounded-[9px] p-2.5 mt-1.5 bg-white text-ink"
              />
            </label>
            <p className="text-[11px] text-muted leading-relaxed mt-2.5">{t.onboarding.allowanceHelp}</p>
          </Card>
          <Button full onClick={() => navigate('/today')}>
            {t.onboarding.finishOnboarding}
          </Button>
        </div>
      )}
    </div>
  );
}
