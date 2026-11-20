import { useId, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedShinyText from "@/components/fx/AnimatedShinyText";

export const BILLING_OPTIONS = ["monthly", "yearly"];
const SPRING = { type: "spring", stiffness: 460, damping: 34, mass: 0.9 };
const CONFETTI_COLORS = ["#C4B5FD", "#8B5CF6", "#E879F9"];

// canvas-confetti is fetched the first time someone switches to yearly, never on page load.
let confettiLib = null;
async function burstFrom(el) {
  confettiLib ??= import("canvas-confetti").then((m) => m.default);
  const confetti = await confettiLib;
  const r = el.getBoundingClientRect();
  confetti({
    particleCount: 40,
    spread: 70,
    startVelocity: 24,
    gravity: 0.9,
    ticks: 150,
    scalar: 0.8,
    origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
    colors: CONFETTI_COLORS,
    disableForReducedMotion: true,
  });
}

/**
 * 7.8 billing toggle: a pill switch "Μηνιαία | Ετήσια" whose thumb slides on a spring (Motion layoutId), next to
 * the yearly badge (Animated Shiny Text). Switching to yearly fires a small confetti burst from the badge.
 * A11y: radiogroup labelled by `pricing.billing`; arrows / Home / End move the choice; the yearly option is
 * described by the badge. Reduced motion: the thumb jumps, no confetti.
 */
export default function BillingToggle({ billing, onChange, reduced, t }) {
  const id = useId();
  const badge = useRef(null);
  const options = useRef([]);

  const select = (value, focus = false) => {
    if (focus) options.current[BILLING_OPTIONS.indexOf(value)]?.focus();
    if (value === billing) return;
    onChange(value);
    if (value === "yearly" && !reduced && badge.current) burstFrom(badge.current);
  };

  const onKeyDown = (e) => {
    const i = BILLING_OPTIONS.indexOf(billing);
    const n = BILLING_OPTIONS.length;
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(BILLING_OPTIONS[(next + n) % n], true);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span id={`${id}-label`} className="sr-only">
        {t("pricing.billing")}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        onKeyDown={onKeyDown}
        className="relative inline-flex rounded-full border border-mv-line bg-mv-surface/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        {BILLING_OPTIONS.map((value, i) => {
          const active = billing === value;
          return (
            <button
              key={value}
              ref={(el) => {
                options.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              aria-describedby={value === "yearly" ? `${id}-badge` : undefined}
              data-billing={value}
              onClick={() => select(value)}
              className={cn(
                "relative min-h-[44px] min-w-[7.5rem] rounded-full px-5 text-sm font-medium transition-colors duration-300",
                active ? "text-white" : "text-mv-muted hover:text-mv-text",
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${id}-thumb`}
                  transition={reduced ? { duration: 0 } : SPRING}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #8b5cf6, #6d28d9)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(139,92,246,0.45), 0 6px 20px -8px rgba(139,92,246,0.7)",
                  }}
                />
              )}
              <span className="relative">{t(`pricing.${value}`)}</span>
            </button>
          );
        })}
      </div>
      <span
        ref={badge}
        id={`${id}-badge`}
        data-yearly-badge
        className={cn(
          "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-500",
          billing === "yearly" ? "border-mv-violet-400/50 bg-mv-violet-500/10" : "border-mv-line bg-mv-surface/60",
        )}
      >
        <Sparkles size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-mv-violet-300" />
        <AnimatedShinyText>{t("pricing.yearlyBadge")}</AnimatedShinyText>
      </span>
    </div>
  );
}
