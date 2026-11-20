import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const CYCLE_MS = 3500;

/**
 * Aceternity "Placeholders And Vanish Input", rebuilt: the placeholder cycles through example values (one every
 * 3.5s, paused while the field is focused or filled), and `vanish()` turns the typed text into particles that
 * drift away left to right. The parent decides when to vanish (after its own validation), via the ref.
 */
const VanishInput = forwardRef(function VanishInput(
  { id, value, onChange, placeholders = [], label, submitLabel, disabled, invalid, describedBy, className, inputProps },
  ref,
) {
  const reduced = useReducedMotion();
  const input = useRef(null);
  const canvas = useRef(null);
  const frame = useRef(0);
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Placeholder rotation: only while idle, empty and on screen.
  useEffect(() => {
    if (placeholders.length < 2 || focused || value || reduced) return undefined;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % placeholders.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [placeholders.length, focused, value, reduced]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const vanish = useCallback(() => {
    const el = input.current;
    const cv = canvas.current;
    if (!el || !cv || !value) return Promise.resolve();
    if (reduced) return Promise.resolve();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    cv.width = Math.ceil(rect.width * dpr);
    cv.height = Math.ceil(rect.height * dpr);
    cv.style.width = `${rect.width}px`;
    cv.style.height = `${rect.height}px`;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    ctx.textBaseline = "middle";
    const padLeft = parseFloat(style.paddingLeft) - el.scrollLeft;
    ctx.fillText(value, padLeft, rect.height / 2);

    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const particles = [];
    const step = Math.max(2, Math.round(2 * dpr));
    let maxX = 1;
    for (let y = 0; y < cv.height; y += step) {
      for (let x = 0; x < cv.width; x += step) {
        const i = (y * cv.width + x) * 4;
        if (data[i + 3] > 80) {
          particles.push({ x: x / dpr, y: y / dpr, r: step / dpr / 1.6, c: `rgba(${data[i]},${data[i + 1]},${data[i + 2]},`, vx: 0, vy: 0, a: 1 });
          maxX = Math.max(maxX, x / dpr);
        }
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setAnimating(true);

    return new Promise((resolve) => {
      const start = performance.now();
      const sweep = 650;
      const tick = (now) => {
        const t = now - start;
        const front = (t / sweep) * (maxX + 40);
        ctx.clearRect(0, 0, rect.width, rect.height);
        let alive = 0;
        for (const p of particles) {
          if (p.x < front) {
            if (p.vx === 0) {
              p.vx = 0.6 + Math.random() * 1.8;
              p.vy = (Math.random() - 0.5) * 1.6;
            }
            p.x += p.vx;
            p.y += p.vy;
            p.a -= 0.02 + Math.random() * 0.02;
          }
          if (p.a > 0) {
            alive += 1;
            ctx.fillStyle = `${p.c}${p.a.toFixed(3)})`;
            ctx.fillRect(p.x, p.y, p.r, p.r);
          }
        }
        if (alive && t < 2000) frame.current = requestAnimationFrame(tick);
        else {
          ctx.clearRect(0, 0, rect.width, rect.height);
          setAnimating(false);
          resolve();
        }
      };
      frame.current = requestAnimationFrame(tick);
    });
  }, [value, reduced]);

  useImperativeHandle(ref, () => ({ vanish, focus: () => input.current?.focus() }), [vanish]);

  const showPlaceholder = !value && !animating;

  return (
    <div
      className={cn(
        "relative flex h-14 w-full items-center overflow-hidden rounded-full border bg-mv-surface/80 pl-5 pr-1.5 shadow-[0_20px_60px_-30px_rgba(76,29,149,0.7)] transition-[border-color,box-shadow] duration-300 md:h-16",
        invalid ? "border-mv-danger/70" : focused ? "border-mv-violet-400/70 shadow-[0_0_0_4px_rgb(var(--mv-violet-500)/0.15)]" : "border-mv-line-strong",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        ref={input}
        id={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn("relative z-[1] h-full min-w-0 flex-1 bg-transparent text-base text-mv-text outline-none md:text-lg", animating && "text-transparent")}
        {...inputProps}
      />
      <canvas ref={canvas} aria-hidden="true" className={cn("pointer-events-none absolute left-0 top-0 z-[2]", !animating && "invisible")} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-5 right-36 flex items-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {showPlaceholder && (
            <motion.span
              key={`ph-${index}`}
              initial={reduced ? { opacity: 0 } : { y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: -12, opacity: 0 }}
              transition={{ duration: 0.35, ease: "linear" }}
              className="truncate text-base text-mv-muted md:text-lg"
            >
              {placeholders[index]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="btn-primary relative z-[3] !min-h-[44px] shrink-0 !px-5 !text-sm md:!min-h-[52px] md:!px-6 md:!text-base"
      >
        {submitLabel}
        <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
});

export default VanishInput;
