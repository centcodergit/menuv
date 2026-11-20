import { cn } from "@/lib/utils";

/**
 * CSS/SVG stand-ins shown until a canvas has rendered once (after that, a snapshot of the canvas takes over as
 * the poster). Decorative, aria-hidden. Shapes and framing match the live scenes.
 */

/** Night globe: dark sphere, a dotted surface fading to the limb, violet atmosphere. Sized like cobe's sphere (80%). */
export function GlobeStandIn({ className, style }) {
  return (
    <div aria-hidden="true" className={cn("absolute inset-0", className)} style={style}>
      <div
        className="absolute left-[10%] top-[10%] h-[80%] w-[80%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 62%, rgb(var(--mv-violet-500) / 0.28) 71%, transparent 72%)," +
            "radial-gradient(circle at 42% 34%, #1d1730 0%, #0d0b16 55%, #07060c 100%)",
          boxShadow: "0 0 60px 6px rgb(var(--mv-violet-600) / 0.35)",
        }}
      />
      <div
        className="absolute left-[10%] top-[10%] h-[80%] w-[80%] rounded-full opacity-70"
        style={{
          backgroundImage: "radial-gradient(rgb(var(--mv-violet-300) / 0.75) 0.9px, transparent 1.3px)",
          backgroundSize: "7px 7px",
          maskImage: "radial-gradient(circle at 46% 40%, black 10%, rgba(0,0,0,0.5) 45%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 46% 40%, black 10%, rgba(0,0,0,0.5) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}

const LEAVES = [
  [228, 158, -30],
  [178, 140, 40],
  [170, 186, -60],
  [262, 190, 20],
  [250, 136, 70],
];
const CHEESE = [
  [200, 162, 26, 15],
  [158, 152, 22, 12],
  [244, 148, 24, 13],
  [258, 178, 21, 12],
  [190, 196, 22, 12],
  [146, 176, 20, 11],
  [210, 128, 18, 10],
];

/** The pizza on its plate, seen from the scene's camera angle (ellipses at cos 0.92 ≈ 0.6). */
export function DishStandIn({ className, style }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid meet" className={cn("absolute inset-0 h-full w-full", className)} style={style}>
      <defs>
        <radialGradient id="mv-standin-plate" cx="0.45" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#2a2733" />
          <stop offset="1" stopColor="#121117" />
        </radialGradient>
        <radialGradient id="mv-standin-crust" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0.75" stopColor="#d9a15c" />
          <stop offset="1" stopColor="#a95e27" />
        </radialGradient>
        <radialGradient id="mv-standin-sauce" cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#c0321f" />
          <stop offset="1" stopColor="#8a1a12" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="196" rx="168" ry="96" fill="#000" opacity="0.35" />
      <ellipse cx="200" cy="168" rx="166" ry="98" fill="url(#mv-standin-plate)" />
      <ellipse cx="200" cy="166" rx="150" ry="86" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
      <ellipse cx="200" cy="164" rx="106" ry="62" fill="url(#mv-standin-crust)" />
      <ellipse cx="200" cy="163" rx="91" ry="52" fill="url(#mv-standin-sauce)" />
      {CHEESE.map(([x, y, rx, ry]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={rx} ry={ry} fill="#f4e8cf" />
      ))}
      {LEAVES.map(([x, y, r]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="11" ry="5.5" fill="#33772a" transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </svg>
  );
}
