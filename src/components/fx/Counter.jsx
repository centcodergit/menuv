import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
/** Place values for a number, largest first: 50 → [10, 1]. */
const placesFor = (n) => {
  const count = String(Math.floor(Math.abs(n))).length;
  return Array.from({ length: count }, (_, i) => 10 ** (count - 1 - i));
};

/**
 * React Bits "Counter", rebuilt with GSAP: each place value is a wheel of digits that rolls like an odometer
 * while the number travels to `value` (the ones wheel spins through every digit on the way). Leading places grow
 * in as the number reaches them, so 0 → 50 reads "0%" → "50%" instead of "00%". Sits on the text baseline
 * (1lh cells, tabular figures) and inherits the surrounding font. Decorative: the wheel digits are generated
 * content (not in the text, so copy/paste and crawlers never see "0123456789"); the caller puts the real number
 * in the text for screen readers. Reduced motion: jumps straight to the value.
 */
export default function Counter({ value, duration = 1.2, ease = "mv.out", className }) {
  const root = useRef(null);
  const state = useRef({ v: value });
  const reduced = useReducedMotion();
  const places = placesFor(Math.max(value, state.current.v));

  // Layout effect: a newly added place must be collapsed before the browser paints it.
  useLayoutEffect(() => {
    const el = root.current;
    const cols = [...el.querySelectorAll("[data-place]")];
    const paint = () => {
      const v = state.current.v;
      cols.forEach((col) => {
        const place = Number(col.dataset.place);
        const wheel = (v / place) % 10;
        col.firstElementChild.style.transform = `translateY(${(-wheel * 100) / DIGITS.length}%)`;
        if (place > 1) {
          const grow = Math.min(1, Math.max(0, v / place));
          col.style.width = `${grow}ch`;
          col.style.opacity = String(grow);
        }
      });
    };
    if (reduced) {
      state.current.v = value;
      paint();
      return undefined;
    }
    paint();
    const tween = gsap.to(state.current, { v: value, duration, ease, onUpdate: paint });
    return () => tween.kill();
  }, [value, duration, ease, reduced, places.length]);

  return (
    <span ref={root} aria-hidden="true" className={cn("inline-flex align-top tabular-nums", className)} style={{ height: "1lh" }}>
      {places.map((place) => (
        <span key={place} data-place={place} className="relative inline-block h-[1lh] w-[1ch] overflow-hidden">
          <span className="flex flex-col will-change-transform">
            {DIGITS.map((d, i) => (
              <span key={i} data-d={d} className="block h-[1lh] text-center before:content-[attr(data-d)]" />
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
