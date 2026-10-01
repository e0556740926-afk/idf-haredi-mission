import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config";

/** Slowly drifting, twinkling specks of gold dust. */
export const GoldDust: React.FC<{ count?: number; seed?: string; opacity?: number }> = ({
  count = 70,
  seed = "dust",
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <svg width={width} height={height}>
        {Array.from({ length: count }, (_, i) => {
          const r = (k: string) => random(`${seed}-${i}-${k}`);
          const speed = 0.15 + r("s") * 0.5;
          const x = (r("x") * width + Math.sin(frame / (60 + r("w") * 80) + r("p") * 6) * 30 + frame * speed * 0.3) % width;
          const y = (((r("y") * height - frame * speed) % height) + height) % height;
          const size = 0.8 + r("r") * 2.4;
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (20 + r("t") * 40) + r("o") * 10));
          return (
            <circle key={i} cx={x} cy={y} r={size} fill={r("c") > 0.5 ? COLORS.goldLight : COLORS.gold}
              opacity={tw * (0.25 + r("a") * 0.55)} style={{ filter: size > 2 ? "blur(0.6px)" : undefined }} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
