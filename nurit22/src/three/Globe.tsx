import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config";
import land from "../geo/land.json";
import { FOV, legPoint, legTangent, shotCamera, STOPS, toVec, type Shot } from "./geo";

const C = (hex: string) => new THREE.Color(hex);

export type GlobeProps = {
  shot: Shot;
  /** legs to draw, with progress 0..1 */
  legs: { index: number; draw: number; glow?: number }[];
  /** stop indices to mark */
  stops: number[];
  pulseStop?: number;
  plane?: { leg: number; t: number; scale?: number } | null;
  /** 0..1: land dots appear, sweeping out from `revealFrom` */
  reveal?: number;
  revealFrom?: number;
  /** overall brightness multiplier */
  intensity?: number;
};

// ---------------------------------------------------------------- shaders

const dotsVertex = /* glsl */ `
  attribute float aRand;
  uniform float uTime, uReveal, uPx, uSize;
  uniform vec3 uRevealFrom;
  uniform vec3 uLight;
  varying float vAlpha;
  varying float vLit;
  varying float vRand;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * position);
    float facing = dot(n, normalize(-mv.xyz));
    float ang = acos(clamp(dot(normalize(position), uRevealFrom), -1.0, 1.0)) / 3.14159;
    float rev = smoothstep(ang - 0.08, ang, uReveal * 1.1);
    float tw = 0.75 + 0.25 * sin(uTime * (0.6 + aRand * 1.4) + aRand * 40.0);
    vAlpha = smoothstep(-0.05, 0.35, facing) * rev * tw;
    vRand = aRand;
    vLit = 0.5 + 1.1 * pow(max(0.0, dot(normalize(position), uLight)), 1.5);
    gl_PointSize = uSize * uPx / -mv.z * (0.8 + 0.4 * aRand) * (0.6 + 0.4 * rev);
    gl_Position = projectionMatrix * mv;
  }`;

const dotsFragment = /* glsl */ `
  uniform vec3 uA, uB;
  uniform float uIntensity;
  varying float vAlpha;
  varying float vRand;
  varying float vLit;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.18, d);
    vec3 col = mix(uA, uB, vRand);
    gl_FragColor = vec4(col * uIntensity * vLit, a * vAlpha);
  }`;

const sphereVertex = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

const sphereFragment = /* glsl */ `
  uniform vec3 uDeep, uMid, uRim;
  varying vec3 vN; varying vec3 vV;
  void main() {
    float f = clamp(dot(vN, vV), 0.0, 1.0);
    vec3 L = normalize(vec3(-0.55, 0.6, 0.6));
    float lit = pow(max(0.0, dot(vN, L)), 2.0);
    vec3 col = mix(uDeep, uMid, lit * 0.85 + pow(f, 2.0) * 0.15);
    col += uRim * pow(max(0.0, dot(reflect(-L, vN), vV)), 24.0) * 0.12;
    float rim = pow(1.0 - f, 7.0);
    col += uRim * rim * 0.45;
    gl_FragColor = vec4(col, 1.0);
  }`;

const atmoFragment = /* glsl */ `
  uniform vec3 uRim; uniform float uIntensity;
  varying vec3 vN; varying vec3 vV;
  void main() {
    float f = dot(vN, vV);
    float g = pow(clamp(0.42 + f, 0.0, 1.0), 3.0);
    gl_FragColor = vec4(uRim, g * 1.6 * uIntensity);
  }`;

const glowFragment = /* glsl */ `
  uniform vec3 uCol; uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.2);
    gl_FragColor = vec4(uCol, a * uAlpha);
  }`;
const uvVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// ---------------------------------------------------------------- pieces

const CameraRig: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { camera } = useThree();
  const { pos, target, up } = shotCamera(shot);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = FOV;
    cam.near = 0.01;
    cam.far = 100;
    cam.position.copy(pos);
    cam.up.copy(up);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
  });
  return null;
};

