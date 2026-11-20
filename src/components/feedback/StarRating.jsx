import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import ChoiceField, { radioKeys } from "@/components/feedback/ChoiceField";

const STARS = [1, 2, 3, 4, 5];
const SPARKS = [0, 60, 120, 180, 240, 300];

/** A tiny sparkle burst around the star that was just chosen (keyed, so each pick replays it). */
function Sparkle() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {SPARKS.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.span
            key={deg}
            className="absolute left-1/2 top-1/2 -ml-[2px] -mt-[2px] h-1 w-1 rounded-full bg-mv-violet-200 shadow-[0_0_6px_rgb(var(--mv-violet-400))]"
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: Math.cos(rad) * 22, y: Math.sin(rad) * 22, scale: [0.4, 1.2, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </span>
  );
}

/**
 * 1-5 rating as an ARIA radiogroup of five star buttons (roving tabindex; arrows move and select; each star is
 * labelled "{n} out of 5 stars"). Hover (mouse only) previews the fill; choosing fills with a spring, staggered from
 * the first star, and sparkles around the chosen one. Reduced motion: instant fill, no sparkle.
 */
const StarRating = forwardRef(function StarRating({ id, label, starLabel, value, onChange, error }, ref) {
  const reduced = useReducedMotion();
  const buttons = useRef([]);
  const [preview, setPreview] = useState(0);
  const [burst, setBurst] = useState(0); // increments on every pick so the sparkle replays
  useImperativeHandle(ref, () => ({ focus: (opts) => buttons.current[Math.max(0, value - 1)]?.focus(opts) }), [value]);

  const shown = preview || value;
  const select = (index, moveFocus) => {
    onChange(index + 1);
    setBurst((b) => b + 1);
    if (moveFocus) buttons.current[index]?.focus();
  };

  return (
    <ChoiceField id={id} label={label} error={error}>
      {(focusHandlers) => (
        <div className="px-2">
          <div
            role="radiogroup"
            aria-labelledby={`${id}-label`}
            aria-required="true"
            aria-invalid={error ? "true" : "false"}
            aria-describedby={`${id}-error`}
            className="flex h-14 w-fit items-center"
            onPointerLeave={() => setPreview(0)}
            {...focusHandlers}
          >
            {STARS.map((n, i) => {
              const filled = n <= shown;
              const previewing = preview > 0 && preview !== value;
              const tabbable = value ? n === value : n === 1;
              return (
                <button
                  key={n}
                  ref={(el) => (buttons.current[i] = el)}
                  type="button"
                  role="radio"
                  aria-checked={n === value}
                  aria-label={starLabel(n)}
                  tabIndex={tabbable ? 0 : -1}
                  onClick={() => select(i, false)}
                  onKeyDown={(e) => radioKeys(e, i, STARS.length, select)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setPreview(n)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-offset-0"
                >
                  <Star size={28} strokeWidth={1.5} aria-hidden="true" className={cn("transition-colors duration-200", filled ? "text-mv-violet-400" : "text-mv-muted")} />
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{ scale: filled ? 1 : 0, opacity: filled ? (previewing ? 0.55 : 1) : 0 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 520, damping: 17, delay: !previewing && filled ? i * 0.035 : 0, opacity: { duration: 0.15 } }
                    }
                  >
                    <Star size={28} strokeWidth={1.5} className="fill-mv-violet-400 text-mv-violet-300 drop-shadow-[0_0_8px_rgb(var(--mv-violet-500)/0.55)]" />
                  </motion.span>
                  {!reduced && burst > 0 && n === value && <Sparkle key={burst} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </ChoiceField>
  );
});

export default StarRating;
