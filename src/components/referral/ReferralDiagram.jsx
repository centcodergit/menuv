import { memo, useLayoutEffect, useRef, useState } from "react";
import { Link2, User, UserRound } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import "@/lib/gsap-extra"; // MotionPath: the "50%" tokens ride the beams
import { useI18n } from "@/lib/i18n";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import AnimatedBeam, { beamPath, layoutBox } from "@/components/fx/AnimatedBeam";
import ReferralTicket from "@/components/referral/ReferralTicket";
import { burstFrom, preloadConfetti } from "@/components/referral/confetti";
import { percentLabel, STAGE_DONE } from "@/components/referral/steps";

const FRIENDS = [0, 1, 2];
const GAP = 6; // beams stop this far from a node's edge
const DRAW = 0.8; // one beam, you → friend
const STAGGER = 0.55; // between friend beams

/** The small "50%" chip a beam carries (in the beam's SVG space, centred on 0,0 so MotionPath puts it on the line). */
function Token({ label }) {
  const w = 16 + label.length * 6.6;
  return (
    <g data-token className="opacity-0" style={{ filter: "drop-shadow(0 0 6px rgb(var(--mv-violet-500) / 0.9))" }}>
      <rect x={-w / 2} y={-10} width={w} height={20} rx={10} style={{ fill: "rgb(var(--mv-violet-500))", stroke: "rgb(var(--mv-violet-300))" }} strokeWidth="1" />
      <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill="#fff" className="font-mono" fontSize="10.5" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

function NodeLabel({ children, labelRef }) {
  return (
    <span ref={labelRef} className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap font-mono text-label uppercase text-mv-muted">
      {children}
    </span>
  );
}

/**
 * 7.9 diagram (Magic UI Animated Beam): you → three friends → the free-menu ticket. Horizontal from 640px,
 * vertical below (you on top, friends in a row, ticket at the bottom). Decorative (`aria-hidden`); the stepper
 * under it carries the meaning as text.
 *
 * Choreography, once, when the diagram is in view (GSAP timeline; `onStage(n)` keeps the stepper in sync):
 *   step1  your node lights up and its link chip pops ("link generated")
 *   step2  beams fire one after another, each carrying a "50%" token along the beam (MotionPath)
 *   step3  the first token lands: that friend lights up with its 50% badge (the stepper's 50 rolls)
 *   step4  after the third, all three beams converge into the ticket, which flips in with a confetti burst
 * The DOM's natural state is the finished picture; the timeline sets the start state and animates back to it,
 * so reduced motion (no timeline) or a revert always lands on the final state.
 */
function ReferralDiagram({ onStage }) {
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const vertical = !useMediaQuery("(min-width: 640px)");
  const orientation = vertical ? "vertical" : "horizontal";
  const percent = percentLabel(t("referral.step3"));

  const container = useRef(null);
  const you = useRef(null);
  const youLabel = useRef(null);
  const friends = useRef([]);
  const friendLabels = useRef([]);
  const ticket = useRef(null);
  const played = useRef(false);
  const [geo, setGeo] = useState(null);

  // Beam geometry from layout boxes (transforms ignored), re-measured on resize, font load and language change.
  useLayoutEffect(() => {
    const el = container.current;
    let last = "";
    const measure = () => {
      const box = (n) => layoutBox(n, el);
      const out = (node, label) => {
        const b = box(node);
        if (!vertical) return { x: b.x + b.w + GAP, y: b.y + b.h / 2 };
        const l = box(label);
        return { x: b.x + b.w / 2, y: l.y + l.h + GAP };
      };
      const into = (node) => {
        const b = box(node);
        return vertical ? { x: b.x + b.w / 2, y: b.y - GAP } : { x: b.x - GAP, y: b.y + b.h / 2 };
      };
      const start = out(you.current, youLabel.current);
      const goal = into(ticket.current);
      const beams = [
        ...FRIENDS.map((i) => [start, into(friends.current[i])]),
        ...FRIENDS.map((i) => [out(friends.current[i], friendLabels.current[i]), goal]),
      ].map(([from, to]) => ({ from, to, d: beamPath(from, to, orientation) }));
      const next = { w: el.offsetWidth, h: el.offsetHeight, beams };
      const key = JSON.stringify(next);
      if (key !== last) {
        last = key;
        setGeo(next);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    [youLabel.current, ...friendLabels.current].forEach((n) => n && ro.observe(n));
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [vertical, orientation, lang]);

  const ready = geo !== null;

  useGSAP(
    () => {
      if (!ready || reduced) return;
      if (played.current) {
        // Re-laid out (e.g. rotated to the other orientation) after it already played: stay on the final state.
        onStage(STAGE_DONE);
        return;
      }
      const q = gsap.utils.selector(container);
      const beams = q("[data-beam]");
      const toFriend = beams.slice(0, 3);
      const toTicket = beams.slice(3);
      const lines = (list) => list.flatMap((g) => [g.querySelector("[data-beam-line]"), g.querySelector("[data-beam-glow]")]);
      const ons = q("[data-friend-on]");
      const badges = q("[data-friend-badge]");
      const flip = q("[data-ticket-flip]")[0];
      const slot = q("[data-ticket-slot]")[0];

      // Start state.
      gsap.set(lines(beams), { drawSVG: "0% 0%", autoAlpha: 0 });
      gsap.set(q("[data-you-ring]"), { autoAlpha: 0, scale: 0.7 });
      gsap.set(q("[data-you-link]"), { autoAlpha: 0, scale: 0.3 });
      gsap.set(ons, { autoAlpha: 0, scale: 0.6 });
      gsap.set(badges, { autoAlpha: 0, scale: 0.4, y: 6 });
      gsap.set(flip, { rotateY: 180, scale: 0.92 });
      gsap.set(q("[data-ticket-glow]"), { autoAlpha: 0 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "mv.out" },
        onComplete: () => {
          // Let the lines draw natively again, so a later resize can't leave a stale dash pattern.
          gsap.set(lines(beams), { clearProps: "strokeDasharray,strokeDashoffset" });
          onStage(STAGE_DONE);
        },
      });

      tl.addLabel("step1", 0.3)
        .call(onStage, [1], "step1")
        .to(q("[data-you-ring]"), { autoAlpha: 1, scale: 1, duration: 0.7 }, "step1")
        .to(q("[data-you-link]"), { autoAlpha: 1, scale: 1, duration: 0.5, ease: "mv.spring" }, "step1+=0.25")
        .addLabel("step2", "step1+=0.95")
        .call(onStage, [2], "step2");

      // Positions as plain offsets from "step2" (GSAP reads one offset per position string, "label+=a-=b" drops b).
      const after2 = (n) => `step2+=${Math.max(0, n).toFixed(2)}`;
      toFriend.forEach((g, i) => {
        const fire = i * STAGGER;
        const land = fire + DRAW;
        const line = g.querySelector("[data-beam-line]");
        const token = g.querySelector("[data-token]");
        tl.set(lines([g]), { autoAlpha: 1 }, after2(fire))
          .to(lines([g]), { drawSVG: "0% 100% live", duration: DRAW, ease: "mv.inOut" }, after2(fire))
          .fromTo(token, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.2 }, after2(fire))
          .to(token, { motionPath: { path: line }, duration: DRAW, ease: "mv.inOut" }, after2(fire))
          .to(token, { autoAlpha: 0, scale: 0.5, duration: 0.2, ease: "power2.in" }, after2(land - 0.12))
          .to(ons[i], { autoAlpha: 1, scale: 1, duration: 0.6, ease: "mv.spring" }, after2(land - 0.08))
          .to(badges[i], { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "mv.spring" }, after2(land));
        if (i === 0) tl.addLabel("step3", after2(land - 0.08)).call(onStage, [3], "step3");
      });

      const converge = 2 * STAGGER + DRAW + 0.15; // just after the third friend lights up
      tl.set(lines(toTicket), { autoAlpha: 1 }, after2(converge))
        .to(lines(toTicket), { drawSVG: "0% 100% live", duration: 0.75, ease: "mv.inOut", stagger: 0.05 }, after2(converge))
        .addLabel("step4", after2(converge + 0.8)) // the beams reach the ticket
        .call(onStage, [4], "step4")
        .to(flip, { rotateY: 0, scale: 1, duration: 1.1, ease: "back.out(1.4)" }, "step4")
        .to(q("[data-ticket-glow]"), { autoAlpha: 1, duration: 0.9 }, "step4+=0.2")
        .call(() => burstFrom(slot), null, "step4+=0.35");

      ScrollTrigger.create({
        trigger: container.current,
        start: "center 78%",
        once: true,
        onEnter: () => {
          played.current = true;
          preloadConfetti();
          tl.play();
        },
      });
    },
    { scope: container, dependencies: [ready, orientation, reduced], revertOnUpdate: true },
  );

  return (
    <div ref={container} aria-hidden="true" className="relative mx-auto w-full max-w-[420px] select-none sm:h-[360px] sm:max-w-[680px] lg:h-[400px]">
      {geo && (
        <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
          {geo.beams.map((b, i) => (
            <AnimatedBeam key={i} d={b.d} from={b.from} to={b.to}>
              {i < 3 && <Token label={percent} />}
            </AnimatedBeam>
          ))}
        </svg>
      )}

      <div className="relative flex flex-col items-center gap-[92px] sm:h-full sm:flex-row sm:justify-between sm:gap-0 sm:px-2">
        {/* You */}
        <div className="relative">
          <div
            ref={you}
            className="relative grid h-16 w-16 place-items-center rounded-full border border-mv-violet-400/50 bg-mv-surface text-mv-violet-200 shadow-[0_0_44px_-10px_rgb(var(--mv-violet-500)/0.8)] sm:h-[76px] sm:w-[76px]"
          >
            <span data-you-ring className="absolute -inset-2 rounded-full border border-mv-violet-400/35" />
            <UserRound size={28} strokeWidth={1.5} />
            <span data-you-link className="absolute -right-1.5 -top-1.5 grid h-7 w-7 place-items-center rounded-full bg-mv-violet-500 text-white shadow-[0_4px_16px_-4px_rgb(var(--mv-violet-500)/0.9)]">
              <Link2 size={14} strokeWidth={2} />
            </span>
          </div>
          <NodeLabel labelRef={youLabel}>{t("referral.you")}</NodeLabel>
        </div>

        {/* Friends */}
        <div className="grid w-full max-w-[340px] grid-cols-3 sm:w-auto sm:grid-cols-1 sm:gap-y-[52px]">
          {FRIENDS.map((i) => (
            <div key={i} className="relative flex justify-center">
              <div className="relative">
                <div
                  ref={(n) => (friends.current[i] = n)}
                  className="relative grid h-[52px] w-[52px] place-items-center rounded-full border border-dashed border-mv-line-strong bg-mv-surface text-mv-muted sm:h-14 sm:w-14"
                >
                  <User size={20} strokeWidth={1.5} />
                  <span
                    data-friend-on
                    className="absolute -inset-px grid place-items-center rounded-full border border-mv-violet-400/70 text-mv-violet-200 shadow-[0_0_30px_-8px_rgb(var(--mv-violet-500)/0.9)]"
                    style={{ background: "radial-gradient(circle at 50% 30%, rgb(var(--mv-violet-500) / 0.35), rgb(var(--mv-surface)) 72%)" }}
                  >
                    <User size={20} strokeWidth={1.75} />
                  </span>
                  <span
                    data-friend-badge
                    className="absolute -right-6 -top-2.5 whitespace-nowrap rounded-full border border-mv-violet-300/60 bg-mv-violet-500 px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-white"
                  >
                    {percent}
                  </span>
                </div>
                <NodeLabel labelRef={(n) => (friendLabels.current[i] = n)}>{t("referral.friend")}</NodeLabel>
              </div>
            </div>
          ))}
        </div>

        {/* The free-menu ticket */}
        <ReferralTicket ref={ticket} />
      </div>
    </div>
  );
}

export default memo(ReferralDiagram);
