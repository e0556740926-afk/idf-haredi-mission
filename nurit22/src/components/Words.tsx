import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

/** Hebrew text revealed word by word (RTL). Frame 0 = start of reveal. */
export const Words: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  dur?: number;
  exitAt?: number;
  exitDur?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}> = ({ text, start = 0, stagger = 4, dur = 16, exitAt, exitDur = 12, style, wordStyle }) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  const exit = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + exitDur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div dir="rtl" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.28em", opacity: exit, ...style }}>
      {words.map((w, i) => {
        const p = interpolate(frame - start - i * stagger, [0, dur], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
        });
        return (
          <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 0.45}em)`,
            filter: p < 1 ? `blur(${(1 - p) * 8}px)` : "none", ...wordStyle }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};
