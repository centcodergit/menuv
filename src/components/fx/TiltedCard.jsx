import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * React Bits "Tilted Card", rebuilt with GSAP: a gentle 3D tilt toward the cursor with a moving glare.
 * Off on touch and reduced motion.
 */
export default function TiltedCard({ children, className, max = 8 }) {
  const wrap = useRef(null);
  const card = useRef(null);
  const glare = useRef(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (isTouch || reduced) return undefined;
    const el = wrap.current;
    const rx = gsap.quickTo(card.current, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(card.current, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * max * 2);
      ry(px * max * 2);
      glare.current.style.background = `radial-gradient(60% 60% at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.22), transparent 60%)`;
      glare.current.style.opacity = "1";
    };
    const leave = () => {
      rx(0);
      ry(0);
      glare.current.style.opacity = "0";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [isTouch, reduced, max]);

  return (
    <div ref={wrap} className={cn("[perspective:1000px]", className)}>
      <div ref={card} className="relative h-full w-full [transform-style:preserve-3d] will-change-transform">
        {children}
        <div ref={glare} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500" />
      </div>
    </div>
  );
}
