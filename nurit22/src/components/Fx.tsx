import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS } from "../config";

/** Film grain + vignette on top of everything. */
export const Finish: React.FC<{ vignette?: number; grain?: number }> = ({ vignette = 0.65, grain = 0.08 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 50;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 48%, transparent 55%, rgba(0,0,0,${vignette}) 100%)` }} />
      <AbsoluteFill style={{ opacity: grain, mixBlendMode: "overlay" }}>
        <svg width={1920} height={1080}>
          <filter id={`grain${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Warm gold light leak that washes across the frame (p 0→1). */
export const LightLeak: React.FC<{ p: number; seed?: string }> = ({ p, seed = "leak" }) => {
  if (p <= 0 || p >= 1) return null;
  const a = Math.sin(p * Math.PI);
  const x = interpolate(p, [0, 1], [-10 + random(seed) * 20, 90 + random(seed + "x") * 20]);
  const y = 30 + random(seed + "y") * 40;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: a * 0.4, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 40% at ${x}% ${y}%, rgba(246,213,140,0.7), rgba(224,184,98,0.15) 45%, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(${100 + p * 40}deg, transparent 30%, rgba(251,241,220,${0.25 * a}) 50%, transparent 70%)` }} />
    </AbsoluteFill>
  );
};

/** Soft background: deep night with a faint blue bloom. */
export const NightSky: React.FC<{ x?: number; y?: number }> = ({ x = 50, y = 45 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 75% at ${x}% ${y}%, ${COLORS.blue} 0%, ${COLORS.night} 60%, #000 100%)` }} />
);

/** Bokeh — a few large, soft out-of-focus gold discs drifting slowly. */
export const Bokeh: React.FC<{ count?: number; seed?: string; opacity?: number }> = ({ count = 14, seed = "bokeh", opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const size = 30 + r("s") * 110;
        const x = r("x") * 1920 + Math.sin(frame / (90 + r("p") * 60) + r("q") * 6) * 40;
        const y = ((r("y") * 1300 - frame * (0.15 + r("v") * 0.35)) % 1300 + 1300) % 1300 - 110;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(246,213,140,${0.18 + r("a") * 0.2}) 0%, rgba(224,184,98,0.08) 55%, transparent 70%)`,
            filter: `blur(${2 + r("b") * 6}px)` }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Cinematic lower band for legible subtitles. */
export const LowerBand: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill style={{ opacity, background: `linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(7,20,46,0.55) 18%, transparent 36%)`, pointerEvents: "none" }} />
);
