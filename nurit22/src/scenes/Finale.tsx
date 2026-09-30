import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, useCurrentFrame } from "remotion";
import { BRAND, COLORS, FINALE, FINALE_TIMING as FT, FONTS } from "../config";
import { GoldDust } from "../components/GoldDust";
import { MapBackdrop } from "../components/MapBackdrop";
import { Burst } from "../components/Passport";
import { FramedImage } from "../components/Placeholder";
import { Voice } from "../components/Sound";
import { Words } from "../components/Words";
import { legCam, lerpCam, planeOnLeg, STOPS, WORLD_CAM } from "../lib/camera";
import { assetSrc, hasAsset } from "../lib/assets";
import { sec, sentenceWindows } from "../lib/timing";

export type FinaleProps = { voiceSec: number };

export const finaleVoiceStart = () => sec(FT.routes) + sec(FT.table);
export const finaleFrames = (voiceSec: number) =>
  finaleVoiceStart() + sec(voiceSec) + sec(FT.logo) + sec(FT.endLine) + sec(FT.black);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

const glowText = `0 0 24px rgba(224,184,98,0.7), 0 0 80px rgba(224,184,98,0.35)`;

const Heart: React.FC<{ size: number; pulse: number }> = ({ size, pulse }) => (
  <svg width={size} height={size} viewBox="0 0 160 150" style={{ overflow: "visible", transform: `scale(${pulse})`,
    filter: `drop-shadow(0 0 12px ${COLORS.gold}) drop-shadow(0 0 40px rgba(224,184,98,0.5))` }}>
    <path d="M80,136 C20,96 8,60 22,36 C38,10 72,16 80,44 C88,16 122,10 138,36 C152,60 140,96 80,136 Z"
      fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth={4} />
  </svg>
);

/** 1 — zoom out to all six routes. */
const RoutesPart: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ramp(frame, 0, sec(FT.routes) * 0.85);
  const land = ramp(frame, 0, sec(FT.routes) * 0.6, Easing.out(Easing.cubic));
  const cam = lerpCam(legCam(STOPS.length - 2), WORLD_CAM, p);
  const lastLeg = STOPS.length - 2;
  const legs = Array.from({ length: lastLeg + 1 }, (_, i) => ({ index: i, draw: i === lastLeg ? 0.55 + 0.45 * land : 1 }));
  const plane = { ...planeOnLeg(lastLeg, 0.55 + 0.45 * land), scale: 1 };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${COLORS.blue}, ${COLORS.night} 72%)` }}>
      <MapBackdrop cam={cam} legs={legs} stops={STOPS.slice(0, -1).map((_, i) => i)} pulseStop={0} plane={plane} mapOpacity={0.55} labels />
      <GoldDust count={60} seed="finale-map" />
    </AbsoluteFill>
  );
};

/** Full-bleed photo with a gold inset frame (or placeholder). */
const FullPhoto: React.FC<{ file: string; zoom: number }> = ({ file, zoom }) =>
  hasAsset(file) ? (
    <AbsoluteFill>
      <Img src={assetSrc(file)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ background: `linear-gradient(to top, rgba(7,20,46,0.9) 0%, rgba(7,20,46,0.2) 45%, rgba(7,20,46,0.35) 100%)` }} />
      <div style={{ position: "absolute", inset: 36, border: `2px solid ${COLORS.gold}`, boxShadow: `inset 0 0 0 8px rgba(7,20,46,0.4), inset 0 0 0 9px rgba(246,213,140,0.5)` }} />
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ background: COLORS.night, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${zoom})` }}>
        <FramedImage src={null} width={1700} height={940} />
      </div>
    </AbsoluteFill>
  );

