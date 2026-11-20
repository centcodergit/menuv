import { LayoutDashboard, LogOut, Shield } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { TransitionLink, usePageTransition } from "@/providers/PageTransition";
import ShineBorder from "@/components/fx/ShineBorder";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/fx/Menu";
import { cn } from "@/lib/utils";

/**
 * Signed out: "Σύνδεση" outline button with a slow shimmer border (Magic UI Shine Border).
 * Signed in: the user's initial opens a glass menu (Dashboard, Admin for admins, Sign out).
 */
export default function AccountButton({ className }) {
  const t = useT();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { transitionTo } = usePageTransition();

  if (!isAuthenticated) {
    return (
      <TransitionLink
        to="/login"
        className={cn(
          "relative inline-flex h-11 items-center rounded-full border border-mv-line px-5 text-sm font-medium text-mv-text transition-colors hover:bg-mv-violet-500/10",
          className,
        )}
      >
        <ShineBorder />
        {t("nav.login")}
      </TransitionLink>
    );
  }

  const initial = (user?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();
  return (
    <Menu className={className}>
      <MenuTrigger
        aria-label={t("nav.account")}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-mv-violet-400/40 bg-mv-violet-500/15 font-display text-sm font-semibold text-mv-text"
      >
        <ShineBorder />
        {initial}
      </MenuTrigger>
      <MenuContent aria-label={t("nav.account")} className="min-w-[230px]">
        <div className="truncate px-3 pb-2 pt-1.5 text-xs text-mv-muted">{user?.email}</div>
        <MenuItem index={0} onSelect={() => transitionTo("/referrals")}>
          <LayoutDashboard size={16} strokeWidth={1.5} className="text-mv-violet-300" aria-hidden="true" />
          {t("referral.dashboard")}
        </MenuItem>
        {isAdmin && (
          <MenuItem index={1} onSelect={() => transitionTo("/admin")}>
            <Shield size={16} strokeWidth={1.5} className="text-mv-violet-300" aria-hidden="true" />
            {t("nav.admin")}
          </MenuItem>
        )}
        <MenuSeparator />
        <MenuItem index={2} onSelect={() => logout()}>
          <LogOut size={16} strokeWidth={1.5} className="text-mv-muted" aria-hidden="true" />
          {t("nav.logout")}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
