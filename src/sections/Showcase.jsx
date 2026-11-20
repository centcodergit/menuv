import { lazy, Suspense } from "react";
import { useT } from "@/lib/i18n";
import { SHOWCASE } from "@/content/showcase";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import ShowcaseSlide from "@/components/showcase/ShowcaseSlide";

const ShowcaseCarousel = lazy(() => import("@/components/showcase/ShowcaseCarousel"));

// Role line per showcase client, from the dictionaries where one exists (the testimonial has it).
const ROLE_KEYS = { anima: "testimonials.items.anima.role" };

/**
 * 7.7 Showcase, "Δείτε το Menuverse σε Δράση": real client menus only. One client today, so no carousel
 * controls; from two clients up the Embla carousel (arrows, dots, depth effect) takes over automatically.
 */
export default function Showcase() {
  const t = useT();
  const items = [...SHOWCASE].sort((a, b) => a.order - b.order);
  const slides = items.map((item) => <ShowcaseSlide key={item.id} item={item} role={ROLE_KEYS[item.id] ? t(ROLE_KEYS[item.id]) : null} />);

  return (
    <Section bg="base" aria-labelledby="showcase-title">
      <div className="container-mv">
        <SectionHeader id="showcase" eyebrow={t("showcase.eyebrow")} title={t("showcase.title")} lead={t("showcase.lead")} accentWords={2} titleId="showcase-title" />
        <div className="mt-14 md:mt-20">
          {slides.length > 1 ? (
            <Suspense fallback={slides[0]}>
              <ShowcaseCarousel slides={slides} />
            </Suspense>
          ) : (
            slides[0]
          )}
        </div>
      </div>
    </Section>
  );
}
