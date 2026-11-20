import { useRef } from "react";
import Marker from "@/components/how/Marker";
import Numeral from "@/components/how/Numeral";
import StepIllustration from "@/components/how/StepIllustration";
import { ART_H, ART_W } from "@/components/how/steps";
import { useVisible } from "@/components/how/useVisible";

/**
 * One step of the vertical timeline (mobile, touch, <1024px, reduced motion): marker on the beam, numeral,
 * title, body, then the illustration (beside the text from 768px, with the text column sticky).
 * The illustration loops only while at least a third of it is on screen.
 */
export default function TimelineStep({ n, title, body, still }) {
  const art = useRef(null);
  const onScreen = useVisible(art, { threshold: 0.33, enabled: !still });
  return (
    <li data-step className="relative pb-16 pl-12 last:pb-0 sm:pl-16 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 md:pb-24">
      <Marker lit={still} className="left-[11px] top-[2.1rem] sm:left-[19px] md:top-[2.6rem]" />
      <div className="md:sticky md:top-32 md:self-start">
        <Numeral n={n} radius={2.6} filled={still} className="h-[4.25rem] w-auto md:h-[5.25rem]" />
        <h3 className="mt-5 font-display text-h3 font-semibold text-mv-text">{title}</h3>
        <p className="mt-3 max-w-[34rem] text-mv-muted">{body}</p>
      </div>
      <div ref={art} className="mt-8 md:mt-0">
        <StepIllustration n={n} active={onScreen} still={still} className="mx-auto w-full max-w-[560px]" style={{ aspectRatio: `${ART_W} / ${ART_H}` }} />
      </div>
    </li>
  );
}
