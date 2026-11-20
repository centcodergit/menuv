import { useMemo } from "react";
import { cn } from "@/lib/utils";

const DIRECTION = {
  top: "to top",
  bottom: "to bottom",
  left: "to left",
  right: "to right",
};

/**
 * React Bits "Gradual Blur", rebuilt: stacked layers whose backdrop blur grows toward one edge, each layer masked
 * to its own band, so content melts into the edge instead of being cut. Optional `fade` adds a soft wash of the
 * section colour (token based, both themes). Decorative and click-through.
 * Parent needs `relative`. Keep it on desktop surfaces: backdrop blur re-renders while content moves under it.
 */
export default function GradualBlur({
  position = "bottom",
  size = "6rem",
  strength = 2,
  divCount = 5,
  exponential = false,
  fade = false,
  className,
}) {
  const layers = useMemo(() => {
    const increment = 100 / divCount;
    const out = [];
    for (let i = 1; i <= divCount; i += 1) {
      const progress = i / divCount;
      const blur = exponential ? 2 ** (progress * 4) * 0.0625 * strength : 0.0625 * (progress * divCount + 1) * strength;
      const r = (n) => Math.round(n * 10) / 10;
      const p1 = r(increment * i - increment);
      const p2 = r(increment * i);
      const p3 = r(increment * i + increment);
      const p4 = r(increment * i + increment * 2);
      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;
      const mask = `linear-gradient(${DIRECTION[position]}, ${gradient})`;
      out.push({ blur: `${blur.toFixed(3)}rem`, mask });
    }
    return out;
  }, [divCount, exponential, position, strength]);

  const horizontal = position === "left" || position === "right";
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute z-[3]", className)}
      style={{
        [position]: 0,
        ...(horizontal ? { top: 0, bottom: 0, width: size } : { left: 0, right: 0, height: size }),
      }}
    >
      {layers.map((l, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            WebkitBackdropFilter: `blur(${l.blur})`,
            backdropFilter: `blur(${l.blur})`,
            WebkitMaskImage: l.mask,
            maskImage: l.mask,
          }}
        />
      ))}
      {fade && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${DIRECTION[position]}, transparent, rgb(var(--mv-void) / 0.55))`,
          }}
        />
      )}
    </div>
  );
}
