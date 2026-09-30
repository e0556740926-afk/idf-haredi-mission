// Copies ../assets into public/, converts voice recordings to mp3 (browser-safe),
// and writes src/generated/manifest.json listing what exists and what is missing.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.resolve(root, "..", "assets");
const publicDir = path.join(root, "public");
const genDir = path.join(root, "src", "generated");
const ffmpeg = path.join(root, "node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg");

const EXPECTED = [
  "logo.png",
  "face.png",
  "table.jpg",
  "us.jpg",
  "music.mp3",
  "sfx/chime.mp3",
  "sfx/stamp.mp3",
  "sfx/whoosh.mp3",
  ...Array.from({ length: 8 }, (_, i) => `voice/scene-0${i}.m4a`),
];

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(genDir, { recursive: true });

const present = [];
const missing = [];

for (const rel of EXPECTED) {
  const src = path.join(assetsDir, rel);
  if (!fs.existsSync(src)) {
    missing.push(rel);
    continue;
  }
  if (rel.startsWith("voice/")) {
    const outRel = rel.replace(/\.m4a$/, ".mp3");
    const out = path.join(publicDir, outRel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-i", src, "-ac", "2", "-ar", "48000", "-b:a", "192k", out], {
      env: { ...process.env, LD_LIBRARY_PATH: path.dirname(ffmpeg) },
    });
    present.push(outRel);
  } else {
    const out = path.join(publicDir, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(src, out);
    present.push(rel);
  }
}

const italyDir = path.join(assetsDir, "italy");
const italy = fs.existsSync(italyDir)
  ? fs.readdirSync(italyDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
  : [];
if (italy.length) {
  fs.mkdirSync(path.join(publicDir, "italy"), { recursive: true });
  for (const f of italy) fs.copyFileSync(path.join(italyDir, f), path.join(publicDir, "italy", f));
} else {
  missing.push("italy/*");
}

fs.writeFileSync(
  path.join(genDir, "manifest.json"),
  JSON.stringify({ present, italy: italy.map((f) => `italy/${f}`), missing }, null, 2),
);
console.log(missing.length ? `Missing assets (placeholders used):\n  ${missing.join("\n  ")}` : "All assets present.");
