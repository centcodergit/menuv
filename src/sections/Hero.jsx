import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { gsap, ScrollTrigger, SplitText, GREEK_GLYPHS, useGSAP } from "@/lib/gsap";
import { useIntroDone } from "@/lib/intro";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsTouch";
import { useScrollTo } from "@/hooks/useSmoothScroll";
import Section from "@/components/layout/Section";
import { phoneScreenX } from "@/components/hero/layout";
import { useTheme } from "@/providers/ThemeProvider";
import Magnet from "@/components/fx/Magnet";
import ClickSpark from "@/components/fx/ClickSpark";
import DomPhone from "@/components/hero/DomPhone";
import HeroChip from "@/components/hero/HeroChip";
import QrDraw from "@/components/hero/QrDraw";
import { usePhoneMenuProps } from "@/components/hero/PhoneMenu";

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const whenIdle = (cb) => {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 250);
  return () => window.clearTimeout(id);
};

/**
 * 7.1 Hero, "The Living Menu".
 * Desktop (fine pointer, ≥1024px, WebGL, motion allowed): a full-bleed React Three Fiber stage (phone with the
 * live menu, QR monolith, scan, chips), mounted after first paint; a CSS phone holds its place until the 3D one
 * is ready, then crossfades. The section pins for 130% of a viewport while the camera dives into the menu.
 * Touch / reduced motion: CSS phone with a gentle float, a QR that draws itself, no canvas, no pin.
 * The H1 renders immediately (LCP); its entrance waits for the preloader hand-off.
 */
