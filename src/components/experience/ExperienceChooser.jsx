import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BatteryFull, Box, Feather, Monitor, MousePointerClick, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useIntroDone } from "@/lib/intro";
import { markExperienceChosen, recommendLight } from "@/lib/experience";
import { useMotionPreference } from "@/providers/MotionPreference";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const GRID = [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1];

/** A 5×5 cluster of QR modules, the site's motif. */
function Modules({ className, tone = "vivid" }) {
  return (
    <div className={cn("grid grid-cols-5 gap-[5px]", className)}>
      {GRID.map((on, i) => (
        <span
          key={i}
          className={cn(
            "aspect-square rounded-[4px]",
            on ? (tone === "vivid" ? "bg-gradient-to-br from-mv-violet-200 to-mv-violet-500" : "bg-mv-violet-300/70") : "bg-transparent",
          )}
        />
      ))}
    </div>
  );
}

/** Full experience preview: drifting light, a tilted module cluster floating in 3D, a light beam. */
function FullPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A0714]">
      <span className="xp-orb absolute -left-6 top-2 h-28 w-28 rounded-full bg-mv-violet-500/60 blur-2xl" />
      <span className="xp-orb-2 absolute -right-4 -top-6 h-24 w-24 rounded-full bg-mv-orchid/45 blur-2xl" />
      <span className="absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 bg-gradient-to-b from-mv-violet-300/30 via-mv-violet-400/10 to-transparent blur-md" />
      <div className="absolute inset-0 flex items-center justify-center [perspective:500px]">
        <div className="xp-float [transform-style:preserve-3d]">
          <Modules className="w-[92px] drop-shadow-[0_14px_22px_rgba(124,58,237,0.65)]" />
        </div>
      </div>
      <span className="absolute inset-x-6 bottom-4 h-px bg-gradient-to-r from-transparent via-mv-violet-300/60 to-transparent" />
    </div>
  );
}

/** Light experience preview: the same motif, flat and still, on a calm surface. */
function LightPreview() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-mv-surface-2">
      <span className="absolute h-32 w-32 rounded-full bg-mv-violet-500/15 blur-2xl" />
      <Modules className="relative w-[78px]" tone="soft" />
    </div>
  );
}

function LoadMeter({ level, label }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mv-muted">{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={cn("h-1.5 w-5 rounded-full", n <= level ? (level > 2 ? "bg-gradient-to-r from-mv-violet-400 to-mv-orchid" : "bg-mv-success") : "bg-mv-line-strong")}
          />
        ))}
      </span>
    </div>
  );
}

function OptionCard({ id, title, body, points, icons, load, preview, recommended, recommendedLabel, loadLabel, chooseLabel, onChoose, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onChoose}
      aria-describedby={`${id}-body`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[22px] border bg-mv-surface/70 text-left transition-[border-color,box-shadow,transform] duration-300 ease-mv-out hover:-translate-y-0.5 focus-visible:outline-offset-4",
        recommended
          ? "border-mv-violet-400/60 shadow-[0_24px_60px_-28px_rgba(124,58,237,0.75)]"
          : "border-mv-line-strong hover:border-mv-violet-400/40",
      )}
    >
      <div className="relative h-32 border-b border-mv-line">
        {preview}
        {recommended && (
          <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-mv-text">
            {recommendedLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-mv-text">{title}</h3>
        <p id={`${id}-body`} className="mt-1.5 text-sm leading-relaxed text-mv-muted">
          {body}
        </p>
        <ul className="mt-4 space-y-2">
          {points.map((point, i) => {
            const Icon = icons[i];
            return (
              <li key={point} className="flex items-center gap-2.5 text-sm text-mv-text">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-mv-violet-500/15 text-mv-violet-300">
                  <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
                </span>
                {point}
              </li>
            );
          })}
        </ul>
        <div className="mt-5 border-t border-mv-line pt-4">
          <LoadMeter level={load} label={loadLabel} />
        </div>
        <span
          className={cn(
            "mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors duration-300",
            recommended ? "bg-gradient-to-b from-mv-violet-500 to-mv-violet-600 text-white" : "border border-mv-line-strong text-mv-text group-hover:border-mv-violet-400/60",
          )}
        >
          {chooseLabel}
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-300 ease-mv-out group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

/**
 * First-visit experience chooser: full (every effect) or light (reduced motion: no 3D, no scroll-driven motion, soft
 * fades). Opens once, shortly after the intro; the choice drives the same switch as the footer toggle and can be
 * changed there. Closing without choosing keeps the full experience and is not asked again.
 */
export default function ExperienceChooser() {
  const { t } = useI18n();
  const introDone = useIntroDone();
  const { setManual } = useMotionPreference();
  const [open, setOpen] = useState(false);
  const lightFirst = useMemo(recommendLight, []);
  const fullRef = useRef(null);
  const lightRef = useRef(null);
  const chosen = useRef(false);

  useEffect(() => {
    if (!introDone) return undefined;
    const id = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(id);
  }, [introDone]);

  const choose = (choice) => {
    chosen.current = true;
    setManual(choice === "light");
    markExperienceChosen(choice);
    setOpen(false);
  };

  const full = t("experience.full");
  const light = t("experience.light");
  const shared = { recommendedLabel: t("experience.recommended"), loadLabel: t("experience.load"), chooseLabel: t("experience.choose") };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !chosen.current) markExperienceChosen("dismissed");
        setOpen(next);
      }}
    >
      <DialogContent
        data-lenis-prevent
        className="max-h-[92dvh] max-w-[880px] gap-0 overflow-y-auto overscroll-contain p-6 sm:p-8 md:p-10"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (lightFirst ? lightRef : fullRef).current?.focus({ preventScroll: true });
        }}
      >
        <style>{`
          @keyframes xp-float { 0%,100% { transform: rotateX(52deg) rotateZ(-38deg) translateZ(0); } 50% { transform: rotateX(48deg) rotateZ(-30deg) translateZ(14px); } }
          @keyframes xp-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(26px,14px); } }
          .xp-float { animation: xp-float 7s ease-in-out infinite; }
          .xp-orb { animation: xp-drift 9s ease-in-out infinite; }
          .xp-orb-2 { animation: xp-drift 11s ease-in-out infinite reverse; }
        `}</style>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(var(--mv-violet-500)/0.22),transparent)]" />
        <div className="relative mx-auto max-w-xl text-center">
          <p className="eyebrow mx-auto">{t("experience.eyebrow")}</p>
          <DialogTitle className="mt-4 font-display text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-tight tracking-[-0.02em] text-mv-text">
            {t("experience.title")}
          </DialogTitle>
          <DialogDescription className="mt-3 text-base leading-relaxed text-mv-muted">{t("experience.lead")}</DialogDescription>
        </div>
        <div className="relative mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
          <OptionCard
            id="xp-full"
            {...full}
            {...shared}
            icons={[Box, MousePointerClick, Monitor]}
            load={4}
            preview={<FullPreview />}
            recommended={!lightFirst}
            onChoose={() => choose("full")}
            buttonRef={fullRef}
          />
          <OptionCard
            id="xp-light"
            {...light}
            {...shared}
            icons={[Feather, Zap, BatteryFull]}
            load={1}
            preview={<LightPreview />}
            recommended={lightFirst}
            onChoose={() => choose("light")}
            buttonRef={lightRef}
          />
        </div>
        <p className="relative mt-6 text-center text-sm text-mv-muted">{t("experience.note", { toggle: t("footer.reduceMotion") })}</p>
      </DialogContent>
    </Dialog>
  );
}
