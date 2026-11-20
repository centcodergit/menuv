import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * React Bits "Magnet", rebuilt with GSAP: the child drifts toward the pointer while it is
 * within `padding` px of the element, then springs back. Off on touch and reduced motion.
 */
export default function Magnet({ children, strength = 0.25, padding = 60, className, innerClassName }) {
  const wrap = useRef(null);
  const inner = useRef(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (isTouch || reduced) return undefined;
    const el = wrap.current;
    const target = inner.current;
    const xTo = gsap.quickTo(target, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(target, "y", { duration: 0.6, ease: "power3.out" });
    let active = false;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const within =
        e.clientX > r.left - padding &&
        e.clientX < r.right + padding &&
        e.clientY > r.top - padding &&
        e.clientY < r.bottom + padding;
      if (within) {
        active = true;
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      } else if (active) {
        active = false;
        gsap.to(target, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.set(target, { x: 0, y: 0 });
    };
  }, [isTouch, reduced, strength, padding]);

  return (
    <div ref={wrap} className={cn("inline-block", className)}>
      <div ref={inner} className={cn("will-change-transform", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
