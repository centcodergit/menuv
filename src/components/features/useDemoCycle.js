import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Step counter for the bento micro-demos (master prompt 7.2).
 * - "loop": advances every `interval` s while `active` (card landed and in view); pauses off-screen.
 * - "once" (touch): advances `onceSteps` times the first time the card is active, then stops.
 * - "static" (reduced motion): stays on `staticStep`.
 * `onBeforeStep` runs right before each change (GSAP Flip records its state there).
 * Uses gsap.delayedCall, so it also sleeps while the tab is hidden.
 */
export function useDemoCycle({ active, mode, count, interval, first = 0.8, onceSteps = count - 1, staticStep = 0, onBeforeStep }) {
  const [step, setStep] = useState(mode === "static" ? staticStep : 0);
  const advanced = useRef(0);
  const before = useRef(onBeforeStep);
  before.current = onBeforeStep;

  useEffect(() => {
    if (mode === "static") setStep(staticStep);
  }, [mode, staticStep]);

  useEffect(() => {
    if (!active || mode === "static") return undefined;
    if (mode === "once" && advanced.current >= onceSteps) return undefined;
    let call = null;
    const tick = () => {
      before.current?.();
      setStep((s) => (s + 1) % count);
      advanced.current += 1;
      if (mode === "once" && advanced.current >= onceSteps) return;
      call = gsap.delayedCall(interval, tick);
    };
    call = gsap.delayedCall(advanced.current === 0 ? first : interval, tick);
    return () => call?.kill();
  }, [active, mode, count, interval, first, onceSteps]);

  return step;
}

/** Plays a paused GSAP timeline while `active`, pauses it otherwise (static mode never plays). */
export function usePlayWhile(timelineRef, active, mode) {
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl || mode === "static") return;
    if (active) tl.play();
    else tl.pause();
  }, [timelineRef, active, mode]);
}
