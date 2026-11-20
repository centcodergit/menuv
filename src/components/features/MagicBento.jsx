import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const SPOT_RADIUS = 320;
const PROXIMITY = SPOT_RADIUS * 0.5;
const FADE = SPOT_RADIUS * 0.75;

/** Fired on a card when it lands, so it can run its Border Beam lap and start its demo. */
export const LAND_EVENT = "mv:bento-land";

/**
 * React Bits "Magic Bento" (grid half), rebuilt with GSAP and re-themed (glow rgb(139, 92, 246) = violet-500).
 * - Entrance: cards rise from depth (z -80 → 0, opacity 0 → 1, stagger 0.08) as they reach the viewport,
 *   then each gets LAND_EVENT. Opacity only (no visibility), so the text stays in the accessibility tree.
 * - `fx` (desktop, fine pointer, motion allowed): a ~320px spotlight follows the cursor across the grid and
 *   every card gets --glow-x/--glow-y/--glow-intensity for its cursor-following edge light. Listeners are
 *   attached only while the grid is near the viewport.
 * Reduced motion: no entrance; cards land immediately (BentoCard handles that).
 */
export default function MagicBento({ fx, reduced, className, children }) {
  const root = useRef(null);
  const spot = useRef(null);

  useGSAP(
    () => {
      if (reduced) return;
      const cards = gsap.utils.toArray("[data-bento-card]", root.current);
      gsap.set(cards, { opacity: 0, z: -80, y: 28 });
      const enter = (batch) => {
        const fresh = batch.filter((el) => !el.dataset.landed);
        fresh.forEach((el, i) => {
          el.dataset.landed = "1";
          gsap.delayedCall(0.42 + i * 0.08, () => el.dispatchEvent(new CustomEvent(LAND_EVENT)));
        });
        gsap.to(fresh, { opacity: 1, z: 0, y: 0, duration: 1.1, ease: "mv.out", stagger: 0.08, clearProps: "transform" });
      };
      ScrollTrigger.batch(cards, { start: "top 88%", once: true, onEnter: enter, onEnterBack: enter });
      return () => cards.forEach((el) => delete el.dataset.landed);
    },
    { scope: root, dependencies: [reduced] },
  );

  // Spotlight + per-card edge light, driven by one rAF-throttled pointer handler.
  useEffect(() => {
    if (!fx) return undefined;
    const grid = root.current;
    const light = spot.current;
    const cards = [...grid.querySelectorAll("[data-bento-card]")];
    gsap.set(light, { xPercent: -50, yPercent: -50, opacity: 0 });
    const xTo = gsap.quickTo(light, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(light, "y", { duration: 0.45, ease: "power3.out" });
    let frame = 0;
    let mx = -9999;
    let my = -9999;
    let shown = -1;

    const fadeTo = (value) => {
      if (Math.abs(value - shown) < 0.02) return;
      shown = value;
      gsap.to(light, { opacity: value, duration: value > 0 ? 0.25 : 0.6, ease: "power2.out", overwrite: "auto" });
    };

    const update = () => {
      frame = 0;
      const g = grid.getBoundingClientRect();
      const inside = mx >= g.left && mx <= g.right && my >= g.top && my <= g.bottom;
      let nearest = Infinity;
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        const d = Math.max(0, Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)) - Math.max(r.width, r.height) / 2);
        nearest = Math.min(nearest, d);
        const intensity = d <= PROXIMITY ? 1 : d <= FADE ? (FADE - d) / (FADE - PROXIMITY) : 0;
        card.style.setProperty("--glow-x", `${((mx - r.left) / r.width) * 100}%`);
        card.style.setProperty("--glow-y", `${((my - r.top) / r.height) * 100}%`);
        card.style.setProperty("--glow-intensity", intensity.toFixed(3));
      }
      if (!inside) {
        fadeTo(0);
        return;
      }
      xTo(mx - g.left);
      yTo(my - g.top);
      fadeTo(nearest <= PROXIMITY ? 0.8 : nearest <= FADE ? ((FADE - nearest) / (FADE - PROXIMITY)) * 0.8 : 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      schedule();
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
      schedule();
    };

    let listening = false;
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      const method = on ? "addEventListener" : "removeEventListener";
      window[method]("pointermove", onMove, { passive: true });
      window[method]("scroll", schedule, { passive: true });
      document.documentElement[method]("pointerleave", onLeave);
      if (!on) onLeave();
    };
    const io = new IntersectionObserver(([entry]) => listen(entry.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(grid);

    return () => {
      io.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
      gsap.killTweensOf(light);
      cards.forEach((card) => card.style.setProperty("--glow-intensity", "0"));
    };
  }, [fx]);

  return (
    <div ref={root} className={cn("relative", className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-5" style={{ perspective: "1200px" }}>
        {children}
      </div>
      {fx && (
        <div
          ref={spot}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 rounded-full mix-blend-multiply dark:mix-blend-screen"
          style={{
            width: SPOT_RADIUS * 2,
            height: SPOT_RADIUS * 2,
            opacity: 0,
            background:
              "radial-gradient(circle, rgb(var(--mv-violet-500) / 0.15) 0%, rgb(var(--mv-violet-500) / 0.08) 15%, rgb(var(--mv-violet-500) / 0.04) 25%, rgb(var(--mv-violet-500) / 0.02) 40%, rgb(var(--mv-violet-500) / 0.01) 65%, transparent 70%)",
          }}
        />
      )}
    </div>
  );
}
