import { useRef } from "react";
import { ChefHat } from "lucide-react";
import { gsap } from "@/lib/gsap";
import "@/lib/gsap-extra";
import { useArtLoop } from "@/components/how/useArtLoop";

/** A closed shape r(θ) around (60, 60), same point count for every shape so the morphs stay calm. */
function polar(r, n = 96) {
  let d = "";
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rr = r(a);
    d += `${i ? "L" : "M"}${(60 + rr * Math.cos(a)).toFixed(2)} ${(60 + rr * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
}
const BLOB = polar((a) => 45 + 5 * Math.sin(3 * a + 0.6) + 3 * Math.cos(2 * a));
const FLOWER = polar((a) => 42 + 8 * Math.cos(6 * a));
const SQUIRCLE = polar((a) => 46 / (Math.abs(Math.cos(a)) ** 4 + Math.abs(Math.sin(a)) ** 4) ** 0.25);

// The demo restaurant's palette (illustration art): cream, terracotta, basil, wine, brand violet.
const SWATCHES = ["#EFE3C8", "#D9734E", "#6E8B4E", "#6B2737", "#8B5CF6"];
const FAN = [-34, -17, 0, 17, 34];
const TILE_REST = [2.5, -3, 4];
const TILE_FROM = [-12, 10, -9];

function Tape({ className }) {
  return <span className={`absolute h-5 w-14 rounded-[3px] bg-white/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] ${className}`} />;
}

/**
 * Step 2 illustration: a moodboard. The logo blob morphs between three shapes (MorphSVG), the colour swatches
 * fan out, abstract image tiles settle onto the board. Entrance once, then a 7.2s morph loop.
 */
export default function Moodboard({ active, still }) {
  const root = useRef(null);

  useArtLoop(root, {
    active,
    still,
    final: () => {
      gsap.set("[data-swatch]", { rotation: (i) => FAN[i] });
      gsap.set("[data-tile]", { rotation: (i) => TILE_REST[i] });
    },
    build: (tl) => {
      gsap.set("[data-tile]", { y: -46, rotation: (i) => TILE_FROM[i], scale: 1.06, autoAlpha: 0 });
      gsap.set("[data-logo-tile]", { scale: 0.82, autoAlpha: 0 });
      gsap.set("[data-swatch]", { rotation: 0 });
      tl.to("[data-logo-tile]", { scale: 1, autoAlpha: 1, duration: 0.8, ease: "mv.spring" }, 0.1)
        .to("[data-tile]", { y: 0, rotation: (i) => TILE_REST[i], scale: 1, autoAlpha: 1, duration: 1.1, ease: "mv.out", stagger: 0.14 }, 0.2)
        .to("[data-swatch]", { rotation: (i) => FAN[i], duration: 1, ease: "mv.spring", stagger: 0.05 }, 0.6);

      const loop = gsap.timeline({ repeat: -1 });
      loop
        .to("[data-blob]", { morphSVG: { shape: FLOWER, shapeIndex: 0 }, duration: 1, ease: "mv.inOut" }, 0.4)
        .to("[data-blob-hi]", { rotation: "+=120", svgOrigin: "60 60", duration: 1, ease: "mv.inOut" }, 0.4)
        .to("[data-blob]", { morphSVG: { shape: SQUIRCLE, shapeIndex: 0 }, duration: 1, ease: "mv.inOut" }, 2.8)
        .to("[data-blob-hi]", { rotation: "+=120", svgOrigin: "60 60", duration: 1, ease: "mv.inOut" }, 2.8)
        .to("[data-blob]", { morphSVG: { shape: BLOB, shapeIndex: 0 }, duration: 1, ease: "mv.inOut" }, 5.2)
        .to("[data-blob-hi]", { rotation: "+=120", svgOrigin: "60 60", duration: 1, ease: "mv.inOut" }, 5.2)
        .to("[data-swatch]", { rotation: (i) => FAN[i] * 0.86, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, 3.2)
        .set({}, {}, 7.2);
      tl.add(loop, 1.4);
    },
  });

  return (
    <div ref={root} className="relative h-full w-full">
      {/* board */}
      <div
        className="absolute inset-[12px] rounded-card border border-mv-line"
        style={{
          backgroundColor: "rgb(var(--mv-surface) / 0.9)",
          backgroundImage: "radial-gradient(rgb(var(--mv-text) / 0.07) 1px, transparent 1.2px)",
          backgroundSize: "18px 18px",
          boxShadow: "var(--mv-glass-highlight), 0 40px 90px -40px rgba(76, 29, 149, 0.6)",
        }}
      />

      {/* logo tile with the morphing blob */}
      <div data-logo-tile className="absolute left-[44px] top-[42px] h-[176px] w-[176px] rounded-[22px] border border-mv-line bg-mv-surface-2 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)]">
        <svg viewBox="0 0 120 120" className="absolute inset-[18px]">
          <defs>
            <linearGradient id="mv-how-blob" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F0A07A" />
              <stop offset="0.55" stopColor="#D9734E" />
              <stop offset="1" stopColor="#6B2737" />
            </linearGradient>
          </defs>
          <path data-blob d={BLOB} fill="url(#mv-how-blob)" />
          <ellipse data-blob-hi cx="44" cy="38" rx="16" ry="9" fill="#FFFFFF" opacity="0.22" transform="rotate(-30 44 38)" />
        </svg>
        <ChefHat size={38} strokeWidth={1.5} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90" />
      </div>

      {/* image tiles: abstract shapes, no photos */}
      <div data-tile className="absolute left-[248px] top-[36px] h-[168px] w-[262px] rounded-[16px] p-2 shadow-[0_22px_44px_-22px_rgba(0,0,0,0.75)]" style={{ background: "#F4EDE0" }}>
        <svg viewBox="0 0 246 152" className="h-full w-full rounded-[10px]">
          <defs>
            <linearGradient id="mv-how-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F6B48F" />
              <stop offset="1" stopColor="#B4709A" />
            </linearGradient>
          </defs>
          <rect width="246" height="152" fill="url(#mv-how-sky)" />
          <circle cx="170" cy="62" r="22" fill="#FCE3C4" opacity="0.9" />
          <path d="M28 152V78a42 42 0 0 1 84 0v74z" fill="#3A1F2B" />
          <path d="M134 152V96a28 28 0 0 1 56 0v56z" fill="#5A2B3A" />
          <rect y="134" width="246" height="18" fill="#2A1620" />
        </svg>
        <Tape className="-top-2 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
      </div>

      <div data-tile className="absolute left-[318px] top-[226px] h-[156px] w-[192px] rounded-[16px] p-2 shadow-[0_22px_44px_-22px_rgba(0,0,0,0.75)]" style={{ background: "#F4EDE0" }}>
        <svg viewBox="0 0 176 140" className="h-full w-full rounded-[10px]">
          <rect width="176" height="140" fill="#2B2130" />
          <circle cx="88" cy="70" r="52" fill="#E9E1D6" />
          <circle cx="88" cy="70" r="40" fill="#D9734E" />
          <circle cx="88" cy="70" r="40" fill="none" stroke="#F0C27A" strokeWidth="5" strokeDasharray="2 9" opacity="0.7" />
          <circle cx="74" cy="58" r="7" fill="#F4EDE0" />
          <circle cx="102" cy="80" r="6" fill="#F4EDE0" />
          <path d="M92 50c8-6 16-4 20 2-8 4-14 4-20-2z" fill="#6E8B4E" />
          <path d="M70 84c6-7 14-7 19-2-7 5-13 6-19 2z" fill="#6E8B4E" />
        </svg>
        <Tape className="-top-2 right-6 rotate-[6deg]" />
      </div>

      <div data-tile className="absolute left-[200px] top-[262px] h-[112px] w-[134px] rounded-[14px] p-1.5 shadow-[0_22px_44px_-22px_rgba(0,0,0,0.75)]" style={{ background: "#F4EDE0" }}>
        <svg viewBox="0 0 122 100" className="h-full w-full rounded-[9px]">
          <rect width="122" height="100" fill="#EFE3C8" />
          {[22, 40, 58, 76].map((y, i) => (
            <path key={y} d={`M-4 ${y}c12-10 22 10 34 0s22 10 34 0 22 10 34 0 22 10 34 0`} fill="none" stroke={i % 2 ? "#D9734E" : "#C9A24E"} strokeWidth="5" strokeLinecap="round" />
          ))}
        </svg>
      </div>

      {/* colour swatches, fanned from one pivot like a paint-chip deck */}
      <div className="absolute left-[108px] top-[396px] h-0 w-0">
        {SWATCHES.map((color) => (
          <span
            key={color}
            data-swatch
            className="absolute -left-[19px] -top-[128px] block h-[132px] w-[38px] overflow-hidden rounded-[10px] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.7)]"
            style={{ transformOrigin: "50% 94%", background: "#F7F3EA" }}
          >
            <span className="block h-[96px] w-full" style={{ background: color }} />
            <span className="mx-auto mt-3 block h-1.5 w-5 rounded-full bg-black/15" />
          </span>
        ))}
      </div>
    </div>
  );
}
