import { useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * React Bits "Circular Text": a line of text set around a circle that slowly rotates (one turn per 24s) and
 * speeds up while hovered. Decorative (the same words exist as real text nearby). Reduced motion: still.
 */
export default function CircularText({ text, size = 132, duration = 24, className, children }) {
  const ring = useRef(null);
  const wrap = useRef(null);
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const r = size / 2 - 10;
  const circumference = 2 * Math.PI * r;

  useGSAP(
    () => {
      if (reduced || !ring.current) return undefined;
      const spin = gsap.to(ring.current, { rotation: 360, duration, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      const el = wrap.current;
      // Spin only while on screen (an endless tween keeps mutating the SVG even when nobody can see it).
      const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? spin.resume() : spin.pause()));
      io.observe(el);
      const fast = () => gsap.to(spin, { timeScale: 4, duration: 0.6, ease: "power2.out" });
      const slow = () => gsap.to(spin, { timeScale: 1, duration: 1, ease: "power2.out" });
      el.addEventListener("pointerenter", fast);
      el.addEventListener("pointerleave", slow);
      return () => {
        io.disconnect();
        el.removeEventListener("pointerenter", fast);
        el.removeEventListener("pointerleave", slow);
      };
    },
    { dependencies: [reduced, duration], scope: wrap },
  );

  return (
    <div ref={wrap} className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg ref={ring} aria-hidden="true" viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <path id={`circ-${id}`} d={`M ${size / 2},${size / 2} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} />
        </defs>
        <text className="fill-mv-muted font-mono uppercase" style={{ fontSize: 10.5, letterSpacing: "0.08em" }}>
          <textPath href={`#circ-${id}`} textLength={circumference - 2} lengthAdjust="spacingAndGlyphs">
            {text}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
