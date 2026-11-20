import { forwardRef, useId, useImperativeHandle, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import ChoiceField, { radioKeys } from "@/components/feedback/ChoiceField";

/**
 * Segmented control as an ARIA radiogroup (roving tabindex, arrows move and select). The violet thumb slides to
 * the chosen option with a shared Motion layoutId; nothing is chosen until the visitor picks.
 * `options`: [{ value, label }]. Reduced motion: the thumb jumps.
 */
const SegmentedChoice = forwardRef(function SegmentedChoice({ id, label, options, value, onChange, error }, ref) {
  const reduced = useReducedMotion();
  const thumbId = useId();
  const buttons = useRef([]);
  const current = options.findIndex((o) => o.value === value);
  useImperativeHandle(ref, () => ({ focus: (opts) => buttons.current[Math.max(0, current)]?.focus(opts) }), [current]);

  const select = (index, moveFocus) => {
    onChange(options[index].value);
    if (moveFocus) buttons.current[index]?.focus();
  };

  return (
    <ChoiceField id={id} label={label} error={error} framed={false}>
      {(focusHandlers, { focused, invalid }) => (
          <div
            role="radiogroup"
            aria-labelledby={`${id}-label`}
            aria-required="true"
            aria-invalid={error ? "true" : "false"}
            aria-describedby={`${id}-error`}
            className={cn(
              "grid h-14 grid-cols-2 gap-1 rounded-input border bg-mv-surface-2/40 p-1 transition-[border-color,box-shadow] duration-300",
              invalid
                ? "border-mv-danger"
                : focused
                  ? "border-mv-violet-400 shadow-[0_0_0_4px_rgb(var(--mv-violet-500)/0.14)]"
                  : "border-mv-muted/[0.5] hover:border-mv-muted/[0.75]",
            )}
            {...focusHandlers}
          >
            {options.map((o, i) => {
              const checked = i === current;
              return (
                <button
                  key={String(o.value)}
                  ref={(el) => (buttons.current[i] = el)}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked || (current < 0 && i === 0) ? 0 : -1}
                  onClick={() => select(i, false)}
                  onKeyDown={(e) => radioKeys(e, i, options.length, select)}
                  className={cn(
                    "relative flex min-h-[44px] items-center justify-center rounded-[10px] px-4 text-[0.95rem] font-medium transition-colors duration-300",
                    checked ? "text-white" : "text-mv-muted hover:text-mv-text",
                  )}
                >
                  {checked && (
                    <motion.span
                      layoutId={thumbId}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_0_1px_rgba(139,92,246,0.5),0_6px_20px_-6px_rgba(139,92,246,0.7)]"
                      style={{ background: "linear-gradient(180deg, #8b5cf6, #6d28d9)" }}
                      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 34 }}
                    />
                  )}
                  <span className="relative">{o.label}</span>
                </button>
              );
            })}
          </div>
      )}
    </ChoiceField>
  );
});

export default SegmentedChoice;
