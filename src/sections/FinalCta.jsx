import { lazy, Suspense, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useIsDesktop } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useInViewMount } from "@/hooks/useInViewMount";
import { useScrollTo } from "@/hooks/useSmoothScroll";
import Section from "@/components/layout/Section";
import Magnet from "@/components/fx/Magnet";
import ClickSpark from "@/components/fx/ClickSpark";
import QrReturn from "@/components/final/QrReturn";

const LightPillar = lazy(() => import("@/components/fx/LightPillar"));

/**
 * 7.15 Final CTA, "Έτοιμοι για το Ψηφιακό σας Μενού;": a full-viewport finale. Light Pillar behind (desktop,
 * only near the viewport), the headline at H1 scale splitting in by characters, the site's largest button
 * (magnetic, Click Spark) to #pricing, and the hero's QR modules assembling under it as the section rises.
 * Touch / reduced motion: a static radial glow instead of the pillar.
 */
export default function FinalCta() {
  const t = useT();
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const fancy = isDesktop && !reduced;
  const scrollTo = useScrollTo();
  const content = useRef(null);
  const [pillarRef, pillarNear] = useInViewMount("30% 0px");

  useGSAP(
    () => {
      if (reduced) return undefined;
      const title = content.current.querySelector("[data-final-title]");
      const split = SplitText.create(title, { type: "chars,words", charsClass: "inline-block", wordsClass: "inline-block whitespace-nowrap" });
      // Back to plain text once the letters have landed (natural wrapping on resize, cleaner for assistive tech).
      const tl = gsap.timeline({ scrollTrigger: { trigger: content.current, start: "top 72%", once: true }, onComplete: () => split.revert() });
      tl.from(split.chars, { yPercent: 110, rotateX: -70, opacity: 0, transformOrigin: "50% 100%", duration: 0.9, ease: "mv.out", stagger: 0.018 })
        .from("[data-final-rest]", { y: 24, opacity: 0, duration: 0.9, ease: "mv.out", stagger: 0.1 }, "-=0.55");
      return () => split.revert();
    },
    { dependencies: [reduced, t], scope: content, revertOnUpdate: true },
  );

  return (
    <Section id="final" bg="bright" aria-labelledby="final-title" className="flex min-h-[100svh] items-center overflow-hidden">
      <div ref={pillarRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
        {fancy && pillarNear ? (
          <Suspense fallback={null}>
            <LightPillar className="absolute inset-0 opacity-90" />
          </Suspense>
        ) : (
          <div className="absolute inset-0" style={{ background: "radial-gradient(38% 60% at 50% 45%, rgb(var(--mv-violet-600) / 0.45), rgb(var(--mv-orchid) / 0.12) 45%, transparent 75%)" }} />
        )}
      </div>
      <div ref={content} className="container-mv relative flex flex-col items-center text-center">
        <h2 id="final-title" data-final-title className="max-w-[16ch] font-display text-h1 font-bold [perspective:600px]">
          {t("final.title")}
        </h2>
        <p data-final-rest className="mt-6 max-w-lead text-lead text-mv-muted">
          {t("final.body")}
        </p>
        <div data-final-rest className="mt-12">
          <Magnet strength={0.3} padding={80}>
            <ClickSpark sparkCount={10} sparkRadius={34} sparkSize={11}>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#pricing");
                }}
                className="btn-primary group !min-h-[68px] !gap-3 !px-10 !text-lg md:!min-h-[80px] md:!px-14 md:!text-2xl"
              >
                {t("final.cta")}
                <ArrowRight size={26} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-300 ease-mv-out group-hover:translate-x-1" />
              </a>
            </ClickSpark>
          </Magnet>
        </div>
        <QrReturn className="mt-14 h-24 w-24 opacity-80 md:mt-16 md:h-28 md:w-28" />
      </div>
    </Section>
  );
}
