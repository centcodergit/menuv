import { ArrowRight, ArrowUpRight, RotateCw } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TransitionLink } from "@/providers/PageTransition";
import { useMyReferral } from "@/hooks/useMyReferral";
import ReferralShare from "@/components/referral/ReferralShare";
import { splitFifty, STEP_KEYS } from "@/components/referral/steps";

// Arbitrary sizes (not text-body etc.): tailwind-merge would read a custom text-* token as a colour and drop it.
const CONTENT = "w-[calc(100vw-32px)] max-w-xl gap-0 overflow-y-auto rounded-card p-6 max-h-[calc(100svh-32px)] sm:p-8";

/** Title with its last word in the serif-italic gradient, like the section header (works in every language). */
function AccentTitle({ text }) {
  const words = text.split(" ");
  const accent = words.pop();
  return (
    <>
      {words.join(" ")} <span className="text-gradient font-serif-italic font-medium">{accent}</span>
    </>
  );
}

function StepList({ className }) {
  const t = useT();
  return (
    <ol className={cn("grid gap-3", className)}>
      {STEP_KEYS.map((key, i) => {
        const text = t(`referral.${key}`);
        const fifty = key === "step3" ? splitFifty(text) : null;
        return (
          <li key={key} className="flex items-center gap-4 rounded-inner border border-mv-line bg-mv-surface/60 p-3 pr-4">
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-mv-violet-400/50 bg-mv-violet-500/15 font-mono text-[12px] text-mv-violet-200">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-[1.02rem] font-semibold leading-snug text-mv-text">
              {fifty ? (
                <>
                  {fifty[0]}
                  <span className="text-mv-violet-300">50</span>
                  {fifty[1]}
                </>
              ) : (
                text
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** "Μάθετε Περισσότερα": the program in one view, built from the section's own copy (eyebrow, title, rule, 4 steps). */
export function LearnMoreDialog({ open, onOpenChange, onStart, onCloseAutoFocus }) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={CONTENT} onCloseAutoFocus={onCloseAutoFocus}>
        <p className="eyebrow mb-5 w-fit">{t("referral.eyebrow")}</p>
        <DialogTitle className="pr-10 font-display text-[clamp(1.7rem,4vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.03em]">
          <AccentTitle text={t("referral.title")} />
        </DialogTitle>
        <DialogDescription className="mt-4 text-[1.0625rem] leading-relaxed text-mv-muted">{t("referral.body")}</DialogDescription>
        <StepList className="mt-6" />
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={onStart}>
            {t("referral.start")}
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Signed in "Ξεκινήστε": loads (or creates) the user's referral and shows the link with copy and share buttons. */
export function ShareDialog({ open, onOpenChange, onCloseAutoFocus }) {
  const t = useT();
  const { data, isError, isFetching, refetch } = useMyReferral({ enabled: open });
  const failed = isError && !isFetching && !data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={CONTENT} onCloseAutoFocus={onCloseAutoFocus}>
        <p className="eyebrow mb-5 w-fit">{t("referral.eyebrow")}</p>
        <DialogTitle className="pr-10 font-display text-[clamp(1.6rem,3.6vw,2.1rem)] font-bold leading-[1.08] tracking-[-0.03em]">
          {t("referral.step2")}
        </DialogTitle>
        <DialogDescription className="mt-3 text-[1rem] leading-relaxed text-mv-muted">
          {t("referral.step3")} · {t("referral.step4")}
        </DialogDescription>

        <div className="mt-7" aria-live="polite" aria-busy={!data && !failed}>
          {data ? (
            <ReferralShare link={data.link} />
          ) : failed ? (
            <div className="flex flex-wrap items-center gap-3 rounded-inner border border-mv-danger/40 bg-mv-danger/10 p-4">
              <p className="min-w-0 flex-1 text-sm text-mv-text">{t("common.error")}</p>
              <button type="button" className="btn-outline !min-h-[40px] !px-4 !text-sm" onClick={() => refetch()}>
                <RotateCw size={15} strokeWidth={1.75} aria-hidden="true" />
                {t("common.retry")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-mono text-label uppercase text-mv-muted">{t("common.loading")}</p>
              <div aria-hidden="true" className="h-[52px] rounded-full border border-mv-line-strong bg-mv-surface-2/80" />
              <div aria-hidden="true" className="flex gap-2">
                <span className="h-11 w-11 rounded-full border border-mv-line-strong" />
                <span className="h-11 w-11 rounded-full border border-mv-line-strong" />
              </div>
            </div>
          )}
        </div>

        <TransitionLink
          to="/referrals"
          onClick={() => onOpenChange(false)}
          className="mt-7 inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full font-medium text-mv-violet-300 underline-offset-4 hover:underline"
        >
          {t("referral.dashboard")}
          <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </TransitionLink>
      </DialogContent>
    </Dialog>
  );
}
