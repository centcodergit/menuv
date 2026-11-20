import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

const MAGNET = 0.03;
const MAGNET_MAX = 8;

/** Click ripple (Magic Bento): a violet light grows from the click point to the farthest corner, then fades. */
function rippleAt(host, e) {
  const r = host.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const d = Math.max(Math.hypot(x, y), Math.hypot(x - r.width, y), Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height));
  const el = document.createElement("span");
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "absolute",
    left: `${x - d}px`,
    top: `${y - d}px`,
    width: `${d * 2}px`,
    height: `${d * 2}px`,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: "3",
    background: "radial-gradient(circle, rgb(var(--mv-violet-500) / 0.3) 0%, rgb(var(--mv-violet-500) / 0.12) 30%, transparent 70%)",
  });
  host.appendChild(el);
  gsap.fromTo(el, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => el.remove() });
}

/**
 * Magic Bento card pointer layer (desktop with a fine pointer, motion allowed):
 * particle stars drift inside the card while it is hovered (each drift is a 6s+ round trip, killed on leave),
 * the card leans a few px toward the cursor (magnetism), and a click sends a ripple from the click point.
 */
export default function useBentoPointer(ref, enabled) {
  useEffect(() => {
    const host = ref.current;
    if (!enabled || !host) return undefined;
    const dots = [...host.querySelectorAll("[data-particle]")];
    const xTo = gsap.quickTo(host, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(host, "y", { duration: 0.5, ease: "power3.out" });
    const clamp = gsap.utils.clamp(-MAGNET_MAX, MAGNET_MAX);
    const rnd = gsap.utils.random;
    let tweens = [];

    const stopDots = () => {
      tweens.forEach((t) => t.kill());
      tweens = [];
    };
    const onEnter = () => {
      stopDots();
      dots.forEach((dot, i) => {
        gsap.set(dot, { left: `${rnd(6, 94)}%`, top: `${rnd(6, 94)}%`, x: 0, y: 0, scale: 0, opacity: 0 });
        tweens.push(
          gsap.to(dot, { scale: 1, opacity: rnd(0.45, 0.9), duration: 0.45, delay: i * 0.07, ease: "mv.spring" }),
          gsap.to(dot, { x: rnd(-56, 56), y: rnd(-48, 48), duration: rnd(3.2, 4.6), delay: i * 0.07, ease: "sine.inOut", repeat: -1, yoyo: true }),
          gsap.to(dot, { opacity: 0.18, duration: rnd(3, 4), delay: 0.6 + i * 0.1, ease: "sine.inOut", repeat: -1, yoyo: true }),
        );
      });
    };
    const onLeave = () => {
      stopDots();
      tweens.push(gsap.to(dots, { opacity: 0, scale: 0, duration: 0.3, ease: "power2.out" }));
      xTo(0);
      yTo(0);
    };
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      xTo(clamp((e.clientX - (r.left + r.width / 2)) * MAGNET));
      yTo(clamp((e.clientY - (r.top + r.height / 2)) * MAGNET));
    };
    const onClick = (e) => rippleAt(host, e);

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("click", onClick);
    return () => {
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("click", onClick);
      stopDots();
      gsap.killTweensOf(host);
      gsap.set(host, { x: 0, y: 0 });
      gsap.set(dots, { opacity: 0 });
    };
  }, [ref, enabled]);
}
