import { useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";
import NumberTicker from "@/components/features/NumberTicker";
import { usePlayWhile } from "@/components/features/useDemoCycle";
import { ANALYTICS, PEAK, dish } from "@/components/features/demoData";

const W = 320;
const BASE = 120;
const TOP = 10;
const MAX = 60;
const xAt = (i) => 6 + i * ((W - 12) / 12);
const yAt = (v) => BASE - (v / MAX) * (BASE - TOP);

/** Smooth line through the points (Catmull-Rom → cubic Bézier). */
function linePath(values) {
  const p = values.map((v, i) => [xAt(i), yAt(v)]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i += 1) {
    const [x0, y0] = p[Math.max(0, i - 1)];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[Math.min(p.length - 1, i + 2)];
    d += ` C${(x1 + (x2 - x0) / 6).toFixed(1)} ${(y1 + (y2 - y0) / 6).toFixed(1)} ${(x2 - (x3 - x1) / 6).toFixed(1)} ${(y2 - (y3 - y1) / 6).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}

const MAX_DISH = Math.max(...ANALYTICS.flatMap((a) => a.dishes.map(([, n]) => n)));

/**
 * 05 Statistics & analytics for the demo restaurant (illustrative numbers, La Bella Italia only):
 * the line draws itself (DrawSVG), the area rises from the baseline, the totals count up (Number Ticker).
 * Loop: two weeks alternate, 6s each. Once: the first week draws and stays. Reduced motion: drawn.
 */
export default function AnalyticsDemo({ active, mode }) {
  const { t, locale } = useI18n();
  const root = useRef(null);
  const tl = useRef(null);
  const [stage, setStage] = useState(mode === "static" ? 0 : -1);
  const paths = useMemo(() => ANALYTICS.map((a) => ({ line: linePath(a.hours), area: `${linePath(a.hours)} L${xAt(12)} ${BASE} L${xAt(0)} ${BASE} Z` })), []);
  const animate = mode !== "static";
  const data = ANALYTICS[Math.max(stage, 0)];

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const lines = q("[data-line]");
      const areas = q("[data-area]");
      const dots = q("[data-dot]");
      const band = q("[data-band]");
      if (mode === "static") {
        setStage(0);
        gsap.set([lines[1], areas[1], dots[1]], { opacity: 0 });
        return undefined;
      }
      gsap.set(lines, { drawSVG: "0% 0%" });
      gsap.set(areas, { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(dots, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(band, { opacity: 0 });

      const t = gsap.timeline({ paused: true, repeat: mode === "loop" ? -1 : 0 });
      const week = (k, at, stay) => {
        t.call(() => setStage(k), null, at + 0.2)
          .fromTo(lines[k], { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1.4, ease: "mv.inOut" }, at + 0.2)
          .fromTo(areas[k], { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: "mv.out" }, at + 0.5)
          .to(band, { opacity: 1, duration: 0.5 }, at + 1.3)
          .fromTo(dots[k], { scale: 0 }, { scale: 1, duration: 0.5, ease: "mv.spring" }, at + 1.4);
        if (stay) return;
        t.to(lines[k], { drawSVG: "100% 100%", duration: 0.7, ease: "mv.inOut" }, at + 5)
          .to(areas[k], { scaleY: 0, duration: 0.6, ease: "mv.inOut" }, at + 5.05)
          .to(dots[k], { scale: 0, duration: 0.3 }, at + 5)
          .to(band, { opacity: 0, duration: 0.4 }, at + 5.2);
      };
      week(0, 0, mode === "once");
      if (mode === "loop") {
        week(1, 6, false);
        t.to({}, { duration: 0.01 }, 11.99);
      }
      tl.current = t;
      return () => {
        tl.current = null;
      };
    },
    { scope: root, dependencies: [mode] },
  );
  usePlayWhile(tl, active, mode);

  const label = "font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.12em] text-mv-muted";
  const peakLeft = ((xAt(PEAK.from) / W) * 100).toFixed(2);
  const peakWidth = (((xAt(PEAK.to) - xAt(PEAK.from)) / W) * 100).toFixed(2);

  return (
    <div ref={root} className="mx-auto flex h-full w-full max-w-[460px] flex-col justify-center gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={label}>
            {t("phone.name")} · {t("features.demo.views")}
          </p>
          <NumberTicker value={stage < 0 ? 0 : data.total} locale={locale} animate={animate} className="mt-1 block font-display text-[1.75rem] font-bold leading-none tracking-[-0.03em] text-mv-text" />
        </div>
        <div className="shrink-0 text-right">
          <p className={label}>{t("features.demo.peak")}</p>
          <p className="mt-1.5 font-display text-[15px] font-semibold tabular-nums leading-none text-mv-violet-300">{PEAK.label}</p>
        </div>
      </div>

      <div>
        <div className="relative">
          <div data-band className="absolute bottom-[8.3%] top-0 rounded-md border-x border-dashed border-mv-violet-400/40 bg-mv-violet-500/[0.08]" style={{ left: `${peakLeft}%`, width: `${peakWidth}%` }} />
          <svg viewBox={`0 0 ${W} 131`} className="relative block w-full overflow-visible" fill="none">
            <defs>
              <linearGradient id="mv-feat-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: "rgb(var(--mv-violet-500))", stopOpacity: 0.38 }} />
                <stop offset="100%" style={{ stopColor: "rgb(var(--mv-violet-500))", stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            {[0.33, 0.66].map((f) => (
              <line key={f} x1="0" x2={W} y1={TOP + (BASE - TOP) * f} y2={TOP + (BASE - TOP) * f} strokeDasharray="2 4" style={{ stroke: "var(--mv-line)" }} />
            ))}
            <line x1="0" x2={W} y1={BASE} y2={BASE} style={{ stroke: "var(--mv-line-strong)" }} />
            {paths.map((p, k) => (
              <g key={k}>
                <path data-area d={p.area} fill="url(#mv-feat-area)" />
                <path data-line d={p.line} strokeWidth="2" strokeLinecap="round" style={{ stroke: "rgb(var(--mv-violet-300))" }} />
                <circle data-dot cx={xAt(9)} cy={yAt(ANALYTICS[k].hours[9])} r="4" strokeWidth="2" style={{ fill: "rgb(var(--mv-surface))", stroke: "rgb(var(--mv-violet-300))" }} />
              </g>
            ))}
          </svg>
        </div>
        <div className={`${label} mt-1.5 flex justify-between text-[9px]`}>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      <ul className="space-y-1.5">
        {data.dishes.map(([id, views]) => {
          const d = dish(id);
          const shown = stage < 0 ? 0 : views;
          return (
            <li key={id} className="flex items-center gap-2.5 text-[12.5px]">
              <span className="w-4 text-center text-[13px] leading-none">{d.emoji}</span>
              <span className="w-[7.5rem] shrink-0 truncate text-mv-text">{d.name}</span>
              <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-mv-text/10">
                <span className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-mv-violet-600 to-mv-violet-300 transition-transform duration-1000 ease-mv-out" style={{ transform: `scaleX(${shown / MAX_DISH})` }} />
              </span>
              <NumberTicker value={shown} locale={locale} animate={animate} className="w-9 text-right font-mono text-[11px] text-mv-muted" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