const LandDots: React.FC<{ reveal: number; revealFrom: THREE.Vector3; intensity: number; size: number }> = ({ reveal, revealFrom, intensity, size }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const geom = useMemo(() => {
    const d = land.dots3d as number[];
    const n = d.length / 2;
    const pos = new Float32Array(n * 3);
    const rnd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const v = toVec([d[i * 2], d[i * 2 + 1]], 1.003);
      pos.set([v.x, v.y, v.z], i * 3);
      rnd[i] = random(`dot${i}`);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: dotsVertex, fragmentShader: dotsFragment, transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uReveal: { value: 1 }, uPx: { value: 1 }, uSize: { value: 1 }, uIntensity: { value: 1 },
      uRevealFrom: { value: new THREE.Vector3() }, uLight: { value: new THREE.Vector3(1, 1, 1).normalize() }, uA: { value: C(COLORS.gold) }, uB: { value: C(COLORS.goldLight) },
    },
  }), []);
  mat.uniforms.uTime.value = frame / fps;
  mat.uniforms.uReveal.value = reveal;
  mat.uniforms.uRevealFrom.value.copy(revealFrom);
  mat.uniforms.uPx.value = height / 1080;
  mat.uniforms.uSize.value = size;
  mat.uniforms.uIntensity.value = intensity;
  const { camera } = useThree();
  const L = new THREE.Vector3(-0.55, 0.6, 0.6).applyQuaternion(camera.quaternion).normalize();
  mat.uniforms.uLight.value.copy(L);
  return <points geometry={geom} material={mat} />;
};

const Sphere: React.FC<{ intensity: number }> = ({ intensity }) => {
  const uniforms = useMemo(() => ({ uDeep: { value: C(COLORS.night) }, uMid: { value: C(COLORS.blue) }, uRim: { value: C(COLORS.gold) } }), []);
  const atmo = useMemo(() => ({ uRim: { value: C(COLORS.gold) }, uIntensity: { value: 1 } }), []);
  atmo.uIntensity.value = intensity;
  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial vertexShader={sphereVertex} fragmentShader={sphereFragment} uniforms={uniforms} />
      </mesh>
      <mesh scale={1.045}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial vertexShader={sphereVertex} fragmentShader={atmoFragment} uniforms={atmo}
          side={THREE.BackSide} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
};

