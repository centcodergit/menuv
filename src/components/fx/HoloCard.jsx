import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const clamp01 = (n) => Math.min(1, Math.max(0, n));

// Iridescent foil from the palette only: violet, orchid, champagne (both themes redefine these tokens).
const FOIL = `repeating-linear-gradient(115deg,
  rgb(var(--mv-violet-300) / 0) 0%,
  rgb(var(--mv-violet-300)) 5%,
  rgb(var(--mv-orchid)) 10%,
  rgb(var(--mv-champagne)) 15%,
  rgb(var(--mv-violet-200)) 20%,
  rgb(var(--mv-violet-300) / 0) 26%)`;
const AT = "calc(var(--px) * 100%) calc(var(--py) * 100%)";

/**
 * React Bits "Holo Card", rebuilt and re-themed: a card with a holographic foil, a fine diffraction grating and a
 * glare that follow the light source. The source is the cursor on fine pointers (with a small 3D tilt), the
 * device tilt on phones that report it without a permission prompt (Android; iOS needs a tap-to-allow prompt,
 * which we skip), and otherwise a slow 10s drift while the card is on screen. Reduced motion: still foil.
 * The root is the perspective box and stays untransformed (so measuring it is stable); `cardClassName` styles
 * the tilting card. `children` sit under the foil layers.
 */
export default function HoloCard({ children, className, cardClassName, maxTilt = 10, ...props }) {
  const root = useRef(null);
  const card = useRef(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();

  useEffect(() => {
    const wrap = root.current;
    const el = card.current;
    if (reduced) return undefined;
    let frame = 0;
    let next = { px: 0.5, py: 0.5 };
    const paint = () => {
      frame = 0;
      el.style.setProperty("--px", next.px.toFixed(3));
      el.style.setProperty("--py", next.py.toFixed(3));
      el.style.setProperty("--rx", `${((0.5 - next.py) * 2 * maxTilt).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((next.px - 0.5) * 2 * maxTilt).toFixed(2)}deg`);
    };
    const aim = (px, py) => {
      next = { px: clamp01(px), py: clamp01(py) };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    // Fine pointer: the cursor is the light.
    if (!isTouch) {
      const onMove = (e) => {
        const r = wrap.getBoundingClientRect();
        el.dataset.active = "true";
        aim((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      };
      const onLeave = () => {
        el.dataset.active = "false";
        aim(0.5, 0.5);
      };
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
      return () => {
        cancelAnimationFrame(frame);
        wrap.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerleave", onLeave);
      };
    }

    // Touch: device tilt where it needs no permission prompt, else a slow drift. Only while on screen.
    const gated = typeof window.DeviceOrientationEvent === "undefined" || typeof window.DeviceOrientationEvent.requestPermission === "function";
    let drift = null;
    let tilted = false;
    let base = null;
    const onOrient = (e) => {
      if (e.beta == null || e.gamma == null) return;
      if (!tilted) {
        tilted = true;
        drift?.kill();
        drift = null;
      }
      base = base == null ? e.beta : base + (e.beta - base) * 0.02; // slowly re-centre on how the phone is held
      aim(0.5 + e.gamma / 50, 0.5 + (e.beta - base) / 40);
    };
    const start = () => {
      if (!gated) window.addEventListener("deviceorientation", onOrient);
      if (!tilted && !drift) {
        drift = gsap.fromTo(el, { "--px": 0.25, "--py": 0.35 }, { "--px": 0.8, "--py": 0.65, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }
    };
    const stop = () => {
      window.removeEventListener("deviceorientation", onOrient);
      drift?.kill();
      drift = null;
    };
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(wrap);
    return () => {
      io.disconnect();
      stop();
      cancelAnimationFrame(frame);
    };
  }, [isTouch, reduced, maxTilt]);

  return (
    <div ref={root} className={cn("relative [perspective:900px]", className)} {...props}>
      <div
        ref={card}
        data-holo
        data-active="false"
        className={cn(
          "group relative h-full w-full overflow-hidden transition-transform duration-700 ease-mv-out data-[active=true]:duration-150",
          cardClassName,
        )}
        style={{ "--px": 0.5, "--py": 0.5, "--rx": "0deg", "--ry": "0deg", transform: "rotateX(var(--rx)) rotateY(var(--ry))" }}
      >
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply transition-opacity duration-500 group-data-[active=true]:opacity-45 dark:opacity-50 dark:mix-blend-color-dodge dark:group-data-[active=true]:opacity-80"
          style={{
            backgroundImage: FOIL,
            backgroundSize: "320% 320%",
            backgroundPosition: AT,
            WebkitMaskImage: `radial-gradient(farthest-corner circle at ${AT}, #000 0%, rgb(0 0 0 / 0.35) 75%)`,
            maskImage: `radial-gradient(farthest-corner circle at ${AT}, #000 0%, rgb(0 0 0 / 0.35) 75%)`,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: "repeating-linear-gradient(-55deg, rgb(var(--mv-text) / 0.05) 0 1px, transparent 1px 5px)" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light transition-opacity duration-500 group-data-[active=true]:opacity-90 dark:mix-blend-overlay"
          style={{ backgroundImage: `radial-gradient(circle at ${AT}, rgb(255 255 255 / 0.7), transparent 50%)` }}
        />
      </div>
    </div>
  );
}
