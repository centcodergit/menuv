import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import ReferralActions from "@/components/referral/ReferralActions";
import ReferralDiagram from "@/components/referral/ReferralDiagram";
import ReferralStepper from "@/components/referral/ReferralStepper";
import { STAGE_DONE } from "@/components/referral/steps";

/**
 * 7.9 Referral program, "Πάρτε το μενού σας, ΔΩΡΕΑΝ!" (logic 3.10). Left: header and the three actions.
 * Right: the Animated Beam diagram (you → three friends → a Holo Card free-menu ticket) that plays once in view.
 * Below: the 4 steps as a stepper whose active step follows the diagram's timeline.
 * Reduced motion: everything in its final state (beams drawn, ticket showing, all steps done).
 */
export default function Referral() {
  const t = useT();
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(() => (reduced ? STAGE_DONE : 0));

  useEffect(() => {
    if (reduced) setStage(STAGE_DONE);
  }, [reduced]);

  return (
    <Section id="referral" bg="base" aria-labelledby="referral-title">
      <div className="container-mv">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeader
              id="referral"
              align="left"
              eyebrow={t("referral.eyebrow")}
              title={t("referral.title")}
              lead={t("referral.body")}
              accentWords={1}
              titleId="referral-title"
            >
              <ReferralActions />
            </SectionHeader>
          </div>
          <div className="relative lg:col-span-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 opacity-70 blur-3xl"
              style={{ background: "radial-gradient(45% 55% at 60% 50%, rgb(var(--mv-violet-600) / 0.28), transparent 70%)" }}
            />
            <ReferralDiagram onStage={setStage} />
          </div>
        </div>
        <ReferralStepper stage={stage} className="mt-20 lg:mt-24" />
      </div>
    </Section>
  );
}
