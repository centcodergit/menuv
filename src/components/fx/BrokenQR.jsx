import { useMemo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SITE_QR_21, darkModules } from "@/content/qr";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Deterministic pseudo-random scatter, so the broken code looks the same on every visit.
const rand = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/**
 * 404 (master prompt 8.5): a QR made of scattered modules that keeps trying to assemble and never quite
 * makes it. Slow loop (9s), no jitter faster than 6s. Reduced motion: a still, half-scattered code.
 */
export default function BrokenQR({ className }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const modules = useMemo(
    () =>
      darkModules(SITE_QR_21).map(([x, y], i) => ({
        x,
        y,
        dx: (rand(i + 1) - 0.5) * 22,
        dy: (rand(i + 101) - 0.5) * 22,
        r: (rand(i + 201) - 0.5) * 120,
      })),
    [],
  );

  useGSAP(
    () => {
      const rects = gsap.utils.toArray("[data-m]", root.current);
      const at = (k) => ({
        x: (i) => modules[i].dx * k,
        y: (i) => modules[i].dy * k,
        rotate: (i) => modules[i].r * k,
        transformOrigin: "50% 50%",
      });
      if (reduced) {
        gsap.set(rects, at(0.5));
        return;
      }
      gsap.set(rects, at(1));
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.6 })
        .to(rects, { ...at(0.12), duration: 3.6, ease: "mv.inOut", stagger: { each: 0.004, from: "random" } })
        .to(rects, { ...at(0.18), duration: 0.9, ease: "sine.inOut" })
        .to(rects, { ...at(1), duration: 3.4, ease: "mv.inOut", stagger: { each: 0.003, from: "center" } });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <svg ref={root} viewBox="-6 -6 33 33" aria-hidden="true" className={className}>
      {modules.map(({ x, y }, i) => (
        <rect
          data-m
          key={`${x}-${y}`}
          x={x + 0.1}
          y={y + 0.1}
          width={0.8}
          height={0.8}
          rx={0.14}
          fill={i % 7 === 0 ? "#A78BFA" : "rgb(var(--mv-text) / 0.85)"}
        />
      ))}
    </svg>
  );
}
