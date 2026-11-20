import { Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Counter from "@/components/fx/Counter";
import { splitFifty, STAGE_DONE, STEP_KEYS } from "@/components/referral/steps";

/** Step 3's text with its "50" rolling (React Bits Counter) once the step is reached; the real number stays in the text for screen readers. */
function FiftyText({ text, rolled }) {
  const parts = splitFifty(text);
  if (!parts) return text;
  return (
    <>
      {parts[0]}
      <span className="sr-only">50</span>
      <Counter value={rolled ? 50 : 0} duration={1.4} className="text-mv-violet-300" />
      {parts[1]}
    </>
  );
}

/**
 * The 4 referral steps as a stepper: horizontal from 640px, a compact vertical list below. `stage` comes from the
 * diagram's timeline (1-4 = the step being played, STAGE_DONE = finished), so the active step follows the beams.
 * Connectors fill as the stages pass. Done steps show a check; the current one glows.
 */
export default function ReferralStepper({ stage, className }) {
  const t = useT();
  const complete = stage >= STAGE_DONE;

  return (
    <ol className={cn("relative grid gap-5 sm:grid-cols-4 sm:gap-0", className)}>
      {STEP_KEYS.map((key, i) => {
        const n = i + 1;
        const state = complete || n < stage ? "done" : n === stage ? "active" : "pending";
        const last = n === STEP_KEYS.length;
        const filled = complete || stage > n;
        return (
          <li
            key={key}
            data-step={n}
            data-state={state}
            aria-current={state === "active" ? "step" : undefined}
            className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:gap-0 sm:px-3 sm:text-center"
          >
            {!last && (
              <span
                aria-hidden="true"
                className="absolute left-[19px] top-11 h-[calc(100%-1.75rem)] w-px bg-mv-line-strong sm:left-[calc(50%+30px)] sm:top-5 sm:h-px sm:w-[calc(100%-60px)]"
              >
                <span
                  className={cn(
                    "absolute inset-0 origin-top bg-gradient-to-b from-mv-violet-300 to-mv-violet-500 transition-transform duration-700 ease-mv-out sm:origin-left sm:bg-gradient-to-r",
                    filled ? "scale-100" : "scale-0",
                  )}
                />
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative grid h-10 w-10 shrink-0 place-items-center rounded-full border font-mono text-[12px] font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-500 ease-mv-out",
                state === "pending" && "border-mv-line-strong bg-mv-surface text-mv-muted",
                state === "done" && "border-mv-violet-400/60 bg-mv-violet-500/15 text-mv-violet-200",
                state === "active" &&
                  "scale-110 border-mv-violet-300 bg-gradient-to-b from-mv-violet-500 to-mv-violet-600 text-white shadow-[0_0_32px_-6px_rgb(var(--mv-violet-500)/0.9)]",
              )}
            >
              {state === "done" ? <Check size={16} strokeWidth={2.25} /> : String(n).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "pt-2 font-display text-[1.02rem] font-semibold leading-snug transition-colors duration-500 sm:mt-4 sm:max-w-[16rem] sm:pt-0",
                state === "pending" ? "text-mv-muted" : "text-mv-text",
              )}
            >
              {key === "step3" ? <FiftyText text={t("referral.step3")} rolled={stage >= 3} /> : t(`referral.${key}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
