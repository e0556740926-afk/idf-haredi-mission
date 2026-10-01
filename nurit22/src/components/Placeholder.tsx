import React from "react";
import { Img } from "remotion";
import { BRAND, COLORS, FONTS } from "../config";
import { foilStyle } from "./Foil";

/** Photo in a gilded frame; without a file, an elegant gold "תמונה" placeholder. */
export const FramedImage: React.FC<{ src?: string | null; width: number; height: number; style?: React.CSSProperties; imgStyle?: React.CSSProperties }> = ({
  src, width, height, style, imgStyle,
}) => (
  <div style={{ width, height, padding: 14, boxSizing: "border-box", position: "relative",
    background: `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold} 30%, ${COLORS.goldLight} 50%, ${COLORS.gold} 70%, ${COLORS.goldLight})`,
    boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(224,184,98,0.18)`, ...style }}>
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", background: COLORS.night,
      boxShadow: `inset 0 0 0 1px rgba(7,20,46,0.8)` }}>
      {src ? (
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", ...imgStyle }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `radial-gradient(ellipse at 50% 40%, ${COLORS.blue}, ${COLORS.night} 75%)` }}>
          <div style={{ position: "absolute", inset: 18, border: `1px solid rgba(224,184,98,0.45)` }} />
          <div style={{ fontFamily: FONTS.title, fontSize: Math.min(width, height) * 0.1, letterSpacing: 4, ...foilStyle(0.5, 0.6) }}>
            {BRAND.placeholderImage}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 60px rgba(0,0,0,0.45)" }} />
    </div>
  </div>
);
