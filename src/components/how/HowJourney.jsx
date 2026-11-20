import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import "@/lib/gsap-extra"; // MotionPath: the comet head rides the drawing tip
import { useI18n } from "@/lib/i18n";
import SectionHeader from "@/components/layout/SectionHeader";
import JourneyPath, { layoutJourney } from "@/components/how/JourneyPath";
import JourneyPanel from "@/components/how/JourneyPanel";
import { FILL_EMPTY, FILL_FULL } from "@/components/how/Numeral";
import { J, SEGMENT_WINDOWS, STEP_IDS, TRACK_VW } from "@/components/how/steps";
import { useVisible } from "@/components/how/useVisible";

/** Left edge of the site container (1280px max, page gutters), so the header lines up with other sections. */
const CONTAINER_LEFT = "max(clamp(20px, 4vw, 48px), calc((100vw - 1280px) / 2 + clamp(20px, 4vw, 48px)))";
/**
 * The path's line: two thirds down, but never so high the header hits the navbar or so low the text overflows.
 * In viewport units, not %, so it never depends on the pinned stage's inline height (see the refreshInit below).
 */
const BAND = "clamp(28rem, 66svh, calc(100svh - 11rem))";
const NONE_ACTIVE = STEP_IDS.map(() => false);

/**
 * 7.5 desktop signature (fine pointer, ≥1024px, motion allowed): the pinned horizontal journey.
 * The stage pins for 300% of a viewport; the track (header slot + four 72vw panels) translates left with
 * scrub 1. The path draws with DrawSVG on the same timeline, segment by segment, so the tip reaches each marker
 * as it passes the middle of the screen; a comet head (MotionPath) rides the tip. Numerals fill and
 * illustrations play when their panel is centred (ScrollTrigger containerAnimation). The track moves by
 * transform only; sizes are read on refresh (function values + invalidateOnRefresh), never in scroll callbacks.
 */
export default function HowJourney() {
  const { t } = useI18n();
  const stage = useRef(null);
  const track = useRef(null);
  const [panelActive, setPanelActive] = useState(NONE_ACTIVE);
  const onScreen = useVisible(stage);

  useGSAP(
    () => {
      const stageEl = stage.current;
      const trackEl = track.current;
      const svg = trackEl.querySelector("[data-journey]");
      // Lay the path out now and at the start of every refresh, before the DrawSVG / MotionPath tweens below
      // re-measure it (invalidateOnRefresh). Marker positions come from vw / svh only, so they are already final
      // while the stage is still pinned at its old size.
      const layout = () => layoutJourney(trackEl, svg);
      layout();
      ScrollTrigger.addEventListener("refreshInit", layout);

      const seg = (k) => svg.querySelectorAll(`[data-seg="${k}"] path`);
      const core = (k) => svg.querySelector(`[data-seg="${k}"] path:last-child`);
      const head = svg.querySelector("[data-head]");
      const panels = gsap.utils.toArray("[data-panel]", trackEl);
      const glows = panels.map((p) => p.querySelector("[data-marker-glow]"));
      const off = { autoAlpha: 0, scale: 0.4 };
      const on = { autoAlpha: 1, scale: 1 };

      // Intro line draws under the header while the section rises into view; marker 1 lights as it arrives.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: stageEl, start: "top 75%", end: "top top", scrub: 1, invalidateOnRefresh: true },
        })
        .fromTo(seg(0), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.88 }, 0)
        .fromTo(glows[0], off, { ...on, duration: 0.12 }, 0.88);

      // The pinned journey.
      const main = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: stageEl, start: "top top", end: "+=300%", pin: true, scrub: 1, invalidateOnRefresh: true },
      });
      main.to(trackEl, { x: () => -(trackEl.offsetWidth - stageEl.clientWidth), duration: 1 }, 0).fromTo(head, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.015 }, 0);
      SEGMENT_WINDOWS.forEach(([from, to], k) => {
        const i = k + 1;
        main
          .fromTo(seg(i), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: to - from }, from)
          .to(head, { motionPath: { path: core(i) }, duration: to - from }, from);
        if (glows[i]) main.fromTo(glows[i], off, { ...on, duration: 0.02 }, to - 0.02);
      });
      main.fromTo(svg.querySelector("[data-end]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.98);

      // Per panel, relative to the moving track: the numeral fills on its way to the centre; the illustration
      // plays from just before it is centred until it has mostly left.
      panels.forEach((panel, i) => {
        gsap.fromTo(
          panel.querySelector("[data-numeral-fill]"),
          { attr: { y: FILL_EMPTY } },
          {
            attr: { y: FILL_FULL },
            ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: main, start: "left 46%", end: "left 16%", scrub: true },
          },
        );
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: main,
          // Panel 1 already starts half on screen, so its window opens right at the start of the pin.
          start: i === 0 ? "left 49%" : "left 62%",
          end: "right 30%",
          onToggle: (self) => setPanelActive((prev) => (prev[i] === self.isActive ? prev : prev.map((v, j) => (j === i ? self.isActive : v)))),
        });
      });

      return () => ScrollTrigger.removeEventListener("refreshInit", layout);
    },
    { scope: stage },
  );

  return (
    <div ref={stage} className="relative h-[100svh] min-h-[560px] overflow-hidden" style={{ "--band": BAND }}>
      <div ref={track} className="absolute inset-y-0 left-0 flex will-change-transform" style={{ width: `${TRACK_VW}vw` }}>
        <JourneyPath />
        <div className="relative h-full shrink-0" style={{ width: `${J.intro}vw` }}>
          <div
            className="absolute"
            style={{ left: CONTAINER_LEFT, width: "min(36rem, 40vw)", bottom: "calc(100% - var(--band) + 2.75rem)" }}
          >
            <SectionHeader id="how" eyebrow={t("how.eyebrow")} title={t("how.title")} lead={t("how.lead")} accentWords={2} align="left" />
          </div>
          <span data-path-start aria-hidden="true" className="absolute h-0 w-0" style={{ left: CONTAINER_LEFT, top: "var(--band)" }} />
        </div>
        <ol className="flex h-full shrink-0">
          {STEP_IDS.map((n, i) => (
            <JourneyPanel key={n} n={n} title={t(`how.${n}.title`)} body={t(`how.${n}.body`)} active={onScreen && panelActive[i]} />
          ))}
        </ol>
        <div aria-hidden="true" className="h-full shrink-0" style={{ width: `${J.end}vw` }} />
      </div>
    </div>
  );
}
