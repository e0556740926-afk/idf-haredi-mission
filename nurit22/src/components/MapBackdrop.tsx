import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config";
import { K, leg, STOPS, toScreen, viewBoxFor, type Cam } from "../lib/camera";
import { GRATICULE, LAND_PATHS, project } from "../lib/map";
import { Plane } from "./Plane";

export type LegDraw = { index: number; draw: number };

/** World map seen through a camera, with dashed flight legs, stop markers and the gold plane. */
export const MapBackdrop: React.FC<{
  cam: Cam;
  legs: LegDraw[];
  stops: number[];
  pulseStop?: number;
  plane?: { x: number; y: number; angle: number; scale?: number } | null;
  mapOpacity?: number;
  labels?: boolean;
}> = ({ cam, legs, stops, pulseStop, plane, mapOpacity = 0.5, labels }) => {
  const frame = useCurrentFrame();
  const px = 1 / (K * cam.z); // one screen pixel in map units
  const planeScreen = plane ? toScreen([plane.x, plane.y], cam) : null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: mapOpacity }}>
        <svg viewBox={viewBoxFor(cam)} width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id="bdGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation={3 * px} result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <BackdropLand px={px} />
        </svg>
      </AbsoluteFill>
      <svg viewBox={viewBoxFor(cam)} width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {legs.map(({ index, draw }) => {
          const r = leg(index);
          return (
            <g key={index}>
              <defs>
                <mask id={`leg${index}`} maskUnits="userSpaceOnUse">
                  <path d={r.d} fill="none" stroke="#fff" strokeWidth={14 * px} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
                </mask>
              </defs>
              <path d={r.d} fill="none" stroke={COLORS.goldLight} strokeWidth={3 * px} strokeDasharray={`${10 * px} ${12 * px}`}
                strokeLinecap="round" mask={`url(#leg${index})`} opacity={0.95} />
            </g>
          );
        })}
        {stops.map((s) => {
          const [x, y] = project(STOPS[s]);
          const pulsing = s === pulseStop;
          const ph = (frame % 45) / 45;
          return (
            <g key={s}>
              <circle cx={x} cy={y} r={(pulsing ? 9 + 3 * Math.sin(frame / 6) : 7) * px} fill={COLORS.goldLight} />
              {pulsing && <circle cx={x} cy={y} r={(18 + ph * 40) * px} fill="none" stroke={COLORS.gold} strokeWidth={2 * px} opacity={1 - ph} />}
              {labels && s > 0 && s < STOPS.length - 1 && (
                <text x={x} y={y - 18 * px} textAnchor="middle" fill={COLORS.gold} fontSize={24 * px} fontFamily="Heebo" fontWeight={700}>{s}</text>
              )}
            </g>
          );
        })}
      </svg>
      {plane && planeScreen && (
        <div style={{ position: "absolute", left: planeScreen[0], top: planeScreen[1],
          transform: `translate(-50%, -50%) rotate(${plane.angle}deg) scale(${plane.scale ?? 1})` }}>
          <Plane size={70} glow={1.3} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// Land outlines memoised separately — they never change, only the viewBox does.
const BackdropLand: React.FC<{ px: number }> = React.memo(({ px }) => (
  <>
    <g opacity={0.18}>
      {GRATICULE.map((d, i) => (
        <path key={i} d={d} stroke={COLORS.gold} strokeWidth={px} strokeDasharray={`${2 * px} ${8 * px}`} fill="none" />
      ))}
    </g>
    <g filter="url(#bdGlow)">
      {LAND_PATHS.map((d, i) => (
        <path key={i} d={d} fill={COLORS.gold} fillOpacity={0.06} stroke={COLORS.goldLight} strokeWidth={2.4 * px} strokeLinejoin="round" />
      ))}
    </g>
  </>
));
