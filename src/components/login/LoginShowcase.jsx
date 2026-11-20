import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { QrCode, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop, useIsTouch } from "@/hooks/useIsTouch";
import { LogoMark } from "@/components/nav/Logo";
import DomPhone from "@/components/hero/DomPhone";
import { usePhoneMenuProps } from "@/components/hero/PhoneMenu";

const ShowcaseMesh = lazy(() => import("@/components/login/ShowcaseMesh"));

const PHONE_W = 320; // DomPhone's natural width (its radii and bezels are in px, so it is scaled, never resized)

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

/** Reduced motion / touch / no WebGL: the same deep violet as layered radial glows. */
function StaticGradient() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(75% 60% at 78% 18%, rgba(109, 40, 217, 0.85), transparent 70%)," +
          "radial-gradient(70% 55% at 12% 72%, rgba(76, 29, 149, 0.9), transparent 72%)," +
          "radial-gradient(55% 45% at 70% 95%, rgba(139, 92, 246, 0.35), transparent 70%)," +
          "#0A0418",
      }}
    />
  );
}

function Chip({ icon: Icon, title, sub, className, chip, blur }) {
  return (
    <div
      data-chip={chip}
      className={cn(
        "absolute flex items-center gap-3 whitespace-nowrap rounded-2xl border border-white/15 bg-white/[0.08] py-2.5 pl-2.5 pr-4 text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]",
        blur && "backdrop-blur-md",
        className,
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#6D28D9]">
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">{title}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">{sub}</span>
      </span>
    </div>
  );
}

/**
 * Left half of /login (master prompt 8.1, desktop ≥1024 only): a deeper-violet Paper Shaders MeshGradient, the
 * floating DOM phone with the live demo menu, two hero chips, the logo and the hero line as a tagline.
 * The panel is a fixed dark brand surface in both themes (like the phone it frames).
 * WebGL: one context (with the page background that makes 2 of 3), desktop with motion only; touch-size
 * desktops, reduced motion and no-WebGL get the static gradient. Motion: the phone floats on a 7s cycle and tilts
 * a few degrees toward a fine pointer; reduced motion is still.
 */
export default function LoginShowcase() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const isTouch = useIsTouch();
  const menuProps = usePhoneMenuProps();
  const root = useRef(null);
  const stage = useRef(null);
  const natural = useRef(null);
  const [gl, setGl] = useState(false);
  const [box, setBox] = useState({ scale: 0.72, h: 680 });

  useEffect(() => {
    if (!isDesktop || reduced || !supportsWebGL()) {
      setGl(false);
      return undefined;
    }
    const idle = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 300));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setGl(true), { timeout: 1200 });
    return () => cancel(id);
  }, [isDesktop, reduced]);

  // Fit the phone (rendered at its natural 320px) into the space between the logo and the tagline.
  useLayoutEffect(() => {
    const el = stage.current;
    const phone = natural.current;
    if (!el || !phone) return undefined;
    const fit = () => {
      const h = phone.offsetHeight || 680;
      const scale = Math.max(0.42, Math.min(0.92, (el.clientHeight - 24) / h, (el.clientWidth * 0.62) / PHONE_W));
      setBox({ scale, h });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    ro.observe(phone);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (reduced) return undefined;
      gsap.from("[data-enter]", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.1, ease: "mv.out", delay: 0.15 });
      gsap.from("[data-chip]", { scale: 0.85, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: "mv.spring", delay: 0.6 });
      // Ambient float: 7s, 8s and 9s full cycles (no loop faster than 6s).
      gsap.to("[data-float]", { y: -12, duration: 3.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to("[data-chip='a']", { y: -8, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.5 });
      gsap.to("[data-chip='b']", { y: 8, duration: 4.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.5 });
      if (isTouch) return undefined;
      const tilt = root.current.querySelector("[data-tilt]");
      const rotY = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });
      const rotX = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
      const onMove = (e) => {
        const r = root.current.getBoundingClientRect();
        rotY(((e.clientX - r.left) / r.width - 0.5) * 10);
        rotX(-((e.clientY - r.top) / r.height - 0.5) * 7);
      };
      const onLeave = () => {
        rotY(0);
        rotX(0);
      };
      root.current.addEventListener("pointermove", onMove);
      root.current.addEventListener("pointerleave", onLeave);
      const el = root.current;
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { dependencies: [reduced, isTouch], scope: root, revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      className="relative isolate flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-[#0A0418] p-9 text-white shadow-[0_40px_120px_-40px_rgba(76,29,149,0.6)] xl:p-11"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <StaticGradient />
        {gl && (
          <Suspense fallback={null}>
            <ShowcaseMesh />
          </Suspense>
        )}
        {/* Soft floor glow under the phone and a top/bottom shade so the logo and tagline stay legible. */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0418]/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0A0418]/60 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(60% 55% at 50% 50%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(60% 55% at 50% 50%, black, transparent 75%)",
          }}
        />
      </div>

      <div data-enter aria-hidden="true" className="flex items-center gap-2.5">
        <LogoMark className="h-8 w-8" />
        <span className="font-display text-[1.3rem] font-bold tracking-[-0.03em] text-white">Menuverse</span>
      </div>

      <div ref={stage} aria-hidden="true" className="relative flex min-h-0 flex-1 items-center justify-center py-4 [perspective:1400px]">
        <div data-tilt className="relative [transform-style:preserve-3d]">
          <div data-float style={{ width: PHONE_W * box.scale, height: box.h * box.scale }}>
            <div ref={natural} className="origin-top-left" style={{ width: PHONE_W, transform: `scale(${box.scale})` }}>
              <DomPhone menuProps={menuProps} autoCycle={!reduced} interactive={false} className="w-[320px]" />
            </div>
          </div>
          <Chip
            chip="a"
            icon={QrCode}
            title={t("hero.chip1.title")}
            sub={t("hero.chip1.sub")}
            blur={!isTouch}
            className="right-[80%] top-[4%]"
          />
          <Chip
            chip="b"
            icon={Zap}
            title={t("hero.chip2.title")}
            sub={t("hero.chip2.sub")}
            blur={!isTouch}
            className="bottom-[16%] left-[64%]"
          />
        </div>
      </div>

      <p data-enter className="max-w-[26ch] font-display text-[clamp(1.6rem,2.2vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-white">
        {t("hero.h1.line1")} <span className="font-serif-italic font-medium text-[#DDD6FE]">{t("hero.h1.line2")}</span>
      </p>
    </div>
  );
}
