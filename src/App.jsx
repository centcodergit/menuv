import { lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import SiteLayout from "@/components/layout/SiteLayout";
import { MotionPreferenceProvider } from "@/providers/MotionPreference";
import { ThemeProvider } from "@/providers/ThemeProvider";
import SmoothScroll from "@/providers/SmoothScroll";
import { PageTransitionProvider } from "@/providers/PageTransition";
// Add page imports here
// Home and 404 ship in the main bundle; every other page is code-split (SiteLayout wraps them in <Suspense>).
import Home from "@/pages/Home";
import PageNotFound from "@/pages/PageNotFound";
import { routeChunks } from "@/lib/routeChunks";
const Login = lazy(routeChunks["/login"]);
const PrivacyPolicy = lazy(routeChunks["/privacypolicy"]);
const TermsOfService = lazy(routeChunks["/termsofservice"]);
const CookiePolicy = lazy(routeChunks["/cookiepolicy"]);
const Referrals = lazy(routeChunks["/referrals"]);
const Admin = lazy(routeChunks["/admin"]);

// Development-only translation review page (not in production builds).
const CopyReview = import.meta.env.DEV ? lazy(() => import("@/pages/CopyReview")) : null;

/**
 * Routes (master prompt 3.1). Public pages render immediately; auth resolves in the background.
 * React Router matches paths case-insensitively, so /PrivacyPolicy also works.
 */
function AuthenticatedApp() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/termsofservice" element={<TermsOfService />} />
        <Route path="/cookiepolicy" element={<CookiePolicy />} />
        <Route element={<ProtectedRoute redirectKey="referrals" />}>
          <Route path="/referrals" element={<Referrals />} />
        </Route>
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        {CopyReview && (
          <Route path="/__copy" element={<CopyReview />} />
        )}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

export default function App({ initialLang }) {
  return (
    <MotionPreferenceProvider>
      <ThemeProvider>
        <I18nProvider initialLang={initialLang}>
          <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
              <Router>
                <SmoothScroll>
                  <PageTransitionProvider>
                    <AuthenticatedApp />
                  </PageTransitionProvider>
                </SmoothScroll>
              </Router>
              <Toaster />
            </QueryClientProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </MotionPreferenceProvider>
  );
}
