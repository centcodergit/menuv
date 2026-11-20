import { cn } from "@/lib/utils";

/**
 * Magic UI "Border Beam", re-themed: a short violet light travelling along the element's border
 * (CSS offset-path, no JS). Parent needs `relative` and a border radius; the beam inherits it.
 * once: run a single lap (cards landing); otherwise it loops every `duration` seconds (≥ 6s).
 * `play` toggles the animation (e.g. start the single lap when the card lands).
 */
export default function BorderBeam({
  className,
  size = 120,
  radius = 28,
  duration = 8,
  delay = 0,
  once = false,
  play = true,
  colorFrom = "#C4B5FD",
  colorTo = "#7C3AED",
  width = 1.5,
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{
        padding: width,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
      }}
    >
      <span
        className="absolute aspect-square motion-reduce:hidden"
        style={{
          width: size,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
          offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
          offsetAnchor: "100% 50%",
          animationName: play ? "border-beam" : "none",
          animationDuration: `${duration}s`,
          animationTimingFunction: once ? "cubic-bezier(0.16, 1, 0.3, 1)" : "linear",
          animationIterationCount: once ? 1 : "infinite",
          animationDelay: `${delay}s`,
          animationFillMode: "both",
          opacity: once && !play ? 0 : 1,
        }}
      />
    </span>
  );
}
