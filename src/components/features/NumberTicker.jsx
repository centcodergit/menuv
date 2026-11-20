import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Magic UI "Number Ticker", rebuilt with GSAP: counts up from the previous value to `value` (from `startValue` the
 * first time, or when the target drops), formatted for `locale`. No animation when `animate` is false. The text is written imperatively
 * (before paint), so React never re-renders the digits while they count.
 */
export default function NumberTicker({ value, locale, startValue = 0, animate = true, duration = 1.6, delay = 0, className }) {
  const el = useRef(null);
  const state = useRef({ v: animate ? startValue : value });
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  useLayoutEffect(() => {
    const node = el.current;
    const write = () => {
      if (node) node.textContent = fmt.format(Math.round(state.current.v));
    };
    if (!animate) {
      state.current.v = value;
      write();
      return undefined;
    }
    // Always counts up: a lower target restarts the count from `startValue` (a fresh draw of the demo).
    if (value < state.current.v) state.current.v = startValue;
    write();
    const tween = gsap.to(state.current, { v: value, duration, delay, ease: "mv.out", onUpdate: write });
    return () => tween.kill();
  }, [value, animate, duration, delay, fmt, startValue]);

  return <span ref={el} className={cn("tabular-nums", className)} />;
}
