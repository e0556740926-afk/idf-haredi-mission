import React from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { BRAND, COLORS, FONTS } from "../config";
import { project } from "../lib/map";
import { HOME_COORDS } from "../config";
import { WorldMap } from "./WorldMap";
import { FramedImage } from "./Placeholder";
import { assetSrc, hasAsset } from "../lib/assets";

export const PAGE_W = 440;
export const PAGE_H = 600;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Guilloche: React.FC<{ opacity?: number }> = ({ opacity = 0.14 }) => (
  <svg width={PAGE_W} height={PAGE_H} style={{ position: "absolute", inset: 0, opacity }}>
    {Array.from({ length: 14 }, (_, i) => (
      <ellipse key={i} cx={PAGE_W / 2} cy={PAGE_H / 2} rx={60 + i * 14} ry={110 + i * 12} fill="none"
        stroke={COLORS.gold} strokeWidth={0.8} transform={`rotate(${i * 13} ${PAGE_W / 2} ${PAGE_H / 2})`} />
    ))}
  </svg>
);

/** Round gold stamp face — used both for the falling stamp and the mark it leaves. */
export const StampFace: React.FC<{ size: number; ink?: boolean }> = ({ size, ink }) => {
  const c = size / 2;
  const id = ink ? "ringInk" : "ringTool";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <path id={id} d={`M${c},${c} m-${c * 0.78},0 a${c * 0.78},${c * 0.78} 0 1,1 ${c * 1.56},0 a${c * 0.78},${c * 0.78} 0 1,1 -${c * 1.56},0`} />
      </defs>
      {!ink && <circle cx={c} cy={c} r={c} fill={COLORS.blue} />}
      <circle cx={c} cy={c} r={c * 0.96} fill="none" stroke={COLORS.gold} strokeWidth={size * 0.035} />
      <circle cx={c} cy={c} r={c * 0.64} fill="none" stroke={COLORS.gold} strokeWidth={size * 0.018} />
      <text fill={COLORS.gold} fontFamily={FONTS.body} fontWeight={700} fontSize={size * 0.085} letterSpacing={size * 0.012}>
        <textPath href={`#${id}`}>{BRAND.stampRing}</textPath>
      </text>
      <text x={c} y={c + size * 0.14} textAnchor="middle" fill={COLORS.goldLight} fontFamily={FONTS.title} fontSize={size * 0.44}>
        {BRAND.stampNumber}
      </text>
    </svg>
  );
};

/** Gold particle burst. `t` = frames since impact. */
export const Burst: React.FC<{ t: number; x: number; y: number; count?: number; seed?: string }> = ({ t, x, y, count = 70, seed = "burst" }) => {
  if (t < 0 || t > 50) return null;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const ang = r("a") * Math.PI * 2;
        const speed = 8 + r("s") * 26;
        const drag = 1 - Math.exp(-t / 9);
        const dist = speed * 9 * drag;
        const px = x + Math.cos(ang) * dist;
        const py = y + Math.sin(ang) * dist * 0.75 + t * t * 0.03;
        const life = interpolate(t, [0, 10 + r("l") * 35], [1, 0], clamp);
        const size = 1.5 + r("z") * 4;
        return <circle key={i} cx={px} cy={py} r={size * (0.5 + life * 0.5)} fill={r("c") > 0.4 ? COLORS.goldLight : COLORS.gold}
          opacity={life} style={{ filter: `drop-shadow(0 0 6px ${COLORS.gold})` }} />;
      })}
      <circle cx={x} cy={y} r={20 + t * 14} fill="none" stroke={COLORS.goldLight} strokeWidth={Math.max(0, 6 - t * 0.4)}
        opacity={interpolate(t, [0, 14], [0.9, 0], clamp)} />
    </svg>
  );
};

/** The passport. `open` 0→1 flips the cover (RTL: hinge on the right), `mapDraw` draws the map on the spread,
 *  `stampMark` 0→1 shows the ink mark on the cover. */
