import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

export const makeBundle = () =>
  bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
