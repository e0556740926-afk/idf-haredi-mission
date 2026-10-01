import React from "react";
import { Audio, interpolate, Sequence, useVideoConfig } from "remotion";
import { AUDIO } from "../config";
import { assetSrc, hasAsset } from "../lib/assets";

/** One-shot sound effect at a given frame (silently skipped if the file is missing). */
export const Sfx: React.FC<{ file: string; at: number; volume?: number }> = ({ file, at, volume = AUDIO.sfxVolume }) =>
  hasAsset(file) ? (
    <Sequence from={at} layout="none">
      <Audio src={assetSrc(file)} volume={volume} />
    </Sequence>
  ) : null;

/** Voice recording starting at `from`. */
export const Voice: React.FC<{ file: string; from: number }> = ({ file, from }) =>
  hasAsset(file) ? (
    <Sequence from={from} layout="none">
      <Audio src={assetSrc(file)} volume={AUDIO.voiceVolume} />
    </Sequence>
  ) : null;

/** Background music, ducked while any voice window is playing, rising at the end. */
export const Music: React.FC<{ voiceWindows: [number, number][]; endRiseFrom?: number }> = ({ voiceWindows, endRiseFrom }) => {
  const { fps, durationInFrames } = useVideoConfig();
  if (!hasAsset("music.mp3")) return null;
  const fade = AUDIO.musicFadeSec * fps;
  return (
    <Audio
      src={assetSrc("music.mp3")}
      loop
      volume={(f) => {
        let duck = 0;
        for (const [a, b] of voiceWindows) {
          duck = Math.max(duck, interpolate(f, [a - fade, a, b, b + fade], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
        }
        let v = AUDIO.musicVolume + (AUDIO.musicDuckedVolume - AUDIO.musicVolume) * duck;
        if (endRiseFrom !== undefined && f >= endRiseFrom) {
          v = Math.max(v, interpolate(f, [endRiseFrom, endRiseFrom + fade], [v, AUDIO.musicEndVolume], { extrapolateRight: "clamp" }));
        }
        return v * interpolate(f, [0, 10, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      }}
    />
  );
};
