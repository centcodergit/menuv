import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import PageNotFound from "@/pages/PageNotFound";

function DefaultFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-mv-line border-t-mv-violet-400" />
    </div>
  );
}

/**
 * Per-route auth guard (layout route with <Outlet />).
 * - Signed out: goes to /login?redirect=<redirectKey or current path>.
 * - requireAdmin: non-admins see the 404 page (the admin area is not advertised).
 */
export default function ProtectedRoute({ fallback = <DefaultFallback />, redirectKey, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoadingAuth, authChecked, authError } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked) return fallback;

  if (authError?.type === "user_not_registered") return <UserNotRegisteredError />;

  if (!isAuthenticated) {
    if (requireAdmin) return <PageNotFound />;
    const redirect = redirectKey ?? location.pathname.replace(/^\//, "");
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (requireAdmin && !isAdmin) return <PageNotFound />;

  return <Outlet />;
}
