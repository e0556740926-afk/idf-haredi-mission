import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../config";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** Metallic gold foil fill for text (background-clip), with a light sheen travelling across. */
export const foilStyle = (sheen: number, glow = 1): React.CSSProperties => ({
  backgroundImage: `linear-gradient(105deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 18%, ${COLORS.gold} 34%, ${COLORS.goldLight} 44%, ${COLORS.cream} 48%, ${COLORS.goldLight} 52%, ${COLORS.gold} 62%, ${COLORS.goldLight} 82%, ${COLORS.gold} 100%)`,
  backgroundSize: "300% 100%",
  backgroundPosition: `${100 - sheen * 100}% 50%`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: glow > 0 ? `drop-shadow(0 0 ${14 * glow}px rgba(224,184,98,${0.35 * glow})) drop-shadow(0 2px 0 rgba(7,20,46,0.6))` : undefined,
});

/** Sheen position 0..1 that loops slowly (plus an optional sweep burst). */
export const useSheen = (period = 150, offset = 0) => {
  const frame = useCurrentFrame();
  return (((frame + offset) % period) / period) * 1.0;
};

/**
 * Words rising from behind a mask line (RTL), one after another.
 * Frame 0 = start. `exitAt` fades/lifts the whole line out.
 */
export const MaskWords: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  dur?: number;
  exitAt?: number;
  exitDur?: number;
  foil?: boolean;
  glow?: number;
  style?: React.CSSProperties;
  align?: "center" | "flex-start" | "flex-end";
}> = ({ text, start = 0, stagger = 3, dur = 22, exitAt, exitDur = 14, foil, glow = 1, style, align = "center" }) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + exitDur], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const sheen = ((frame % 180) / 180);
  return (
    <div dir="rtl" style={{ display: "flex", flexWrap: "wrap", justifyContent: align, columnGap: "0.26em", opacity: 1 - exit,
      transform: `translateY(${-exit * 18}px)`,
      filter: [exit > 0 ? `blur(${exit * 6}px)` : "", foil && glow > 0 ? `drop-shadow(0 0 ${14 * glow}px rgba(224,184,98,${0.4 * glow})) drop-shadow(0 2px 1px rgba(7,20,46,0.7))` : ""].join(" ").trim() || undefined,
      ...style }}>
      {words.map((w, i) => {
        const p = interpolate(frame - start - i * stagger, [0, dur], [0, 1], { ...clamp, easing: EASE_OUT });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", paddingTop: "0.08em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 4}deg)`,
              ...(foil ? foilStyle(sheen, 0) : {}) }}>
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Thin gold rule with a diamond in the middle, drawing out from the centre. */
export const GoldRule: React.FC<{ p: number; width?: number; diamond?: boolean }> = ({ p, width = 320, diamond = true }) => (
  <svg width={width} height={16} viewBox={`0 0 ${width} 16`} style={{ overflow: "visible", display: "block" }}>
    <defs>
      <linearGradient id="ruleG" x1="0" x2="1">
        <stop offset="0" stopColor={COLORS.gold} stopOpacity={0} />
        <stop offset="0.5" stopColor={COLORS.goldLight} />
        <stop offset="1" stopColor={COLORS.gold} stopOpacity={0} />
      </linearGradient>
    </defs>
    <line x1={width / 2 - (width / 2) * p} x2={width / 2 + (width / 2) * p} y1={8} y2={8} stroke="url(#ruleG)" strokeWidth={1.2} />
    {diamond && <path d={`M${width / 2},${8 - 5 * p} L${width / 2 + 5 * p},8 L${width / 2},${8 + 5 * p} L${width / 2 - 5 * p},8 Z`} fill={COLORS.goldLight} />}
  </svg>
);