export const Passport: React.FC<{ open: number; mapDraw: number; stampMark: number; children?: React.ReactNode }> = ({
  open, mapDraw, stampMark, children,
}) => {
  const coverAngle = interpolate(open, [0, 1], [0, 180], { easing: Easing.inOut(Easing.cubic) });
  const shift = interpolate(open, [0, 1], [PAGE_W / 2, 0], { easing: Easing.inOut(Easing.cubic) });
  const spreadVisible = interpolate(open, [0, 0.08], [0, 1], clamp);
  const markScale = interpolate(stampMark, [0, 0.4, 1], [1.25, 0.96, 1]);

  const page: React.CSSProperties = {
    position: "absolute", top: 0, width: PAGE_W, height: PAGE_H, background: COLORS.blue,
    boxShadow: `inset 0 0 0 2px rgba(224,184,98,0.35)`, overflow: "hidden",
  };

  return (
    <div style={{ position: "relative", width: PAGE_W * 2, height: PAGE_H, transformStyle: "preserve-3d", transform: `translateX(${shift}px)` }}>
      {/* inner spread */}
      <div style={{ ...page, left: 0, opacity: spreadVisible, borderRadius: "14px 0 0 14px" }}><Guilloche /></div>
      <div style={{ ...page, left: PAGE_W, opacity: spreadVisible, borderRadius: "0 14px 14px 0" }}><Guilloche /></div>
      <div style={{ position: "absolute", left: PAGE_W - 1, top: 0, width: 2, height: PAGE_H, opacity: spreadVisible,
        background: `linear-gradient(${COLORS.night}, ${COLORS.gold}, ${COLORS.night})` }} />
      {/* passport photo on the data page */}
      <div style={{ position: "absolute", left: 34, top: PAGE_H - 150, opacity: spreadVisible, display: "flex", gap: 22, alignItems: "center", transform: "translateZ(1px)" }}>
        <FramedImage src={hasAsset("face.png") ? assetSrc("face.png") : null} width={100} height={124} style={{ padding: 4, borderWidth: 2 }} />
        <div style={{ fontFamily: FONTS.body, color: COLORS.gold, fontSize: 15, letterSpacing: 3, lineHeight: 1.7 }}>
          <div style={{ fontFamily: FONTS.title, fontSize: 30, color: COLORS.goldLight, letterSpacing: 2 }}>{BRAND.passportName}</div>
          <div>{BRAND.airline.toUpperCase()}</div>
          <div dir="rtl">{BRAND.flight}</div>
        </div>
      </div>
      {/* map across the spread */}
      <div style={{ position: "absolute", left: 20, right: 20, top: 120, opacity: spreadVisible, transform: "translateZ(1px)" }}>
        <WorldMap draw={mapDraw} strokeScale={2.2}>{children}</WorldMap>
      </div>

      {/* cover */}
      <div style={{ position: "absolute", left: 0, top: 0, width: PAGE_W, height: PAGE_H, transformStyle: "preserve-3d",
        transformOrigin: "right center", transform: `rotateY(${coverAngle}deg) translateZ(2px)` }}>
        {/* front */}
        <div style={{ ...page, left: 0, backfaceVisibility: "hidden", borderRadius: 14,
          background: `linear-gradient(145deg, ${COLORS.blue}, ${COLORS.night})`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 2px ${COLORS.gold}, inset 0 0 0 10px ${COLORS.blue}, inset 0 0 0 11px rgba(224,184,98,0.6)` }}>
          <Guilloche opacity={0.08} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
            <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, letterSpacing: 10, color: COLORS.gold }}>
              {BRAND.passportLabel}
            </div>
            <svg width={150} height={150} viewBox="-60 -60 120 120" style={{ marginTop: 50 }}>
              <g fill="none" stroke={COLORS.gold} strokeWidth={2}>
                <circle r={52} />
                <ellipse rx={22} ry={52} />
                <ellipse rx={42} ry={52} />
                <path d="M-52,0H52M-46,-24H46M-46,24H46" />
              </g>
            </svg>
            <div style={{ marginTop: 50, fontFamily: FONTS.title, fontSize: 64, color: COLORS.goldLight, letterSpacing: 4,
              textShadow: `0 0 18px rgba(224,184,98,0.55)` }}>
              {BRAND.passportName}
            </div>
            <div style={{ marginTop: 14, fontFamily: FONTS.body, fontSize: 20, letterSpacing: 8, color: COLORS.gold }}>
              {BRAND.airline.toUpperCase()}
            </div>
          </AbsoluteFill>
          {/* stamp ink */}
          {stampMark > 0 && (
            <div style={{ position: "absolute", left: 210, top: 330, opacity: 0.92 * Math.min(1, stampMark * 3),
              transform: `rotate(-14deg) scale(${markScale})`, filter: `drop-shadow(0 0 10px rgba(246,213,140,0.6))` }}>
              <StampFace size={190} ink />
            </div>
          )}
        </div>
        {/* back (inside of cover) */}
        <div style={{ ...page, left: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 14 }}>
          <Guilloche />
        </div>
      </div>
    </div>
  );
};

/** Home point on the passport map, in page-spread pixels (for launching the plane). */
export const homeOnSpread = () => {
  const [mx, my] = project(HOME_COORDS);
  const mapPx = PAGE_W * 2 - 40;
  const k = mapPx / 2000;
  return { x: 20 + mx * k, y: 120 + my * k };
};
