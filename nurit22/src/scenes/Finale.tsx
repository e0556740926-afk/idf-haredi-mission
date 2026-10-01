import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, useCurrentFrame } from "remotion";
import { BRAND, COLORS, FINALE, FINALE_TIMING as FT, FONTS } from "../config";
import { EASE_IN_OUT, EASE_OUT, foilStyle, GoldRule, MaskWords } from "../components/Foil";
import { Finish, LowerBand, NightSky } from "../components/Fx";
import { GoldDust } from "../components/GoldDust";
import { Burst } from "../components/Passport";
import { FramedImage } from "../components/Placeholder";
import { Voice } from "../components/Sound";
import { Subtitles } from "../components/Subtitles";
import { Globe } from "../three/Globe";
import { legShot, shotLerp, STOPS, toVec, type Shot } from "../three/geo";
import { assetSrc, hasAsset } from "../lib/assets";
import { sec, sentenceWindows } from "../lib/timing";

export type FinaleProps = { voiceSec: number };

export const finaleVoiceStart = () => sec(FT.routes) + sec(FT.table);
export const finaleFrames = (voiceSec: number) =>
  finaleVoiceStart() + sec(voiceSec) + sec(FT.logo) + sec(FT.endLine) + sec(FT.black);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, ease: (t: number) => number = EASE_IN_OUT) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

/** 1 — pull back: every route of the trip glowing on the globe. */
const RoutesPart: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const lastLeg = STOPS.length - 2;
  const land = ramp(frame, 0, dur * 0.45, Easing.out(Easing.cubic));
  const pull = ramp(frame, 0, dur * 0.7);
  const sweep = interpolate(frame, [0, dur], [0, 1]);
  const wide: Shot = { focus: toVec([60 - sweep * 50, 28]), dist: 4.6, tilt: 0.05, sx: 0, sy: -0.02, roll: 0 };
  const shot = shotLerp(legShot(lastLeg), wide, pull);
  const legs = Array.from({ length: lastLeg + 1 }, (_, i) => ({ index: i, draw: i === lastLeg ? 0.5 + 0.5 * land : 1, glow: pull }));
  const out = interpolate(frame, [dur - 16, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <NightSky />
      <Globe shot={shot} legs={legs} stops={STOPS.slice(0, -1).map((_, i) => i)} pulseStop={0}
        plane={land < 1 ? { leg: lastLeg, t: 0.5 + 0.5 * land, scale: 1.2 - 0.4 * land } : null} intensity={1 + pull * 0.3} />
    </AbsoluteFill>
  );
};

