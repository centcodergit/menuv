import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const NAV_OFFSET = 96;

function ScrollTriggerSync() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

/**
 * Lenis smooth scrolling driven by gsap.ticker (master prompt 5.4).
 * Reduced motion: no Lenis at all (native scrolling).
 * Touch devices keep native scrolling (no syncTouch).
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return undefined;
    const update = (time) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [reduce]);

  if (reduce) return children;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.085,
        wheelMultiplier: 0.9,
        smoothWheel: true,
        anchors: { offset: -NAV_OFFSET },
        stopInertiaOnNavigate: true,
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
