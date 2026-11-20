import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { NAV_SECTIONS, useGoToSection } from "@/hooks/useNavigation";
import { TransitionLink } from "@/providers/PageTransition";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/nav/ThemeToggle";

/**
 * React Bits "Staggered Menu", rebuilt with GSAP and re-themed (master prompt 6.4, mobile):
 * violet pre-layers sweep in, then the panel, then large Commissioner links rise one by one.
 * Language and theme controls at the bottom. Closes on link tap, Escape, or the close button.
 * Focus is trapped inside while open and returns to the hamburger on close.
 */
export default function MobileMenu({ open, onClose, returnFocusRef }) {
  const { t, lang, setLang } = useI18n();
  const { isAuthenticated } = useAuth();
  const go = useGoToSection();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const root = useRef(null);
  const tl = useRef(null);

  useGSAP(
    () => {
      gsap.set(root.current, { autoAlpha: 0 });
      gsap.set("[data-layer]", { xPercent: 100 });
      tl.current = gsap
        .timeline({ paused: true })
        .set(root.current, { autoAlpha: 1 })
        .to("[data-layer]", { xPercent: 0, duration: reduced ? 0.01 : 0.55, ease: "mv.inOut", stagger: reduced ? 0 : 0.07 })
        .from("[data-link]", { yPercent: 120, rotate: 4, duration: reduced ? 0.01 : 0.8, ease: "mv.out", stagger: 0.06 }, "-=0.25")
        .from("[data-foot]", { y: 16, autoAlpha: 0, duration: reduced ? 0.01 : 0.5, stagger: 0.05 }, "-=0.5");
    },
    { scope: root, dependencies: [reduced] },
  );

  useEffect(() => {
    if (!tl.current) return undefined;
    if (open) {
      tl.current.timeScale(1).play();
      lenis?.stop();
      const first = root.current.querySelector("[data-focus-first]");
      window.setTimeout(() => first?.focus(), 50);
    } else {
      tl.current.timeScale(1.6).reverse();
      lenis?.start();
    }
    return undefined;
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        returnFocusRef?.current?.focus();
      }
      if (e.key !== "Tab") return;
      const focusables = [...root.current.querySelectorAll("a[href], button:not([disabled])")];
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, returnFocusRef]);

  const close = () => {
    onClose();
    returnFocusRef?.current?.focus();
  };

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.menu")}
      aria-hidden={!open}
      inert={open ? undefined : ""}
      className="invisible fixed inset-0 z-curtain lg:hidden"
    >
      <div data-layer className="absolute inset-0 bg-mv-violet-600" />
      <div data-layer className="absolute inset-0 bg-mv-plum-800" />
      <div data-layer className="absolute inset-0 flex flex-col bg-mv-void" data-lenis-prevent>
        <div className="flex items-center justify-between px-gutter pt-5">
          <span className="font-mono text-label uppercase text-mv-muted">{t("nav.menu")}</span>
          <button
            type="button"
            onClick={close}
            aria-label={t("nav.close")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mv-line text-mv-text"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center px-gutter" aria-label={t("a11y.mainNav")}>
          <ul className="space-y-2">
            {NAV_SECTIONS.map((s, i) => (
              <li key={s.id} className="overflow-hidden">
                <a
                  href={`/#${s.id}`}
                  data-link
                  data-focus-first={i === 0 ? "" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    window.setTimeout(() => go(s.id), 250);
                  }}
                  className="flex items-baseline gap-4 py-1 font-display text-[clamp(2.4rem,11vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.04em] text-mv-text"
                >
                  <span className="font-mono text-sm font-medium tracking-normal text-mv-violet-300">0{i + 1}</span>
                  {t(s.key)}
                </a>
              </li>
            ))}
            {!isAuthenticated && (
              <li className="overflow-hidden">
                <TransitionLink
                  to="/login"
                  data-link
                  onClick={onClose}
                  className="flex items-baseline gap-4 py-1 font-display text-[clamp(2.4rem,11vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.04em] text-gradient"
                >
                  <span className="font-mono text-sm font-medium tracking-normal text-mv-violet-300">0{NAV_SECTIONS.length + 1}</span>
                  {t("nav.login")}
                </TransitionLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="space-y-4 border-t border-mv-line px-gutter pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
          <div data-foot className="flex flex-wrap gap-2" role="group" aria-label={t("a11y.language")}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                lang={l.code}
                aria-pressed={lang === l.code}
                aria-label={l.label}
                onClick={() => setLang(l.code)}
                className={cn(
                  "inline-flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-full border px-3 font-mono text-xs uppercase",
                  lang === l.code ? "border-mv-violet-400/60 bg-mv-violet-500/15 text-mv-text" : "border-mv-line text-mv-muted",
                )}
              >
                <span aria-hidden="true">{l.flag}</span>
                {l.code}
              </button>
            ))}
          </div>
          <div data-foot className="flex items-center justify-between">
            <span className="font-mono text-label uppercase text-mv-muted">MENUVERSE</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
