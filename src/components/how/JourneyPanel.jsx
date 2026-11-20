import { memo } from "react";
import Marker from "@/components/how/Marker";
import Numeral from "@/components/how/Numeral";
import StepIllustration from "@/components/how/StepIllustration";
import { J } from "@/components/how/steps";

/**
 * One 72vw panel of the desktop journey. Everything hangs off the stage's `--band` line (the path):
 * numeral above it on the left, the step marker on it, title + body below it, illustration above it on the right
 * (sitting on the line). The path's valley runs through the empty space under the illustration.
 */
function JourneyPanel({ n, title, body, active }) {
  return (
    <li data-panel className="relative h-full shrink-0" style={{ width: `${J.panel}vw` }}>
      <div className="absolute" style={{ left: "4.5vw", bottom: "calc(100% - var(--band) + 0.85rem)" }}>
        <Numeral n={n} radius={1.3} className="h-[clamp(6rem,10.5vw,10.5rem)] w-auto" />
      </div>
      <Marker style={{ left: `${J.marker}vw`, top: "var(--band)" }} />
      <div className="absolute" style={{ left: "4.5vw", top: "calc(var(--band) + 1.6rem)", width: "max(17rem, 24vw)" }}>
        <h3 className="font-display text-h3 font-semibold text-mv-text">{title}</h3>
        <p className="mt-3 text-[1rem] leading-relaxed text-mv-muted">{body}</p>
      </div>
      <StepIllustration
        n={n}
        active={active}
        align="end"
        className="absolute"
        style={{ left: "31vw", right: "3vw", top: "calc(var(--nav-offset) + 1rem)", bottom: "calc(100% - var(--band) + 1.75rem)" }}
      />
    </li>
  );
}

export default memo(JourneyPanel);
