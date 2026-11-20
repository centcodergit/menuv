import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/providers/ThemeProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// Sun core (a circle drawn as a path) and moon crescent: MorphSVG morphs between them.
const SUN = "M12 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9Z";
const MOON = "M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9Z";
const RAYS = ["M12 2v2", "M12 20v2", "m4.93 4.93 1.41 1.41", "m17.66 17.66 1.41 1.41", "M2 12h2", "M20 12h2", "m6.34 17.66-1.41 1.41", "m19.07 4.93-1.41 1.41"];

let morphReady = null;
const loadMorph = () => (morphReady ??= import("@/lib/gsap-extra"));

/**
 * Magic UI "Animated Theme Toggler", re-themed: View Transitions circular reveal from the button
 * (ThemeProvider), with the sun morphing into the moon (GSAP MorphSVG). MorphSVG lives in a lazy chunk,
 * fetched when the pointer or focus reaches the button, so it costs nothing on first load.
 * Shows the sun in dark mode (click for light) and the moon in light mode.
 */
export default function ThemeToggle({ className }) {
  const t = useT();
  const { theme, toggleTheme } = useTheme();
  const reduced = useReducedMotion();
  const body = useRef(null);
  const rays = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    const showSun = theme === "dark";
    if (first.current || reduced) {
      first.current = false;
      body.current.setAttribute("d", showSun ? SUN : MOON);
      gsap.set(rays.current, { autoAlpha: showSun ? 1 : 0, scale: showSun ? 1 : 0.4, rotate: 0, svgOrigin: "12 12" });
      return;
    }
    loadMorph().then(() => {
      gsap.to(body.current, { morphSVG: showSun ? SUN : MOON, duration: 0.6, ease: "mv.inOut" });
      gsap.to(rays.current, {
        autoAlpha: showSun ? 1 : 0,
        scale: showSun ? 1 : 0.4,
        rotate: showSun ? 0 : 90,
        svgOrigin: "12 12",
        duration: 0.6,
        ease: showSun ? "mv.spring" : "mv.inOut",
      });
    });
  }, [theme, reduced]);

  return (
    <button
      type="button"
      onPointerEnter={loadMorph}
      onFocus={loadMorph}
      onClick={(e) => toggleTheme(e.currentTarget)}
      aria-label={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-mv-line text-mv-text transition-colors hover:border-mv-line-strong hover:bg-mv-surface-2/60",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path ref={body} d={SUN} />
        <g ref={rays}>
          {RAYS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>
    </button>
  );
}
