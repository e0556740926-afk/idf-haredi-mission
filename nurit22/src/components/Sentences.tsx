import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../config";
import { Words } from "./Words";

type Win = { text: string; from: number; to: number };

/** Shows one sentence at a time, synced to the voice windows (frames relative to this component). */
export const Sentences: React.FC<{ windows: Win[]; style?: React.CSSProperties; fontSize?: number }> = ({ windows, style, fontSize = 64 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150, ...style }}>
      {windows.map((w, i) => {
        if (frame < w.from - 2 || frame > w.to + 14) return null;
        const last = i === windows.length - 1;
        return (
          <div key={i} style={{ position: "absolute", width: 1500, bottom: 150 }}>
            <Words text={w.text} start={w.from} stagger={3} dur={14} exitAt={last ? undefined : w.to - 2}
              style={{ fontFamily: FONTS.body, fontWeight: 400, fontSize, lineHeight: 1.35, color: COLORS.cream,
                textShadow: `0 2px 20px ${COLORS.night}, 0 0 30px rgba(7,20,46,0.9)` }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
