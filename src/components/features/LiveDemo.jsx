import { useRef, useState } from "react";
import NumberFlow from "@number-flow/react";
import { useI18n } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePlayWhile } from "@/components/features/useDemoCycle";
import { LIVE_DISH, LIVE_PRICES, dish } from "@/components/features/demoData";

const ITEM = dish(LIVE_DISH);
const EUR = { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 };
// Canvas 300 x 190: the SVG and the phones share these coordinates (the box keeps that aspect ratio).
const PHONES = [50, 150, 250];
const WIRES = ["M150 62 C150 88 50 80 50 106", "M150 62 L150 106", "M150 62 C150 88 250 80 250 106"];

/**
 * 02 Real-time updates: the Bruschetta row changes price every 3s (€8.50 ↔ €9.00, NumberFlow), the "live" dot
 * pulses, a light runs down three wires and the three phones update a beat later. One loop = 6s.
 */
export default function LiveDemo({ active, mode }) {
  const { t, locale } = useI18n();
  const root = useRef(null);
  const tl = useRef(null);
  const [price, setPrice] = useState(mode === "static" ? LIVE_PRICES[1] : LIVE_PRICES[0]);
  const [echo, setEcho] = useState(price);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (mode === "static") {
        setPrice(LIVE_PRICES[1]);
        setEcho(LIVE_PRICES[1]);
        return undefined;
      }
      gsap.set(q("[data-pulse]"), { drawSVG: "0% 0%", opacity: 0 });
      gsap.set(q("[data-ring]"), { scale: 0.6, opacity: 0 });
      gsap.set(q("[data-flash]"), { opacity: 0 });

      const t = gsap.timeline({ paused: true, repeat: mode === "loop" ? -1 : 0 });
      const change = (at, value) => {
        t.call(() => setPrice(value), null, at)
          .fromTo(q("[data-ring]"), { scale: 0.6, opacity: 0.7 }, { scale: 2.4, opacity: 0, duration: 1.1, ease: "mv.out", stagger: 0.12 }, at)
          .set(q("[data-pulse]"), { opacity: 1 }, at + 0.15)
          .fromTo(q("[data-pulse]"), { drawSVG: "0% 18%" }, { drawSVG: "82% 100%", duration: 0.7, ease: "mv.inOut", stagger: 0.06 }, at + 0.15)
          .to(q("[data-pulse]"), { opacity: 0, duration: 0.2, stagger: 0.06 }, at + 0.75)
          .call(() => setEcho(value), null, at + 0.85)
          .fromTo(q("[data-flash]"), { opacity: 1 }, { opacity: 0, duration: 0.9, ease: "power2.out", stagger: 0.06 }, at + 0.85);
      };
      change(0.4, LIVE_PRICES[1]);
      if (mode === "loop") {
        change(3.4, LIVE_PRICES[0]);
        t.to({}, { duration: 0.01 }, 5.99);
      }
      tl.current = t;
      return () => {
        tl.current = null;
      };
    },
    { scope: root, dependencies: [mode] },
  );
  usePlayWhile(tl, active, mode);

  const animated = mode !== "static";
  return (
    <div ref={root} className="mx-auto flex h-full min-h-[190px] w-full max-w-[320px] items-center">
      <div className="relative w-full" style={{ aspectRatio: "300 / 190" }}>
        <svg viewBox="0 0 300 190" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
          {WIRES.map((d) => (
            <path key={d} d={d} strokeWidth="1" strokeDasharray="2 3" style={{ stroke: "var(--mv-line-strong)" }} />
          ))}
          {WIRES.map((d) => (
            <path key={`p-${d}`} data-pulse d={d} strokeWidth="2" strokeLinecap="round" style={{ stroke: "rgb(var(--mv-violet-300))", filter: "drop-shadow(0 0 4px rgb(var(--mv-violet-500) / 0.9))" }} />
          ))}
        </svg>

        {/* The menu row being edited */}
        <div className="absolute inset-x-[3%] top-0 flex items-center gap-3 rounded-2xl border border-mv-line bg-mv-surface-2 px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mv-text/[0.06] text-lg">{ITEM.emoji}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold leading-tight text-mv-text">{ITEM.name}</span>
            <span className="mt-1 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-mv-success">
              <span className="relative flex h-1.5 w-1.5">
                <span data-ring className="absolute inset-0 rounded-full bg-mv-success opacity-0" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-mv-success shadow-[0_0_6px_rgb(var(--mv-success)/0.8)]" />
              </span>
              {t("features.demo.live")}
            </span>
          </span>
          <span className="relative shrink-0">
            <span data-ring className="absolute inset-0 rounded-full border border-mv-violet-400 opacity-0" />
            <NumberFlow value={price} locales={locale} format={EUR} animated={animated} className="text-[15px] font-semibold tabular-nums text-mv-violet-300" />
          </span>
        </div>

        {/* Three customer phones */}
        {PHONES.map((x) => (
          <div key={x} className="absolute bottom-0 w-[15%] -translate-x-1/2" style={{ left: `${(x / 300) * 100}%`, aspectRatio: "9 / 16" }}>
            <div className="relative h-full rounded-[9px] border border-mv-line-strong bg-mv-surface-2 p-[3px]">
              <span data-flash className="pointer-events-none absolute -inset-px rounded-[9px] border border-mv-violet-400 opacity-0 shadow-[0_0_14px_rgb(var(--mv-violet-500)/0.6)]" />
              <div className="flex h-full flex-col items-center gap-[3px] rounded-[6px] bg-mv-void px-[3px] pt-2.5">
                <span className="h-[3px] w-3/5 rounded-full bg-mv-text/40" />
                <span className="mt-0.5 flex w-full flex-col items-center rounded-[4px] bg-mv-text/[0.07] py-[3px]">
                  <span className="text-[8px] leading-none">{ITEM.emoji}</span>
                  <NumberFlow value={echo} locales={locale} format={EUR} animated={animated} className="mt-[2px] text-[8.5px] font-semibold leading-none tabular-nums text-mv-violet-300" />
                </span>
                <span className="h-[3px] w-4/5 rounded-full bg-mv-text/15" />
                <span className="h-[3px] w-3/5 rounded-full bg-mv-text/15" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
