import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Plan layout (master prompt 7.8): 4 columns from 1280px, 2 × 2 on tablet, and on phones a horizontal
 * scroll-snap carousel that opens centred on the featured plan, with dots (pills that stretch when active).
 * Dots: tap or arrow keys to move between plans; Tab through the cards also scrolls them into view.
 */
export default function PlanTrack({ ids, featured, renderPlan, t, reduced }) {
  const mobile = useMediaQuery("(max-width: 767px)");
  const track = useRef(null);
  const dots = useRef([]);
  const start = Math.max(0, ids.indexOf(featured));
  const [active, setActive] = useState(start);

  const centre = useCallback((i, behavior = "auto") => {
    const el = track.current;
    const item = el?.children[i];
    if (!item) return;
    el.scrollTo({ left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2, behavior });
  }, []);

  // Phones open on the featured plan (instantly, before paint).
  useLayoutEffect(() => {
    if (!mobile) return;
    centre(start);
    setActive(start);
  }, [mobile, start, centre]);

  useEffect(() => {
    const el = track.current;
    if (!mobile || !el) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let distance = Infinity;
        [...el.children].forEach((child, i) => {
          const d = Math.abs(child.offsetLeft + child.offsetWidth / 2 - mid);
          if (d < distance) {
            distance = d;
            best = i;
          }
        });
        setActive(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [mobile]);

  const go = (i, focus = false) => {
    const next = (i + ids.length) % ids.length;
    setActive(next);
    centre(next, reduced ? "auto" : "smooth");
    if (focus) dots.current[next]?.focus();
  };

  const onDotsKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      go(e.key === "Home" ? 0 : ids.length - 1, true);
    } else if (step) {
      e.preventDefault();
      go(active + step, true);
    }
  };

  return (
    <>
      <ul
        ref={track}
        role="list"
        data-plan-track
        className={cn(
          "relative -mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-4 pt-6",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4 xl:gap-5",
        )}
      >
        {ids.map((id) => (
          <li key={id} data-plan-slide={id} className="w-[86%] max-w-[22rem] shrink-0 snap-center md:w-auto md:max-w-none">
            {renderPlan(id)}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-center md:hidden" onKeyDown={onDotsKey}>
        {ids.map((id, i) => (
          <button
            key={id}
            ref={(el) => {
              dots.current[i] = el;
            }}
            type="button"
            data-plan-dot={id}
            aria-label={t(`pricing.plans.${id}.name`)}
            aria-current={active === i ? "true" : undefined}
            tabIndex={active === i ? 0 : -1}
            onClick={() => go(i)}
            className="group grid h-11 min-w-[44px] place-items-center rounded-full"
          >
            <span
              aria-hidden="true"
              className={cn(
                "block h-1.5 rounded-full transition-all duration-500 ease-mv-out",
                active === i ? "w-7 bg-mv-violet-400" : "w-1.5 bg-mv-text/25 group-hover:bg-mv-text/45",
              )}
            />
          </button>
        ))}
      </div>
    </>
  );
}
