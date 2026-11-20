import { forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Aceternity UI "Stateful Button", rebuilt with Motion and our tokens: the label stays put while a status slot
 * opens beside it, first with a short spinner (loading), then with a check that draws itself (success).
 * `state`: "idle" | "loading" | "success". While busy the button stays focusable but ignores clicks
 * (aria-disabled), and a polite status line tells screen readers `loadingLabel`.
 * Reduced motion: no width spring and no draw (the global reduced-motion CSS also stops the spinner).
 */
const StatefulButton = forwardRef(function StatefulButton(
  { state = "idle", loadingLabel, children, className, onClick, type = "button", ...props },
  ref,
) {
  const reduced = useReducedMotion();
  const busy = state !== "idle";
  const t = reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 };

  return (
    <>
      <button
        ref={ref}
        type={type}
        aria-disabled={busy || undefined}
        onClick={(e) => {
          if (busy) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        className={cn("btn-primary relative overflow-hidden", busy && "cursor-default", className)}
        {...props}
      >
        <motion.span
          aria-hidden="true"
          className="relative flex h-5 shrink-0 items-center justify-center overflow-hidden"
          initial={false}
          animate={{ width: busy ? 20 : 0, marginRight: busy ? 2 : -8, opacity: busy ? 1 : 0 }}
          transition={t}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {state === "loading" && (
              <motion.svg
                key="spin"
                viewBox="0 0 24 24"
                className="absolute h-5 w-5 animate-spin"
                fill="none"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </motion.svg>
            )}
            {state === "success" && (
              <motion.svg
                key="check"
                viewBox="0 0 24 24"
                className="absolute h-5 w-5"
                fill="none"
                initial={{ opacity: 0, scale: reduced ? 1 : 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0 : 0.25, ease: EASE }}
              >
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 0.4, ease: EASE, delay: reduced ? 0 : 0.05 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.span>
        <span className="relative">{children}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "loading" ? loadingLabel : ""}
      </span>
    </>
  );
});

export default StatefulButton;
