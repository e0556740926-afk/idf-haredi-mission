import { parseIsoDate } from '../lib/date';
import type { CashflowCliff, CashflowPoint } from '../data/types';

const WIDTH = 320;
const HEIGHT = 265;
const LEFT = 22;
const RIGHT = 280;
const TOP = 20;
const BOTTOM = 200;

/**
 * Manual SVG, no chart library (docs/04-conventions.md). Time runs from
 * right (today) to left (the far future) — a deliberate RTL choice kept
 * from design/prototype.html (docs/08-design-system.md).
 */
export function ForecastChart({
  points,
  cliffs,
  floor,
}: {
  points: CashflowPoint[];
  cliffs: CashflowCliff[];
  floor: number;
}) {
  if (points.length === 0) return null;

  const dates = points.map((p) => parseIsoDate(p.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateSpan = Math.max(1, maxDate - minDate);

  const values = points.flatMap((p) => [p.low, p.high, p.expected, floor]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueSpan = Math.max(1, maxValue - minValue);

  const x = (dateIso: string) => {
    const ratio = (parseIsoDate(dateIso).getTime() - minDate) / dateSpan;
    return RIGHT - ratio * (RIGHT - LEFT);
  };
  const y = (value: number) => {
    const ratio = (value - minValue) / valueSpan;
    return BOTTOM - ratio * (BOTTOM - TOP);
  };

  const expectedPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.date)} ${y(p.expected)}`).join('');
  const highPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.date)} ${y(p.high)}`).join('');
  const lowPathReversed = [...points]
    .reverse()
    .map((p) => `L${x(p.date)} ${y(p.low)}`)
    .join('');
  const areaPath = `${highPath}${lowPathReversed}Z`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="תחזית יתרת הבית ל־90 יום, ציר הזמן מתקדם מימין לשמאל"
      className="w-full h-auto overflow-visible"
    >
      <defs>
        <linearGradient id="forecastShade" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#b9cbe0" stopOpacity={0.65} />
          <stop offset="1" stopColor="#e2eaf4" stopOpacity={0.4} />
        </linearGradient>
      </defs>

      <path d={`M${LEFT} ${y(maxValue)}H${RIGHT}`} stroke="#e2e7ef" strokeDasharray="3 5" />
      <text x={RIGHT - 2} y={y(maxValue) + 4} textAnchor="end" fontSize={10} fill="var(--muted)">
        {Math.round(maxValue).toLocaleString('he-IL')}
      </text>

      <path d={`M${LEFT} ${y(floor)}H${RIGHT}`} stroke="#9a5a1e" strokeDasharray="5 5" />
      <text x={RIGHT - 2} y={y(floor) + 16} textAnchor="end" fontSize={10} fill="var(--muted)">
        {`רצפה: ${floor.toLocaleString('he-IL')} ₪`}
      </text>

      <path d={areaPath} fill="url(#forecastShade)" />
      <path d={expectedPath} fill="none" stroke="var(--blue)" strokeWidth={2.5} />

      {cliffs.map((cliff) => (
        <g key={cliff.date}>
          <circle cx={x(cliff.date)} cy={y(0)} r={5} fill="#9a5a1e" stroke="white" strokeWidth={2} />
          <path d={`M${x(cliff.date)} ${y(0) + 6}V${y(0) + 33}`} stroke="#9a5a1e" />
          <rect
            x={Math.max(LEFT, x(cliff.date) - 66)}
            y={y(0) + 32}
            width={132}
            height={22}
            rx={5}
            fill="var(--warm)"
          />
          <text
            x={Math.max(LEFT, x(cliff.date) - 66) + 128}
            y={y(0) + 47}
            textAnchor="end"
            fontSize={10}
            fill="var(--copper)"
          >
            {cliff.label}
          </text>
        </g>
      ))}

      <text x={RIGHT + 1} y={239} textAnchor="end" fontSize={10} fill="var(--muted)">
        {new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(minDate)}
      </text>
      <text x={LEFT} y={239} textAnchor="start" fontSize={10} fill="var(--muted)">
        {new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(maxDate)}
      </text>
    </svg>
  );
}
