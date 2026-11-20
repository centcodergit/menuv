import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { burstFrom } from "@/components/referral/confetti";

const EASE = [0.16, 1, 0.3, 1];

/**
 * The thank-you state: a checkmark that draws itself (ring, then tick), the title and body, and, right after a
 * submission (`celebrate`), a small violet confetti burst from the mark. Focus moves to the title so keyboard and
 * screen-reader users land on the confirmation. A revisit in the same session shows it still, without confetti.
 */
export default function ThankYou({ celebrate = false, focusOnMount = false }) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const mark = useRef(null);
  const title = useRef(null);
  const draw = celebrate && !reduced;

  useEffect(() => {
    if (focusOnMount) title.current?.focus({ preventScroll: true });
    if (!draw) return undefined;
    const id = window.setTimeout(() => burstFrom(mark.current), 650);
    return () => window.clearTimeout(id);
  }, [draw, focusOnMount]);

  return (
    <div className="flex flex-col items-center px-2 py-6 text-center md:py-10">
      <svg ref={mark} viewBox="0 0 80 80" className="h-20 w-20 text-mv-violet-300 drop-shadow-[0_0_24px_rgb(var(--mv-violet-500)/0.5)]" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="37" className="fill-mv-violet-500/10" />
        <motion.circle
          cx="40"
          cy="40"
          r="37"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          initial={{ pathLength: draw ? 0 : 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        <motion.path
          d="M25 41.5l10 10L56 30"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: draw ? 0 : 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, ease: EASE, delay: draw ? 0.45 : 0 }}
        />
      </svg>
      <h3 ref={title} tabIndex={-1} className="mt-7 font-serif-italic text-[clamp(2rem,4vw,2.75rem)] leading-tight focus-visible:outline-offset-4">
        <span className="text-gradient">{t("feedback.success.title")}</span>
      </h3>
      <p className="mt-3 max-w-md text-lead text-mv-muted">{t("feedback.success.body")}</p>
    </div>
  );
}
