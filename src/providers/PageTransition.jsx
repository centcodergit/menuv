import { createContext, forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { preloadRoute } from "@/lib/routeChunks";

const PageTransitionContext = createContext({ transitionTo: () => {} });

/**
 * Route transitions (master prompt 6.7): a violet-to-void curtain wipes up (0.45s, mv.inOut),
 * the new page mounts and scroll resets to the top, then the curtain wipes out of the top.
 * Reduced motion: a 150ms crossfade.
 */
export function PageTransitionProvider({ children }) {
  const curtain = useRef(null);
  const busy = useRef(false);
  const coveredFor = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const lenis = useLenis();
  const reduced = useReducedMotion();

  const transitionTo = useCallback(
    (to, options) => {
      const target = typeof to === "string" ? new URL(to, window.location.origin) : null;
      const samePage = target && target.pathname === window.location.pathname;
      if (busy.current || samePage || !curtain.current) {
        navigate(to, options);
        return;
      }
      busy.current = true;
      coveredFor.current = target?.pathname ?? null;
      const el = curtain.current;
      const cover = reduced
        ? gsap.fromTo(el, { autoAlpha: 0, yPercent: 0 }, { autoAlpha: 1, duration: 0.15, ease: "none" })
        : gsap.fromTo(el, { autoAlpha: 1, yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: "mv.inOut" });
      // Load the next page's code while the curtain covers the screen.
      Promise.all([cover, preloadRoute(target?.pathname)]).then(() => navigate(to, options));
    },
    [navigate, reduced],
  );

  // On every route change: reset scroll, refresh triggers, reveal.
  useLayoutEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [location.pathname, lenis]);

  useEffect(() => {
    const el = curtain.current;
    if (!el) return;
    const wasCovered = busy.current && coveredFor.current === location.pathname;
    if (!wasCovered) {
      gsap.set(el, { autoAlpha: 0 });
      return;
    }
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const reveal = reduced
        ? gsap.to(el, { autoAlpha: 0, duration: 0.15, ease: "none" })
        : gsap.to(el, { yPercent: -100, duration: 0.45, ease: "mv.inOut", delay: 0.05 });
      reveal.then(() => {
        gsap.set(el, { autoAlpha: 0, yPercent: 100 });
        busy.current = false;
        coveredFor.current = null;
      });
    });
  }, [location.pathname, reduced]);

  return (
    <PageTransitionContext.Provider value={{ transitionTo }}>
      {children}
      <div
        ref={curtain}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-curtain invisible opacity-0"
        style={{
          background:
            "linear-gradient(0deg, rgb(var(--mv-violet-600)) 0%, rgb(var(--mv-plum-800)) 22%, rgb(var(--mv-void)) 55%)",
        }}
      />
    </PageTransitionContext.Provider>
  );
}

export const usePageTransition = () => useContext(PageTransitionContext);

/**
 * Drop-in for react-router's <Link> that plays the curtain between pages.
 * Hash-only links on the same page fall through to Lenis anchor scrolling.
 */
export const TransitionLink = forwardRef(function TransitionLink({ to, onClick, replace, state, ...props }, ref) {
  const { transitionTo } = usePageTransition();
  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target && props.target !== "_self") return;
    e.preventDefault();
    transitionTo(to, { replace, state });
  };
  return <Link ref={ref} to={to} replace={replace} state={state} onClick={handleClick} {...props} />;
});
