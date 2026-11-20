import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import SectionHeader from "@/components/layout/SectionHeader";
import TimelineStep from "@/components/how/TimelineStep";
import { FILL_EMPTY, FILL_FULL } from "@/components/how/Numeral";
import { STEP_IDS } from "@/components/how/steps";

const BEAM = "linear-gradient(180deg, rgb(var(--mv-violet-500) / 0) 0%, rgb(var(--mv-violet-500)) 14%, rgb(var(--mv-violet-300)) 100%)";

/**
 * 7.5 on mobile, touch, below 1024px and with reduced motion: Aceternity "Timeline", vertical, no pin.
 * A beam on the left follows the scroll (scaleY, scrubbed) and lights each marker as it passes; numerals fill
 * as their step arrives; each illustration sits under its text and loops only while on screen.
 * still (reduced motion): no scroll animation at all, everything in its final state.
 */
export default function HowTimeline({ still = false }) {
  const { t } = useI18n();
  const list = useRef(null);

  useGSAP(
    () => {
      if (still) return;
      gsap.fromTo(
        "[data-beam]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 70%", end: "bottom 70%", scrub: 0.6 } },
      );
      gsap.utils.toArray("[data-step]", list.current).forEach((step) => {
        gsap
          .timeline({ scrollTrigger: { trigger: step, start: "top 66%", toggleActions: "play none none reverse" } })
          .fromTo(step.querySelector("[data-marker-glow]"), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "mv.spring" }, 0)
          .fromTo(step.querySelector("[data-numeral-fill]"), { attr: { y: FILL_EMPTY } }, { attr: { y: FILL_FULL }, duration: 1, ease: "mv.out" }, 0.05);
      });
    },
    { scope: list, dependencies: [still] },
  );

  return (
    <div className="container-mv">
      <SectionHeader id="how" eyebrow={t("how.eyebrow")} title={t("how.title")} lead={t("how.lead")} accentWords={2} align="left" />
      <div ref={list} className="relative mt-14 md:mt-20">
        <span aria-hidden="true" className="absolute bottom-2 left-[10px] top-[2.1rem] w-[2px] overflow-hidden rounded-full bg-mv-line sm:left-[18px] md:top-[2.6rem]">
          <span data-beam className="block h-full w-full origin-top" style={{ background: BEAM }} />
        </span>
        <ol>
          {STEP_IDS.map((n) => (
            <TimelineStep key={n} n={n} title={t(`how.${n}.title`)} body={t(`how.${n}.body`)} still={still} />
          ))}
        </ol>
      </div>
    </div>
  );
}
