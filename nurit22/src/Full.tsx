import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COUNTRIES, HOOK } from "./config";
import { Music } from "./components/Sound";
import { CountryScene, countryFrames } from "./scenes/CountryScene";
import { Finale, finaleFrames, finaleVoiceStart } from "./scenes/Finale";
import { Scene0, scene0Frames } from "./scenes/Scene0";
import { sec } from "./lib/timing";

/** voices[0] = scene 0, voices[1..6] = countries, voices[7] = finale (seconds). */
export type FullProps = { voices: number[] };

export const fullLayout = (voices: number[]) => {
  const durs = [scene0Frames(voices[0]), ...COUNTRIES.map((_, i) => countryFrames(voices[i + 1])), finaleFrames(voices[7])];
  const starts = durs.map((_, i) => durs.slice(0, i).reduce((a, b) => a + b, 0));
  const voiceStart = [starts[0] + sec(HOOK.totalSec), ...COUNTRIES.map((_, i) => starts[i + 1]), starts[7] + finaleVoiceStart()];
  const voiceWindows = voiceStart.map((s, i) => [s, s + sec(voices[i])] as [number, number]);
  return { durs, starts, voiceWindows, total: starts[7] + durs[7] };
};

export const Full: React.FC<FullProps> = ({ voices }) => {
  const { durs, starts, voiceWindows } = fullLayout(voices);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={starts[0]} durationInFrames={durs[0]}><Scene0 voiceSec={voices[0]} /></Sequence>
      {COUNTRIES.map((c, i) => (
        <Sequence key={c.id} from={starts[i + 1]} durationInFrames={durs[i + 1]}>
          <CountryScene index={i} voiceSec={voices[i + 1]} />
        </Sequence>
      ))}
      <Sequence from={starts[7]} durationInFrames={durs[7]}><Finale voiceSec={voices[7]} /></Sequence>
      <Music voiceWindows={voiceWindows} endRiseFrom={voiceWindows[7][1]} />
    </AbsoluteFill>
  );
};
