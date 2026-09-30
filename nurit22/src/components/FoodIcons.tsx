import React from "react";
import { COLORS } from "../config";

// Gold line-art food icons, 120×120 viewBox. Every shape is stroked so it can draw itself.
const ICONS: Record<string, React.ReactElement[]> = {
  "מוצ׳י": [
    <ellipse cx={60} cy={92} rx={48} ry={9} />,
    <path d="M16,90 C14,62 34,54 50,56 C64,58 66,74 64,90" />,
    <path d="M56,90 C54,56 84,48 100,60 C110,68 108,82 104,90" />,
    <path d="M34,64 C38,62 44,62 48,64 M76,60 C82,57 90,58 94,62" />,
    <path d="M78,52 C74,40 82,30 94,30 C94,42 88,50 78,52 Z" />,
  ],
  "אדממה": [
    <path d="M12,80 C18,62 30,66 40,56 C50,46 60,54 70,44 C80,34 94,40 108,28 C112,40 100,56 86,62 C74,68 64,64 54,72 C42,82 28,76 16,90 Z" />,
    <circle cx={34} cy={72} r={7} />,
    <circle cx={60} cy={60} r={7} />,
    <circle cx={86} cy={48} r={7} />,
    <path d="M108,28 C112,22 110,16 104,14" />,
  ],
  "מאצ׳ה": [
    <path d="M14,58 H106 C104,88 84,102 60,102 C36,102 16,88 14,58 Z" />,
    <path d="M22,66 C40,72 80,72 98,66" />,
    <path d="M44,102 V108 H76 V102" />,
    <path d="M78,50 L92,14 M86,50 L96,16 M94,50 L100,18 M102,50 L104,20" />,
    <path d="M76,50 H106" />,
  ],
  "בוראטה": [
    <ellipse cx={60} cy={96} rx={50} ry={10} />,
    <circle cx={60} cy={66} r={28} />,
    <path d="M48,40 C50,30 70,30 72,40" />,
    <path d="M54,38 L50,24 M66,38 L70,24" />,
    <path d="M86,88 C92,78 104,76 110,80 C104,90 94,92 86,88 Z" />,
    <path d="M44,70 C50,74 58,74 64,70" />,
  ],
  "פרמזן בדבש": [
    <path d="M10,92 L66,92 L66,58 Z" />,
    <path d="M10,92 L40,62 L66,58" />,
    <circle cx={42} cy={82} r={3} />,
    <circle cx={54} cy={74} r={2.5} />,
    <path d="M78,14 L96,56" />,
    <ellipse cx={100} cy={66} rx={10} ry={14} transform="rotate(-22 100 66)" />,
    <path d="M92,60 L108,56 M94,68 L110,64" />,
    <path d="M104,80 C104,88 100,92 100,98 C100,104 108,104 108,98 C108,92 104,88 104,80" />,
  ],
  "אמרטי": [
    <path d="M10,78 C10,58 48,58 48,78 Z" />,
    <path d="M72,78 C72,58 110,58 110,78 Z" />,
    <path d="M36,52 C36,30 84,30 84,52 Z" />,
    <path d="M20,70 L28,64 L32,70 M84,70 L92,64 L98,70 M50,44 L58,38 L64,44 L70,40" />,
    <path d="M8,82 H112" />,
  ],
  "קימצ׳י": [
    <path d="M12,62 H108 C106,90 86,104 60,104 C34,104 14,90 12,62 Z" />,
    <path d="M22,62 C22,40 40,34 48,50 C52,28 74,26 78,48 C86,34 100,40 98,62" />,
    <path d="M40,62 C42,52 48,48 54,54 M66,62 C68,50 76,48 82,56" />,
    <path d="M30,78 C50,84 72,84 92,78" />,
  ],
  "אצות": [
    <rect x={18} y={40} width={70} height={56} rx={3} transform="rotate(-8 53 68)" />,
    <rect x={32} y={30} width={70} height={56} rx={3} transform="rotate(6 67 58)" />,
    <path d="M44,44 C52,48 60,40 68,44 C76,48 84,40 92,44 M42,58 C50,62 58,54 66,58 C74,62 82,54 90,58 M40,72 C48,76 56,68 64,72 C72,76 80,68 88,72" />,
  ],
  "גוצ׳וג׳אנג": [
    <rect x={22} y={34} width={76} height={66} rx={10} />,
    <rect x={16} y={22} width={88} height={14} rx={5} />,
    <path d="M40,58 C48,50 60,52 66,60 C72,68 84,70 88,62 C84,82 56,84 44,72 C40,68 38,62 40,58 Z" />,
    <path d="M40,58 C36,54 34,48 38,44" />,
  ],
  "פפאדם": [
    <circle cx={60} cy={60} r={44} />,
    <circle cx={60} cy={60} r={36} strokeDasharray="0.02 0.03" />,
    <circle cx={46} cy={46} r={3} />,
    <circle cx={72} cy={42} r={2.5} />,
    <circle cx={78} cy={70} r={3} />,
    <circle cx={50} cy={76} r={2.5} />,
    <circle cx={62} cy={58} r={2} />,
    <path d="M60,16 L64,34 L56,44" />,
  ],
  "סמוסה": [
    <path d="M14,92 L58,20 L106,92 Z" />,
    <path d="M58,20 L68,92" />,
    <path d="M20,86 L26,82 M30,76 L36,72 M40,60 L46,56 M50,44 L56,40 M96,82 L102,86 M88,70 L94,74 M78,54 L84,58" />,
    <path d="M8,98 H112" />,
  ],
  "לאסי מנגו": [
    <path d="M34,26 L42,104 H78 L86,26" />,
    <path d="M36,44 H84" />,
    <path d="M70,8 L62,70" />,
    <path d="M78,26 C80,12 98,8 104,18 C98,28 86,30 78,26 Z" />,
    <path d="M42,62 C54,66 66,58 80,62" />,
  ],
  "אלוטה": [
    <path d="M28,92 C18,80 40,40 70,22 C88,12 100,20 96,34 C88,62 50,100 28,92 Z" />,
    <path d="M40,76 L82,34 M34,64 L72,26 M50,84 L92,42" />,
    <path d="M44,50 L60,66 M56,38 L74,56 M68,30 L84,46" />,
    <path d="M28,92 L12,110" />,
    <path d="M32,86 C20,76 14,62 20,48 M40,90 C38,102 46,110 58,112" />,
  ],
  "סלסה ורדה": [
    <path d="M10,54 H110 C108,80 88,94 60,94 C32,94 12,80 10,54 Z" />,
    <path d="M30,94 L24,108 M60,94 V108 M90,94 L96,108" />,
    <path d="M20,54 C34,46 48,50 60,54 C74,46 90,48 100,54" />,
    <circle cx={86} cy={30} r={14} />,
    <path d="M86,16 C82,8 90,4 94,10" />,
    <path d="M38,70 C44,68 50,72 56,70 M64,72 C70,70 76,74 82,72" />,
  ],
  "שוקולד צ׳ילי": [
    <rect x={10} y={44} width={70} height={56} rx={4} />,
    <path d="M33,44 V100 M56,44 V100 M10,72 H80" />,
    <path d="M80,44 L70,34 L10,34 L10,44" />,
    <path d="M90,90 C84,70 88,46 102,30 C108,40 110,62 98,86 C96,92 92,94 90,90 Z" />,
    <path d="M102,30 C100,22 104,16 110,14" />,
  ],
  "שוקולד דובאי": [
    <path d="M10,50 L56,50 L50,62 L58,72 L52,84 L56,96 L10,96 Z" />,
    <path d="M10,64 H50 M10,82 H52" />,
    <path d="M66,50 L110,50 L110,96 L68,96 L62,84 L70,72 L62,62 Z" />,
    <path d="M14,70 C20,74 26,68 32,72 C38,76 44,70 50,74 M68,72 C74,76 80,70 86,74 C92,78 98,72 106,76" />,
    <ellipse cx={86} cy={26} rx={12} ry={8} transform="rotate(-20 86 26)" />,
    <path d="M78,28 C84,24 90,24 96,22" />,
  ],
  "חלומי בדבש": [
    <rect x={10} y={56} width={60} height={34} rx={4} transform="rotate(-6 40 73)" />,
    <rect x={44} y={46} width={60} height={34} rx={4} transform="rotate(8 74 63)" />,
    <path d="M56,56 L68,72 M70,58 L82,74 M84,60 L96,76" />,
    <path d="M60,8 C60,20 54,26 54,34 C54,42 66,42 66,34 C66,26 60,20 60,8" />,
    <path d="M24,70 L34,84" />,
  ],
  "לוקום": [
    <path d="M14,70 L34,60 L54,70 L34,80 Z M14,70 V92 L34,102 V80 M54,70 V92 L34,102" />,
    <path d="M60,60 L80,50 L100,60 L80,70 Z M60,60 V82 L80,92 V70 M100,60 V82 L80,92" />,
    <path d="M38,38 L58,28 L78,38 L58,48 Z M38,38 V58 M78,38 V58 M58,48 V60" />,
    <circle cx={30} cy={70} r={1.5} />,
    <circle cx={80} cy={60} r={1.5} />,
    <circle cx={60} cy={38} r={1.5} />,
    <circle cx={50} cy={34} r={1.2} />,
  ],
};

/** A food icon drawing itself (`draw` 0→1) with its label underneath. */
export const FoodIcon: React.FC<{ name: string; draw: number; size?: number; label?: React.ReactNode }> = ({ name, draw, size = 170, label }) => {
  const shapes = ICONS[name] ?? [<circle cx={60} cy={60} r={40} />];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible",
        filter: `drop-shadow(0 0 6px rgba(224,184,98,0.55))` }}>
        <circle cx={60} cy={60} r={58} fill={COLORS.gold} fillOpacity={0.05 * draw} stroke={COLORS.gold}
          strokeOpacity={0.35} strokeWidth={1} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        {shapes.map((el, i) => {
          const local = Math.max(0, Math.min(1, draw * (1 + shapes.length * 0.15) - i * 0.15));
          const dotted = (el.props as { strokeDasharray?: string }).strokeDasharray;
          return React.cloneElement(el as React.ReactElement<React.SVGProps<SVGElement>>, {
            key: i, fill: "none", stroke: COLORS.goldLight, strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round",
            pathLength: 1, strokeDasharray: dotted ?? "1 1", strokeDashoffset: dotted ? 0 : 1 - local,
            opacity: dotted ? local : 1,
          });
        })}
      </svg>
      {label}
    </div>
  );
};
