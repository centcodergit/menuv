import { lazy, Suspense, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useScrolled } from "@/hooks/useNavigation";
import GlassSurface from "@/components/fx/GlassSurface";
import Logo from "@/components/nav/Logo";
import NavLinks from "@/components/nav/NavLinks";
import LanguageSwitcher from "@/components/nav/LanguageSwitcher";
import ThemeToggle from "@/components/nav/ThemeToggle";
import AccountButton from "@/components/nav/AccountButton";

const MobileMenu = lazy(() => import("@/components/nav/MobileMenu"));

/**
 * Navbar (master prompt 6.4), Aceternity "Resizable Navbar" behaviour: full-width and transparent at the top;
 * after 80px it contracts into a floating, centred glass pill (max 860px, 12px from the top) with a spring.
 * Desktop: logo · section links · language, theme, sign-in. Below 1024px: logo · language · hamburger.
 */
export default function Navbar() {
  const t = useT();
  const scrolled = useScrolled(80);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const burger = useRef(null);

  const openMenu = () => {
    setMenuLoaded(true);
    setMenuOpen(true);
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-nav flex justify-center px-3">
        <div
          className={cn(
            "pointer-events-auto relative flex w-full items-center justify-between gap-4 rounded-full",
            "transition-[max-width,padding,transform] duration-700 ease-mv-spring",
            scrolled ? "max-w-[860px] translate-y-3 py-2 pl-5 pr-2" : "max-w-content translate-y-0 px-gutter py-5",
          )}
        >
          <GlassSurface active={scrolled} />
          <div className="relative z-10 flex items-center">
            <Logo />
          </div>

          <nav aria-label={t("a11y.mainNav")} className="relative z-10 hidden lg:block">
            <NavLinks />
          </nav>

          <div className="relative z-10 flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle className="hidden lg:inline-flex" />
            <AccountButton className="hidden lg:inline-flex" />
            <button
              ref={burger}
              type="button"
              onClick={openMenu}
              onPointerEnter={() => setMenuLoaded(true)}
              aria-label={t("nav.menu")}
              aria-expanded={menuOpen}
              className="group inline-flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-mv-line lg:hidden"
            >
              <span className="h-px w-5 bg-mv-text transition-transform duration-300 group-hover:translate-x-0.5" />
              <span className="h-px w-5 bg-mv-text transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      {menuLoaded && (
        <Suspense fallback={null}>
          <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusRef={burger} />
        </Suspense>
      )}
    </>
  );
}
