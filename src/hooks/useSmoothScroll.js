import { useCallback, useEffect } from "react";
import { useLenis } from "lenis/react";
import { NAV_OFFSET } from "@/providers/SmoothScroll";

/**
 * scrollTo(target, opts): Lenis when it is running, native scrolling otherwise (reduced motion).
 * target: "#id", an element, or a number.
 */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (target, { offset = -NAV_OFFSET, immediate = false, onComplete } = {}) => {
      if (lenis) {
        // Content may have grown since Lenis last measured (lazy sections, pin spacers): re-measure
        // first, otherwise the target is clamped to a stale scroll limit.
        lenis.resize();
        lenis.scrollTo(target, { offset, immediate, force: true, onComplete, duration: immediate ? undefined : 1.4 });
        return;
      }
      let top = 0;
      if (typeof target === "number") top = target;
      else {
        const el = typeof target === "string" ? document.querySelector(target) : target;
        if (!el) return;
        top = el.getBoundingClientRect().top + window.scrollY + offset;
      }
      window.scrollTo({ top, behavior: "auto" });
      onComplete?.();
    },
    [lenis],
  );
}

/**
 * Stop Lenis while a modal, sheet or the chat is open (master prompt 5.4 / 6.8).
 * Native scroll is locked by Radix itself.
 */
export function useLenisLock(active = true) {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis || !active) return undefined;
    lenis.stop();
    return () => lenis.start();
  }, [lenis, active]);
}
