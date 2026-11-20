import { useQuery } from "@tanstack/react-query";
import { fetchMyReferral } from "@/api/referrals";
import { useAuth } from "@/lib/AuthContext";

/**
 * The signed-in user's referral ({ code, link, clicks, signups, reward_status }), created on first request.
 * Disabled while signed out; pass `enabled: false` to wait for an explicit action (the section's "Ξεκινήστε").
 */
export function useMyReferral({ enabled = true } = {}) {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: ["my-referral", user?.id],
    queryFn: fetchMyReferral,
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
