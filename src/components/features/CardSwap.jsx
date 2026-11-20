import { Children, useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useDemoCycle } from "@/components/features/useDemoCycle";

/**
 * React Bits "Card Swap", rebuilt with GSAP and re-themed (mv easing): a skewed 3D stack; every `interval` s
 * the front card drops away (fading, clipped to the demo area), the others move forward, and it returns at the back.
 * Runs only while `active`; "once" mode does a single swap; "static" keeps the stack still.
 */
export default function CardSwap({ children, active, mode, interval = 3.5, distX = 26, distY = 30, skew = 6, className }) {
  const root = useRef(null);
  const order = useRef([]);
  const tl = useRef(null);
  const count = Children.count(children);

  const slot = (i) => ({ x: i * distX, y: -i * distY, z: -i * distX * 1.5, zIndex: count - i });

  useGSAP(
    () => {
      const cards = gsap.utils.toArray("[data-swap-card]", root.current);
      order.current = cards.map((_, i) => i);
      cards.forEach((el, i) => {
        const s = slot(i);
        gsap.set(el, { x: s.x, y: s.y, z: s.z, zIndex: s.zIndex, xPercent: -50, yPercent: -50, skewY: skew, transformOrigin: "center center", force3D: true });
      });
    },
    { scope: root, dependencies: [count, distX, distY, skew] },
  );

  const step = useDemoCycle({ active, mode, count, interval, first: 1.4, onceSteps: 1 });

  const { contextSafe } = useGSAP({ scope: root });
  const swap = contextSafe(() => {
    const cards = gsap.utils.toArray("[data-swap-card]", root.current);
    const [front, ...rest] = order.current;
    const elFront = cards[front];
    if (!elFront) return;
    const drop = (root.current?.offsetHeight ?? 360) * 0.6;
    const t = gsap.timeline();
    t.to(elFront, { y: `+=${drop}`, duration: 0.8, ease: "mv.inOut" });
    t.to(elFront, { opacity: 0, duration: 0.4, ease: "power1.in" }, 0.35);
    t.addLabel("promote", "-=0.4");
    rest.forEach((idx, i) => {
      const s = slot(i);
      t.set(cards[idx], { zIndex: s.zIndex }, "promote");
      t.to(cards[idx], { x: s.x, y: s.y, z: s.z, duration: 0.8, ease: "mv.out" }, `promote+=${i * 0.12}`);
    });
    const back = slot(count - 1);
    t.addLabel("return", "promote+=0.18");
    t.set(elFront, { zIndex: back.zIndex }, "return");
    t.to(elFront, { x: back.x, y: back.y, z: back.z, opacity: 1, duration: 0.9, ease: "mv.out" }, "return");
    t.call(() => {
      order.current = [...rest, front];
    });
    tl.current = t;
  });

  const last = useRef(step);
  useEffect(() => {
    if (step === last.current) return;
    last.current = step;
    tl.current?.progress(1);
    swap();
  }, [step, swap]);

  // A swap caught mid-way when the card leaves the screen waits there.
  useEffect(() => {
    const t = tl.current;
    if (!t || t.progress() === 1) return;
    if (active) t.play();
    else t.pause();
  }, [active]);

  return (
    <div ref={root} className={cn("absolute inset-0 overflow-hidden", className)} style={{ perspective: "900px" }}>
      {Children.map(children, (child, i) => (
        <div
          key={i}
          data-swap-card
          className="absolute"
          style={{ left: `calc(50% - ${((count - 1) * distX) / 2}px)`, top: `calc(50% + ${((count - 1) * distY) / 2}px)`, transformStyle: "preserve-3d", backfaceVisibility: "hidden", willChange: "transform" }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
