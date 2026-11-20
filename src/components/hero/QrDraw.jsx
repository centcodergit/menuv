import { useMemo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { URL_QR, darkModules } from "@/content/qr";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Inline-SVG QR of https://menuverse.eu that draws itself (DrawSVG on each module's outline, then the fill),
 * the mobile / reduced-motion stand-in for the 3D monolith (master prompt 7.1). Plays when `play` turns true.
 */
export default function QrDraw({ play, className }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const modules = useMemo(() => darkModules(URL_QR), []);

  useGSAP(
    () => {
      const rects = gsap.utils.toArray("[data-q]", root.current);
      if (reduced) {
        gsap.set(rects, { drawSVG: "100%", fillOpacity: 1 });
        return;
      }
      gsap.set(rects, { drawSVG: "0%", fillOpacity: 0 });
      if (!play) return;
      gsap
        .timeline({ delay: 0.3 })
        .to(rects, { drawSVG: "100%", duration: 0.7, ease: "mv.inOut", stagger: { each: 0.9 / rects.length, from: "random" } })
        .to(rects, { fillOpacity: 1, duration: 0.5, ease: "mv.out", stagger: { each: 0.4 / rects.length, from: "start" } }, "-=0.4");
    },
    { scope: root, dependencies: [play, reduced] },
  );

  return (
    <svg ref={root} viewBox={`-1 -1 ${URL_QR.size + 2} ${URL_QR.size + 2}`} aria-hidden="true" className={className}>
      {modules.map(([x, y]) => (
        <rect
          data-q
          key={`${x}-${y}`}
          x={x + 0.12}
          y={y + 0.12}
          width={0.76}
          height={0.76}
          rx={0.14}
          fill="rgb(var(--mv-violet-300))"
          stroke="rgb(var(--mv-violet-400))"
          strokeWidth={0.08}
        />
      ))}
    </svg>
  );
}
