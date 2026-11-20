import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import BorderBeam from "@/components/fx/BorderBeam";

const LAP = 1.8;

/**
 * One Border Beam lap around a card as it lands (master prompt 7.2). BorderBeam's single lap ends where it
 * started, so the light is faded out at the end of the lap and then unmounted (`onDone`).
 */
export default function BeamLap({ onDone }) {
  const wrap = useRef(null);
  const done = useRef(onDone);
  done.current = onDone;

  useGSAP(
    () => {
      gsap.to(wrap.current, { opacity: 0, duration: 0.45, delay: LAP - 0.35, ease: "power2.out", onComplete: () => done.current?.() });
    },
    { scope: wrap },
  );

  return (
    <span ref={wrap} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]">
      <BorderBeam once play duration={LAP} size={160} radius={28} width={1.5} />
    </span>
  );
}
