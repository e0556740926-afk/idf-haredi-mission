import { useViewer } from '../../app/DevViewerContext';
import { useSettingsScreen } from './hooks';
import { PageHead } from '../../components/PageHead';
import { Card } from '../../components/Card';
import { VisibilityBadge } from '../../components/VisibilityBadge';
import { Skeleton, ErrorState, EmptyState } from '../../components/ScreenStates';
import { formatMoney } from '../../lib/money';
import { formatDateShort } from '../../lib/date';
import { formatTemplate, t } from '../../i18n/he';
import type { Archetype, VisibilityLogEntry } from '../../data/types';

const ARCHETYPE_LABEL: Record<Archetype, string> = {
  one_pot: t.settings.archetypeOnePot,
  three_pots: t.settings.archetypeThreePots,
  separate: t.settings.archetypeSeparate,
  asymmetric: t.settings.archetypeAsymmetric,
};

const FAIRNESS_LABEL: Record<string, string> = {
  none: t.settings.fairnessRuleNone,
  half: t.settings.fairnessRuleHalf,
  income: t.settings.fairnessRuleIncome,
  per_category: t.settings.fairnessRulePerCategory,
};

export function SettingsScreen() {
  const { viewerId } = useViewer();
  const { household, members, visibilityLog } = useSettingsScreen(viewerId);

  if (household.isPending || members.isPending || visibilityLog.isPending) return <Skeleton rows={5} />;
  if (household.isError || members.isError || visibilityLog.isError) return <ErrorState />;

  return (
    <div>
      <PageHead eyebrow={household.data.name} title={t.settings.title} members={members.data} />

      <Card>
        <h3 className="text-[15px] mb-2">{t.settings.membersTitle}</h3>
        {members.data.map((m) => (
          <div key={m.id} className="text-[12px] py-1.5">
            {formatTemplate(t.settings.allowanceMonthlyLabel, { name: m.displayName, amount: formatMoney(m.allowanceMonthly) })}
          </div>
        ))}
      </Card>

      <Card>
        <div className="flex justify-between text-[13px]">
          <span>{t.settings.archetypeTitle}</span>
          <b>{ARCHETYPE_LABEL[household.data.archetype]}</b>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between text-[13px]">
          <span>{t.settings.fairnessRuleTitle}</span>
          <b>{FAIRNESS_LABEL[household.data.fairnessRule.type]}</b>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between text-[13px]">
          <span>{t.settings.safetyBufferTitle}</span>
          <b>{formatMoney(household.data.safetyBuffer)}</b>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between text-[13px]">
          <span>{t.settings.quietModeTitle}</span>
          <b>{household.data.quietModeEnabled ? t.settings.quietModeOn : t.settings.quietModeOff}</b>
        </div>
      </Card>

      <div className="flex items-center justify-between my-6 mb-3">
        <h3 className="text-[17px]">{t.settings.visibilityLogTitle}</h3>
      </div>
      {visibilityLog.data.length === 0 ? (
        <EmptyState message={t.settings.visibilityLogEmpty} />
      ) : (
        visibilityLog.data.map((entry) => <VisibilityLogRow key={entry.id} entry={entry} />)
      )}
    </div>
  );
}

function VisibilityLogRow({ entry }: { entry: VisibilityLogEntry }) {
  const at = formatDateShort(entry.at);
  return (
    <Card>
      <p className="text-[12px]">
        {entry.entityLabel
          ? formatTemplate(t.settings.visibilityLogEntry, {
              name: entry.changedByName,
              entity: entry.entityLabel,
              from: t.visibility[entry.from === 'summary_only' ? 'summary' : entry.from],
              to: t.visibility[entry.to === 'summary_only' ? 'summary' : entry.to],
            })
          : formatTemplate(t.settings.visibilityLogEntryHidden, {
              name: entry.changedByName,
              from: t.visibility[entry.from === 'summary_only' ? 'summary' : entry.from],
              to: t.visibility[entry.to === 'summary_only' ? 'summary' : entry.to],
            })}
      </p>
      <div className="flex justify-between mt-1.5">
        <small className="text-muted">{at}</small>
        <VisibilityBadge visibility={entry.to} />
      </div>
    </Card>
  );
}
