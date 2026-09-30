import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { INTRO, VIDEO } from "./config";
import { Scene0, scene0Frames, type Scene0Props } from "./scenes/Scene0";
import { voiceDurationSec } from "./lib/timing";

export const Root: React.FC = () => (
  <>
    <Composition
      id="Scene0"
      component={Scene0}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={300}
      defaultProps={{ voiceSec: VIDEO.placeholderVoiceSec } satisfies Scene0Props}
      calculateMetadata={async () => {
        const voiceSec = await voiceDurationSec(INTRO.voice);
        return { durationInFrames: scene0Frames(voiceSec), props: { voiceSec } };
      }}
    />
  </>
);
