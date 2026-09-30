import { Config } from "@remotion/cli/config";

// Remotion can't download its own browser in this cloud environment, so use the pre-installed one.
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