/** 2 — the map dissolves into the real table. */
const TablePart: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, 0, 30);
  return (
    <AbsoluteFill style={{ opacity: inP }}>
      <FullPhoto file="table.jpg" zoom={interpolate(frame, [0, dur], [1.02, 1.12])} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
        <Words text={FINALE.tableCaption} start={20} stagger={6} dur={20}
          style={{ fontFamily: FONTS.title, fontSize: 110, color: COLORS.goldLight }} wordStyle={{ textShadow: glowText }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 3 — us.jpg in a gold frame, personal text beside it. */
const UsPart: React.FC<{ voiceF: number; dur: number }> = ({ voiceF, dur }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, -10, 20);
  const out = interpolate(frame, [dur - 20, dur], [1, 0], clamp);
  const kb = interpolate(frame, [0, dur], [0, 1]);
  const windows = sentenceWindows(FINALE.sentences, voiceF);
  return (
    <AbsoluteFill style={{ opacity: inP * out, background: `radial-gradient(ellipse at 30% 50%, ${COLORS.blue}, ${COLORS.night} 75%)` }}>
      <GoldDust count={50} seed="us" />
      <div style={{ position: "absolute", left: 150, top: 150, transform: `rotate(-2deg) scale(${0.95 + inP * 0.05})` }}>
        <FramedImage src={hasAsset("us.jpg") ? assetSrc("us.jpg") : null} width={660} height={780}
          imgStyle={{ transform: `scale(${1.05 + kb * 0.1}) translateY(${-kb * 14}px)` }} />
      </div>
      {windows.map((w, i) => {
        if (frame < w.from - 2 || frame > w.to + 14) return null;
        const last = i === windows.length - 1;
        return (
          <div key={i} style={{ position: "absolute", left: 920, width: 880, top: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Words text={w.text} start={w.from} stagger={3} dur={14} exitAt={last ? undefined : w.to - 2}
              style={{ fontFamily: i >= windows.length - 2 ? FONTS.title : FONTS.body, fontWeight: 400,
                fontSize: i >= windows.length - 2 ? 96 : 64, lineHeight: 1.35,
                color: i >= windows.length - 2 ? COLORS.goldLight : COLORS.cream }}
              wordStyle={i >= windows.length - 2 ? { textShadow: glowText } : undefined} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 4 — logo rises with glow and particles. */
const LogoPart: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, 0, 40, Easing.out(Easing.cubic));
  const out = interpolate(frame, [dur - 15, dur], [1, 0], clamp);
  const glow = 0.7 + 0.3 * Math.sin(frame / 10);
  return (
    <AbsoluteFill style={{ background: COLORS.night, opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(246,213,140,${0.22 * p}) 0%, transparent 45%)` }} />
      <GoldDust count={110} seed="logo" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translateY(${(1 - p) * 80}px) scale(${0.85 + p * 0.15})`, opacity: p, filter: `blur(${(1 - p) * 12}px)` }}>
          {hasAsset("logo.png") ? (
            <Img src={assetSrc("logo.png")} style={{ width: 760, filter: `drop-shadow(0 0 ${24 * glow}px rgba(224,184,98,0.7)) drop-shadow(0 0 80px rgba(224,184,98,0.3))` }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: FONTS.title, fontSize: 220, color: COLORS.goldLight, textShadow: glowText, letterSpacing: 8 }}>{BRAND.passportName}</div>
              <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 34, letterSpacing: 12, color: COLORS.gold }}>{BRAND.airline.toUpperCase()}</div>
            </div>
          )}
        </div>
      </AbsoluteFill>
      <Burst t={frame - 12} x={960} y={540} count={90} seed="logo-burst" />
    </AbsoluteFill>
  );
};

/** 5 — "ועכשיו… טועמים?" with a heart, then black. */
const EndPart: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const heartIn = ramp(frame, 26, 46, Easing.out(Easing.back(2)));
  const pulse = heartIn * (1 + 0.06 * Math.sin(frame / 5));
  const out = interpolate(frame, [dur - 18, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: COLORS.night, opacity: out }}>
      <GoldDust count={80} seed="end" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
        <Words text={FINALE.endLine} start={0} stagger={8} dur={20}
          style={{ fontFamily: FONTS.title, fontSize: 200, color: COLORS.goldLight }} wordStyle={{ textShadow: glowText }} />
        <Heart size={150} pulse={pulse} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Finale: React.FC<FinaleProps> = ({ voiceSec }) => {
  const R = sec(FT.routes);
  const Tb = sec(FT.table);
  const vS = finaleVoiceStart();
  const vF = sec(voiceSec);
  const L = sec(FT.logo);
  const E = sec(FT.endLine);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={R + 20}><RoutesPart /></Sequence>
      <Sequence from={R - 10} durationInFrames={Tb + 30}><TablePart dur={Tb + 30} /></Sequence>
      <Sequence from={vS} durationInFrames={vF + 10}><UsPart voiceF={vF} dur={vF + 10} /></Sequence>
      <Sequence from={vS + vF} durationInFrames={L}><LogoPart dur={L} /></Sequence>
      <Sequence from={vS + vF + L} durationInFrames={E}><EndPart dur={E} /></Sequence>
      <Voice file={FINALE.voice} from={vS} />
    </AbsoluteFill>
  );
};
