import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COLORS, COUNTRIES, COUNTRY_TIMING as T, FONTS, VIDEO } from "../config";
import { FoodIcon } from "../components/FoodIcons";
import { GoldDust } from "../components/GoldDust";
import { MapBackdrop, type LegDraw } from "../components/MapBackdrop";
import { Motif } from "../components/Motifs";
import { FramedImage } from "../components/Placeholder";
import { Sentences } from "../components/Sentences";
import { Sfx, Voice } from "../components/Sound";
import { countryCam, legCam, lerpCam, planeOnLeg } from "../lib/camera";
import { assetSrc, italyPhotos } from "../lib/assets";
import { sec, sentenceWindows } from "../lib/timing";

export type CountryProps = { index: number; voiceSec: number };

export const countryFrames = (voiceSec: number) => sec(voiceSec) + sec(VIDEO.transitionSec);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

const GateTag: React.FC<{ gate: string; name: string; p: number }> = ({ gate, name, p }) => (
  <div dir="rtl" style={{ position: "absolute", right: 80, top: 64, opacity: p, transform: `translateX(${(1 - p) * 80}px)`,
    display: "flex", alignItems: "stretch", border: `2px solid ${COLORS.gold}`, borderRadius: 14, overflow: "hidden",
    background: COLORS.blue, boxShadow: `0 0 30px rgba(224,184,98,0.25)` }}>
    <div style={{ padding: "14px 30px", background: COLORS.gold, color: COLORS.night, fontFamily: FONTS.title, fontSize: 46, lineHeight: 1.1 }}>
      {gate}
    </div>
    <div style={{ padding: "10px 28px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: `2px dashed ${COLORS.gold}` }}>
      <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 18, letterSpacing: 4, color: COLORS.gold }}>{`${BRAND.airline} · ${BRAND.flight}`}</div>
      <div style={{ fontFamily: FONTS.title, fontSize: 34, color: COLORS.cream }}>{name}</div>
    </div>
  </div>
);

const ItalyPhotos: React.FC<{ from: number; to: number; appear: number }> = ({ from, to, appear }) => {
  const frame = useCurrentFrame();
  const photos: (string | null)[] = italyPhotos.length ? italyPhotos : [null, null, null];
  const span = (to - from) / photos.length;
  const xf = 14;
  return (
    <div style={{ position: "absolute", left: 150, top: 190, width: 980, height: 600, opacity: appear,
      transform: `rotate(-1.5deg) scale(${0.94 + appear * 0.06})` }}>
      {photos.map((p, i) => {
        const a = from + i * span;
        const b = a + span;
        const op = interpolate(frame, [a - xf, a, b - xf, b], [0, 1, 1, i === photos.length - 1 ? 1 : 0], clamp);
        if (op <= 0) return null;
        const kb = interpolate(frame, [a - xf, b], [0, 1], clamp);
        const dir = i % 2 ? 1 : -1;
        return (
          <FramedImage key={i} src={p ? assetSrc(p) : null} width={980} height={600}
            style={{ position: "absolute", inset: 0, opacity: op }}
            imgStyle={{ transform: `scale(${1.04 + kb * 0.12}) translate(${dir * kb * 18}px, ${-kb * 10}px)` }} />
        );
      })}
    </div>
  );
};

