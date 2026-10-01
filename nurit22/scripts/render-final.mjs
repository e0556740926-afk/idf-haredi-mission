// Renders the full video to out/nurit22.mp4 (1920x1080, 30fps), keeping it under 90MB:
// a high-quality master first, then a two-pass re-encode to a bitrate that fits.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { browserExecutable, chromiumOptions, makeBundle, root } from "./common.mjs";

const MAX_BYTES = 85 * 1024 * 1024; // a little headroom under 90MB
const ffDir = path.join(root, "node_modules/@remotion/compositor-linux-x64-gnu");
const ff = (args) => execFileSync(path.join(ffDir, "ffmpeg"), ["-loglevel", "error", "-y", ...args], { env: { ...process.env, LD_LIBRARY_PATH: ffDir }, cwd: outDir });

const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });
const master = path.join(outDir, "master.mp4");
const final = path.join(outDir, "nurit22.mp4");

const serveUrl = await makeBundle();
const composition = await selectComposition({ serveUrl, id: "Full", browserExecutable, chromiumOptions });
const seconds = composition.durationInFrames / composition.fps;
console.log(`Full: ${composition.durationInFrames} frames (${seconds.toFixed(1)}s)`);

await renderMedia({
  serveUrl, composition, codec: "h264", crf: 18, outputLocation: master, browserExecutable, chromiumOptions, concurrency: 3,
  imageFormat: "jpeg", jpegQuality: 92, audioBitrate: "192k",
  onProgress: ({ progress }) => process.stdout.write(`\rrender: ${Math.round(progress * 100)}%`),
});

if (fs.statSync(master).size <= MAX_BYTES) {
  fs.renameSync(master, final);
} else {
  const kbps = Math.floor((MAX_BYTES * 8) / seconds / 1000) - 192;
  ff(["-i", master, "-c:v", "libx264", "-b:v", `${kbps}k`, "-preset", "slow", "-pass", "1", "-an", "-f", "mp4", "/dev/null"]);
  ff(["-i", master, "-c:v", "libx264", "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.6)}k`, "-bufsize", `${kbps * 2}k`,
    "-preset", "slow", "-pass", "2", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", final]);
  fs.rmSync(master);
  for (const f of fs.readdirSync(outDir)) if (f.startsWith("ffmpeg2pass")) fs.rmSync(path.join(outDir, f));
}
console.log(`\n${final}: ${(fs.statSync(final).size / 1024 / 1024).toFixed(1)}MB`);
