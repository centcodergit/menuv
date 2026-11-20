import { useLayoutEffect, useRef } from "react";
import { useT } from "@/lib/i18n";
import { gsap } from "@/lib/gsap";
import RollingLabel from "@/components/fx/RollingLabel";
import { NAV_SECTIONS, useActiveNavSection, useGoToSection } from "@/hooks/useNavigation";

/**
 * Desktop section links (master prompt 6.4): the active section gets a pill that slides behind its label
 * (React Bits Pill Nav idea, driven by GSAP instead of Motion layoutId to keep Motion out of the first load);
 * hovering rolls the label up and a duplicate rises from below.
 */
export default function NavLinks() {
  const t = useT();
  const active = useActiveNavSection();
  const go = useGoToSection();
  const list = useRef(null);
  const pill = useRef(null);

  useLayoutEffect(() => {
    const target = active ? list.current?.querySelector(`[data-section="${active}"]`) : null;
    if (!target) {
      gsap.to(pill.current, { autoAlpha: 0, scale: 0.9, duration: 0.3, ease: "mv.out" });
      return;
    }
    const first = gsap.getProperty(pill.current, "autoAlpha") === 0;
    const props = { x: target.offsetLeft, width: target.offsetWidth };
    if (first) gsap.set(pill.current, props);
    gsap.to(pill.current, { ...props, autoAlpha: 1, scale: 1, duration: first ? 0.35 : 0.6, ease: "mv.spring" });
  }, [active, t]);

  return (
    <ul ref={list} className="relative flex items-center">
      <span
        ref={pill}
        aria-hidden="true"
        className="invisible absolute left-0 top-0 h-full rounded-full border border-mv-violet-400/25 bg-mv-violet-500/15 opacity-0"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 24px -6px rgba(139,92,246,0.55)" }}
      />
      {NAV_SECTIONS.map((s) => (
        <li key={s.id}>
          <a
            href={`/#${s.id}`}
            data-section={s.id}
            aria-current={active === s.id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              go(s.id);
            }}
            className="group relative z-10 flex min-h-[40px] items-center rounded-full px-4 text-sm text-mv-muted transition-colors duration-300 hover:text-mv-text aria-[current=true]:text-mv-text"
          >
            <RollingLabel>{t(s.key)}</RollingLabel>
          </a>
        </li>
      ))}
    </ul>
  );
}
