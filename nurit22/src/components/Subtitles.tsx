import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../config";
import { EASE_OUT, MaskWords } from "./Foil";

export type Win = { text: string; from: number; to: number };

/** One sentence at a time, rising word by word; a hairline of gold marks each new line. */
export const Subtitles: React.FC<{ windows: Win[]; fontSize?: number; box?: React.CSSProperties; highlightLast?: number }> = ({
  windows, fontSize = 54, box, highlightLast = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {windows.map((w, i) => {
        if (frame < w.from - 2 || frame > w.to + 16) return null;
        const last = i === windows.length - 1;
        const big = i >= windows.length - highlightLast;
        const line = interpolate(frame, [w.from, w.from + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
        return (
          <div key={i} style={{ position: "absolute", left: 200, right: 200, bottom: 96, display: "flex", flexDirection: "column", alignItems: "center", ...box }}>
            <div style={{ width: 90 * line, height: 1.5, background: COLORS.gold, marginBottom: 22, opacity: (last ? 1 : interpolate(frame, [w.to - 2, w.to + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) * 0.8 }} />
            <MaskWords text={w.text} start={w.from} stagger={2} dur={18} exitAt={last ? undefined : w.to - 2} foil={big} glow={big ? 1.2 : 0}
              style={{ fontFamily: big ? FONTS.title : FONTS.body, fontWeight: 300, fontSize: big ? fontSize * 1.5 : fontSize, lineHeight: 1.38,
                color: COLORS.cream, textShadow: big ? undefined : `0 2px 24px rgba(0,0,0,0.85)` }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
