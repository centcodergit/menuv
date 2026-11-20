import { useRef } from "react";
import { Sparkles } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useT } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsTouch";
import { useInViewMount } from "@/hooks/useInViewMount";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import AnimatedShinyText from "@/components/fx/AnimatedShinyText";
import GlobeStage from "@/components/guide/GlobeStage";
import DishStage from "@/components/guide/DishStage";
import { useSingleLive } from "@/components/guide/useSingleLive";
import PartnersCard from "@/components/guide/PartnersCard";

// Ambient loops for this section (inline so the section ships its own keyframes): emblem float, hint hand swipe.
const KEYFRAMES = `
@keyframes mv-guide-float { 0%, 100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-9px) rotate(1.5deg); } }
@keyframes mv-guide-swipe {
  0%, 52%, 100% { transform: translateX(0) rotate(0deg); }
  62% { transform: translateX(5px) rotate(8deg); }
  76% { transform: translateX(-5px) rotate(-8deg); }
  86% { transform: translateX(0) rotate(0deg); }
}
@keyframes mv-partners-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes mv-partners-flow { to { stroke-dashoffset: -90; } }
@keyframes mv-partners-sheen { 0%, 70% { transform: translateX(0); } 100% { transform: translateX(400%); } }
.partners-float { animation: mv-partners-float 7.2s ease-in-out infinite; }
.partners-flow { animation: mv-partners-flow 6s linear infinite; }
.partners-sheen { animation: mv-partners-sheen 7s ease-in-out infinite; }
[data-reduce-motion] .partners-float, [data-reduce-motion] .partners-flow, [data-reduce-motion] .partners-sheen { animation: none; }`;

function GuideCard({ titleId, title, body, children }) {
  return (
    <article data-guide-card aria-labelledby={titleId} className="stone group relative flex flex-col overflow-hidden rounded-card p-2.5 sm:p-3">
      {/* Stone hover: an inner glow along the top edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-0 transition-opacity duration-500 ease-mv-out group-hover:opacity-100"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgb(var(--mv-violet-500) / 0.16), transparent 70%)" }}
      />
      {children}
      <div className="relative px-3 pb-4 pt-6 sm:px-5 sm:pb-6">
        <h3 id={titleId} className="font-display text-h3 font-semibold text-mv-text">
          {title}
        </h3>
        <p className="mt-3 max-w-[46ch] text-body text-mv-muted md:text-body-lg">{body}</p>
      </div>
    </article>
  );
}

/**
 * 7.11 Coming soon (#guide), "Δύο νέοι τρόποι να ερωτευτείς ένα μενού".
 * Card A: the Menuverse Guide, a cobe night globe (food capitals glowing, drag to spin) with the champagne metal
 * emblem floating in front. Card B: a dish in 3D (R3F), orbitable, with an exploded view when it reaches the
 * middle of the screen.
 * Card C (wide, "In planning"): free menus backed by beverage partners, CSS/SVG only.
 * WebGL budget: canvases mount only near the section. Desktop (WebGL page background) runs both, 3 contexts in
 * total; phones and tablets (CSS background) run one, whichever stage shows more of itself, and the other shows a
 * snapshot poster.
 */
export default function ComingSoon() {
  const t = useT();
  const reduced = useReducedMotion();
  const dual = useIsDesktop();
  const [sectionRef, near] = useInViewMount("60% 0px");
  const root = useRef(null);
  const globeStage = useRef(null);
  const dishStage = useRef(null);
  const single = useSingleLive(globeStage, dishStage, near && !dual);
  const globeLive = near && (dual || single === 0);
  const dishLive = near && (dual || single === 1);

  useGSAP(
    () => {
      const badge = root.current.querySelector("[data-guide-badge]");
      const cards = root.current.querySelectorAll("[data-guide-card]");
      const foot = root.current.querySelector("[data-guide-foot]");
      if (reduced) {
        gsap.set([badge, ...cards, foot], { opacity: 0 });
        ScrollTrigger.create({ trigger: badge, start: "top 82%", once: true, onEnter: () => gsap.to(badge, { opacity: 1, duration: 0.3 }) });
        ScrollTrigger.create({ trigger: cards[0], start: "top 85%", once: true, onEnter: () => gsap.to([...cards, foot], { opacity: 1, duration: 0.3 }) });
        return;
      }
      gsap.set(badge, { opacity: 0, y: 10 });
      ScrollTrigger.create({ trigger: badge, start: "top 82%", once: true, onEnter: () => gsap.to(badge, { opacity: 1, y: 0, duration: 0.6, ease: "mv.out" }) });
      gsap.set(cards, { opacity: 0, y: 56 });
      gsap.set(foot, { opacity: 0 });
      ScrollTrigger.create({
        trigger: cards[0],
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(cards, { opacity: 1, y: 0, duration: 1.1, ease: "mv.out", stagger: 0.12 });
          gsap.to(foot, { opacity: 1, duration: 0.8, delay: 0.5 });
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <Section ref={sectionRef} id="guide" bg="base" aria-labelledby="guide-title">
      <style>{KEYFRAMES}</style>
      <div ref={root} className="container-mv">
        <p data-guide-badge className="eyebrow relative z-[1] mb-6">
          <Sparkles size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-mv-violet-300" />
          <AnimatedShinyText>{t("guide.badge")}</AnimatedShinyText>
        </p>
        <SectionHeader id="guide" title={t("guide.title")} lead={t("guide.lead")} accentWords={3} titleId="guide-title" align="left" />

        <div className="mt-14 grid gap-5 md:mt-20 lg:grid-cols-2 lg:gap-6">
          <GuideCard titleId="guide-a-title" title={t("guide.a.title")} body={t("guide.a.body")}>
            <GlobeStage ref={globeStage} live={globeLive} still={reduced} dragLabel={t("cursor.drag")} />
          </GuideCard>
          <GuideCard titleId="guide-b-title" title={t("guide.b.title")} body={t("guide.b.body")}>
            <DishStage ref={dishStage} live={dishLive} still={reduced} hint={t("guide.b.hint")} compact={!dual} />
          </GuideCard>
          <div className="lg:col-span-2">
            <PartnersCard />
          </div>
        </div>

        <p data-guide-foot className="text-balance mt-10 flex items-center justify-center gap-4 text-center font-mono text-label font-medium uppercase text-mv-muted">
          <span aria-hidden="true" className="hidden h-px w-14 shrink-0 bg-gradient-to-r from-transparent to-mv-violet-400/60 sm:block" />
          {t("guide.footnote")}
          <span aria-hidden="true" className="hidden h-px w-14 shrink-0 bg-gradient-to-l from-transparent to-mv-violet-400/60 sm:block" />
        </p>
      </div>
    </Section>
  );
}
