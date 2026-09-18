import { TodayScreen } from '../today/TodayScreen';
import { ActivityScreen } from '../activity/ActivityScreen';
import { HomeScreen } from '../home/HomeScreen';
import { RitualScreen } from '../ritual/RitualScreen';
import { CashflowScreen } from '../cashflow/CashflowScreen';
import { t } from '../../i18n/he';

const FRAMES = [
  { id: 'today', label: t.nav.today, Screen: TodayScreen },
  { id: 'activity', label: t.nav.activity, Screen: ActivityScreen },
  { id: 'home', label: t.nav.home, Screen: HomeScreen },
  { id: 'ritual', label: t.nav.ritual, Screen: RitualScreen },
  { id: 'flow', label: t.nav.flow, Screen: CashflowScreen },
];

/**
 * Dev-only comparison view against design/prototype.html's five-phones-on-a-
 * canvas layout — see PROMPT-FULL-BUILD.md point "חריג אחד". Never linked
 * from the product's own navigation.
 */
export function CanvasScreen() {
  return (
    <div className="min-h-screen bg-canvas p-6">
      <h1 className="text-[20px] mb-1">{t.canvas.title}</h1>
      <p className="text-[12px] text-muted mb-6">{t.canvas.subtitle}</p>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {FRAMES.map(({ id, label, Screen }) => (
          <div key={id} className="shrink-0 w-[390px]">
            <div className="flex justify-between text-[12px] text-muted mb-3">
              <span>{label}</span>
            </div>
            <div className="h-[844px] w-[390px] border border-line rounded-[28px] bg-bg overflow-y-auto p-[20px_22px_28px] shadow-[0_10px_35px_#1c3a5e0a]">
              <Screen />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
