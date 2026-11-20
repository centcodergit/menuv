import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { captureReferralFromUrl, claimStoredReferral, storedReferralCode } from "@/api/referrals";

const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 4000 }) : window.setTimeout(fn, 1500));
const cancelIdle = (id) => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id));

/**
 * Referral plumbing for every page (master prompt 3.10): a `?ref=` visit is remembered (and counted once), and the
 * remembered code is attached to the account on the first signed-in load. Both run when the browser is idle.
 */
export function useReferralTracking() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!window.location.search.includes("ref=")) return undefined;
    const id = idle(() => captureReferralFromUrl());
    return () => cancelIdle(id);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !storedReferralCode()) return undefined;
    const id = idle(() => claimStoredReferral());
    return () => cancelIdle(id);
  }, [isAuthenticated]);
}
