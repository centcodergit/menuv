/**
 * Code-split pages, keyed by path. App.jsx builds its lazy routes from these, and the page transition
 * preloads the target's chunk while the curtain covers the screen, so the curtain never lifts on a blank page.
 */
export const routeChunks = {
  "/login": () => import("@/pages/Login"),
  "/privacypolicy": () => import("@/pages/PrivacyPolicy"),
  "/termsofservice": () => import("@/pages/TermsOfService"),
  "/cookiepolicy": () => import("@/pages/CookiePolicy"),
  "/referrals": () => import("@/pages/Referrals"),
  "/admin": () => import("@/pages/Admin"),
};

export function preloadRoute(pathname) {
  const load = routeChunks[(pathname ?? "").toLowerCase().replace(/\/+$/, "")];
  return load ? load().catch(() => null) : Promise.resolve(null);
}
