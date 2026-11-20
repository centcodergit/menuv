import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "@/lib/gsap";
import { useScrollTo } from "@/hooks/useSmoothScroll";
import { usePageTransition } from "@/providers/PageTransition";

/** Homepage sections reachable from the navbar (master prompt 3.1 anchors). */
export const NAV_SECTIONS = [
  { id: "features", key: "nav.features" },
  { id: "how-it-works", key: "nav.howItWorks" },
  { id: "pricing", key: "nav.pricing" },
];

/** True once the page has scrolled past `threshold` px (navbar contracts into the pill at 80px). */
export function useScrolled(threshold = 80) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);
  return scrolled;
}

/**
 * Go to a homepage section: smooth scroll when already on "/", otherwise the page curtain to "/#id"
 * (Home then scrolls to the hash once the section exists).
 */
export function useGoToSection() {
  const { pathname } = useLocation();
  const scrollTo = useScrollTo();
  const { transitionTo } = usePageTransition();
  return useCallback(
    (id) => {
      if (pathname === "/") {
        scrollTo(`#${id}`);
        history.replaceState(history.state, "", `#${id}`);
      } else {
        transitionTo(`/#${id}`);
      }
    },
    [pathname, scrollTo, transitionTo],
  );
}

/** Which navbar section is on screen (homepage only). Sections mount lazily, so wait for them. */
export function useActiveNavSection() {
  const { pathname } = useLocation();
  const [active, setActive] = useState(null);

  useEffect(() => {
    setActive(null);
    if (pathname !== "/") return undefined;
    const triggers = [];
    let frame = 0;
    let tries = 0;
    const attach = () => {
      const found = NAV_SECTIONS.map((s) => document.getElementById(s.id));
      if (found.some((el) => !el) && tries++ < 600) {
        frame = requestAnimationFrame(attach);
        return;
      }
      found.forEach((el, i) => {
        if (!el) return;
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (self.isActive) setActive(NAV_SECTIONS[i].id);
              else setActive((current) => (current === NAV_SECTIONS[i].id ? null : current));
            },
          }),
        );
      });
    };
    attach();
    return () => {
      cancelAnimationFrame(frame);
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  return active;
}
