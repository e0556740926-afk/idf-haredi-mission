import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BRAND, COLORS, FONTS, type Country } from "../config";
import { EASE_IN_OUT, EASE_OUT, GoldRule, MaskWords } from "./Foil";
import { Ornament } from "./Patterns";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ROMAN = ["I", "II", "III"];

/** First-class tasting-menu card for a country. Frame 0 = card starts entering. */
export const MenuCard: React.FC<{ country: Country; exitAt: number; compact?: boolean }> = ({ country, exitAt, compact }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 34], [0, 1], { ...clamp, easing: EASE_OUT });
  const out = interpolate(frame, [exitAt, exitAt + 16], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const sweep = interpolate(frame, [26, 70], [-0.4, 1.4], clamp);
  const W = compact ? 500 : 560;
  const H = compact ? 760 : 800;
  const rule = interpolate(frame, [18, 44], [0, 1], { ...clamp, easing: EASE_OUT });
  const item = (i: number) => 40 + i * 12;

  return (
    <div style={{ position: "absolute", right: 110, top: 110, width: W, height: H, perspective: 1600 }}>
      <div dir="rtl" style={{
        position: "absolute", inset: 0, transformOrigin: "100% 50%",
        transform: `rotateY(${-(1 - p) * 70 + out * 25}deg) translateX(${(1 - p) * 60 + out * 60}px) translateZ(${-out * 200}px)`,
        opacity: Math.min(1, p * 1.6) * (1 - out),
        background: `linear-gradient(165deg, rgba(12,29,70,0.96) 0%, rgba(7,20,46,0.97) 100%)`,
        boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 0 1.5px ${COLORS.gold}, inset 0 0 0 10px rgba(7,20,46,0.9), inset 0 0 0 11px rgba(246,213,140,0.55)`,
        overflow: "hidden", borderRadius: 4,
      }}>
        <Ornament kind={country.pattern} id={`card-${country.id}`} opacity={0.07} scale={1.2} />
        {/* ornament band */}
        <div style={{ position: "absolute", left: 11, right: 11, bottom: 11, height: 90,
          WebkitMaskImage: "linear-gradient(to top, black, transparent)", maskImage: "linear-gradient(to top, black, transparent)" }}>
          <Ornament kind={country.pattern} id={`band-${country.id}`} opacity={0.5} scale={1} />
        </div>
        {/* corner brackets */}
        {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], k) => (
          <svg key={k} width={34} height={34} style={{ position: "absolute", [x ? "right" : "left"]: 20, [y ? "bottom" : "top"]: 20,
            transform: `scale(${x ? -1 : 1}, ${y ? -1 : 1})` }}>
            <path d="M2,26 V2 H26" fill="none" stroke={COLORS.goldLight} strokeWidth={1.4} />
            <circle cx={2} cy={2} r={2.5} fill={COLORS.goldLight} />
          </svg>
        ))}

        <div style={{ position: "absolute", inset: "54px 56px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 15, letterSpacing: 7, color: COLORS.gold, opacity: rule }} dir="ltr">
            {`${BRAND.airline.toUpperCase()} · ${BRAND.cabin}`}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 26 }}>
            <MaskWords text={country.gate} start={10} dur={20} foil style={{ fontFamily: FONTS.title, fontSize: 40 }} />
            <div style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.gold, opacity: rule }}>{BRAND.flight}</div>
          </div>
          <MaskWords text={country.name} start={14} dur={26} stagger={5} foil glow={1.2}
            style={{ fontFamily: FONTS.title, fontSize: country.name.length > 8 ? 70 : 96, lineHeight: 1.15, marginTop: 6 }} />
          <div style={{ marginTop: 16 }}><GoldRule p={rule} width={330} /></div>
          <div style={{ fontFamily: FONTS.body, fontWeight: 300, fontSize: 26, color: COLORS.goldLight, marginTop: 20, opacity: rule }}>
            {BRAND.menuTitle}
          </div>
          <div style={{ marginTop: 26, width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
            {country.foods.map((f, i) => {
              const q = interpolate(frame, [item(i), item(i) + 26], [0, 1], { ...clamp, easing: EASE_OUT });
              return (
                <div key={f} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "11px 0" }}>
                  <div style={{ fontFamily: FONTS.title, fontSize: 18, color: COLORS.gold, letterSpacing: 4, opacity: q, marginBottom: 2 }}>{ROMAN[i]}</div>
                  <MaskWords text={f} start={item(i) + 4} dur={22} stagger={4}
                    style={{ fontFamily: FONTS.body, fontWeight: 400, fontSize: 40, color: COLORS.cream }} />
                  {i < 2 && <div style={{ width: 60 * q, height: 1, background: COLORS.gold, opacity: 0.6, marginTop: 14 }} />}
                </div>
              );
            })}
          </div>
        </div>
        {/* light sweep */}
        <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", pointerEvents: "none",
          background: `linear-gradient(115deg, transparent ${(sweep - 0.15) * 100}%, rgba(251,241,220,0.22) ${sweep * 100}%, transparent ${(sweep + 0.15) * 100}%)` }} />
      </div>
    </div>
  );
};
