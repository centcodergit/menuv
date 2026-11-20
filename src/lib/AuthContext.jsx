import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getBase44, hasBackend } from "@/api/getBase44";

const AuthContext = createContext(null);

const whenIdle = (cb) => {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
};

/**
 * Auth state for the public site.
 * Unlike the stock Base44 template, public pages never wait for this: the hero (LCP) renders
 * immediately, the SDK loads when the browser is idle, and auth resolves in the background.
 * Protected routes wait via <ProtectedRoute>.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(hasBackend);
  const [authChecked, setAuthChecked] = useState(!hasBackend);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = useCallback(async () => {
    if (!hasBackend) {
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return null;
    }
    setIsLoadingAuth(true);
    try {
      const base44 = await getBase44();
      const signedIn = await base44.auth.isAuthenticated();
      if (!signedIn) {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
      return currentUser;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (error?.data?.extra_data?.reason === "user_not_registered") {
        setAuthError({ type: "user_not_registered", message: "User not registered for this app" });
      }
      return null;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => whenIdle(() => checkUserAuth()), [checkUserAuth]);

  /** Send the visitor to the Base44 login page. `next` is where they land afterwards. */
  const navigateToLogin = useCallback(async (next = window.location.href) => {
    const base44 = await getBase44();
    base44.auth.redirectToLogin(next);
  }, []);

  const logout = useCallback(async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    const base44 = await getBase44();
    if (shouldRedirect) base44.auth.logout(window.location.href);
    else base44.auth.logout();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin: user?.role === "admin",
      isLoadingAuth,
      authChecked,
      authError,
      checkUserAuth,
      navigateToLogin,
      logout,
    }),
    [user, isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth, navigateToLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
