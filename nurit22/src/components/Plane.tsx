import React from "react";
import { COLORS } from "../config";

/** Small gold airliner seen from above, nose pointing right (angle 0). */
export const Plane: React.FC<{ size?: number; glow?: number }> = ({ size = 60, glow = 1 }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: "visible",
    filter: `drop-shadow(0 0 ${6 * glow}px ${COLORS.gold}) drop-shadow(0 0 ${16 * glow}px rgba(224,184,98,0.45))` }}>
    <defs>
      <linearGradient id="planeGold" x1="0" y1="-1" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor={COLORS.goldLight} />
        <stop offset="1" stopColor={COLORS.gold} />
      </linearGradient>
    </defs>
    <path fill="url(#planeGold)" stroke={COLORS.cream} strokeWidth={0.8} strokeLinejoin="round"
      d="M46,0 C46,-3 42,-5 36,-5 L10,-5 L-10,-38 L-18,-38 L-6,-5 L-28,-5 L-36,-16 L-42,-16 L-37,0 L-42,16 L-36,16 L-28,5 L-6,5 L-18,38 L-10,38 L10,5 L36,5 C42,5 46,3 46,0 Z" />
  </svg>
);
