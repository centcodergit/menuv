import { useEffect, useState } from "react";

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Phones and tablets get one live WebGL canvas at a time (master prompt 7.11 + 10). Watches two stages and returns
 * the index (0 or 1) of the one showing more of itself on screen, or null.
 * A switch releases the old canvas first (null for a moment), then hands the slot over, so two contexts never
 * overlap. Keeps the last winner while neither is visible (it is paused off screen anyway).
 */
export function useSingleLive(refA, refB, enabled) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return undefined;
    }
    const els = [refA.current, refB.current];
    const heights = [0, 0];
    let want = null;
    let current = null;
    let timer = 0;

    const decide = () => {
      let best = null;
      if (heights[0] > heights[1] + 1) best = 0;
      else if (heights[1] > heights[0] + 1) best = 1;
      else if (heights[0] > 0) best = want ?? 0;
      if (best === null || best === want) return;
      want = best;
      window.clearTimeout(timer);
      if (current === null) {
        current = best;
        setActive(best);
        return;
      }
      current = null;
      setActive(null);
      // Long enough for the old canvas to unmount and lose its context (R3F releases it 500ms after unmount).
      timer = window.setTimeout(() => {
        current = want;
        setActive(want);
      }, 650);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = els.indexOf(e.target);
          if (i >= 0) heights[i] = e.isIntersecting ? e.intersectionRect.height : 0;
        }
        decide();
      },
      { threshold: THRESHOLDS },
    );
    els.forEach((el) => el && io.observe(el));
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [refA, refB, enabled]);

  return active;
}

export default useSingleLive;
