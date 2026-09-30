# NURIT 22 — "לטעום את העולם איתך"

A Remotion video (1920×1080, 30fps) for Nurit's 22nd birthday.

- **Change texts, colors, timings:** `src/config.ts`
- **Assets:** put them in `assets/` at the repository root (`logo.png`, `face.png`, `table.jpg`, `us.jpg`,
  `italy/*`, `voice/scene-00.m4a … scene-07.m4a`, `music.mp3`, `sfx/chime.mp3`, `sfx/stamp.mp3`, `sfx/whoosh.mp3`).
  Missing files get placeholders: 18s of silence per voice, a gold frame reading "תמונה" per image.
- **Previews:** `npm run preview -- Scene3 scene3 1,4,10,17` → stills + 720p clip in `previews/`
- **Final render:** `npm run render` → `out/nurit22.mp4` (retries with a higher CRF until it is under 90MB)

Compositions: `Full`, `Scene0` (hook + intro), `Scene1`–`Scene6` (countries), `Scene7` (finale).
Each scene lasts voice length + 1s transition (the hook and finale add their fixed segments, see `HOOK` and `FINALE_TIMING`).

Cloud-environment notes: Remotion uses the pre-installed Chromium (`remotion.config.ts`, `scripts/common.mjs`),
and Google Fonts load only after the proxy CA is imported into `~/.pki/nssdb` with `certutil`.