/** Full-bleed photo with a gold inset frame (or an elegant placeholder). */
const FullPhoto: React.FC<{ file: string; zoom: number }> = ({ file, zoom }) =>
  hasAsset(file) ? (
    <AbsoluteFill>
      <Img src={assetSrc(file)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ background: `linear-gradient(to top, rgba(7,20,46,0.92) 0%, rgba(7,20,46,0.15) 45%, rgba(7,20,46,0.3) 100%)` }} />
      <div style={{ position: "absolute", inset: 34, border: `1.5px solid ${COLORS.gold}`, boxShadow: `inset 0 0 0 7px rgba(7,20,46,0.35), inset 0 0 0 8px rgba(246,213,140,0.5)` }} />
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ background: COLORS.night, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${zoom})` }}><FramedImage src={null} width={1720} height={940} /></div>
    </AbsoluteFill>
  );

/** 2 — the globe gives way to the real table. */
const TablePart: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, 0, 26);
  const flash = interpolate(frame, [0, 6, 22], [0, 0.55, 0], clamp);
  const rule = ramp(frame, 26, 56, EASE_OUT);
  return (
    <AbsoluteFill style={{ opacity: inP }}>
      <FullPhoto file="table.jpg" zoom={interpolate(frame, [0, dur], [1.08, 1.0])} />
      <LowerBand />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
        <MaskWords text={FINALE.tableCaption} start={18} stagger={6} dur={28} foil glow={1.3}
          style={{ fontFamily: FONTS.title, fontSize: 112 }} />
        <div style={{ marginTop: 18 }}><GoldRule p={rule} width={560} /></div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: COLORS.cream, opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/** 3 — us.jpg in a gilded frame, the words beside it. */
const UsPart: React.FC<{ voiceF: number; dur: number }> = ({ voiceF, dur }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, 0, 30, EASE_OUT);
  const out = interpolate(frame, [dur - 20, dur], [1, 0], clamp);
  const kb = interpolate(frame, [0, dur], [0, 1]);
  const windows = sentenceWindows(FINALE.sentences, voiceF);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <NightSky x={30} y={50} />
      <GoldDust count={40} seed="us" opacity={0.7} />
      <div style={{ position: "absolute", left: 150, top: 130, perspective: 1600, opacity: inP }}>
        <div style={{ transform: `rotateY(${10 - inP * 4}deg) rotateZ(-1.5deg) translateZ(${(1 - inP) * -150}px)` }}>
          <FramedImage src={hasAsset("us.jpg") ? assetSrc("us.jpg") : null} width={660} height={820}
            imgStyle={{ transform: `scale(${1.05 + kb * 0.1}) translateY(${-kb * 14}px)` }} />
        </div>
      </div>
      <Subtitles windows={windows} fontSize={60} highlightLast={2}
        box={{ left: 900, right: 110, bottom: "auto", top: 0, height: 1080, justifyContent: "center" }} />
    </AbsoluteFill>
  );
};

/** 4 — the logo rises in gold. */
const LogoPart: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, 0, 45, EASE_OUT);
  const out = interpolate(frame, [dur - 16, dur], [1, 0], clamp);
  const sweep = interpolate(frame, [30, 80], [0, 1], clamp);
  const hasLogo = hasAsset("logo.png");
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <NightSky />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(246,213,140,${0.2 * p}) 0%, transparent 42%)` }} />
      <GoldDust count={120} seed="logo" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translateY(${(1 - p) * 70}px) scale(${0.9 + p * 0.1})`, opacity: p, filter: `blur(${(1 - p) * 14}px)` }}>
          {hasLogo ? (
            <div style={{ position: "relative", width: 780 }}>
              <Img src={assetSrc("logo.png")} style={{ width: 780, display: "block", filter: `drop-shadow(0 0 30px rgba(224,184,98,0.55))` }} />
              <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${assetSrc("logo.png")})`, WebkitMaskSize: "100% 100%",
                background: `linear-gradient(110deg, transparent ${sweep * 140 - 30}%, rgba(251,241,220,0.85) ${sweep * 140 - 15}%, transparent ${sweep * 140}%)` }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: FONTS.title, fontSize: 230, letterSpacing: 10, lineHeight: 1, ...foilStyle(sweep, 1.4) }}>{BRAND.passportName}</div>
              <div style={{ marginTop: 26 }}><GoldRule p={p} width={620} /></div>
              <div style={{ marginTop: 22, fontFamily: FONTS.body, fontWeight: 400, fontSize: 30, letterSpacing: 14, color: COLORS.gold }}>{BRAND.airline.toUpperCase()}</div>
            </div>
          )}
        </div>
      </AbsoluteFill>
      <Burst t={frame - 14} x={960} y={540} count={110} seed="logo-burst" />
    </AbsoluteFill>
  );
};

const Heart: React.FC<{ size: number; p: number; sheen: number }> = ({ size, p, sheen }) => (
  <svg width={size} height={size} viewBox="0 0 160 150" style={{ overflow: "visible", transform: `scale(${p})`,
    filter: `drop-shadow(0 0 14px rgba(224,184,98,0.8)) drop-shadow(0 0 50px rgba(224,184,98,0.4))` }}>
    <defs>
      <linearGradient id="heartG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={COLORS.goldLight} />
        <stop offset={Math.max(0.05, Math.min(0.95, sheen))} stopColor={COLORS.cream} />
        <stop offset="1" stopColor={COLORS.gold} />
      </linearGradient>
    </defs>
    <path d="M80,136 C20,96 8,60 22,36 C38,10 72,16 80,44 C88,16 122,10 138,36 C152,60 140,96 80,136 Z" fill="url(#heartG)" />
  </svg>
);

/** 5 — "ועכשיו… טועמים?" and a gold heart, then black. */
const EndPart: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const heart = interpolate(frame, [30, 52], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const beat = 1 + 0.07 * Math.max(0, Math.sin(frame / 4.5)) * heart;
  const out = interpolate(frame, [dur - 20, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <NightSky />
      <GoldDust count={70} seed="end" opacity={0.8} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <MaskWords text={FINALE.endLine} start={0} stagger={9} dur={30} foil glow={1.5} style={{ fontFamily: FONTS.title, fontSize: 200 }} />
        <Heart size={150} p={heart * beat} sheen={(frame % 60) / 60} />
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
      <Sequence durationInFrames={R + 16}><RoutesPart dur={R + 16} /></Sequence>
      <Sequence from={R} durationInFrames={Tb + 20}><TablePart dur={Tb + 20} /></Sequence>
      <Sequence from={vS} durationInFrames={vF + 10}><UsPart voiceF={vF} dur={vF + 10} /></Sequence>
      <Sequence from={vS + vF} durationInFrames={L}><LogoPart dur={L} /></Sequence>
      <Sequence from={vS + vF + L} durationInFrames={E}><EndPart dur={E} /></Sequence>
      <Voice file={FINALE.voice} from={vS} />
      <Finish />
    </AbsoluteFill>
  );
};
