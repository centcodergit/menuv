import { useEffect, useMemo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SITE_QR_21, darkModules } from "@/content/qr";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// Deterministic scatter so the assembly looks the same on every visit.
const rand = (i, salt) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const MODULE_TIME = 0.5; // share of the scrub each module takes to land
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - (1 - t) ** 3;

const readColor = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--mv-violet-300").trim();
  return v ? `rgb(${v.split(/\s+/).join(",")})` : "#C4B5FD";
};

/**
 * The hero's QR modules come back under the final button (7.15): scattered while the section rises, they settle
 * into the site's own code (menuverse.eu) by the time the section reaches the top of the screen. Scrubbed with
 * scroll. Drawn on one 2D canvas (redrawing 236 squares is far cheaper than moving 236 SVG elements every frame).
 * Reduced motion: drawn in place. Decorative.
 */
export default function QrReturn({ className }) {
  const canvas = useRef(null);
  const state = useRef({ p: 0 });
  const reduced = useReducedMotion();
  const n = SITE_QR_21.size;
  const modules = useMemo(
    () =>
      darkModules(SITE_QR_21).map(([x, y], i) => ({
        x,
        y,
        sx: (rand(i, 1) - 0.5) * 60,
        sy: (rand(i, 2) - 0.2) * 40,
        rot: ((rand(i, 3) - 0.5) * 180 * Math.PI) / 180,
        delay: rand(i, 4) * (1 - MODULE_TIME),
      })),
    [],
  );

  // Draws the code at scrub progress `p` (0 = scattered, 1 = assembled).
  const draw = useMemo(() => {
    let color = null;
    return (p, refreshColor = false) => {
      const cv = canvas.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      const size = cv.clientWidth;
      if (!size) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const px = Math.round(size * dpr);
      if (cv.width !== px) {
        cv.width = px;
        cv.height = px;
      }
      if (!color || refreshColor) color = readColor();
      // One module of margin around the code; scatter offsets are in CSS px.
      const unit = px / (n + 2);
      const cssToUnit = (n + 2) / size;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, px, px);
      ctx.fillStyle = color;
      for (const m of modules) {
        const t = easeOut(clamp01((p - m.delay) / MODULE_TIME));
        if (t <= 0) continue;
        const k = 1 - t;
        const cx = (m.x + 1 + 0.5 + m.sx * cssToUnit * k) * unit;
        const cy = (m.y + 1 + 0.5 + m.sy * cssToUnit * k) * unit;
        ctx.globalAlpha = t;
        ctx.setTransform(1, 0, 0, 1, cx, cy);
        if (k > 0.001) ctx.rotate(m.rot * k);
        ctx.beginPath();
        ctx.roundRect(-unit / 2, -unit / 2, unit, unit, unit * 0.18);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      cv.dataset.progress = p.toFixed(3);
    };
  }, [modules, n]);

  useGSAP(
    () => {
      const section = canvas.current.closest("section") ?? canvas.current;
      if (reduced) {
        state.current.p = 1;
        draw(1);
        return;
      }
      state.current.p = 0;
      draw(0);
      gsap.to(state.current, {
        p: 1,
        ease: "none",
        onUpdate: () => draw(state.current.p),
        scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: 0.8 },
      });
    },
    { dependencies: [reduced, draw] },
  );

  // Redraw on resize and theme change.
  useEffect(() => {
    const cv = canvas.current;
    const ro = new ResizeObserver(() => draw(state.current.p));
    ro.observe(cv);
    // Only theme switches matter (Lenis toggles other classes on <html> on every scroll start/stop).
    let dark = document.documentElement.classList.contains("dark");
    const mo = new MutationObserver(() => {
      const now = document.documentElement.classList.contains("dark");
      if (now !== dark) {
        dark = now;
        draw(state.current.p, true);
      }
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [draw]);

  return <canvas ref={canvas} aria-hidden="true" data-qr-return className={cn("block", className)} />;
}
