import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { COLORS } from "../config";

const GLOW = `drop-shadow(0 0 8px rgba(224,184,98,0.6)) drop-shadow(0 0 24px rgba(224,184,98,0.3))`;

/** Japan — paper lanterns swinging on strings from the top edge. */
const Lanterns: React.FC<{ appear: number }> = ({ appear }) => {
  const frame = useCurrentFrame();
  const lanterns = [
    { x: 150, len: 170, s: 1 }, { x: 360, len: 90, s: 0.8 }, { x: 1560, len: 90, s: 0.8 }, { x: 1770, len: 170, s: 1 },
  ];
  return (
    <AbsoluteFill style={{ opacity: appear }}>
      {lanterns.map((l, i) => {
        const swing = Math.sin(frame / 28 + i * 1.7) * 6;
        const drop = (1 - appear) * -300;
        return (
          <div key={i} style={{ position: "absolute", left: l.x - 60, top: drop, width: 120, transformOrigin: "60px 0px",
            transform: `rotate(${swing}deg) scale(${l.s})`, filter: GLOW }}>
            <svg width={120} height={l.len + 190} style={{ overflow: "visible" }}>
              <defs>
                <radialGradient id={`lg${i}`}>
                  <stop offset="0" stopColor={COLORS.goldLight} stopOpacity={0.55 + 0.1 * Math.sin(frame / 9 + i)} />
                  <stop offset="1" stopColor={COLORS.gold} stopOpacity={0.08} />
                </radialGradient>
              </defs>
              <line x1={60} y1={0} x2={60} y2={l.len} stroke={COLORS.gold} strokeWidth={2} />
              <rect x={40} y={l.len} width={40} height={12} rx={3} fill={COLORS.blue} stroke={COLORS.gold} strokeWidth={2} />
              <path d={`M40,${l.len + 12} C0,${l.len + 40} 0,${l.len + 140} 40,${l.len + 168} H80 C120,${l.len + 140} 120,${l.len + 40} 80,${l.len + 12} Z`}
                fill={`url(#lg${i})`} stroke={COLORS.goldLight} strokeWidth={2.5} />
              {[40, 65, 90, 115, 140].map((dy) => (
                <path key={dy} d={`M${14 + Math.abs(dy - 90) * 0.18},${l.len + dy} Q60,${l.len + dy + 8} ${106 - Math.abs(dy - 90) * 0.18},${l.len + dy}`}
                  fill="none" stroke={COLORS.gold} strokeWidth={1.2} opacity={0.7} />
              ))}
              <rect x={42} y={l.len + 166} width={36} height={10} rx={3} fill={COLORS.blue} stroke={COLORS.gold} strokeWidth={2} />
              <path d={`M60,${l.len + 176} V${l.len + 190}`} stroke={COLORS.gold} strokeWidth={2} />
            </svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Korea — gold neon signs flickering. */
const Neon: React.FC<{ appear: number }> = ({ appear }) => {
  const frame = useCurrentFrame();
  const flick = (k: number) => {
    const bucket = Math.floor(frame / 3);
    const off = random(`neon-${k}-${bucket}`) < 0.06 || (random(`neonb-${k}-${Math.floor(frame / 50)}`) < 0.25 && frame % 50 < 6 && frame % 2 === 0);
    return off ? 0.25 : 1;
  };
  const neon = (k: number): React.CSSProperties => ({
    position: "absolute", opacity: appear * flick(k),
    filter: `drop-shadow(0 0 4px ${COLORS.goldLight}) drop-shadow(0 0 14px ${COLORS.gold}) drop-shadow(0 0 34px rgba(224,184,98,0.6))`,
  });
  const s = { fill: "none", stroke: COLORS.goldLight, strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <AbsoluteFill>
      {/* bowl with chopsticks */}
      <svg style={{ ...neon(0), left: 90, top: 110 }} width={240} height={200} viewBox="0 0 240 200">
        <rect x={6} y={6} width={228} height={188} rx={24} {...s} strokeWidth={3} />
        <path d="M40,100 H200 C196,150 164,172 120,172 C76,172 44,150 40,100 Z" {...s} />
        <path d="M150,40 L100,96 M176,46 L118,98" {...s} />
        <path d="M80,82 C76,70 86,62 82,50 M110,80 C106,68 116,60 112,48" {...s} strokeWidth={3} />
      </svg>
      {/* 22 */}
      <svg style={{ ...neon(1), left: 1610, top: 220 }} width={220} height={160} viewBox="0 0 220 160">
        <rect x={6} y={6} width={208} height={148} rx={74} {...s} strokeWidth={3} />
        <path d="M50,60 C50,36 96,36 96,60 C96,80 50,96 50,120 H100" {...s} />
        <path d="M122,60 C122,36 168,36 168,60 C168,80 122,96 122,120 H172" {...s} />
      </svg>
      {/* heart */}
      <svg style={{ ...neon(2), left: 1640, top: 440 }} width={160} height={150} viewBox="0 0 160 150">
        <path d="M80,136 C20,96 8,60 22,36 C38,10 72,16 80,44 C88,16 122,10 138,36 C152,60 140,96 80,136 Z" {...s} />
      </svg>
      {/* arrow */}
      <svg style={{ ...neon(3), left: 110, top: 370 }} width={220} height={90} viewBox="0 0 220 90">
        <path d="M200,45 H20 M60,12 L20,45 L60,78" {...s} />
      </svg>
    </AbsoluteFill>
  );
};

/** India — golden mandala slowly rotating behind everything. */
const Mandala: React.FC<{ appear: number }> = ({ appear }) => {
  const frame = useCurrentFrame();
  const rings = [
    { r: 90, n: 12, len: 40, w: 16 },
    { r: 170, n: 18, len: 60, w: 22 },
    { r: 260, n: 24, len: 70, w: 22 },
    { r: 350, n: 36, len: 56, w: 16 },
  ];
  const Ring = ({ rotate, children }: { rotate: number; children: React.ReactNode }) => (
    <g transform={`rotate(${rotate})`}>{children}</g>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: appear * 0.4 }}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{ filter: GLOW, transform: `scale(${0.8 + appear * 0.2})` }}>
        <g fill="none" stroke={COLORS.gold} strokeWidth={1.6}>
          {rings.map((ring, k) => (
            <Ring key={k} rotate={(k % 2 ? -1 : 1) * frame * (0.12 + k * 0.03)}>
              <circle r={ring.r - 8} strokeOpacity={0.6} />
              {Array.from({ length: ring.n }, (_, i) => (
                <g key={i} transform={`rotate(${(360 / ring.n) * i})`}>
                  <path d={`M0,${-ring.r} C${ring.w},${-ring.r - ring.len * 0.4} ${ring.w * 0.6},${-ring.r - ring.len * 0.8} 0,${-ring.r - ring.len} C${-ring.w * 0.6},${-ring.r - ring.len * 0.8} ${-ring.w},${-ring.r - ring.len * 0.4} 0,${-ring.r}Z`} />
                  <circle cy={-ring.r - ring.len - 8} r={3} fill={COLORS.goldLight} stroke="none" />
                </g>
              ))}
            </Ring>
          ))}
          <circle r={40} />
          <circle r={20} stroke={COLORS.goldLight} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Mexico — papel picado flags fluttering on two strings across the top. */
const PapelPicado: React.FC<{ appear: number }> = ({ appear }) => {
  const frame = useCurrentFrame();
  const Flag = ({ x, y, i }: { x: number; y: number; i: number }) => {
    const flutter = Math.sin(frame / 10 + i * 0.9) * 8;
    const cut = i % 3;
    return (
      <g transform={`translate(${x},${y}) rotate(${flutter * 0.3}) skewX(${flutter})`}>
        <path d="M-45,0 H45 V92 L36,100 L27,92 L18,100 L9,92 L0,100 L-9,92 L-18,100 L-27,92 L-36,100 L-45,92 Z"
          fill={COLORS.gold} fillOpacity={0.22} stroke={COLORS.goldLight} strokeWidth={2} />
        {cut === 0 && <path d="M0,22 L18,46 L0,70 L-18,46 Z M-30,20 h10 v10 h-10z M20,20 h10 v10 h-10z M-30,66 h10 v10 h-10z M20,66 h10 v10 h-10z" fill={COLORS.night} stroke={COLORS.gold} strokeWidth={1.2} />}
        {cut === 1 && <g fill={COLORS.night} stroke={COLORS.gold} strokeWidth={1.2}>
          <circle cx={0} cy={46} r={16} />{[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 28} cy={46 + Math.sin((a * Math.PI) / 180) * 28} r={6} />)}
        </g>}
        {cut === 2 && <path d="M0,16 C24,30 24,62 0,80 C-24,62 -24,30 0,16 Z M-34,40 l8,8 l-8,8 l-8,-8z M34,40 l8,8 l-8,8 l-8,-8z" fill={COLORS.night} stroke={COLORS.gold} strokeWidth={1.2} />}
      </g>
    );
  };
  const rows = [{ y: 0, sag: 60, n: 9, offset: 0 }, { y: -20, sag: 40, n: 8, offset: 110 }];
  return (
    <AbsoluteFill style={{ opacity: appear, transform: `translateY(${(1 - appear) * -200}px)`, filter: GLOW }}>
      <svg width={1920} height={400}>
        {rows.map((row, r) => {
          const pts = Array.from({ length: row.n }, (_, i) => {
            const t = (i + 0.5) / row.n;
            const x = row.offset + t * (1920 - row.offset * 2 + (r ? 0 : 0));
            const y = 30 + row.y + Math.sin(t * Math.PI) * row.sag + r * 150;
            return { x, y };
          });
          return (
            <g key={r} opacity={r ? 0.75 : 1}>
              <path d={`M0,${30 + row.y + r * 150} Q960,${30 + row.y + r * 150 + row.sag * 2} 1920,${30 + row.y + r * 150}`} fill="none" stroke={COLORS.gold} strokeWidth={2} />
              {pts.filter((_, i) => r === 0 || (i > 0 && i < row.n - 1 && (i < 3 || i > row.n - 4))).map((p, i) => <Flag key={i} x={p.x} y={p.y} i={i + r * 5} />)}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Turkey & Dubai — glowing mosaic lamps hanging from the top. */
const MosaicLamps: React.FC<{ appear: number }> = ({ appear }) => {
  const frame = useCurrentFrame();
  const lamps = [
    { x: 140, len: 120, s: 1 }, { x: 330, len: 40, s: 0.75 }, { x: 1590, len: 40, s: 0.75 }, { x: 1780, len: 120, s: 1 }, { x: 1430, len: 170, s: 0.6 }, { x: 490, len: 170, s: 0.6 },
  ];
  return (
    <AbsoluteFill style={{ opacity: appear }}>
      {lamps.map((l, i) => {
        const sway = Math.sin(frame / 34 + i * 1.3) * 3;
        const pulse = 0.7 + 0.3 * Math.sin(frame / 12 + i * 2);
        const cy = l.len + 90;
        return (
          <div key={i} style={{ position: "absolute", left: l.x - 90, top: (1 - appear) * -300, transformOrigin: "90px 0px",
            transform: `rotate(${sway}deg) scale(${l.s})` }}>
            <svg width={180} height={l.len + 220} style={{ overflow: "visible" }}>
              <defs>
                <radialGradient id={`mg${i}`}>
                  <stop offset="0" stopColor={COLORS.goldLight} stopOpacity={0.7 * pulse} />
                  <stop offset="0.5" stopColor={COLORS.gold} stopOpacity={0.2 * pulse} />
                  <stop offset="1" stopColor={COLORS.gold} stopOpacity={0} />
                </radialGradient>
                <clipPath id={`mc${i}`}><ellipse cx={90} cy={cy} rx={62} ry={70} /></clipPath>
              </defs>
              <circle cx={90} cy={cy} r={140} fill={`url(#mg${i})`} />
              <line x1={90} y1={0} x2={90} y2={cy - 90} stroke={COLORS.gold} strokeWidth={2} />
              <path d={`M72,${cy - 66} L90,${cy - 92} L108,${cy - 66}`} fill={COLORS.blue} stroke={COLORS.gold} strokeWidth={2} />
              <ellipse cx={90} cy={cy} rx={62} ry={70} fill={COLORS.gold} fillOpacity={0.18 * pulse} stroke={COLORS.goldLight} strokeWidth={2.5}
                style={{ filter: GLOW }} />
              <g clipPath={`url(#mc${i})`} stroke={COLORS.goldLight} strokeWidth={1.4} fill="none" opacity={0.85}>
                {Array.from({ length: 7 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
                  const x = 30 + c * 20 + (r % 2) * 10;
                  const y = cy - 70 + r * 22;
                  return <path key={`${r}-${c}`} d={`M${x},${y - 10} L${x + 10},${y} L${x},${y + 10} L${x - 10},${y} Z`}
                    fill={random(`m${i}${r}${c}`) > 0.6 ? COLORS.goldLight : "none"} fillOpacity={0.35 * pulse} />;
                }))}
              </g>
              <path d={`M74,${cy + 68} L90,${cy + 100} L106,${cy + 68}`} fill={COLORS.blue} stroke={COLORS.gold} strokeWidth={2} />
              <circle cx={90} cy={cy + 108} r={5} fill={COLORS.goldLight} />
            </svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export type MotifKey = "lanterns" | "photos" | "neon" | "mandala" | "papel" | "lamps";

export const Motif: React.FC<{ kind: MotifKey; appear: number }> = ({ kind, appear }) => {
  switch (kind) {
    case "lanterns": return <Lanterns appear={appear} />;
    case "neon": return <Neon appear={appear} />;
    case "mandala": return <Mandala appear={appear} />;
    case "papel": return <PapelPicado appear={appear} />;
    case "lamps": return <MosaicLamps appear={appear} />;
    default: return null;
  }
};
