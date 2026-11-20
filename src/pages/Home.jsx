import { lazy, Suspense, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Hero from "@/sections/Hero";
import { useScrollTo } from "@/hooks/useSmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";

// Everything below the fold is code-split (master prompt 10).
const Features = lazy(() => import("@/sections/Features"));
const MultilingualLoop = lazy(() => import("@/sections/MultilingualLoop"));
const LiveSupport = lazy(() => import("@/sections/LiveSupport"));
const HowItWorks = lazy(() => import("@/sections/HowItWorks"));
const Demo = lazy(() => import("@/sections/Demo"));
const Showcase = lazy(() => import("@/sections/Showcase"));
const Pricing = lazy(() => import("@/sections/Pricing"));
const Referral = lazy(() => import("@/sections/Referral"));
const Testimonials = lazy(() => import("@/sections/Testimonials"));
const ComingSoon = lazy(() => import("@/sections/ComingSoon"));
const Feedback = lazy(() => import("@/sections/Feedback"));
const Articles = lazy(() => import("@/sections/Articles"));
const Newsletter = lazy(() => import("@/sections/Newsletter"));
const FinalCta = lazy(() => import("@/sections/FinalCta"));

/** Reserves space while a section chunk loads, so nothing shifts (CLS). */
const Reserve = () => <div aria-hidden="true" className="min-h-[60vh]" />;

/**
 * Scroll to the URL hash once its section exists and layout has settled
 * (sections load lazily; fonts and ScrollTrigger pin spacers change positions).
 * A deep link on page load jumps; later hash changes glide.
 */
function useHashScroll() {
  const { hash } = useLocation();
  const scrollTo = useScrollTo();
  const firstRun = useRef(true);
  useEffect(() => {
    const immediate = firstRun.current;
    firstRun.current = false;
    if (!hash || hash.startsWith("#article-")) return undefined;
    let cancelled = false;
    let tries = 0;
    let frame = 0;
    const settleThenScroll = async (el) => {
      await document.fonts?.ready;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (cancelled) return;
      ScrollTrigger.refresh();
      scrollTo(el, { immediate });
    };
    const attempt = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) settleThenScroll(el);
      else if (tries++ < 180) frame = requestAnimationFrame(attempt);
    };
    attempt();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [hash, scrollTo]);
}

export default function Home() {
  useHashScroll();
  return (
    <>
      <Hero />
      <Suspense fallback={<Reserve />}>
        <Features />
        <MultilingualLoop />
        <LiveSupport />
        <HowItWorks />
        <Demo />
        <Showcase />
        <Pricing />
        <Referral />
        <Testimonials />
        <ComingSoon />
        <Feedback />
        <Articles />
        <Newsletter />
        <FinalCta />
      </Suspense>
    </>
  );
}
