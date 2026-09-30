import React from "react";
import { COLORS } from "../config";
import { GRATICULE, LAND_PATHS, MAP_H, MAP_W } from "../lib/map";

/** Gold line world map. `draw` 0→1 animates the outlines drawing themselves. */
export const WorldMap: React.FC<{ draw?: number; width?: number | string; strokeScale?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({
  draw = 1, width = "100%", strokeScale = 1, children, style,
}) => (
  <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width={width} style={{ overflow: "visible", display: "block", ...style }}>
    <defs>
      <filter id="mapGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={3 * strokeScale} result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g opacity={0.18 * Math.min(1, draw * 2)}>
      {GRATICULE.map((d, i) => (
        <path key={i} d={d} stroke={COLORS.gold} strokeWidth={1 * strokeScale} strokeDasharray={`${2 * strokeScale} ${8 * strokeScale}`} fill="none" />
      ))}
    </g>
    <g filter="url(#mapGlow)">
      {LAND_PATHS.map((d, i) => {
        const local = Math.max(0, Math.min(1, draw * 1.35 - i * 0.025));
        return (
          <path key={i} d={d} pathLength={1} fill={COLORS.gold} fillOpacity={0.06 * local}
            stroke={COLORS.goldLight} strokeWidth={2.2 * strokeScale} strokeLinejoin="round"
            strokeDasharray="1 1" strokeDashoffset={1 - local} />
        );
      })}
    </g>
    {children}
  </svg>
);