/** Camera-facing soft glow sprite. */
const Glow: React.FC<{ at: THREE.Vector3; size: number; alpha: number; color?: string }> = ({ at, size, alpha, color = COLORS.goldLight }) => {
  const uniforms = useMemo(() => ({ uCol: { value: C(color) }, uAlpha: { value: alpha } }), [color]);
  uniforms.uAlpha.value = alpha;
  const { camera } = useThree();
  return (
    <mesh position={at} quaternion={camera.quaternion} renderOrder={5}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial vertexShader={uvVertex} fragmentShader={glowFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};

const ARC_SEG = 200;
const tubeFragment = /* glsl */ `
  uniform vec3 uCol; uniform float uAlpha, uDraw, uTime;
  varying vec2 vUv;
  void main() {
    if (vUv.x > uDraw) discard;
    float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
    float head = smoothstep(uDraw - 0.12, uDraw, vUv.x) * step(uDraw, 0.999);
    float dash = 0.55 + 0.45 * step(0.5, fract(vUv.x * 60.0 - uTime * 0.8));
    gl_FragColor = vec4(uCol, (edge * uAlpha * dash) * (1.0 + head * 1.5));
  }`;

const Arc: React.FC<{ index: number; draw: number; glow: number }> = ({ index, draw, glow }) => {
  const frame = useCurrentFrame();
  const curve = useMemo(() => {
    const pts = Array.from({ length: 64 }, (_, i) => legPoint(index, i / 63));
    return new THREE.CatmullRomCurve3(pts);
  }, [index]);
  const core = useMemo(() => ({ uCol: { value: C(COLORS.cream) }, uAlpha: { value: 1 }, uDraw: { value: 0 }, uTime: { value: 0 } }), []);
  const halo = useMemo(() => ({ uCol: { value: C(COLORS.gold) }, uAlpha: { value: 0.35 }, uDraw: { value: 0 }, uTime: { value: 0 } }), []);
  core.uDraw.value = halo.uDraw.value = draw;
  core.uTime.value = halo.uTime.value = frame / 30;
  core.uAlpha.value = 0.95;
  halo.uAlpha.value = 0.28 + glow * 0.25;
  const head = draw > 0 && draw < 1 ? legPoint(index, draw) : null;
  return (
    <>
      <mesh renderOrder={3}>
        <tubeGeometry args={[curve, ARC_SEG, 0.0022, 8, false]} />
        <shaderMaterial vertexShader={uvVertex} fragmentShader={tubeFragment} uniforms={core} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh renderOrder={2}>
        <tubeGeometry args={[curve, ARC_SEG, 0.009, 8, false]} />
        <shaderMaterial vertexShader={uvVertex} fragmentShader={tubeFragment} uniforms={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {head && <Glow at={head} size={0.14} alpha={0.9} />}
    </>
  );
};

const Marker: React.FC<{ stop: number; pulse: boolean }> = ({ stop, pulse }) => {
  const frame = useCurrentFrame();
  const v = useMemo(() => toVec(STOPS[stop], 1.004), [stop]);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v.clone().normalize()), [v]);
  const ph = (frame % 50) / 50;
  return (
    <group position={v} quaternion={q}>
      <mesh>
        <ringGeometry args={[0.009, 0.013, 48]} />
        <meshBasicMaterial color={COLORS.goldLight} transparent opacity={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.005, 24]} />
        <meshBasicMaterial color={COLORS.cream} side={THREE.DoubleSide} />
      </mesh>
      {pulse && (
        <mesh scale={1 + ph * 3.5}>
          <ringGeometry args={[0.012, 0.0145, 64]} />
          <meshBasicMaterial color={COLORS.gold} transparent opacity={(1 - ph) * 0.9} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      <Glow at={new THREE.Vector3(0, 0, 0.002)} size={pulse ? 0.11 : 0.06} alpha={pulse ? 0.8 : 0.5} />
    </group>
  );
};

// plane silhouette (nose +x), same outline as the 2D plane
const PLANE_SHAPE = (() => {
  const pts: [number, number][] = [[46, 0], [40, -4.5], [36, -5], [10, -5], [-10, -38], [-18, -38], [-6, -5], [-28, -5], [-36, -16], [-42, -16], [-37, 0],
    [-42, 16], [-36, 16], [-28, 5], [-6, 5], [-18, 38], [-10, 38], [10, 5], [36, 5], [40, 4.5]];
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
})();

const PlaneMesh: React.FC<{ leg: number; t: number; scale: number }> = ({ leg, t, scale }) => {
  const p = legPoint(leg, t);
  const fwd = legTangent(leg, t);
  const n = p.clone().normalize();
  const side = new THREE.Vector3().crossVectors(n, fwd).normalize();
  const fwdOrtho = new THREE.Vector3().crossVectors(side, n).normalize();
  const m = new THREE.Matrix4().makeBasis(fwdOrtho, side, n);
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  const k = 0.001 * scale;
  return (
    <group position={p.clone().add(n.clone().multiplyScalar(0.012))} quaternion={q}>
      <mesh scale={[k, k, k]}>
        <extrudeGeometry args={[PLANE_SHAPE, { depth: 3, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2, bevelSegments: 2 }]} />
        <meshStandardMaterial color={COLORS.goldLight} emissive={COLORS.gold} emissiveIntensity={0.45} metalness={0.85} roughness={0.28} />
      </mesh>
      <Glow at={new THREE.Vector3(0, 0, -0.004)} size={0.16 * scale} alpha={0.55} />
    </group>
  );
};

const Stars: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const geom = useMemo(() => {
    const n = 900;
    const pos = new Float32Array(n * 3);
    const rnd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(random(`s${i}x`) - 0.5, random(`s${i}y`) - 0.5, random(`s${i}z`) - 0.5).normalize().multiplyScalar(22 + random(`s${i}r`) * 10);
      pos.set([v.x, v.y, v.z], i * 3);
      rnd[i] = random(`s${i}`);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: dotsVertex.replace("vAlpha = smoothstep(-0.05, 0.35, facing) * rev * tw;", "vAlpha = tw * (0.25 + 0.5 * aRand);"),
    fragmentShader: dotsFragment, transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uReveal: { value: 1 }, uPx: { value: 1 }, uSize: { value: 60 }, uIntensity: { value: 0.9 },
      uRevealFrom: { value: new THREE.Vector3(0, 1, 0) }, uLight: { value: new THREE.Vector3(0, 0, 0) }, uA: { value: C(COLORS.gold) }, uB: { value: C(COLORS.cream) },
    },
  }), []);
  mat.uniforms.uTime.value = frame / 30;
  mat.uniforms.uPx.value = height / 1080;
  return <points geometry={geom} material={mat} />;
};

// ---------------------------------------------------------------- globe

export const Globe: React.FC<GlobeProps> = ({ shot, legs, stops, pulseStop, plane, reveal = 1, revealFrom = 0, intensity = 1 }) => {
  const { width, height } = useVideoConfig();
  const from = useMemo(() => toVec(STOPS[revealFrom]), [revealFrom]);
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
      <CameraRig shot={shot} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color={COLORS.cream} />
      <Stars />
      <Sphere intensity={intensity} />
      <LandDots reveal={reveal} revealFrom={from} intensity={intensity * 1.35} size={9.5} />
      {legs.filter((l) => l.draw > 0).map((l) => <Arc key={l.index} index={l.index} draw={l.draw} glow={l.glow ?? 0} />)}
      {stops.map((s) => <Marker key={s} stop={s} pulse={s === pulseStop} />)}
      {plane && <PlaneMesh leg={plane.leg} t={plane.t} scale={plane.scale ?? 1} />}
    </ThreeCanvas>
  );
};