export const CountryScene: React.FC<CountryProps> = ({ index, voiceSec }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const k = index + 1; // stop number
  const country = COUNTRIES[index];
  const tr = sec(VIDEO.transitionSec);
  const inLeg = k - 1;
  const outLeg = k;

  // landing + zoom in, then take-off + zoom out
  const land = ramp(frame, sec(T.landing[0]), sec(T.landing[1]), Easing.out(Easing.cubic));
  const zoom = ramp(frame, sec(T.zoomIn[0]), sec(T.zoomIn[1]));
  const exit = ramp(frame, D - tr, D, Easing.in(Easing.cubic));
  const cam = exit > 0 ? lerpCam(countryCam(country.coords), legCam(outLeg), ramp(frame, D - tr, D)) : lerpCam(legCam(inLeg), countryCam(country.coords), zoom);

  const legs: LegDraw[] = Array.from({ length: k }, (_, i) => ({ index: i, draw: i === inLeg ? 0.55 + 0.45 * land : 1 }));
  if (exit > 0) legs.push({ index: outLeg, draw: exit * 0.55 });
  const bob = Math.sin(frame / 14) * 0.03;
  const plane = exit > 0
    ? { ...planeOnLeg(outLeg, exit * 0.55), scale: 1 + exit * 0.3 }
    : { ...planeOnLeg(inLeg, 0.55 + 0.45 * land), scale: (land < 1 ? 1.15 - 0.15 * land : 1) + bob };

  // content
  const out = interpolate(frame, [D - tr - 4, D - tr + 10], [1, 0], clamp);
  const nameIn = ramp(frame, sec(T.nameIn), sec(T.nameIn) + 24, Easing.out(Easing.cubic));
  const motifIn = ramp(frame, sec(T.motifIn), sec(T.motifIn) + 30, Easing.out(Easing.cubic));
  const fadeIn = index === 0 ? interpolate(frame, [0, 10], [0, 1], clamp) : 1;
  const isItaly = country.motif === "photos";

  const voiceF = sec(voiceSec);
  const windows = sentenceWindows(country.sentences, voiceF);
  windows[0].from = Math.max(windows[0].from, sec(T.firstTextAt));

  const iconDraw = (i: number) => ramp(frame, sec(T.iconsIn + i * T.iconStagger), sec(T.iconsIn + i * T.iconStagger + T.iconDraw), Easing.inOut(Easing.quad));
  const label = (text: string, p: number, size: number) => (
    <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: size, color: COLORS.goldLight, opacity: p,
      textShadow: `0 0 16px ${COLORS.night}` }}>{text}</div>
  );

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${COLORS.blue}, ${COLORS.night} 72%)`, opacity: fadeIn }}>
      <MapBackdrop cam={cam} legs={legs} stops={Array.from({ length: k + 1 }, (_, i) => i)} pulseStop={exit > 0 ? undefined : k}
        plane={plane} mapOpacity={interpolate(zoom - exit, [0, 1], [0.55, 0.3], clamp)} />
      <GoldDust count={60} seed={`c${k}`} />

      <AbsoluteFill style={{ opacity: out }}>
        {/* giant country name */}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div dir="rtl" style={{ fontFamily: FONTS.title, fontSize: Math.min(420, 3400 / country.name.length), color: COLORS.gold,
            opacity: 0.09 * nameIn, transform: `scale(${1.12 - 0.12 * nameIn})`, whiteSpace: "nowrap", marginTop: 60 }}>
            {country.name}
          </div>
        </AbsoluteFill>

        <Motif kind={country.motif} appear={motifIn} />
        <GateTag gate={country.gate} name={country.name} p={nameIn} />

        {isItaly ? (
          <>
            <ItalyPhotos from={sec(T.nameIn)} to={D - tr} appear={nameIn} />
            <div dir="rtl" style={{ position: "absolute", right: 170, top: 230, display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
              {country.foods.map((f, i) => (
                <FoodIcon key={f} name={f} draw={iconDraw(i)} size={112} label={label(f, iconDraw(i), 30)} />
              ))}
            </div>
          </>
        ) : (
          <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center", gap: 190 }}>
            {country.foods.map((f, i) => (
              <FoodIcon key={f} name={f} draw={iconDraw(i)} size={170} label={label(f, iconDraw(i), 40)} />
            ))}
          </div>
        )}

        <Sentences windows={windows} fontSize={58} />
      </AbsoluteFill>

      <Voice file={country.voice} from={0} />
      <Sfx file="sfx/whoosh.mp3" at={D - tr - 4} />
    </AbsoluteFill>
  );
};
