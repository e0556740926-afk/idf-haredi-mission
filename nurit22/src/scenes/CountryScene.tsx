import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, COUNTRIES, COUNTRY_TIMING as T, FONTS, VIDEO } from "../config";
import { EASE_IN_OUT, EASE_OUT } from "../components/Foil";
import { Finish, LightLeak, LowerBand, NightSky } from "../components/Fx";
import { MenuCard } from "../components/MenuCard";
import { FramedImage } from "../components/Placeholder";
import { Sfx, Voice } from "../components/Sound";
import { Subtitles } from "../components/Subtitles";
import { Globe } from "../three/Globe";
import { countryShot, legShot, shotLerp } from "../three/geo";
import { assetSrc, italyPhotos } from "../lib/assets";
import { sec, sentenceWindows } from "../lib/timing";

export type CountryProps = { index: number; voiceSec: number };

export const countryFrames = (voiceSec: number) => sec(voiceSec) + sec(VIDEO.transitionSec);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, ease: (t: number) => number = EASE_IN_OUT) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

/** Italy — photos floating in gold frames with a slow Ken Burns. */
const PhotoGallery: React.FC<{ from: number; to: number; appear: number }> = ({ from, to, appear }) => {
  const frame = useCurrentFrame();
  const photos: (string | null)[] = italyPhotos.length ? italyPhotos : [null, null, null];
  const span = (to - from) / photos.length;
  const xf = 18;
  return (
    <div style={{ position: "absolute", left: 120, top: 150, width: 900, height: 600, perspective: 1800, opacity: appear }}>
      {photos.map((p, i) => {
        const a = from + i * span;
        const b = a + span;
        const op = interpolate(frame, [a - xf, a, b - xf, b], [0, 1, 1, i === photos.length - 1 ? 1 : 0], clamp);
        if (op <= 0) return null;
        const kb = interpolate(frame, [a - xf, b], [0, 1], clamp);
        const inP = interpolate(frame, [a - xf, a + 10], [0, 1], { ...clamp, easing: EASE_OUT });
        const dir = i % 2 ? 1 : -1;
        return (
          <div key={i} style={{ position: "absolute", inset: 0, opacity: op,
            transform: `rotateY(${8 * dir + (1 - inP) * 14 * dir}deg) rotateZ(${-1.2 * dir}deg) translateZ(${(1 - inP) * -120}px)` }}>
            <FramedImage src={p ? assetSrc(p) : null} width={900} height={600}
              imgStyle={{ transform: `scale(${1.06 + kb * 0.12}) translate(${dir * kb * 20}px, ${-kb * 12}px)` }} />
          </div>
        );
      })}
    </div>
  );
};

export const CountryScene: React.FC<CountryProps> = ({ index, voiceSec }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const k = index + 1;
  const country = COUNTRIES[index];
  const tr = sec(VIDEO.transitionSec);
  const inLeg = k - 1;
  const outLeg = k;

  const land = ramp(frame, sec(T.landing[0]), sec(T.landing[1]) + 6, Easing.out(Easing.cubic));
  const zoom = ramp(frame, sec(T.zoomIn[0]), sec(T.zoomIn[1]) + 10);
  const exit = ramp(frame, D - tr - 6, D, Easing.in(Easing.cubic));
  const exitCam = ramp(frame, D - tr - 6, D);

  const stay = shotLerp(legShot(inLeg), countryShot(k), zoom);
  const drift = frame / D;
  stay.dist *= 1 - 0.06 * drift; // slow push-in while talking
  stay.sx += 0.02 * Math.sin(drift * Math.PI);
  const shot = exit > 0 ? shotLerp(countryShot(k), legShot(outLeg), exitCam) : stay;

  const legs = Array.from({ length: k }, (_, i) => ({ index: i, draw: i === inLeg ? 0.5 + 0.5 * land : 1 }));
  if (exit > 0) legs.push({ index: outLeg, draw: exit * 0.5 });
  const plane = exit > 0 ? { leg: outLeg, t: 0.5 * exit, scale: 1 } : { leg: inLeg, t: 0.5 + 0.5 * land, scale: 1.1 - 0.5 * land };

  const cardStart = sec(T.nameIn);
  const nameIn = ramp(frame, cardStart, cardStart + 40, EASE_OUT);
  const out = interpolate(frame, [D - tr - 6, D - tr + 12], [1, 0], clamp);
  const isItaly = country.motif === "photos";

  const windows = sentenceWindows(country.sentences, sec(voiceSec));
  windows[0].from = Math.max(windows[0].from, sec(T.firstTextAt));

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <NightSky x={35} y={45} />
      {/* giant country name, engraved outline, behind the globe */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 0 60px 40px", opacity: out }}>
        <div dir="rtl" style={{ fontFamily: FONTS.title, fontSize: Math.min(360, 2600 / country.name.length), lineHeight: 1, color: "transparent",
          WebkitTextStroke: `1.5px ${COLORS.gold}`, opacity: 0.22 * nameIn, whiteSpace: "nowrap",
          transform: `translateX(${(1 - nameIn) * -80 + frame * 0.15}px)` }}>
          {country.name}
        </div>
      </AbsoluteFill>
      <Globe shot={shot} legs={legs} stops={Array.from({ length: k + 1 }, (_, i) => i)} pulseStop={exit > 0 ? undefined : k} plane={plane}
        intensity={isItaly ? 1 - 0.35 * nameIn * out : 1} />

      <AbsoluteFill style={{ opacity: out }}>
        {isItaly && <PhotoGallery from={cardStart} to={D - tr} appear={nameIn} />}
        <Sequence from={cardStart} layout="none">
          <MenuCard country={country} exitAt={D - tr - 10 - cardStart} />
        </Sequence>
      </AbsoluteFill>
      <LowerBand />
      <Subtitles windows={windows} fontSize={isItaly ? 50 : 54} box={isItaly ? { left: 120, right: 720 } : { left: 140, right: 760 }} />
      <LightLeak p={interpolate(frame, [D - tr - 8, D + 4], [0, 1], clamp)} seed={`leak${k}`} />
      <Finish />
      <Voice file={country.voice} from={0} />
      <Sfx file="sfx/whoosh.mp3" at={D - tr - 6} />
    </AbsoluteFill>
  );
};
