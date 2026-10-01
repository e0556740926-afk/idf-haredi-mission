import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import "./fonts";
import { COUNTRIES, FINALE, HOOK, INTRO, VIDEO } from "./config";
import { Music } from "./components/Sound";
import { Scene0, scene0Frames } from "./scenes/Scene0";
import { CountryScene, countryFrames } from "./scenes/CountryScene";
import { Finale, finaleFrames, finaleVoiceStart } from "./scenes/Finale";
import { Full, fullLayout } from "./Full";
import { sec, voiceDurationSec } from "./lib/timing";

const base = { width: VIDEO.width, height: VIDEO.height, fps: VIDEO.fps, durationInFrames: 300 };
const P = VIDEO.placeholderVoiceSec;

// Single-scene compositions (for previews) get their own music bed.
const Scene0M: React.FC<{ voiceSec: number }> = ({ voiceSec }) => (
  <AbsoluteFill>
    <Scene0 voiceSec={voiceSec} />
    <Music voiceWindows={[[sec(HOOK.totalSec), sec(HOOK.totalSec) + sec(voiceSec)]]} />
  </AbsoluteFill>
);
const CountryM: React.FC<{ index: number; voiceSec: number }> = ({ index, voiceSec }) => (
  <AbsoluteFill>
    <CountryScene index={index} voiceSec={voiceSec} />
    <Music voiceWindows={[[0, sec(voiceSec)]]} />
  </AbsoluteFill>
);
const FinaleM: React.FC<{ voiceSec: number }> = ({ voiceSec }) => {
  const w: [number, number] = [finaleVoiceStart(), finaleVoiceStart() + sec(voiceSec)];
  return (
    <AbsoluteFill>
      <Finale voiceSec={voiceSec} />
      <Music voiceWindows={[w]} endRiseFrom={w[1]} />
    </AbsoluteFill>
  );
};

const allVoices = () => Promise.all([INTRO.voice, ...COUNTRIES.map((c) => c.voice), FINALE.voice].map(voiceDurationSec));

export const Root: React.FC = () => (
  <>
    <Composition
      id="Full"
      component={Full}
      {...base}
      defaultProps={{ voices: Array(8).fill(P) }}
      calculateMetadata={async () => {
        const voices = await allVoices();
        return { durationInFrames: fullLayout(voices).total, props: { voices } };
      }}
    />
    <Composition
      id="Scene0"
      component={Scene0M}
      {...base}
      defaultProps={{ voiceSec: P }}
      calculateMetadata={async () => {
        const voiceSec = await voiceDurationSec(INTRO.voice);
        return { durationInFrames: scene0Frames(voiceSec), props: { voiceSec } };
      }}
    />
    {COUNTRIES.map((c, index) => (
      <Composition
        key={c.id}
        id={`Scene${index + 1}`}
        component={CountryM}
        {...base}
        defaultProps={{ index, voiceSec: P }}
        calculateMetadata={async () => {
          const voiceSec = await voiceDurationSec(c.voice);
          return { durationInFrames: countryFrames(voiceSec), props: { index, voiceSec } };
        }}
      />
    ))}
    <Composition
      id="Scene7"
      component={FinaleM}
      {...base}
      defaultProps={{ voiceSec: P }}
      calculateMetadata={async () => {
        const voiceSec = await voiceDurationSec(FINALE.voice);
        return { durationInFrames: finaleFrames(voiceSec), props: { voiceSec } };
      }}
    />
  </>
);
