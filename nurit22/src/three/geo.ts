import * as THREE from "three";
import { COUNTRIES, HOME_COORDS } from "../config";

export type LonLat = [number, number];

/** lon/lat → point on the unit sphere (y up, lon 0 facing +z). */
export const toVec = ([lon, lat]: LonLat, r = 1) => {
  const phi = (lat * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180;
  return new THREE.Vector3(r * Math.cos(phi) * Math.sin(lam), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(lam));
};

/** Stops of the trip: home, the six countries, back home. */
export const STOPS: LonLat[] = [HOME_COORDS, ...COUNTRIES.map((c) => c.coords), HOME_COORDS];

/** Great-circle arc between two stops, lifted above the surface. Returns point at t∈[0,1]. */
export const arcPoint = (a: LonLat, b: LonLat, t: number) => {
  const va = toVec(a);
  const vb = toVec(b);
  const angle = va.angleTo(vb);
  const lift = 0.06 + 0.22 * (angle / Math.PI);
  const p = slerp(va, vb, t);
  return p.multiplyScalar(1 + Math.sin(Math.PI * t) * lift);
};

export const slerp = (a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 => {
  const angle = a.angleTo(b);
  if (angle < 1e-6) return a.clone();
  // near-antipodal: bend through the north so the path is defined
  if (Math.PI - angle < 0.05) {
    const mid = new THREE.Vector3(0, 1, 0);
    return t < 0.5 ? slerp(a, mid, t * 2) : slerp(mid, b, (t - 0.5) * 2);
  }
  const s = Math.sin(angle);
  return a.clone().multiplyScalar(Math.sin((1 - t) * angle) / s).add(b.clone().multiplyScalar(Math.sin(t * angle) / s));
};

export const legPoint = (i: number, t: number) => arcPoint(STOPS[i], STOPS[i + 1], t);

/** Tangent (flight direction) on a leg. */
export const legTangent = (i: number, t: number) => {
  const e = 0.002;
  return legPoint(i, Math.min(1, t + e)).sub(legPoint(i, Math.max(0, t - e))).normalize();
};

// ---------------------------------------------------------------- camera

/** A camera "shot": look at `focus` (unit vector) from `dist` above the centre,
 *  tilted toward the south by `tilt`, with the focus pushed to screen offset (sx, sy) in NDC-ish units. */
export type Shot = { focus: THREE.Vector3; dist: number; tilt: number; sx: number; sy: number; roll: number };

export const shotLerp = (a: Shot, b: Shot, t: number): Shot => ({
  focus: slerp(a.focus.clone().normalize(), b.focus.clone().normalize(), t),
  dist: a.dist * Math.pow(b.dist / a.dist, t),
  tilt: a.tilt + (b.tilt - a.tilt) * t,
  sx: a.sx + (b.sx - a.sx) * t,
  sy: a.sy + (b.sy - a.sy) * t,
  roll: a.roll + (b.roll - a.roll) * t,
});

export const FOV = 32;

/** Camera position/target/up for a shot. */
export const shotCamera = (s: Shot) => {
  const f = s.focus.clone().normalize();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const east = new THREE.Vector3().crossVectors(worldUp, f);
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0);
  east.normalize();
  const north = new THREE.Vector3().crossVectors(f, east).normalize();
  // camera sits above the focus, pulled south to look "across" the globe
  const pos = f.clone().multiplyScalar(s.dist).add(north.clone().multiplyScalar(-s.tilt * (s.dist - 1)));
  const dir = f.clone().sub(pos).normalize();
  const right = new THREE.Vector3().crossVectors(dir, north).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir).normalize();
  // shift the aim point so the focus appears offset on screen
  const d = f.clone().sub(pos).length();
  const h = Math.tan(((FOV / 2) * Math.PI) / 180) * d;
  const target = f.clone().add(right.clone().multiplyScalar(-s.sx * h * (16 / 9))).add(up.clone().multiplyScalar(-s.sy * h));
  const rolledUp = up.clone().applyAxisAngle(dir, s.roll);
  return { pos, target, up: rolledUp };
};

export const stopVec = (i: number) => toVec(STOPS[i]);

/** Close shot of a country: focus on the left of the screen, horizon visible. */
export const countryShot = (i: number): Shot => ({ focus: stopVec(i), dist: 2.25, tilt: 0.5, sx: -0.36, sy: 0.08, roll: 0 });

/** Wide shot framing a whole leg. */
export const legShot = (i: number): Shot => {
  const a = stopVec(i);
  const b = stopVec(i + 1);
  const angle = a.angleTo(b);
  const mid = legPoint(i, 0.5).normalize();
  // keep the camera at friendly latitudes so the globe stays upright
  const lat = Math.asin(mid.y);
  const clamped = Math.max(-0.2, Math.min(0.62, lat));
  const h = Math.sqrt(mid.x * mid.x + mid.z * mid.z) || 1;
  const focus = new THREE.Vector3((mid.x / h) * Math.cos(clamped), Math.sin(clamped), (mid.z / h) * Math.cos(clamped));
  return { focus, dist: 2.6 + angle * 1.05, tilt: 0.2, sx: 0, sy: -0.02, roll: 0 };
};
