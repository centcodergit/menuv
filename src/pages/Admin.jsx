import { useCallback, useEffect, useState } from "react";
import { Inbox, Mail, MessageSquareText, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageBackground } from "@/hooks/useBackgroundIntensity";
import { useNoIndex } from "@/hooks/useNoIndex";
import { useAdminInbox } from "@/components/admin/useAdminInbox";
import InboxTab from "@/components/admin/InboxTab";
import FeedbackTab from "@/components/admin/FeedbackTab";
import NewsletterTab from "@/components/admin/NewsletterTab";
import ReferralsTab from "@/components/admin/ReferralsTab";

const TABS = [
  { id: "inbox", icon: Inbox },
  { id: "feedback", icon: MessageSquareText },
  { id: "newsletter", icon: Mail },
  { id: "referrals", icon: Users },
];
const TAB_IDS = TABS.map((tab) => tab.id);
const tabFromHash = () => {
  const id = window.location.hash.replace(/^#/, "").toLowerCase();
  return TAB_IDS.includes(id) ? id : "inbox";
};

/** The active tab lives in the URL hash (#inbox, #feedback, …) so a reload or a shared link keeps it. */
function useTabHash() {
  const [tab, setTab] = useState(tabFromHash);
  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const change = useCallback((next) => {
    setTab(next);
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${search}#${next}`);
  }, []);
  return [tab, change];
}

/**
 * /admin (master prompt 8.4), admin role only (ProtectedRoute shows non-admins the 404). Utility first:
 * Inbox (live support threads), Feedback, Newsletter (CSV export) and Referrals (rewards set by the team).
 * Minimal motion: no entrance choreography and no ambient loops, only hover/state transitions.
 */
export default function Admin() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [tab, setTab] = useTabHash();
  const inbox = useAdminInbox({ active: tab === "inbox" });
  usePageBackground("dim");
  useNoIndex();

  useEffect(() => {
    const previous = document.title;
    document.title = `${t("admin.title")} | Menuverse`;
    return () => {
      document.title = previous;
    };
  }, [t]);

  return (
    <section className="section !pb-24 !pt-28 md:!pt-32">
      <Tabs value={tab} onValueChange={setTab} className="container-mv">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
              <p className="eyebrow">{t("nav.admin")}</p>
              {user?.email && <p className="truncate font-mono text-xs text-mv-muted">{user.email}</p>}
            </div>
            <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-none tracking-[-0.03em] text-mv-text">{t("admin.title")}</h1>
            <p className="mt-3 text-mv-muted">{t("admin.subtitle")}</p>
          </div>

          <TabsList className="grid h-auto w-full shrink-0 grid-cols-2 gap-1 rounded-[20px] border border-mv-line bg-mv-surface/70 p-1 text-mv-muted sm:inline-grid sm:w-auto sm:grid-cols-4">
            {TABS.map(({ id, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                id={`mv-admin-tab-${id}`}
                className={cn(
                  "min-h-[44px] gap-2 rounded-2xl px-4 text-sm font-medium text-mv-muted ring-offset-0 transition-colors hover:text-mv-text",
                  "focus-visible:ring-0 data-[state=active]:bg-mv-violet-500/15 data-[state=active]:text-mv-text data-[state=active]:shadow-[inset_0_0_0_1px_rgb(var(--mv-violet-400)/0.45)]",
                )}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
                {t(`admin.tabs.${id}`)}
                {id === "inbox" && inbox.unreadCount > 0 && (
                  <span data-unread-count className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-mv-violet-500 px-1.5 font-mono text-[11px] font-semibold text-white">
                    {inbox.unreadCount}
                    <span className="sr-only"> {t("admin.unread")}</span>
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </header>

        <TabsContent value="inbox" className="mt-6 focus-visible:ring-0">
            <InboxTab inbox={inbox} />
          </TabsContent>
          <TabsContent value="feedback" className="mt-6 focus-visible:ring-0">
            <FeedbackTab />
          </TabsContent>
          <TabsContent value="newsletter" className="mt-6 focus-visible:ring-0">
            <NewsletterTab />
          </TabsContent>
          <TabsContent value="referrals" className="mt-6 focus-visible:ring-0">
            <ReferralsTab />
          </TabsContent>
      </Tabs>
    </section>
  );
}
