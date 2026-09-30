// Renders the full video to out/nurit22.mp4 (1920x1080, 30fps), keeping it under 90MB.
import fs from "node:fs";
import path from "node:path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { browserExecutable, chromiumOptions, makeBundle, root } from "./common.mjs";

const MAX_BYTES = 90 * 1024 * 1024;
const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });
const outputLocation = path.join(outDir, "nurit22.mp4");

const serveUrl = await makeBundle();
const composition = await selectComposition({ serveUrl, id: "Full", browserExecutable, chromiumOptions });
console.log(`Full: ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(1)}s)`);

for (const crf of [20, 24, 28, 32]) {
  await renderMedia({
    serveUrl, composition, codec: "h264", crf, outputLocation, browserExecutable, chromiumOptions, concurrency: 3,
    imageFormat: "jpeg", jpegQuality: 92, audioBitrate: "192k",
    onProgress: ({ progress }) => process.stdout.write(`\rcrf ${crf}: ${Math.round(progress * 100)}%`),
  });
  const size = fs.statSync(outputLocation).size;
  console.log(`\ncrf ${crf}: ${(size / 1024 / 1024).toFixed(1)}MB`);
  if (size < MAX_BYTES) break;
}
