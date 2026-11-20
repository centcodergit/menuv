import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LogoMark } from "@/components/nav/Logo";
import { cn } from "@/lib/utils";

const SPRING = { animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" };

function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-mv-violet-300 motion-safe:animate-bounce"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "1.1s" }}
        />
      ))}
    </span>
  );
}

/**
 * Decorative chat window for 7.4 (Magic UI "Animated List" idea): the greeting, then a typing indicator,
 * then a short reply, appearing one by one when the window scrolls into view. Translated example text.
 */
export default function ChatPreview({ className }) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const root = useRef(null);
  const [step, setStep] = useState(reduced ? 3 : 0);

  useEffect(() => {
    if (reduced) {
      setStep(3);
      return undefined;
    }
    const el = root.current;
    const timers = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timers.push(window.setTimeout(() => setStep(1), 300));
        timers.push(window.setTimeout(() => setStep(2), 1300));
        timers.push(window.setTimeout(() => setStep(3), 2900));
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [reduced]);

  const bubble = "max-w-[85%] rounded-[18px] rounded-bl-md border border-mv-line bg-mv-surface-2 px-4 py-3 text-[15px] leading-relaxed text-mv-text";

  return (
    <div ref={root} aria-hidden="true" className={cn("glass overflow-hidden rounded-card shadow-[0_40px_100px_-40px_rgba(76,29,149,0.7)]", className)}>
      <div className="flex items-center gap-3 border-b border-mv-line px-5 py-4">
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-mv-line bg-mv-surface-2">
          <LogoMark className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-mv-void">
            <span className="absolute h-2 w-2 rounded-full bg-mv-success motion-safe:animate-ping-slow" />
            <span className="h-2 w-2 rounded-full bg-mv-success" />
          </span>
        </span>
        <div>
          <p className="font-display text-base font-semibold text-mv-text">{t("chat.name")}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-mv-success">{t("chat.online")}</p>
        </div>
        <div className="ml-auto flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-mv-line-strong" style={{ background: "var(--mv-line-strong)" }} />
          ))}
        </div>
      </div>
      <ul className="flex min-h-[300px] flex-col justify-end gap-3 px-5 py-6">
        {step >= 1 && (
          <li className="flex animate-in fade-in slide-in-from-bottom-3 duration-500" style={SPRING}>
            <p className={bubble}>{t("chat.greeting")}</p>
          </li>
        )}
        {step === 2 && (
          <li className="flex animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className={cn(bubble, "py-2.5")}>
              <TypingDots />
            </p>
          </li>
        )}
        {step >= 3 && (
          <li className="flex animate-in fade-in slide-in-from-bottom-3 duration-500" style={SPRING}>
            <p className={bubble}>{t("support.preview.reply")}</p>
          </li>
        )}
      </ul>
      <div className="flex items-center gap-2 border-t border-mv-line p-3">
        <span className="flex h-11 flex-1 items-center rounded-input border border-mv-line bg-mv-surface-2 px-4 text-[15px] text-mv-muted">
          {t("chat.placeholder")}
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-mv-violet-500 to-mv-violet-600 text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </span>
      </div>
    </div>
  );
}
