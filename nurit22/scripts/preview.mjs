// Usage: node scripts/preview.mjs <CompositionId> <outName> <sec,sec,sec,...>
// Renders stills at the given seconds + a 720p MP4 of the whole composition into ../previews/.
import fs from "node:fs";
import path from "node:path";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { browserExecutable, makeBundle, root } from "./common.mjs";

const [id, name, secs] = process.argv.slice(2);
const outDir = path.join(root, "previews");
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await makeBundle();
const composition = await selectComposition({ serveUrl, id, browserExecutable });
console.log(`${id}: ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(1)}s)`);

const seconds = secs.split(",").map(Number);
for (const [i, s] of seconds.entries()) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const output = path.join(outDir, `${name}-${i + 1}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 88, browserExecutable });
  console.log("still", output);
}

if (process.env.NO_CLIP !== "1") {
  const output = path.join(outDir, `${name}.mp4`);
  await renderMedia({
    serveUrl, composition, codec: "h264", crf: 26, scale: 2 / 3, outputLocation: output, browserExecutable,
    imageFormat: "jpeg", jpegQuality: 85,
    onProgress: ({ progress }) => process.stdout.write(`\r${Math.round(progress * 100)}%`),
  });
  console.log("\nclip", output);
}
