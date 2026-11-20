import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Drives one step illustration. `build(tl)` adds the entrance and a repeating loop (each cycle 6s or longer)
 * to a paused timeline and may return a cleanup; `final()` sets the end frame for reduced motion.
 * The timeline plays only while `active` (panel centred and on screen) and pauses otherwise.
 * Selector strings inside build/final are scoped to `scope`.
 */
export function useArtLoop(scope, { active, still, build, final, deps = [] }) {
  const tl = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useGSAP(
    () => {
      if (still) {
        final();
        return undefined;
      }
      const timeline = gsap.timeline({ paused: true });
      const cleanup = build(timeline);
      tl.current = timeline;
      if (activeRef.current) timeline.play();
      return () => {
        tl.current = null;
        cleanup?.();
      };
    },
    { scope, dependencies: [still, ...deps] },
  );

  useEffect(() => {
    const timeline = tl.current;
    if (!timeline) return;
    if (active) timeline.play();
    else timeline.pause();
  }, [active]);
}

export default useArtLoop;
