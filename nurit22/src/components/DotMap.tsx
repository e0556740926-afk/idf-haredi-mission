import React, { useMemo } from "react";
import { COLORS, HOME_COORDS } from "../config";
import land from "../geo/land.json";

export const DOTMAP_TOP = 83;
const BOTTOM = -57;

/** Flat dotted world map (equirectangular). `reveal` 0→1 lights dots outward from home. */
export const DotMap: React.FC<{ width: number; reveal: number; pulse?: number }> = ({ width, reveal, pulse = 0 }) => {
  const k = width / 360;
  const height = (DOTMAP_TOP - BOTTOM) * k;
  const [hx, hy] = [(HOME_COORDS[0] + 180) * k, (DOTMAP_TOP - HOME_COORDS[1]) * k];
  const dots = useMemo(() => {
    const d = land.dots2d as number[];
    const out: { x: number; y: number; delay: number }[] = [];
    for (let i = 0; i < d.length; i += 2) {
      const x = (d[i] + 180) * k;
      const y = (DOTMAP_TOP - d[i + 1]) * k;
      out.push({ x, y, delay: Math.hypot(x - hx, y - hy) / width });
    }
    return out;
  }, [width]);
  const r = k * 0.55;
  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
      {dots.map((p, i) => {
        const a = Math.max(0, Math.min(1, (reveal * 1.25 - p.delay) * 7));
        if (a <= 0) return null;
        return <circle key={i} cx={p.x} cy={p.y} r={r * (0.6 + 0.4 * a)} fill={i % 3 ? COLORS.gold : COLORS.goldLight} opacity={a * 0.95} />;
      })}
      {reveal > 0 && (
        <>
          <circle cx={hx} cy={hy} r={k * 1.6} fill={COLORS.cream} />
          <circle cx={hx} cy={hy} r={k * (2 + pulse * 6)} fill="none" stroke={COLORS.goldLight} strokeWidth={1.2} opacity={1 - pulse} />
        </>
      )}
    </svg>
  );
};

export const dotMapHome = (width: number) => ({ x: (HOME_COORDS[0] + 180) * (width / 360), y: (DOTMAP_TOP - HOME_COORDS[1]) * (width / 360) });
