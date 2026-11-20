import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { useMotionPreference } from "@/providers/MotionPreference";
import { TransitionLink } from "@/providers/PageTransition";
import { NAV_SECTIONS, useGoToSection } from "@/hooks/useNavigation";
import ToggleSwitch from "@/components/fx/ToggleSwitch";
import Logo from "@/components/nav/Logo";
import TextHoverEffect from "@/components/fx/TextHoverEffect";

const linkClass =
  "inline-flex min-h-[44px] items-center bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-mv-muted transition-[background-size,color] duration-500 ease-mv-out hover:bg-[length:100%_1px] hover:text-mv-text focus-visible:bg-[length:100%_1px] sm:min-h-0";

/**
 * Footer (master prompt 7.16): a curtain reveal (the footer stays fixed underneath and the page scrolls up
 * to uncover it; a clip-path wrapper keeps it hidden until then), mono column headers, underline-grow links,
 * dynamic copyright year, the reduce-motion toggle, and the giant MENUVERSE wordmark.
 * Falls back to a normal footer when it is taller than the viewport (small phones in landscape).
 */
export default function Footer() {
  const t = useT();
  const go = useGoToSection();
  const { manual, system, setManual } = useMotionPreference();
  const inner = useRef(null);
  const [height, setHeight] = useState(0);
  const [fixed, setFixed] = useState(true);

  useEffect(() => {
    const el = inner.current;
    const measure = () => {
      const h = el.offsetHeight;
      setHeight(h);
      setFixed(h < window.innerHeight - 40);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="relative z-content" style={{ height: fixed ? height : "auto", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
      <footer ref={inner} className={fixed ? "fixed inset-x-0 bottom-0" : "relative"}>
        <div className="relative overflow-hidden border-t border-mv-line bg-mv-ink">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 45% at 50% 0%, rgb(var(--mv-violet-600) / 0.18), transparent 70%)" }} />
          <div className="container-mv relative pt-16 md:pt-20">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="space-y-5 md:col-span-6">
                <Logo />
                <p className="max-w-[38ch] text-mv-muted">{t("footer.description")}</p>
                <div className="flex min-h-[44px] w-fit items-center gap-3">
                  <ToggleSwitch checked={manual || system} disabled={system} onCheckedChange={setManual} aria-label={t("footer.reduceMotion")} />
                  <span aria-hidden="true" className="font-mono text-label uppercase text-mv-muted">{t("footer.reduceMotion")}</span>
                </div>
              </div>

              <nav aria-label={t("footer.col.navigate")} className="grid grid-cols-2 gap-8 md:col-span-6 md:grid-cols-2">
                <div>
                  <p className="mb-4 font-mono text-label uppercase text-mv-violet-300">{t("footer.col.navigate")}</p>
                  <ul className="space-y-1 sm:space-y-3">
                    {NAV_SECTIONS.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`/#${s.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            go(s.id);
                          }}
                          className={linkClass}
                        >
                          {t(s.key)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-4 font-mono text-label uppercase text-mv-violet-300">{t("footer.col.legal")}</p>
                  <ul className="space-y-1 sm:space-y-3">
                    <li><TransitionLink to="/privacypolicy" className={linkClass}>{t("footer.privacy")}</TransitionLink></li>
                    <li><TransitionLink to="/termsofservice" className={linkClass}>{t("footer.terms")}</TransitionLink></li>
                    <li><TransitionLink to="/cookiepolicy" className={linkClass}>{t("footer.cookies")}</TransitionLink></li>
                  </ul>
                </div>
              </nav>
            </div>

            <div className="mt-14 border-t border-mv-line pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-mv-muted">
              <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
            </div>
          </div>

          <div className="relative px-2 pb-2 pt-4 sm:px-4">
            <TextHoverEffect text={t("footer.wordmark")} className="block h-auto w-full select-none" />
          </div>
        </div>
      </footer>
    </div>
  );
}
