import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

/*
 * Core GSAP set, needed above the fold (hero, section headers, phone menu tabs, mobile QR draw).
 * The heavier plugins (MorphSVG, Draggable, Inertia, MotionPath) live in "@/lib/gsap-extra"
 * and are imported only by the lazy sections that use them, to protect the initial-JS budget.
 */
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, ScrambleTextPlugin, CustomEase, useGSAP);

// Easing tokens (master prompt 4.8)
CustomEase.create("mv.out", "0.16,1,0.3,1"); // every entrance
CustomEase.create("mv.inOut", "0.76,0,0.24,1"); // transitions, wipes, camera moves
CustomEase.create("mv.spring", "M0,0 C0.25,1.35 0.5,1 1,1"); // chips, badges, toggles

gsap.defaults({ ease: "mv.out", duration: 0.9 });
ScrollTrigger.config({ ignoreMobileResize: true });

/** Glyphs used by ScrambleText (eyebrows scramble in from Greek). */
export const GREEK_GLYPHS = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ0123456789";

/** Duration tokens in seconds. */
export const DUR = { micro: 0.25, ui: 0.6, reveal: 1.1, hero: 1.8 };

// Refresh trigger positions once web fonts have loaded (layout shifts otherwise).
if (typeof document !== "undefined" && document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

// Homepage sections are lazy and land in any order. A section below the How-it-works pin can create its
// triggers before that pin adds its 300% spacer, leaving them measured too high. Two parts fix it: triggers are
// sorted into page order on every refresh (GSAP does that once any trigger sets `refreshPriority`; the
// background triggers do), and the page re-measures whenever its height settles at a new value.
if (typeof window !== "undefined" && typeof ResizeObserver !== "undefined") {
  let lastHeight = 0;
  let timer = 0;
  const watch = () => {
    new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const height = document.documentElement.scrollHeight;
        if (Math.abs(height - lastHeight) < 2) return;
        lastHeight = height;
        ScrollTrigger.refresh();
      }, 200);
    }).observe(document.body);
  };
  if (document.body) watch();
  else window.addEventListener("DOMContentLoaded", watch, { once: true });
}

// Dev-only handle for debugging and QA scripts (stripped from production builds).
if (import.meta.env.DEV && typeof window !== "undefined") window.__gsap = { gsap, ScrollTrigger };

export { gsap, ScrollTrigger, SplitText, Flip, DrawSVGPlugin, ScrambleTextPlugin, CustomEase, useGSAP };
