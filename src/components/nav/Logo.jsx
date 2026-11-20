import { useLocation } from "react-router-dom";
import { useT } from "@/lib/i18n";
import { TransitionLink } from "@/providers/PageTransition";
import { useScrollTo } from "@/hooks/useSmoothScroll";

/**
 * PLACEHOLDER MARK until Nikolas uploads the logo SVG (master prompt "uploaded SVG"): QR modules in violet.
 * Swap this component's SVG for the real mark; the wordmark stays typographic (Commissioner).
 */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mv-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C4B5FD" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="8.5" height="8.5" rx="2.2" fill="url(#mv-mark)" />
      <rect x="13.5" y="2" width="8.5" height="8.5" rx="2.2" fill="url(#mv-mark)" />
      <rect x="2" y="13.5" width="8.5" height="8.5" rx="2.2" fill="url(#mv-mark)" />
      <rect x="13.5" y="13.5" width="3.6" height="3.6" rx="1" fill="#DDD6FE" />
      <rect x="18.4" y="18.4" width="3.6" height="3.6" rx="1" fill="#DDD6FE" />
    </svg>
  );
}

export default function Logo({ onNavigate }) {
  const t = useT();
  const { pathname } = useLocation();
  const scrollTo = useScrollTo();
  return (
    <TransitionLink
      to="/"
      aria-label={t("a11y.home")}
      onClick={(e) => {
        onNavigate?.();
        if (pathname === "/") {
          e.preventDefault();
          scrollTo(0, { offset: 0 });
        }
      }}
      className="group flex min-h-[44px] items-center gap-2.5 rounded-full"
    >
      <LogoMark className="h-7 w-7 transition-transform duration-500 ease-mv-spring group-hover:rotate-90" />
      <span className="font-display text-[1.15rem] font-bold tracking-[-0.03em] text-mv-text">Menuverse</span>
    </TransitionLink>
  );
}
