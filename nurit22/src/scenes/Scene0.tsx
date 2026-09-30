import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COLORS, FONTS, HOME_COORDS, HOOK, INTRO, TITLE, VIDEO } from "../config";
import { EASE_IN_OUT, EASE_OUT, GoldRule, MaskWords } from "../components/Foil";
import { Finish, LightLeak, LowerBand, NightSky } from "../components/Fx";
import { GoldDust } from "../components/GoldDust";
import { Burst, Passport, PAGE_H, PAGE_W, StampFace, homeOnSpread } from "../components/Passport";
import { Plane } from "../components/Plane";
import { Sfx, Voice } from "../components/Sound";
import { Subtitles } from "../components/Subtitles";
import { Globe } from "../three/Globe";
import { legShot, shotLerp, toVec, type Shot } from "../three/geo";
import { sec, sentenceWindows } from "../lib/timing";

export type Scene0Props = { voiceSec: number };

export const scene0Frames = (voiceSec: number) => sec(HOOK.totalSec) + sec(voiceSec) + sec(VIDEO.transitionSec);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const between = (f: number, [a, b]: number[], ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [sec(a), sec(b)], [0, 1], { ...clamp, easing: ease });

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const impact = sec(HOOK.stampImpact);

  // passport slides in with perspective
  const inP = between(frame, HOOK.passportIn, Easing.out(Easing.cubic));
  const open = between(frame, HOOK.passportOpen);
  const tiltX = interpolate(inP, [0, 1], [62, 22]) - open * 12;
  const rotZ = interpolate(inP, [0, 1], [-18, -3]) + open * 3;
  const ty = interpolate(inP, [0, 1], [900, 0]);
  const sc = interpolate(inP, [0, 1], [0.7, 1]) * interpolate(open, [0, 1], [1, 1.25]);

  // stamp
  const drop = interpolate(frame, [impact - 10, impact], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const lift = interpolate(frame, [impact + 5, impact + 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const stampMark = interpolate(frame, [impact, impact + 8], [0, 1], clamp);
  const shakeT = frame - impact;
  const shakeAmp = shakeT >= 0 ? 22 * Math.exp(-shakeT / 5) : 0;
  const shakeX = Math.sin(shakeT * 2.9) * shakeAmp;
  const shakeY = Math.cos(shakeT * 3.7) * shakeAmp * 0.8;
  const shakeR = Math.sin(shakeT * 2.1) * shakeAmp * 0.03;
  const flash = shakeT >= 0 ? interpolate(shakeT, [0, 2, 12], [0, 0.22, 0], clamp) : 0;

  // plane takeoff from the page
  const home = homeOnSpread();
  const take = interpolate(frame, [sec(HOOK.takeoff), sec(HOOK.cameraDive[1])], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const planeShow = interpolate(frame, [sec(HOOK.mapDraw[1]) - 12, sec(HOOK.mapDraw[1])], [0, 1], clamp);
  const px = home.x - take * 260;
  const py = home.y - take * 420;
  const pz = take * 520;

  // camera dive
  const dive = between(frame, HOOK.cameraDive, Easing.in(Easing.cubic));
  const diveScale = 1 + dive * 6;
  const hookFade = interpolate(frame, [sec(HOOK.cameraDive[1]) - 10, sec(HOOK.cameraDive[1]) + 4], [1, 0], clamp);

  // spotlight
  const spot = interpolate(frame, [sec(HOOK.spotlightOn), sec(HOOK.spotlightOn) + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });

  if (hookFade <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: hookFade }}>
      <AbsoluteFill style={{ background: "#000" }} />
      <AbsoluteFill style={{ opacity: spot, background: `radial-gradient(ellipse 55% 60% at 50% 50%, ${COLORS.blue} 0%, ${COLORS.night} 55%, #000 100%)` }} />
      <AbsoluteFill style={{ opacity: spot * 0.55, background: `radial-gradient(circle at 50% 46%, rgba(246,213,140,0.35) 0%, rgba(224,184,98,0.08) 28%, transparent 50%)` }} />
      <GoldDust count={50} seed="hook" opacity={spot} />

      {/* camera: shake + dive */}
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px) rotate(${shakeR}deg) scale(${diveScale})`,
        transformOrigin: `${960 + (px - PAGE_W) * 0.9}px ${540 + (py - PAGE_H / 2) * 0.6}px` }}>
        <AbsoluteFill style={{ perspective: 1600, alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: PAGE_W * 2, height: PAGE_H, transformStyle: "preserve-3d",
            transform: `translateY(${ty}px) rotateX(${tiltX}deg) rotateZ(${rotZ}deg) scale(${sc})`, opacity: inP > 0 ? 1 : 0 }}>
            <Passport open={open} mapDraw={between(frame, HOOK.mapDraw, Easing.inOut(Easing.quad))} stampMark={stampMark}
              sheen={interpolate(frame, [sec(HOOK.passportIn[1]) - 10, sec(HOOK.passportIn[1]) + 30], [0, 1], clamp)} pulse={(frame % 40) / 40} />
            {/* plane lifting off the page */}
            <div style={{ position: "absolute", left: px, top: py, opacity: planeShow,
              transform: `translate(-50%, -50%) translateZ(${pz + 4}px) rotate(${-110 + take * 20}deg) scale(${0.7 + take * 1.2})` }}>
              <Plane size={60} glow={1 + take} />
            </div>
          </div>
        </AbsoluteFill>

        {/* stamp tool falling onto the cover */}
        {drop > 0 && lift < 1 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ transform: `translate(95px, ${115 - (1 - drop) * 520 - lift * 600}px) rotate(-14deg) scale(${2.6 - drop * 1.6 + lift * 0.4})`,
              opacity: drop * (1 - lift), filter: `drop-shadow(0 ${30 * (1 - drop) + 8}px 30px rgba(0,0,0,0.6))` }}>
              <StampFace size={190} />
            </div>
          </AbsoluteFill>
        )}
        <Burst t={frame - impact} x={1055} y={655} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 55% 60%, ${COLORS.goldLight}, transparent 45%)`, opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const GlobeStage: React.FC<{ hookF: number; voiceF: number; total: number }> = ({ hookF, voiceF, total }) => {
  const frame = useCurrentFrame();
  const t0 = sec(HOOK.cameraDive[1]) - 14;
  const appear = interpolate(frame, [t0, t0 + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  if (appear <= 0) return null;
  const tr = sec(VIDEO.transitionSec);
  const approach = interpolate(frame, [t0, hookF + 20], [0, 1], { ...clamp, easing: EASE_OUT });
  const far: Shot = { focus: toVec(HOME_COORDS), dist: 10, tilt: 0, sx: 0, sy: 0, roll: -0.25 };
  const near: Shot = { focus: toVec(HOME_COORDS), dist: 3.3, tilt: 0.12, sx: 0, sy: -0.46, roll: 0 };
  const talk = shotLerp(far, near, approach);
  const orbit = interpolate(frame, [hookF, total], [0, 1], clamp);
  talk.focus = toVec([HOME_COORDS[0] + orbit * 14, HOME_COORDS[1] - orbit * 4]);
  const exit = interpolate(frame, [total - tr - 6, total], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const exitCam = interpolate(frame, [total - tr - 6, total], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const shot = exit > 0 ? shotLerp(talk, legShot(0), exitCam) : talk;
  const reveal = interpolate(frame, [t0, t0 + 70], [0, 1], clamp);

  const titleF = sec(HOOK.titleIn);
  const toTop = interpolate(frame, [hookF - 6, hookF + 26], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const titleOut = interpolate(frame, [total - tr - 6, total - tr + 10], [1, 0], clamp);
  const brand = interpolate(frame, [titleF + 26, titleF + 50], [0, 1], { ...clamp, easing: EASE_OUT });

  return (
    <AbsoluteFill style={{ opacity: appear }}>
      <NightSky y={60} />
      <Globe shot={shot} legs={exit > 0 ? [{ index: 0, draw: exit * 0.5 }] : []} stops={[0]} pulseStop={0}
        plane={exit > 0 ? { leg: 0, t: exit * 0.5 } : null} reveal={reveal} revealFrom={0} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: titleOut,
        transform: `translateY(${-160 - 250 * toTop}px) scale(${1 - 0.45 * toTop})` }}>
        <MaskWords text={TITLE} start={titleF} stagger={6} dur={30} foil glow={1.4}
          style={{ fontFamily: FONTS.title, fontSize: 168, lineHeight: 1.1 }} />
        <div style={{ marginTop: 26, opacity: brand * (1 - toTop) }}><GoldRule p={brand} width={520} /></div>
        <div dir="rtl" style={{ marginTop: 18, fontFamily: FONTS.body, fontWeight: 300, fontSize: 30, color: COLORS.goldLight,
          opacity: brand * (1 - toTop), transform: `translateY(${(1 - brand) * 14}px)` }}>
          {`${BRAND.airline} · ${BRAND.flight} · ${BRAND.tagline}`}
        </div>
      </AbsoluteFill>
      <LowerBand opacity={toTop} />
      <Sequence from={hookF} layout="none">
        <Subtitles windows={sentenceWindows(INTRO.sentences, voiceF)} />
      </Sequence>
      <LightLeak p={interpolate(frame, [total - tr - 8, total + 4], [0, 1], clamp)} seed="leak0" />
    </AbsoluteFill>
  );
};

export const Scene0: React.FC<Scene0Props> = ({ voiceSec }) => {
  const { durationInFrames } = useVideoConfig();
  const hookF = sec(HOOK.totalSec);
  const voiceF = sec(voiceSec);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <GlobeStage hookF={hookF} voiceF={voiceF} total={durationInFrames} />
      <Hook />
      <Sfx file="sfx/chime.mp3" at={sec(HOOK.spotlightOn)} />
      <Sfx file="sfx/stamp.mp3" at={sec(HOOK.stampImpact) - 1} />
      <Sfx file="sfx/whoosh.mp3" at={sec(HOOK.takeoff)} />
      <Sfx file="sfx/whoosh.mp3" at={durationInFrames - sec(VIDEO.transitionSec) - 4} />
      <Voice file={INTRO.voice} from={hookF} />
      <Finish />
    </AbsoluteFill>
  );
};
