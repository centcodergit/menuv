import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const RING_MASK = {
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

// An arc of light centred on --glow-start (degrees, 0 = top, clockwise), 2 × --glow-spread wide.
const ARC =
  "conic-gradient(from calc((var(--glow-start) - var(--glow-spread)) * 1deg), transparent 0deg, " +
  "rgb(var(--mv-violet-300)) calc(var(--glow-spread) * 0.55deg), rgb(var(--mv-violet-500)) calc(var(--glow-spread) * 1deg), " +
  "rgb(var(--mv-orchid)) calc(var(--glow-spread) * 1.45deg), transparent calc(var(--glow-spread) * 2deg))";

/**
 * Aceternity "Glowing Effect", rebuilt and re-themed: the card's hairline border lights up in a violet arc that
 * points at the cursor while it is over the card or within `proximity` px of it, and fades when it leaves.
 * The arc eases around the edge (GSAP, shortest way round). Paint only: a conic gradient inside a border mask.
 * One pointer listener per card, attached only while the card is near the viewport.
 * Parent needs `relative` and a border radius; the ring covers its 1px border.
 * `disabled` (touch devices) renders nothing; `reduced` snaps the arc to the cursor instead of easing it.
 */
export default function GlowingEffect({ disabled = false, reduced = false, spread = 38, proximity = 64, inactiveZone = 0.01, borderWidth = 1.5, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (disabled || !el) return undefined;
    const proxy = { a: 0 };
    let target = 0;
    let frame = 0;
    let point = null;
    const paint = () => el.style.setProperty("--glow-start", proxy.a.toFixed(1));
    const ease = reduced ? null : gsap.quickTo(proxy, "a", { duration: 0.6, ease: "power3.out", onUpdate: paint });

    const update = () => {
      frame = 0;
      if (!point) return;
      const r = el.getBoundingClientRect();
      const { x, y } = point;
      const near = x > r.left - proximity && x < r.right + proximity && y > r.top - proximity && y < r.bottom + proximity;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const centre = Math.hypot(x - cx, y - cy) < (Math.min(r.width, r.height) / 2) * inactiveZone;
      const active = near && !centre;
      el.style.setProperty("--glow-active", active ? "1" : "0");
      if (!active) return;
      const angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
      target += ((((angle - target) % 360) + 540) % 360) - 180;
      if (ease) ease(target);
      else {
        proxy.a = target;
        paint();
      }
    };
    const onMove = (e) => {
      point = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onOut = (e) => {
      if (e.relatedTarget) return;
      point = null;
      el.style.setProperty("--glow-active", "0");
    };

    let listening = false;
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      const method = on ? "addEventListener" : "removeEventListener";
      window[method]("pointermove", onMove, { passive: true });
      document.documentElement[method]("pointerout", onOut);
      if (!on) el.style.setProperty("--glow-active", "0");
    };
    const io = new IntersectionObserver(([entry]) => listen(entry.isIntersecting), { rootMargin: "25% 0px" });
    io.observe(el);

    return () => {
      io.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
      gsap.killTweensOf(proxy);
    };
  }, [disabled, reduced, proximity, inactiveZone]);

  if (disabled) return null;
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300", className)}
      style={{
        "--glow-start": 0,
        "--glow-active": 0,
        "--glow-spread": spread,
        padding: borderWidth,
        opacity: "var(--glow-active)",
        background: ARC,
        ...RING_MASK,
      }}
    />
  );
}
