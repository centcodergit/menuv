import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import FeedbackForm from "@/components/feedback/FeedbackForm";

let revealed = false; // the card rises in once per page view

/**
 * 7.12 Feedback, "Δώστε μας τα Σχόλιά σας": one obsidian glass card on the dimmed reading zone holding the
 * feedback form (logic 3.7, see components/feedback/FeedbackForm.jsx). The card rises in once after the header.
 * Touch devices get the same translucent obsidian surface without the backdrop blur (master prompt 4.6 keeps blur
 * off large scrolling surfaces on mobile). Reduced motion: a short fade.
 */
export default function Feedback() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const card = useRef(null);

  useGSAP(
    () => {
      if (revealed) return;
      const el = card.current;
      gsap.set(el, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          revealed = true;
          if (reduced) gsap.to(el, { autoAlpha: 1, duration: 0.3, ease: "none" });
          else gsap.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "mv.out", delay: 0.25, clearProps: "transform" });
        },
      });
    },
    { scope: card, dependencies: [reduced] },
  );

  return (
    <Section id="feedback" bg="dim" aria-labelledby="feedback-title">
      <div className="container-mv">
        <SectionHeader
          id="feedback"
          eyebrow={t("feedback.eyebrow")}
          title={t("feedback.title")}
          lead={t("feedback.lead")}
          accentWords={2}
          titleId="feedback-title"
        />
        <div ref={card} className="relative mx-auto mt-12 max-w-3xl md:mt-16">
          {/* A soft violet light behind the card, so the glass has something to hold. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-10 -top-16 bottom-1/3 opacity-70 [background:radial-gradient(50%_55%_at_50%_40%,rgb(var(--mv-violet-500)/0.22),transparent_75%)]"
          />
          <div
            className={cn("relative rounded-card p-5 sm:p-8 md:p-10", isTouch ? "border border-mv-line" : "glass")}
            style={isTouch ? { background: "var(--mv-glass-bg)", boxShadow: "var(--mv-glass-highlight)" } : undefined}
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-mv-violet-300/50 to-transparent" />
            <FeedbackForm />
          </div>
        </div>
      </div>
    </Section>
  );
}
