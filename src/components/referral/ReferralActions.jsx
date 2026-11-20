import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { TransitionLink, usePageTransition } from "@/providers/PageTransition";
import Magnet from "@/components/fx/Magnet";
import { LearnMoreDialog, ShareDialog } from "@/components/referral/ReferralDialogs";

/**
 * The section's three actions (master prompt 3.10), magnetic on fine pointers:
 *   Ξεκινήστε: signed out → /login?redirect=referrals; signed in → the share dialog with the user's link.
 *              Auth is checked on idle, so a click before that check finishes waits for it instead of guessing.
 *   Μάθετε Περισσότερα: the program dialog (4 steps and the rule), which can start from there too.
 *   Πίνακας: /referrals (the dashboard sends signed-out visitors to the login itself).
 */
export default function ReferralActions() {
  const t = useT();
  const { isAuthenticated, authChecked, checkUserAuth } = useAuth();
  const { transitionTo } = usePageTransition();
  const [learnOpen, setLearnOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const startBtn = useRef(null);
  const learnBtn = useRef(null);

  // The dialogs open without a Radix trigger, so they hand focus back to their button themselves
  // (unless the other dialog has just opened: "Ξεκινήστε" inside "Μάθετε Περισσότερα").
  const focusBack = (ref) => (event) => {
    event.preventDefault();
    if (!document.querySelector("[role='dialog']")) ref.current?.focus();
  };

  const start = async () => {
    const signedIn = isAuthenticated || (!authChecked && Boolean(await checkUserAuth()));
    if (signedIn) setShareOpen(true);
    else transitionTo("/login?redirect=referrals");
  };

  return (
    <>
      <div className="mt-10 flex flex-col items-start gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Magnet strength={0.2} padding={36}>
            <button ref={startBtn} type="button" className="btn-primary" onClick={start}>
              {t("referral.start")}
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </Magnet>
          <Magnet strength={0.2} padding={36}>
            <button ref={learnBtn} type="button" className="btn-outline" onClick={() => setLearnOpen(true)} aria-haspopup="dialog">
              {t("referral.learnMore")}
            </button>
          </Magnet>
        </div>
        {/* The dashboard is a quieter destination: its own row, as a link. */}
        <Magnet strength={0.2} padding={24}>
          <TransitionLink
            to="/referrals"
            className="group -ml-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-1 font-medium text-mv-muted transition-colors duration-300 hover:text-mv-text"
          >
            {t("referral.dashboard")}
            <ArrowUpRight
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="transition-transform duration-300 ease-mv-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </TransitionLink>
        </Magnet>
      </div>

      <LearnMoreDialog
        open={learnOpen}
        onOpenChange={setLearnOpen}
        onStart={() => {
          setLearnOpen(false);
          start();
        }}
        onCloseAutoFocus={focusBack(learnBtn)}
      />
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} onCloseAutoFocus={focusBack(startBtn)} />
    </>
  );
}
