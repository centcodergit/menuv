import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import Section from "@/components/layout/Section";
import HowJourney from "@/components/how/HowJourney";
import HowTimeline from "@/components/how/HowTimeline";
import { useIsDesktop } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 7.5 How it works (`#how-it-works`), "Ξεκινήστε σε Λίγα Λεπτά".
 * Desktop with a fine pointer, ≥1024px, motion allowed: the pinned horizontal journey (the stage is one
 * viewport tall, so the section drops its vertical padding). Everything else, and reduced motion: the
 * vertical timeline (still, in its final state, with reduced motion). Steps are an ordered list, 1 → 4.
 * The pin lives in a child of <Section>, so it is created before the section's own background trigger and
 * that trigger measures the pin spacing.
 */
export default function HowItWorks() {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const journey = isDesktop && !reduced;

  // Switching modes at runtime (motion toggle in the footer, resizing across 1024px) adds or removes a
  // 300% pin, which moves every trigger below: re-measure once the new layout is in.
  const firstMode = useRef(true);
  useEffect(() => {
    if (firstMode.current) {
      firstMode.current = false;
      return undefined;
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [journey]);

  return journey ? (
    <Section key="journey" id="how-it-works" bg="base" className="!py-0">
      <HowJourney />
    </Section>
  ) : (
    <Section key="timeline" id="how-it-works" bg="base">
      <HowTimeline still={reduced} />
    </Section>
  );
}
