import React from "react";
import { COLORS } from "../config";

export type PatternKey = "seigaiha" | "quatrefoil" | "lattice" | "jali" | "talavera" | "star";

const S = { fill: "none", stroke: COLORS.gold, strokeWidth: 1 } as const;

/** Engraved gold ornament tiles — one per country. */
const TILES: Record<PatternKey, { w: number; h: number; body: React.ReactNode }> = {
  // Japan — seigaiha waves
  seigaiha: {
    w: 48, h: 24,
    body: (
      <>
        {[[0, 12], [48, 12], [24, 24], [0, 36], [48, 36]].map(([cx, cy], k) => (
          <g key={k}>
            {[22, 16, 10, 4].map((r) => <circle key={r} cx={cx} cy={cy} r={r} fill={r === 22 ? COLORS.night : "none"} stroke={COLORS.gold} strokeWidth={1} />)}
          </g>
        ))}
      </>
    ),
  },
  // Italy — quatrefoil tiles
  quatrefoil: {
    w: 48, h: 48,
    body: (
      <>
        <rect x={0} y={0} width={48} height={48} {...S} strokeOpacity={0.5} />
        {[[24, 12], [36, 24], [24, 36], [12, 24]].map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={12} {...S} />)}
        <circle cx={24} cy={24} r={3} fill={COLORS.gold} />
      </>
    ),
  },
  // Korea — window lattice
  lattice: {
    w: 40, h: 40,
    body: (
      <>
        <rect x={2} y={2} width={36} height={36} {...S} />
        <rect x={10} y={10} width={20} height={20} {...S} />
        <path d="M2,20 H10 M30,20 H38 M20,2 V10 M20,30 V38 M10,10 L2,2 M30,10 L38,2 M10,30 L2,38 M30,30 L38,38" {...S} />
      </>
    ),
  },
  // India — jali (overlapping circles)
  jali: {
    w: 40, h: 40,
    body: (
      <>
        {[[0, 0], [40, 0], [0, 40], [40, 40], [20, 20]].map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={20} {...S} />)}
        <circle cx={20} cy={20} r={4} {...S} />
      </>
    ),
  },
  // Mexico — talavera star tile
  talavera: {
    w: 56, h: 56,
    body: (
      <>
        <rect x={0} y={0} width={56} height={56} {...S} strokeOpacity={0.5} />
        <rect x={16} y={16} width={24} height={24} {...S} />
        <rect x={16} y={16} width={24} height={24} {...S} transform="rotate(45 28 28)" />
        <circle cx={28} cy={28} r={5} {...S} />
        {[[0, 0], [56, 0], [0, 56], [56, 56]].map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={10} {...S} />)}
      </>
    ),
  },
  // Turkey & Dubai — eight-point Islamic star
  star: {
    w: 60, h: 60,
    body: (
      <>
        <rect x={16} y={16} width={28} height={28} {...S} />
        <rect x={16} y={16} width={28} height={28} {...S} transform="rotate(45 30 30)" />
        <path d="M30,10 V0 M30,50 V60 M10,30 H0 M50,30 H60 M16,16 L0,0 M44,16 L60,0 M16,44 L0,60 M44,44 L60,60" {...S} />
        <circle cx={30} cy={30} r={6} {...S} />
      </>
    ),
  },
};

/** Fills its box with the country's ornament. `scale` enlarges the tile. */
export const Ornament: React.FC<{ kind: PatternKey; opacity?: number; scale?: number; id: string; style?: React.CSSProperties; offset?: number }> = ({
  kind, opacity = 0.2, scale = 1, id, style, offset = 0,
}) => {
  const t = TILES[kind];
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity, ...style }}>
      <defs>
        <pattern id={id} width={t.w * scale} height={t.h * scale} patternUnits="userSpaceOnUse"
          patternTransform={`translate(${offset} 0)`}>
          <g transform={`scale(${scale})`}>{t.body}</g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};
