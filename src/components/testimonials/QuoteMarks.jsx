import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// One opening quotation mark: a teardrop with a tail, drawn as an outline and then filled.
const MARK = "M34 6C17 12 6 25 6 43c0 11 7 19 17 19 9 0 16-7 16-16s-6-15-15-15c-2 0-3 0-5 1 3-9 10-16 19-20L34 6Z";

/**
 * Oversized violet quotation marks for the pull quote (7.10): the outlines draw in when the quote enters,
 * then the fill fades up. Decorative.
 */
export default function QuoteMarks({ className }) {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const paths = root.current.querySelectorAll("path");
      if (reduced) {
        gsap.set(paths, { drawSVG: "100%", fillOpacity: 1 });
        return;
      }
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top 85%", once: true } })
        .fromTo(paths, { drawSVG: "0%", fillOpacity: 0 }, { drawSVG: "100%", duration: 1.4, stagger: 0.18, ease: "mv.inOut" })
        .to(paths, { fillOpacity: 1, duration: 0.8, stagger: 0.18, ease: "mv.out" }, "-=0.6");
    },
    { dependencies: [reduced], scope: root },
  );

  return (
    <svg ref={root} aria-hidden="true" viewBox="0 0 88 68" className={cn("overflow-visible", className)}>
      <defs>
        <linearGradient id="mv-quote-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--mv-violet-300))" stopOpacity="0.55" />
          <stop offset="100%" stopColor="rgb(var(--mv-violet-600))" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {[0, 44].map((x) => (
        <path
          key={x}
          d={MARK}
          transform={`translate(${x} 0)`}
          fill="url(#mv-quote-fill)"
          stroke="rgb(var(--mv-violet-400))"
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
