import { lazy, Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useT } from "@/lib/i18n";
import { markIntroDone, shouldPlayIntro } from "@/lib/intro";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useReferralTracking } from "@/hooks/useReferralTracking";
import { needsExperienceChoice } from "@/lib/experience";
import Background from "@/components/layout/Background";
import Grain from "@/components/layout/Grain";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Cursor from "@/components/layout/Cursor";
import Preloader from "@/components/layout/Preloader";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/nav/Navbar";
import ChatWidget from "@/components/chat/ChatWidget";

// First-visit full/light choice: its own chunk, loaded only when it will be shown.
const ExperienceChooser = lazy(() => import("@/components/experience/ExperienceChooser"));

/**
 * Shared layout route for every public page: living background, grain, scroll progress, navbar,
 * footer (curtain reveal), chat widget, cursor label, and the once-per-session preloader on "/".
 */
export default function SiteLayout() {
  const t = useT();
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  useReferralTracking();
  const [askExperience] = useState(needsExperienceChoice);
  const [intro, setIntro] = useState(() => {
    const play = shouldPlayIntro({ reduced, pathname });
    if (!play) markIntroDone();
    return play;
  });

  return (
    <>
      <a href="#main" className="skip-link">
        {t("a11y.skip")}
      </a>
      <Background />
      <Grain />
      <ScrollProgress />
      <Navbar />
      <main id="main" className="relative z-content">
        <Suspense fallback={<div aria-hidden="true" className="min-h-[100svh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {/* The customer chat is for visitors; the admin answers from the inbox on /admin. */}
      {!pathname.startsWith("/admin") && <ChatWidget />}
      <Cursor />
      {intro && <Preloader onFinish={() => setIntro(false)} />}
      {askExperience && (
        <Suspense fallback={null}>
          <ExperienceChooser />
        </Suspense>
      )}
    </>
  );
}