export default function Hero() {
  const { t, lang } = useI18n();
  const menuProps = usePhoneMenuProps();
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const isDesktop = useIsDesktop();
  const introDone = useIntroDone();
  const scrollTo = useScrollTo();
  const webgl = useMemo(supportsWebGL, []);
  const use3D = isDesktop && !reduced && webgl;

  const section = useRef(null);
  const copyWrap = useRef(null);
  const stage = useRef(null);
  const driver = useRef({ progress: 0, textTop: 0.45, pointer: { x: 0, y: 0, ndcX: 0, ndcY: 0, inside: false } });

  // Where the headline starts (fraction of the hero's height): the 3D scene keeps the QR monolith above it.
  useEffect(() => {
    const measure = () => {
      const sec = section.current;
      const h1 = document.getElementById("hero-title");
      if (!sec || !h1) return;
      // offsetTop ignores transforms, so the entrance animation (text rising into place) can't skew it.
      let top = 0;
      for (let el = h1; el && el !== sec; el = el.offsetParent) top += el.offsetTop;
      driver.current.textTop = top / Math.max(1, sec.offsetHeight);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [lang]);
  const played = useRef(false);
  const stepFive = useRef(false);

  const [sceneWanted, setSceneWanted] = useState(false);
  const [sceneNear, setSceneNear] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [late, setLate] = useState(false);
  const [stageIn, setStageIn] = useState(false);
  const [placeholderGone, setPlaceholderGone] = useState(false);

  const chips = {
    scanTitle: t("hero.chip1.title"),
    scanSub: t("hero.chip1.sub"),
    liveTitle: t("hero.chip2.title"),
    liveSub: t("hero.chip2.sub"),
  };

  // Mount the canvas after first paint (idle), never on touch / reduced motion.
  useEffect(() => {
    if (!use3D) return undefined;
    return whenIdle(() => {
      setLate(stepFive.current);
      setSceneWanted(true);
    });
  }, [use3D]);

  // Unmount the canvas once the visitor is more than one viewport past the hero.
  useEffect(() => {
    if (!use3D || !section.current) return undefined;
    const io = new IntersectionObserver(([e]) => setSceneNear(e.isIntersecting), { rootMargin: "100% 0px 0px 0px" });
    io.observe(section.current);
    return () => io.disconnect();
  }, [use3D]);

  // Pointer → driver ref (camera rig, phone tilt, monolith ripple). No React state per move.
  useEffect(() => {
    if (!use3D) return undefined;
    const p = driver.current.pointer;
    const onMove = (e) => {
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = -((e.clientY / window.innerHeight) * 2 - 1);
      const r = stage.current?.getBoundingClientRect();
      if (r) {
        p.ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
        p.ndcY = -(((e.clientY - r.top) / r.height) * 2 - 1);
        p.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      }
    };
    const onLeave = () => {
      p.inside = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [use3D]);

  // Entrance (master prompt 7.1): eyebrow scramble → H1 characters rise from a line mask → subtitle un-blurs →
  // CTAs rise → stage. Plays once, after the preloader hand-off.
  useGSAP(
    () => {
      const el = section.current;
      const targets = el.querySelectorAll("[data-hero-in]");
      if (!introDone) {
        gsap.set(targets, { autoAlpha: 0 });
        return undefined;
      }
      if (played.current) return undefined;
      played.current = true;

      if (reduced) {
        gsap.fromTo(targets, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" });
        gsap.set(el.querySelectorAll("[data-stage-phone], [data-chip]"), { autoAlpha: 1 });
        stepFive.current = true;
        setStageIn(true);
        return undefined;
      }

      gsap.set(targets, { autoAlpha: 1 });
      const eyebrow = el.querySelector("[data-eyebrow-text]");
      const h1 = el.querySelector("h1");
      const subtitle = el.querySelector("[data-subtitle]");
      const split = SplitText.create(h1, { type: "lines,words,chars", mask: "lines", charsClass: "split-char", aria: "auto" });
      const sub = SplitText.create(subtitle, { type: "words", aria: "auto" });

      const tl = gsap.timeline({
        onComplete: () => {
          split.revert();
          sub.revert();
        },
      });
      tl.from(eyebrow.parentElement, { autoAlpha: 0, y: 8, duration: 0.5 }, 0)
        .to(eyebrow, { duration: 0.9, scrambleText: { text: eyebrow.textContent, chars: GREEK_GLYPHS, speed: 0.6, revealDelay: 0.2 } }, 0)
        .from(split.chars, { yPercent: 110, rotateX: -80, transformPerspective: 600, transformOrigin: "50% 100%", stagger: 0.018, duration: 1.2, ease: "mv.out" }, 0.1)
        .from(sub.words, { autoAlpha: 0, filter: "blur(10px)", y: 6, stagger: 0.015, duration: 0.9, ease: "mv.out" }, 0.45)
        .from("[data-cta]", { y: 16, scale: 0.96, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: "mv.out" }, 0.75)
        .call(
          () => {
            stepFive.current = true;
            setStageIn(true);
          },
          null,
          0.5,
        );
      const domStage = el.querySelector("[data-stage-phone]");
      if (domStage) tl.from(domStage, { y: 56, rotate: -4, autoAlpha: 0, duration: 1.3, ease: "mv.out" }, 0.5);
      const domChips = el.querySelectorAll("[data-chip]");
      if (domChips.length) tl.from(domChips, { scale: 0.6, autoAlpha: 0, duration: 0.8, ease: "mv.spring", stagger: 0.12 }, 1.0);
      return undefined;
    },
    { scope: section, dependencies: [introDone, reduced] },
  );

  // Scroll choreography (desktop 3D only): pin for 130% of a viewport; copy drifts up and fades (0 to 0.25),
  // the camera dives (read by the scene from driver.progress), the stage crossfades away at the end.
  useGSAP(
    () => {
      if (!use3D) return undefined;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=130%",
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            driver.current.progress = self.progress;
          },
        },
      });
      tl.to(copyWrap.current, { yPercent: -22, autoAlpha: 0, duration: 0.25 }, 0)
        .to(stage.current, { autoAlpha: 0, duration: 0.12 }, 0.88)
        .set({}, {}, 1);
      return () => {
        driver.current.progress = 0;
      };
    },
    { scope: section, dependencies: [use3D] },
  );

  // Once the 3D phone has taken over: refresh trigger positions, and remove the CSS placeholder after the
  // crossfade (so its menu is not a second, invisible set of tabs for keyboard users).
  useEffect(() => {
    if (!sceneReady) return undefined;
    ScrollTrigger.refresh();
    const id = window.setTimeout(() => setPlaceholderGone(true), 900);
    return () => window.clearTimeout(id);
  }, [sceneReady]);

  const goPricing = () => scrollTo("#pricing");
  const goDemo = () =>
    scrollTo("#demo-section", {
      onComplete: () => window.dispatchEvent(new CustomEvent("mv:demo-pulse")),
    });

  const copyBlock = (
    <div key={lang} className={use3D ? "relative z-10 max-w-[46rem] lg:col-span-7" : "relative z-10 max-w-[44rem] lg:col-span-6"}>
      <p data-hero-in className="eyebrow mb-6">
        <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-mv-violet-400 opacity-60 motion-safe:animate-ping-slow" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mv-violet-400" />
        </span>
        <span data-eyebrow-text>{t("hero.eyebrow")}</span>
      </p>
      {/* Hero-sized H1: the Greek words are long, so the size also follows the viewport height (master prompt 4.4). */}
      <h1 id="hero-title" data-hero-in className="font-display text-[clamp(2.4rem,min(4.6vw,8.2svh),5.25rem)] xl:text-[clamp(2.4rem,min(5.1vw,8.2svh),5.25rem)] font-bold leading-[1.02] tracking-[-0.04em]">
        <span className="block">{t("hero.h1.line1")}</span>
        <span className="text-sheen block pb-[0.1em] font-serif-italic font-medium">{t("hero.h1.line2")}</span>
      </h1>
      <p data-hero-in data-subtitle className={`mt-6 text-lead text-mv-muted ${use3D ? "max-w-[32rem]" : "max-w-lead"}`}>
        {t("hero.subtitle")}
      </p>
      <div data-hero-in className="mt-9 flex flex-wrap items-center gap-4">
        <span data-cta>
          <Magnet>
            <ClickSpark>
              <button type="button" onClick={goPricing} className="btn-primary group">
                {t("hero.ctaPrimary")}
                <ArrowRight size={18} strokeWidth={1.75} className="transition-transform duration-300 ease-mv-out group-hover:translate-x-0.5" />
              </button>
            </ClickSpark>
          </Magnet>
        </span>
        <span data-cta>
          <button type="button" onClick={goDemo} className="btn-outline group">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mv-violet-500/20 text-mv-violet-200 transition-colors group-hover:bg-mv-violet-500/35">
              <Play size={12} strokeWidth={2} className="translate-x-px fill-current" />
            </span>
            {t("hero.ctaSecondary")}
          </button>
        </span>
      </div>
    </div>
  );

  if (use3D) {
    return (
      <Section ref={section} bg="bright" className="flex h-[100svh] min-h-[620px] items-end overflow-hidden !py-0" aria-labelledby="hero-title">
        <div ref={stage} className="absolute inset-0">
          {sceneWanted && sceneNear && (
            <div className="absolute inset-0 transition-opacity duration-700 ease-mv-out" style={{ opacity: sceneReady ? 1 : 0 }}>
              <Suspense fallback={null}>
                <HeroScene
                  driver={driver}
                  play={stageIn}
                  late={late}
                  menuProps={menuProps}
                  chips={chips}
                  onReady={() => setSceneReady(true)}
                  light={theme === "light"}
                />
              </Suspense>
            </div>
          )}
          {/* Placeholder phone at the 3D phone's spot until the scene is ready. */}
          {!placeholderGone && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ease-mv-out"
              style={{ left: `${phoneScreenX(typeof window !== "undefined" ? window.innerWidth : 1440) * 100}%`, height: "77%", aspectRatio: "1.5 / 3.1", opacity: introDone && !sceneReady ? 1 : 0 }}
            >
              <DomPhone menuProps={menuProps} className="w-full" autoCycle={false} interactive={false} />
            </div>
          )}
        </div>
        <div ref={copyWrap} className="container-mv relative z-10 pb-[clamp(2.5rem,8vh,6rem)] pt-28 lg:grid lg:grid-cols-12">
          {copyBlock}
        </div>
      </Section>
    );
  }

  // Touch, small screens, reduced motion, no WebGL.
  return (
    <Section ref={section} bg="bright" className="overflow-hidden !pb-section !pt-32 lg:flex lg:min-h-[100svh] lg:items-center" aria-labelledby="hero-title">
      <div className="container-mv grid items-center gap-14 lg:grid-cols-12">
        {copyBlock}
        <div className="relative mx-auto w-full max-w-[420px] lg:col-span-6 lg:max-w-none">
          <QrDraw play={stageIn} className="absolute -left-2 top-[6%] w-[46%] max-w-[220px] opacity-50 lg:left-[2%] lg:w-[38%]" />
          <div data-stage-phone className="relative mx-auto w-[min(70vw,300px)]" style={{ visibility: "hidden" }}>
            <div className="motion-safe:animate-float">
              <DomPhone menuProps={menuProps} className="w-full" />
            </div>
            <div data-chip className="absolute -left-[14%] top-[2%] sm:-left-[34%]" style={{ visibility: "hidden" }}>
              <HeroChip kind="scan" title={chips.scanTitle} sub={chips.scanSub} className="motion-safe:animate-float" style={{ animationDelay: "-2s" }} />
            </div>
            <div data-chip className="absolute -right-[14%] bottom-[18%] sm:-right-[28%]" style={{ visibility: "hidden" }}>
              <HeroChip kind="live" title={chips.liveTitle} sub={chips.liveSub} className="motion-safe:animate-float" style={{ animationDelay: "-4.5s" }} />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
