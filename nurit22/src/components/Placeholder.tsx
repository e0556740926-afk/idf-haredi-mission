import React from "react";
import { Img } from "remotion";
import { BRAND, COLORS, FONTS } from "../config";

/** Image in a gold frame; falls back to a gold "תמונה" placeholder when the file is missing. */
export const FramedImage: React.FC<{ src?: string | null; width: number; height: number; style?: React.CSSProperties; imgStyle?: React.CSSProperties }> = ({
  src, width, height, style, imgStyle,
}) => (
  <div style={{ width, height, padding: 10, boxSizing: "border-box", border: `3px solid ${COLORS.gold}`,
    background: COLORS.blue, boxShadow: `0 0 40px rgba(224,184,98,0.25), inset 0 0 0 1px ${COLORS.goldLight}`, ...style }}>
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative",
      outline: `1px solid rgba(246,213,140,0.5)` }}>
      {src ? (
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", ...imgStyle }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `radial-gradient(circle, ${COLORS.blue}, ${COLORS.night})`, color: COLORS.gold,
          fontFamily: FONTS.title, fontSize: Math.min(width, height) * 0.14 }}>
          {BRAND.placeholderImage}
        </div>
      )}
    </div>
  </div>
);
