import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { VIDEO } from "../config";
import { assetSrc, hasAsset } from "./assets";

export const sec = (s: number) => Math.round(s * VIDEO.fps);

export const voiceDurationSec = async (voice: string) =>
  hasAsset(voice) ? getAudioDurationInSeconds(assetSrc(voice)) : VIDEO.placeholderVoiceSec;

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Splits a voice window between sentences, proportional to word count. Frames relative to window start. */
export const sentenceWindows = (sentences: string[], voiceFrames: number) => {
  const counts = sentences.map(wordCount);
  const total = counts.reduce((a, b) => a + b, 0);
  let acc = 0;
  return sentences.map((text, i) => {
    const from = Math.round((acc / total) * voiceFrames);
    acc += counts[i];
    const to = Math.round((acc / total) * voiceFrames);
    return { text, from, to };
  });
};
