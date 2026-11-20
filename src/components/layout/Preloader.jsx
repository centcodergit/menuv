import { useMemo, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { markIntroDone } from "@/lib/intro";
import { SITE_QR_21, darkModules } from "@/content/qr";

const SIZE = SITE_QR_21.size;
const C = SIZE / 2;

/**
 * Preloader "Mise en place" (master prompt 6.1), at most 1.6s:
 *   0.00-0.55  QR modules appear in random order until they form the code
 *   0.50-0.82  a violet laser line sweeps across it (the scan)
 *   0.82-1.02  the code collapses into one glowing dot
 *   1.02-1.60  the dot opens as a circle that reveals the hero (the hero entrance starts here)
 * Counter 000 to 100 bottom-left, MENUVERSE bottom-right. The H1 is already in the DOM underneath (LCP).
 */
export default function Preloader({ onFinish }) {
  const root = useRef(null);
  const lenis = useLenis();
  const modules = useMemo(() => darkModules(SITE_QR_21), []);

  useGSAP(
    () => {
      const el = root.current;
      const rects = el.querySelectorAll("[data-module]");
      const counter = el.querySelector("[data-counter]");
      const count = { v: 0 };
      const html = document.documentElement;
      const prevOverflow = html.style.overflow;
      html.style.overflow = "hidden";
      lenis?.stop();
      // Lenis runs GSAP with lag smoothing off; a long task while the page boots would then make the intro
      // jump to its end. Smooth over stalls while the preloader plays, and start it after the first paint.
      gsap.ticker.lagSmoothing(500, 33);

      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        html.style.overflow = prevOverflow;
        gsap.ticker.lagSmoothing(0);
        lenis?.start();
      };

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          release();
          onFinish();
        },
      });
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => tl.play());
      });

      tl.from(
        rects,
        {
          scale: 0,
          autoAlpha: 0,
          transformOrigin: "50% 50%",
          duration: 0.2,
          ease: "mv.out",
          stagger: { each: 0.35 / rects.length, from: "random" },
        },
        0,
      )
        .to(count, {
          v: 100,
          duration: 1.02,
          ease: "power2.inOut",
          onUpdate: () => {
            counter.textContent = String(Math.round(count.v)).padStart(3, "0");
          },
        }, 0)
        .fromTo("[data-scan]", { y: 0, autoAlpha: 0 }, { y: SIZE, autoAlpha: 1, duration: 0.32, ease: "mv.inOut" }, 0.5)
        .to("[data-scan]", { autoAlpha: 0, duration: 0.1 }, 0.78)
        .to("[data-qr-glow]", { opacity: 1, duration: 0.15, yoyo: true, repeat: 1 }, 0.76)
        .to(
          rects,
          {
            x: (i) => C - (modules[i][0] + 0.5),
            y: (i) => C - (modules[i][1] + 0.5),
            scale: 0.15,
            duration: 0.22,
            ease: "mv.inOut",
            stagger: { each: 0.06 / rects.length, from: "edges" },
          },
          0.82,
        )
        .fromTo("[data-dot]", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.16, ease: "mv.spring" }, 0.94)
        .set("[data-qr]", { autoAlpha: 0 }, 1.02)
        .call(() => markIntroDone({ remember: true }), null, 1.02)
        .fromTo(
          el,
          { "--hole": "0px" },
          { "--hole": () => `${Math.hypot(window.innerWidth, window.innerHeight) / 2 + 40}px`, duration: 0.58, ease: "mv.inOut" },
          1.02,
        )
        .to("[data-dot]", { scale: 2.2, autoAlpha: 0, duration: 0.3, ease: "mv.out" }, 1.02)
        .to("[data-meta]", { autoAlpha: 0, duration: 0.25 }, 1.02);

      return () => {
        cancelAnimationFrame(frame);
        release();
      };
    },
    { scope: root },
  );

  const mask = "radial-gradient(circle at 50% 50%, transparent var(--hole), #000 calc(var(--hole) + 1px))";

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-curtain"
      style={{ "--hole": "0px", WebkitMaskImage: mask, maskImage: mask }}
    >
      <div className="absolute inset-0 bg-mv-void" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(40% 35% at 50% 50%, rgb(var(--mv-violet-600) / 0.14), transparent 70%)" }} />

      <div className="absolute left-1/2 top-1/2 h-[min(42vmin,240px)] w-[min(42vmin,240px)] -translate-x-1/2 -translate-y-1/2">
        <svg data-qr viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="mv-scan" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#8B5CF6" stopOpacity="0" />
              <stop offset="0.5" stopColor="#C4B5FD" />
              <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            <filter id="mv-scan-glow" x="-20%" y="-400%" width="140%" height="900%">
              <feGaussianBlur stdDeviation="0.35" />
            </filter>
          </defs>
          <g data-qr-glow opacity="0" style={{ filter: "drop-shadow(0 0 1px rgba(167,139,250,0.9))" }}>
            {modules.map(([x, y]) => (
              <rect key={`g${x}-${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.14} fill="#A78BFA" />
            ))}
          </g>
          {modules.map(([x, y]) => (
            <rect data-module key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.14} fill="#F5F3FF" />
          ))}
          <g data-scan opacity="0">
            <rect x={-1} y={-0.6} width={SIZE + 2} height={1.2} fill="url(#mv-scan)" opacity="0.35" filter="url(#mv-scan-glow)" />
            <rect x={-1} y={-0.06} width={SIZE + 2} height={0.12} fill="url(#mv-scan)" />
          </g>
        </svg>
        <span
          data-dot
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mv-violet-200 opacity-0"
          style={{ boxShadow: "0 0 18px 6px rgba(139,92,246,0.85), 0 0 60px 18px rgba(124,58,237,0.45)" }}
        />
      </div>

      <div data-meta className="absolute inset-x-0 bottom-0 flex items-end justify-between px-gutter pb-8 font-mono text-label uppercase text-mv-muted">
        <span data-counter className="tabular-nums text-mv-text">000</span>
        <span>MENUVERSE</span>
      </div>
    </div>
  );
}
