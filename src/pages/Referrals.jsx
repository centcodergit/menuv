import { useEffect, useRef } from "react";
import { useNoIndex } from "@/hooks/useNoIndex";
import NumberFlow from "@number-flow/react";
import { ArrowLeft, RotateCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { REFERRAL_GOAL } from "@/api/referrals";
import { useMyReferral } from "@/hooks/useMyReferral";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePageBackground } from "@/hooks/useBackgroundIntensity";
import { TransitionLink } from "@/providers/PageTransition";
import ReferralShare from "@/components/referral/ReferralShare";

const STATUS_STYLE = {
  pending: "border-mv-line-strong text-mv-muted",
  earned: "border-mv-violet-400/60 bg-mv-violet-500/15 text-mv-violet-200",
  redeemed: "border-mv-success/50 bg-mv-success/10 text-mv-success",
};

/** One QR-module slot of the progress meter: a finder-pattern ring whose centre fills when a friend joins. */
function ModuleSlot({ filled }) {
  return (
    <span
      data-slot
      data-filled={filled || undefined}
      className={cn(
        "relative flex aspect-square w-full items-center justify-center rounded-[14px] border-2 transition-colors duration-500",
        filled ? "border-mv-violet-400" : "border-dashed border-mv-line-strong",
      )}
    >
      <span
        data-core
        className={cn(
          "h-[46%] w-[46%] rounded-[6px] bg-gradient-to-br from-mv-violet-300 to-mv-violet-600 shadow-[0_0_30px_-4px_rgb(var(--mv-violet-500)/0.8)]",
          !filled && "scale-0 opacity-0",
        )}
      />
    </span>
  );
}

function ProgressMeter({ count }) {
  const { t } = useI18n();
  const root = useRef(null);
  const reduced = useReducedMotion();
  const filled = Math.min(count, REFERRAL_GOAL);

  useGSAP(
    () => {
      if (reduced || !filled) return; // nothing to animate with zero friends (avoids a GSAP "target not found" warning)
      gsap.from("[data-filled] [data-core]", { scale: 0, rotate: -45, opacity: 0, duration: 0.8, stagger: 0.15, ease: "mv.spring", delay: 0.2 });
    },
    { dependencies: [filled, reduced], scope: root },
  );

  return (
    <div ref={root}>
      <div className="grid grid-cols-3 gap-3" role="img" aria-label={t("referral.progress", { count: filled })}>
        {Array.from({ length: REFERRAL_GOAL }, (_, i) => (
          <ModuleSlot key={i} filled={i < filled} />
        ))}
      </div>
      <p aria-hidden="true" className="mt-4 font-display text-2xl font-semibold text-mv-text">
        {t("referral.progress", { count: filled })}
      </p>
    </div>
  );
}

function Skeleton() {
  const { t } = useI18n();
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{t("common.loading")}</span>
      <div className="h-4 w-32 animate-pulse rounded bg-mv-surface-2" />
      <div className="h-14 w-full animate-pulse rounded-full bg-mv-surface-2" />
      <div className="h-11 w-48 animate-pulse rounded-full bg-mv-surface-2" />
    </div>
  );
}

/**
 * /referrals (master prompt 8.3), signed-in only (ProtectedRoute sends visitors to /login?redirect=referrals):
 * the user's link with copy and share, a "x / 3 friends" meter drawn as three QR-module slots, visits through
 * the link, the reward status (set by the team), and the four steps as a reminder.
 */
export default function Referrals() {
  useNoIndex();
  const { t, locale } = useI18n();
  const reduced = useReducedMotion();
  const root = useRef(null);
  const { data, isLoading, isError, refetch, isFetching } = useMyReferral();
  usePageBackground("base");

  useEffect(() => {
    const previous = document.title;
    document.title = `${t("referral.dashboard")} | Menuverse`;
    return () => {
      document.title = previous;
    };
  }, [t]);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from("[data-rise]", { y: 28, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "mv.out", delay: 0.1 });
    },
    { dependencies: [reduced], scope: root },
  );

  const status = data?.reward_status ?? "pending";
  const steps = [1, 2, 3, 4].map((n) => t(`referral.step${n}`));

  return (
    <section ref={root} className="section !pt-32 md:!pt-40">
      <div className="container-mv">
        <TransitionLink to="/" data-rise className="inline-flex items-center gap-2 font-mono text-label uppercase text-mv-muted hover:text-mv-text">
          <ArrowLeft size={14} strokeWidth={1.75} />
          {t("legal.back")}
        </TransitionLink>

        <header className="mt-8 max-w-3xl">
          <p data-rise className="eyebrow">
            {t("referral.dashboard")}
          </p>
          <h1 data-rise className="mt-5 font-display text-h2 font-bold">
            {t("referral.title")}
          </h1>
          <p data-rise className="mt-5 max-w-reading text-lead text-mv-muted">
            {t("referral.body")}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div data-rise className="stone rounded-card p-6 md:p-8 lg:col-span-7">
            {isLoading && <Skeleton />}
            {isError && (
              <div role="alert" className="flex flex-wrap items-center gap-4">
                <p className="text-mv-muted">{t("common.error")}</p>
                <button type="button" onClick={() => refetch()} className="btn-outline !min-h-[44px]" disabled={isFetching}>
                  <RotateCw size={16} strokeWidth={1.75} className={cn(isFetching && "animate-spin")} />
                  {t("common.retry")}
                </button>
              </div>
            )}
            {data && <ReferralShare link={data.link} size="lg" />}
          </div>

          <div data-rise className="stone grid grid-cols-1 gap-8 rounded-card p-6 sm:grid-cols-2 md:p-8 lg:col-span-5 lg:grid-cols-1 xl:grid-cols-2">
            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
              <ProgressMeter count={data?.signups ?? 0} />
            </div>
            <div>
              <p className="font-mono text-label uppercase text-mv-muted">{t("referral.clicks")}</p>
              <p className="mt-2 font-display text-4xl font-bold tabular-nums text-mv-text">
                <NumberFlow value={data?.clicks ?? 0} locales={locale} />
              </p>
            </div>
            <div>
              <p className="font-mono text-label uppercase text-mv-muted">{t("referral.reward")}</p>
              <p className={cn("mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium", STATUS_STYLE[status] ?? STATUS_STYLE.pending)}>
                <span aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-current" />
                {t(`referral.status.${status}`)}
              </p>
            </div>
          </div>
        </div>

        <ol data-rise className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={i} className="glass rounded-card p-6">
              <span className="font-mono text-label text-mv-violet-300">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-display text-lg font-semibold leading-snug text-mv-text">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
