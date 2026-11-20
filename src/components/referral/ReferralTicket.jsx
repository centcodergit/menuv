import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import HoloCard from "@/components/fx/HoloCard";
import { LogoMark } from "@/components/nav/Logo";
import { REFERRAL_GOAL } from "@/api/referrals";
import { longestRun, unbreakableRuns } from "@/components/referral/steps";

const HIDDEN_BACK = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
// Ticket notches where the stub's perforation meets the top and bottom edges (stub = the right 26%).
const NOTCHED = {
  WebkitMask:
    "radial-gradient(circle at 74% 0, transparent 8px, #000 8.5px) top / 100% 51% no-repeat, radial-gradient(circle at 74% 100%, transparent 8px, #000 8.5px) bottom / 100% 51% no-repeat",
  mask: "radial-gradient(circle at 74% 0, transparent 8px, #000 8.5px) top / 100% 51% no-repeat, radial-gradient(circle at 74% 100%, transparent 8px, #000 8.5px) bottom / 100% 51% no-repeat",
};

/**
 * The free-menu ticket at the end of the referral diagram: a Holo Card front ("ΔΩΡΕΑΝ ΜΕΝΟΥ", the Menuverse mark,
 * a "3 / 3" stub) and a plain back. Its natural state shows the front; the diagram's timeline starts it turned
 * to the back (`[data-ticket-flip]`) and flips it in. The outer slot is what the beams measure (never transformed).
 * The ticket text is sized from its longest unbreakable run, so "GRATIS-SPEISEKARTE" fits as well as "ΔΩΡΕΑΝ ΜΕΝΟΥ".
 */

/**
 * Width of the widest unbreakable run of `label` in em, measured in the element's own font (Greek capitals like Ω
 * are much wider than Latin ones, so a per-letter estimate isn't enough). Layout width (offsetWidth), so the
 * ticket's flip and tilt transforms don't skew it. Re-measured once the web fonts are in.
 */
function useRunEm(ref, label) {
  const [em, setEm] = useState(() => longestRun(label) * 0.78);
  useLayoutEffect(() => {
    const el = ref.current;
    let alive = true;
    const measure = () => {
      if (!alive || !el) return;
      const probe = document.createElement("span");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;display:inline-block;font-size:100px;";
      el.appendChild(probe);
      let widest = 0;
      for (const run of unbreakableRuns(label)) {
        probe.textContent = run;
        widest = Math.max(widest, probe.offsetWidth);
      }
      probe.remove();
      if (widest > 0) setEm(widest / 100);
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      alive = false;
    };
  }, [ref, label]);
  return em;
}
const ReferralTicket = forwardRef(function ReferralTicket(_props, ref) {
  const t = useT();
  const label = t("referral.ticket");
  const text = useRef(null);
  // The widest run fills ~92% of the ticket's text column (92cqi), capped at 1.9rem for short words.
  const fit = `min(1.9rem, calc(92cqi / ${useRunEm(text, label).toFixed(3)}))`;

  return (
    <div ref={ref} data-ticket-slot className="relative aspect-[1.6/1] w-[240px] [perspective:1000px] sm:w-[188px] lg:w-[200px] xl:w-[236px]">
      <div
        data-ticket-glow
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-full opacity-80 blur-2xl"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgb(var(--mv-violet-500) / 0.45), transparent 70%)" }}
      />
      <div data-ticket-flip className="relative h-full w-full [transform-style:preserve-3d]">
        {/* Back: what the slot shows until the third friend lands. */}
        <div
          data-ticket-back
          className="absolute inset-0 grid place-items-center rounded-[16px] border border-mv-violet-400/30 bg-mv-surface"
          style={{ ...HIDDEN_BACK, ...NOTCHED, transform: "rotateY(180deg)" }}
        >
          <div
            className="absolute inset-0 rounded-[inherit] opacity-70"
            style={{ backgroundImage: "radial-gradient(rgb(var(--mv-violet-400) / 0.28) 1.4px, transparent 1.6px)", backgroundSize: "11px 11px" }}
          />
          <LogoMark className="relative h-9 w-9 opacity-60" />
        </div>

        {/* Front */}
        <HoloCard className="absolute inset-0" style={{ ...HIDDEN_BACK, ...NOTCHED }} cardClassName="rounded-[16px] border border-mv-violet-400/45">
          <div className="absolute inset-0" style={{ background: "linear-gradient(140deg, rgb(var(--mv-plum-800)) 0%, rgb(var(--mv-surface)) 72%)" }} />
          <div className="relative flex h-full">
            <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5 xl:p-4" style={{ containerType: "inline-size" }}>
              <span className="flex items-center gap-1.5">
                <LogoMark className="h-[18px] w-[18px]" />
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-mv-muted">Menuverse</span>
              </span>
              <span ref={text} data-ticket-text className="block font-display font-extrabold uppercase leading-[0.95] tracking-[-0.01em] text-mv-text" style={{ fontSize: fit }}>
                {label}
              </span>
            </div>
            <div className="flex w-[26%] shrink-0 items-center justify-center border-l border-dashed border-mv-line-strong">
              <span className="rotate-180 whitespace-nowrap font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-mv-violet-300 [writing-mode:vertical-rl]">
                {t("referral.progress", { count: REFERRAL_GOAL })}
              </span>
            </div>
          </div>
        </HoloCard>
      </div>
    </div>
  );
});

export default ReferralTicket;
