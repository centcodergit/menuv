import { forwardRef } from "react";
import { motion } from "framer-motion";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** "Your Name *" → "Your Name" (the asterisk is drawn separately and hidden from screen readers; fields carry aria-required). */
export const stripRequired = (label) => String(label).replace(/\s*\*\s*$/, "");

/** The label text with its violet required mark (both visual only where the label is also given another way). */
export function LabelText({ text }) {
  return (
    <>
      {stripRequired(text)}
      <span aria-hidden="true" className="text-mv-violet-300">
        {" *"}
      </span>
    </>
  );
}

/**
 * Outlined field frame shared by every form control: a notched hairline (a <fieldset>/<legend> pair, so the lifted
 * label sits in a real gap in the border over translucent glass), the violet focus scan line along the bottom border,
 * and the error line underneath. The frame is purely visual (aria-hidden); the control inside owns the semantics.
 * `floated`: the label is lifted into the border (focus or value). `focused`: draws the scan line.
 */
const FieldShell = forwardRef(function FieldShell(
  { legend, floated, focused, invalid, errorId, error, className, frameClassName, children },
  ref,
) {
  const reduced = useReducedMotion();
  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className={cn("group/field relative rounded-input bg-mv-surface-2/40 transition-colors duration-300", frameClassName)}>
        <fieldset
          aria-hidden="true"
          className={cn(
            legend != null ? "-top-[6px]" : "top-0",
            "pointer-events-none absolute inset-x-0 bottom-0 m-0 min-w-0 overflow-hidden rounded-input border px-[10px] text-left transition-[border-color,box-shadow] duration-300",
            invalid
              ? "border-mv-danger"
              : focused
                ? "border-mv-violet-400 shadow-[0_0_0_4px_rgb(var(--mv-violet-500)/0.14)]"
                : "border-mv-muted/[0.5] group-hover/field:border-mv-muted/[0.75]",
          )}
        >
          {legend != null && (
          <legend
            className={cn(
              "invisible float-none block h-3 w-auto overflow-hidden whitespace-nowrap p-0 text-[12px] leading-3",
              floated ? "max-w-full transition-[max-width] duration-100 [transition-delay:40ms]" : "max-w-[0.01px] transition-[max-width] duration-75",
            )}
          >
            <span className="inline-block px-1">{legend}</span>
          </legend>
          )}
        </fieldset>
        {/* Scan line: a violet underline sweeps in from the left along the bottom border while focused. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-input">
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-mv-violet-600 via-mv-violet-400 to-mv-violet-200 transition-transform duration-700 ease-mv-out",
              focused && !invalid ? "scale-x-100" : "scale-x-0",
            )}
          />
          {focused && !invalid && !reduced && (
            <motion.span
              className="absolute bottom-0 h-[3px] w-12 -translate-x-full rounded-full bg-mv-violet-200 blur-[2px]"
              initial={{ left: "0%", opacity: 0 }}
              animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.8, times: [0, 0.15, 0.7, 1] } }}
            />
          )}
        </span>
        {children}
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
});

export default FieldShell;

/** The error line under a field (live region, so the message is announced). */
export function FieldError({ id, error }) {
  return (
    <div id={id} aria-live="polite" className="min-h-0">
      {error && (
        <p className="flex items-center gap-1.5 px-1 pt-2 text-sm font-medium text-mv-danger">
          <CircleAlert size={15} strokeWidth={2} aria-hidden="true" className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
