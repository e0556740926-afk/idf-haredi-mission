import { COUNTRY_TIMING, COUNTRIES, HOME_COORDS } from "../config";
import { MAP_H, MAP_W, project, quadAt, routePath } from "./map";

/** Base scale: map units → screen px at zoom 1 (map is 2300px wide on screen). */
export const K = 2300 / MAP_W;

export type Cam = { cx: number; cy: number; z: number; ax: number; ay: number };

export const toScreen = (p: readonly number[], c: Cam): [number, number] => [
  c.ax + (p[0] - c.cx) * K * c.z,
  c.ay + (p[1] - c.cy) * K * c.z,
];

export const viewBoxFor = (c: Cam) => {
  const s = K * c.z;
  return `${c.cx - c.ax / s} ${c.cy - c.ay / s} ${1920 / s} ${1080 / s}`;
};

export const lerpCam = (a: Cam, b: Cam, t: number): Cam => {
  // interpolate zoom geometrically so the zoom speed feels even
  const z = a.z * Math.pow(b.z / a.z, t);
  return { cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, z, ax: a.ax + (b.ax - a.ax) * t, ay: a.ay + (b.ay - a.ay) * t };
};

export const WORLD_CAM: Cam = { cx: MAP_W / 2, cy: MAP_H / 2, z: 1, ax: 960, ay: 540 };

/** Stops of the trip: home, the six countries, back home. */
export const STOPS: [number, number][] = [HOME_COORDS, ...COUNTRIES.map((c) => c.coords), HOME_COORDS];

export const leg = (i: number) => routePath(STOPS[i], STOPS[i + 1]);

export const planeOnLeg = (i: number, t: number) => {
  const r = leg(i);
  return quadAt(r.p0, r.c, r.p1, t);
};

/** Camera framing a whole leg. */
export const legCam = (i: number): Cam => {
  const r = leg(i);
  const xs = [r.p0[0], r.p1[0], (r.p0[0] + r.c[0] * 2 + r.p1[0]) / 4];
  const ys = [r.p0[1], r.p1[1], (r.p0[1] + r.c[1] * 2 + r.p1[1]) / 4];
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  const z = Math.max(1, Math.min(2.6, (1920 * 0.6) / (w * K), (1080 * 0.55) / (h * K)));
  return { cx: (Math.max(...xs) + Math.min(...xs)) / 2, cy: (Math.max(...ys) + Math.min(...ys)) / 2, z, ax: 960, ay: 540 };
};

/** Camera zoomed onto a country, placed high on screen to leave room for the content. */
export const countryCam = (coords: [number, number]): Cam => {
  const [cx, cy] = project(coords);
  return { cx, cy, z: COUNTRY_TIMING.zoom, ax: 960, ay: 300 };
};
