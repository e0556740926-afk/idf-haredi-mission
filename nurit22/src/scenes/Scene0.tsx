import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COLORS, COUNTRIES, FONTS, HOME_COORDS, HOOK, INTRO, TITLE, VIDEO } from "../config";
import { GoldDust } from "../components/GoldDust";
import { Burst, Passport, PAGE_H, PAGE_W, StampFace, homeOnSpread } from "../components/Passport";
import { Plane } from "../components/Plane";
import { Sentences } from "../components/Sentences";
import { Sfx, Voice } from "../components/Sound";
import { Words } from "../components/Words";
import { WorldMap } from "../components/WorldMap";
import { MAP_H, MAP_W, project, quadAt, routePath } from "../lib/map";
import { sec, sentenceWindows } from "../lib/timing";

export type Scene0Props = { voiceSec: number };

export const scene0Frames = (voiceSec: number) => sec(HOOK.totalSec) + sec(voiceSec) + sec(VIDEO.transitionSec);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const between = (f: number, [a, b]: number[], ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [sec(a), sec(b)], [0, 1], { ...clamp, easing: ease });

// Full-screen map layout
const MAP_SCREEN_W = 2300;
const K = MAP_SCREEN_W / MAP_W;
const MAP_LEFT = (1920 - MAP_SCREEN_W) / 2;
const MAP_TOP = (1080 - MAP_H * K) / 2;

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
            <Passport open={open} mapDraw={between(frame, HOOK.mapDraw, Easing.inOut(Easing.quad))} stampMark={stampMark}>
              <circle cx={project(HOME_COORDS)[0]} cy={project(HOME_COORDS)[1]} r={10} fill={COLORS.goldLight}
                opacity={planeShow * (0.6 + 0.4 * Math.sin(frame / 4))} />
            </Passport>
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

const MapStage: React.FC<{ hookF: number; voiceF: number; total: number }> = ({ hookF, voiceF, total }) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [sec(HOOK.cameraDive[1]) - 12, sec(HOOK.cameraDive[1]) + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  if (appear <= 0) return null;
  const zoomIn = interpolate(appear, [0, 1], [1.8, 1]);
  const drift = interpolate(frame, [0, total], [1, 1.06]);

  const titleF = sec(HOOK.titleIn);
  const toTop = interpolate(frame, [hookF - 6, hookF + 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const titleGlow = 0.6 + 0.4 * Math.sin(frame / 18);

  // route to the first destination, drawn during the voice; the plane flies it in the transition
  const route = routePath(HOME_COORDS, COUNTRIES[0].coords);
  const routeDraw = interpolate(frame, [hookF + 20, hookF + voiceF * 0.6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const fly = interpolate(frame, [total - sec(VIDEO.transitionSec) - 4, total], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const pt = quadAt(route.p0, route.c, route.p1, fly * 0.55);
  const endFade = interpolate(frame, [total - 14, total], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: appear * endFade, background: `radial-gradient(ellipse at 50% 45%, ${COLORS.blue}, ${COLORS.night} 70%)` }}>
      <AbsoluteFill style={{ transform: `scale(${zoomIn * drift})` }}>
        <div style={{ position: "absolute", left: MAP_LEFT, top: MAP_TOP, width: MAP_SCREEN_W, opacity: 0.5 }}>
          <WorldMap draw={1} strokeScale={1}>
            <path d={route.d} fill="none" stroke={COLORS.goldLight} strokeWidth={3} strokeDasharray="10 12"
              opacity={0.9} mask="url(#routeMask)" />
            <defs>
              <mask id="routeMask" maskUnits="userSpaceOnUse">
                <path d={route.d} fill="none" stroke="#fff" strokeWidth={12} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - routeDraw} />
              </mask>
            </defs>
            <circle cx={route.p0[0]} cy={route.p0[1]} r={9 + 3 * Math.sin(frame / 6)} fill={COLORS.goldLight} />
            <circle cx={route.p0[0]} cy={route.p0[1]} r={18 + ((frame % 45) / 45) * 40} fill="none" stroke={COLORS.gold}
              strokeWidth={2} opacity={1 - (frame % 45) / 45} />
          </WorldMap>
        </div>
        {/* plane sitting at home, then taking off along the route */}
        <div style={{ position: "absolute", left: MAP_LEFT + pt.x * K, top: MAP_TOP + pt.y * K,
          transform: `translate(-50%, -50%) rotate(${fly > 0 ? pt.angle : -60}deg) scale(${1 + fly * 0.6})` }}>
          <Plane size={70} glow={1.3} />
        </div>
      </AbsoluteFill>
      <GoldDust count={70} seed="map" />

      {/* title */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center",
        transform: `translateY(${-330 * toTop}px) scale(${1 - 0.5 * toTop})` }}>
        <Words text={TITLE} start={titleF} stagger={6} dur={22}
          style={{ fontFamily: FONTS.title, fontSize: 170, lineHeight: 1.1, color: COLORS.goldLight }}
          wordStyle={{ textShadow: `0 0 ${30 * titleGlow}px rgba(224,184,98,0.7), 0 0 90px rgba(224,184,98,0.35)` }} />
        <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 30, letterSpacing: 6, color: COLORS.gold, marginTop: 28,
          opacity: interpolate(frame, [titleF + 20, titleF + 40], [0, 1], clamp) * (1 - toTop) }} dir="rtl">
          {`${BRAND.airline} · ${BRAND.flight} · ${BRAND.tagline}`}
        </div>
      </AbsoluteFill>

      <Sequence from={hookF} layout="none">
        <Sentences windows={sentenceWindows(INTRO.sentences, voiceF)} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Scene0: React.FC<Scene0Props> = ({ voiceSec }) => {
  const { durationInFrames } = useVideoConfig();
  const hookF = sec(HOOK.totalSec);
  const voiceF = sec(voiceSec);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <MapStage hookF={hookF} voiceF={voiceF} total={durationInFrames} />
      <Hook />
      <Sfx file="sfx/chime.mp3" at={sec(HOOK.spotlightOn)} />
      <Sfx file="sfx/stamp.mp3" at={sec(HOOK.stampImpact) - 1} />
      <Sfx file="sfx/whoosh.mp3" at={sec(HOOK.takeoff)} />
      <Sfx file="sfx/whoosh.mp3" at={durationInFrames - sec(VIDEO.transitionSec) - 4} />
      <Voice file={INTRO.voice} from={hookF} />
    </AbsoluteFill>
  );
};
