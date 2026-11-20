import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Magnet from "@/components/fx/Magnet";

/**
 * Embla carousel shell for the showcase, used from two clients up (master prompt 3.11 / 7.7):
 * inactive slides scale to 0.86, dim to 40% and blur 2px; magnetic arrows; pill dots that stretch when active.
 * Arrow keys move between slides when the carousel has focus.
 */
export default function ShowcaseCarousel({ slides }) {
  const t = useT();
  const [viewport, api] = useEmblaCarousel({ loop: false, align: "center" });
  const [selected, setSelected] = useState(0);

  const tween = useCallback(() => {
    if (!api) return;
    const progress = api.scrollProgress();
    api.scrollSnapList().forEach((snap, i) => {
      const diff = Math.min(1, Math.abs(snap - progress) * slides.length);
      const node = api.slideNodes()[i];
      node.style.transform = `scale(${1 - diff * 0.14})`;
      node.style.opacity = String(1 - diff * 0.6);
      node.style.filter = diff > 0.05 ? `blur(${diff * 2}px)` : "none";
    });
  }, [api, slides.length]);

  useEffect(() => {
    if (!api) return undefined;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    tween();
    onSelect();
    api.on("scroll", tween).on("reInit", tween).on("select", onSelect);
    return () => api.off("scroll", tween).off("reInit", tween).off("select", onSelect);
  }, [api, tween]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") api?.scrollPrev();
        if (e.key === "ArrowRight") api?.scrollNext();
      }}
      className="outline-none"
    >
      <div ref={viewport} className="overflow-hidden" data-cursor="drag" data-cursor-label={t("cursor.drag")}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full px-4 transition-[filter] duration-300" aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}`}>
              {slide}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 flex items-center justify-center gap-6">
        <Magnet>
          <button type="button" onClick={() => api?.scrollPrev()} aria-label={t("showcase.prev")} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-mv-line-strong hover:bg-mv-violet-500/15">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
        </Magnet>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`${i + 1} / ${slides.length}`}
              aria-current={selected === i}
              className={cn("h-2 rounded-full transition-[width,background-color] duration-500 ease-mv-out", selected === i ? "w-8 bg-mv-violet-400" : "w-2 bg-mv-line-strong")}
            />
          ))}
        </div>
        <Magnet>
          <button type="button" onClick={() => api?.scrollNext()} aria-label={t("showcase.next")} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-mv-line-strong hover:bg-mv-violet-500/15">
            <ArrowRight size={18} strokeWidth={1.5} />
          </button>
        </Magnet>
      </div>
    </div>
  );
}
