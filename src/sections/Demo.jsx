import { lazy, Suspense, useRef } from "react";
import { useT } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIsDesktop } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useInViewMount } from "@/hooks/useInViewMount";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import VideoFacade from "@/components/demo/VideoFacade";

const LightRays = lazy(() => import("@/components/fx/LightRays"));

/**
 * 7.6 Demo, "Δοκιμάστε το Demo": Aceternity "Container Scroll Animation" (the video's device frame starts
 * tilted back in 3D and flattens as you scroll into it) over a soft violet Light Rays glow (desktop only, only
 * while in view). Touch / reduced motion: a plain fade-up, no tilt, no rays.
 */
export default function Demo() {
  const t = useT();
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const fancy = isDesktop && !reduced;
  const frame = useRef(null);
  const [raysRef, raysNear] = useInViewMount("25% 0px");

  useGSAP(
    () => {
      const el = frame.current;
      if (!el) return;
      if (reduced) return;
      if (!fancy) {
        gsap.from(el, { y: 40, autoAlpha: 0, duration: 1, ease: "mv.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        return;
      }
      gsap.fromTo(
        el,
        { rotateX: 20, scale: 1.05, y: 60, transformPerspective: 1400, transformOrigin: "50% 0%" },
        { rotateX: 0, scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "center 55%", scrub: 0.6 } },
      );
    },
    { dependencies: [fancy, reduced] },
  );

  return (
    <Section id="demo-section" bg="base" aria-labelledby="demo-title" className="overflow-hidden">
      <div ref={raysRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[90%] opacity-60">
        {fancy && raysNear && (
          <Suspense fallback={null}>
            <LightRays className="h-full w-full" />
          </Suspense>
        )}
      </div>
      <div className="container-mv relative">
        <SectionHeader id="demo" eyebrow={t("demo.eyebrow")} title={t("demo.title")} lead={t("demo.lead")} accentWords={1} dot titleId="demo-title" />
        <div className="mx-auto mt-14 max-w-5xl [perspective:1400px] md:mt-20">
          <div
            ref={frame}
            className="relative rounded-[30px] border border-mv-line-strong bg-[#0B0A12] p-2 shadow-[0_60px_140px_-50px_rgba(76,29,149,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] will-change-transform md:p-3"
          >
            <div aria-hidden="true" className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-mv-violet-300/70 to-transparent" />
            <div className="relative aspect-video overflow-hidden rounded-[22px] bg-black">
              <VideoFacade />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
