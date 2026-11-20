import { useI18n } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop, useIsTouch } from "@/hooks/useIsTouch";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import MagicBento from "@/components/features/MagicBento";
import BentoCard from "@/components/features/BentoCard";
import QrDemo from "@/components/features/QrDemo";
import LiveDemo from "@/components/features/LiveDemo";
import TemplatesDemo from "@/components/features/TemplatesDemo";
import LanguagesDemo from "@/components/features/LanguagesDemo";
import AnalyticsDemo from "@/components/features/AnalyticsDemo";
import DietaryDemo from "@/components/features/DietaryDemo";

/**
 * Bento placement. Desktop (6 columns): QR and Live share the first row with Templates (tall, two rows) on
 * the right; Languages runs wide under them; Analytics (wide) and Dietary close the grid.
 * Tablet (2 columns): wide cards span both columns and switch to a side-by-side layout. Mobile: one column.
 */
const FEATURES = [
  { id: "qr", Demo: QrDemo, className: "lg:col-span-2" },
  { id: "live", Demo: LiveDemo, className: "lg:col-span-2" },
  { id: "templates", Demo: TemplatesDemo, className: "md:col-span-2 lg:col-span-2 lg:row-span-2", layout: "split-md" },
  { id: "languages", Demo: LanguagesDemo, className: "lg:col-span-4", layout: "split-lg" },
  { id: "analytics", Demo: AnalyticsDemo, className: "lg:col-span-4", layout: "split-lg" },
  { id: "dietary", Demo: DietaryDemo, className: "md:col-span-2 lg:col-span-2", layout: "split-md" },
];

/**
 * 7.2 Features, "Όλα Όσα Χρειάζεστε": six stone cards in a Magic Bento grid, each with a live micro-demo.
 * Desktop with a fine pointer: spotlight, edge light, particles, magnetism, click ripple; demos loop while
 * their card is in view. Touch: one column on phones, no pointer effects, each demo plays once.
 * Reduced motion: no entrance, no loops, every demo shown in its final state.
 */
export default function Features() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const isDesktop = useIsDesktop();
  const mode = reduced ? "static" : isTouch ? "once" : "loop";
  const fx = isDesktop && !reduced;

  return (
    // overflow-x-clip: the header aurora (-inset-x-24) and the spotlight must not widen the page on phones.
    <Section id="features" bg="base" aria-labelledby="features-title" className="overflow-x-clip">
      <div className="container-mv">
        <SectionHeader
          id="features"
          titleId="features-title"
          eyebrow={t("features.eyebrow")}
          title={t("features.title")}
          lead={t("features.lead")}
          accentWords={1}
        />
        <MagicBento fx={fx} reduced={reduced} className="mt-14 lg:mt-20">
          {FEATURES.map((f, i) => (
            <BentoCard
              key={f.id}
              id={f.id}
              label={String(i + 1).padStart(2, "0")}
              title={t(`features.${f.id}.title`)}
              body={t(`features.${f.id}.body`)}
              Demo={f.Demo}
              layout={f.layout}
              className={f.className}
              mode={mode}
              fx={fx}
              reduced={reduced}
            />
          ))}
        </MagicBento>
      </div>
    </Section>
  );
}
