import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

const GRID = 21;

/** Small deterministic PRNG (mulberry32), so every article gets the same pattern on every visit. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const inFinder = (x, y) => (x < 8 && y < 8) || (x > GRID - 9 && y < 8) || (x < 8 && y > GRID - 9);

/** A QR-like module field from the seed: three finder patterns, timing rows, random data modules. One path each. */
function qrPaths(seed) {
  const rand = rng(seed * 7919 + 13);
  let data = "";
  let finders = "";
  const finder = (ox, oy) => {
    // 7x7 ring, 3x3 core
    finders += `M${ox} ${oy}h7v7h-7zM${ox + 1} ${oy + 1}v5h5v-5z M${ox + 2} ${oy + 2}h3v3h-3z`;
  };
  finder(0, 0);
  finder(GRID - 7, 0);
  finder(0, GRID - 7);
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (inFinder(x, y)) continue;
      const timing = (y === 6 || x === 6) && (x + y) % 2 === 0;
      if (timing || rand() < 0.46) data += `M${x} ${y}h1v1h-1z`;
    }
  }
  return { data, finders };
}

/**
 * Generated cover (no stock images, master prompt 7.13): a violet gradient that differs per article
 * (cover.hue / angle / seed), a QR-module field from the seed, and the category as a large mono label.
 * Theme aware: pastel in Porcelain, deep violet in Nocturne. Decorative (the category is also in the card text).
 */
function ArticleCover({ cover, category, index, total, size = "card", className }) {
  const { hue, angle, seed } = cover;
  const paths = useMemo(() => qrPaths(seed), [seed]);
  const glow = useMemo(() => {
    const r = rng(seed);
    return { x: Math.round(20 + r() * 60), y: Math.round(10 + r() * 50) };
  }, [seed]);
  const reader = size === "reader";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate overflow-hidden rounded-inner border border-mv-line",
        "[--c1:hsl(var(--h)_75%_93%)] [--c2:hsl(var(--h2)_80%_83%)] [--c3:hsl(var(--h2)_90%_72%/0.55)]",
        "dark:[--c1:hsl(var(--h)_55%_11%)] dark:[--c2:hsl(var(--h2)_65%_30%)] dark:[--c3:hsl(var(--h2)_90%_65%/0.45)]",
        className,
      )}
      style={{
        "--h": hue,
        "--h2": hue + 24,
        backgroundImage: `radial-gradient(circle at ${glow.x}% ${glow.y}%, var(--c3), transparent 58%), linear-gradient(${angle}deg, var(--c1), var(--c2))`,
      }}
    >
      <svg
        viewBox={`0 0 ${GRID} ${GRID}`}
        shapeRendering="crispEdges"
        className={cn(
          "absolute top-1/2 aspect-square -translate-y-1/2 text-mv-violet-200 [mask-image:linear-gradient(to_left,black_35%,transparent)]",
          reader ? "-right-[4%] h-[150%]" : "-right-[14%] h-[132%]",
        )}
      >
        <path d={paths.data} fill="currentColor" opacity="0.22" />
        <path d={paths.finders} fill="currentColor" fillRule="evenodd" opacity="0.5" />
      </svg>
      <span
        className={cn(
          "absolute left-4 top-3.5 font-mono text-[11px] font-medium tracking-[0.12em] text-mv-text/70",
          reader && "left-6 top-5",
        )}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "absolute bottom-3.5 left-4 max-w-[78%] break-words font-mono font-semibold uppercase tracking-[-0.03em] text-mv-text",
          reader ? "bottom-6 left-6 text-[clamp(1.9rem,4.2vw,3.25rem)] leading-[1.02]" : "text-[clamp(1.45rem,2.1vw,1.9rem)] leading-[1.02]",
        )}
      >
        {category}
      </span>
    </div>
  );
}

export default memo(ArticleCover);
