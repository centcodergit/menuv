import { memo } from "react";
import FitBox from "@/components/how/FitBox";
import SignupCard from "@/components/how/SignupCard";
import Moodboard from "@/components/how/Moodboard";
import MenuBuilder from "@/components/how/MenuBuilder";
import ShareTable from "@/components/how/ShareTable";
import { ART_H, ART_W } from "@/components/how/steps";

const ART = { 1: SignupCard, 2: Moodboard, 3: MenuBuilder, 4: ShareTable };

/**
 * One step's illustration (decorative, aria-hidden), built in code at 560 × 440 and scaled to its box.
 * active: loop playing (panel centred and on screen). still: reduced motion, final frame only.
 */
function StepIllustration({ n, active = false, still = false, align, className, style }) {
  const Art = ART[n];
  return (
    <FitBox width={ART_W} height={ART_H} align={align} className={className} style={style} aria-hidden="true">
      <Art key={still ? "still" : "live"} active={active && !still} still={still} />
    </FitBox>
  );
}

export default memo(StepIllustration);
