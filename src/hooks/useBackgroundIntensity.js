import { useEffect } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Background brightness levels (master prompt 6.2). */
export const BG_LEVELS = { bright: 1, base: 0.7, dim: 0.35 };

/** The layer whose opacity sets the brightness (rendered by Background). */
export const BG_LAYER_ID = "mv-bg-layer";
let current = 1;
export const currentIntensity = () => current;

/**
 * Sets the background brightness. Only the background layer's own opacity changes, eased by a CSS transition,
 * so the browser animates it on the compositor. (An earlier version tweened a custom property on <html>, which
 * re-styled every element on the page on every frame of the fade.)
 */
const setIntensity = (value, immediate = false) => {
  current = value;
  const el = document.getElementById(BG_LAYER_ID);
  if (!el) return;
  el.style.transitionDuration = immediate ? "0ms" : "800ms";
  el.style.opacity = String(value);
};

/**
 * Section-level: while `ref` is in the middle of the viewport, the living background
 * goes to `level` (bright at hero, pricing, final CTA; dim behind reading sections).
 */
export function useBackgroundIntensity(ref, level = "base") {
  useGSAP(
    () => {
      if (!ref.current) return;
      const value = BG_LEVELS[level] ?? BG_LEVELS.base;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 55%",
        end: "bottom 55%",
        // Measured last (they never change layout); any refreshPriority also makes GSAP sort triggers into
        // page order on refresh, which lazy sections need (see src/lib/gsap.js).
        refreshPriority: -1,
        onToggle: (self) => self.isActive && setIntensity(value),
      });
    },
    { dependencies: [level], scope: ref },
  );
}

/** Page-level: a whole page at one level (legal pages are "dim"). Restores on leave. */
export function usePageBackground(level = "base") {
  useEffect(() => {
    setIntensity(BG_LEVELS[level] ?? BG_LEVELS.base, true);
    return () => setIntensity(BG_LEVELS.bright, true);
  }, [level]);
}
