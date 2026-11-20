import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { gsap, Draggable } from "@/lib/gsap-extra";
import { useGSAP } from "@/lib/gsap";
import { useT } from "@/lib/i18n";
import GradualBlur from "@/components/fx/GradualBlur";
import { FocusCards, FocusCard } from "@/components/fx/FocusCards";

// Track padding = the page container's inner edge (1280px max, page gutters), so card 1 lines up with the header.
const GUTTER = "clamp(20px, 4vw, 48px)";
const EDGE = `max(${GUTTER}, calc((100% - 1280px) / 2 + ${GUTTER}))`;
const BLUR_SIZE = `max(28px, min(150px, calc((100% - 1280px) / 2 + ${GUTTER})))`;

const nearest = (points, v) => points.reduce((best, p) => (Math.abs(p - v) < Math.abs(best - v) ? p : best), points[0] ?? 0);

/**
 * Desktop rail (fine pointer, >= 1024px): GSAP Draggable + Inertia with bounds and snap to cards, horizontal
 * trackpad / shift-wheel (plain vertical wheel keeps scrolling the page), arrow keys, Gradual Blur on both edges,
 * Focus Cards hover. A drag never opens a card (`wasDragged()`; cards check it on click).
 * Reduced motion: no throw, moves are instant.
 */
const ArticleRail = forwardRef(function ArticleRail({ items, reduced, renderCard, label }, ref) {
  const t = useT();
  const viewport = useRef(null);
  const track = useRef(null);
  const api = useRef({ points: [0], minX: 0, drag: null, dragged: false });

  const cardEls = () => [...track.current.querySelectorAll("[data-rail-item]")];

  const measure = useCallback(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return;
    const els = cardEls();
    const minX = Math.min(0, vp.clientWidth - tr.scrollWidth);
    const first = els[0]?.offsetLeft ?? 0;
    const points = [...new Set(els.map((el) => Math.max(minX, -(el.offsetLeft - first))))];
    if (!points.includes(minX)) points.push(minX);
    api.current.points = points.sort((a, b) => b - a);
    api.current.minX = minX;
    api.current.drag?.applyBounds({ minX, maxX: 0 });
    const x = gsap.getProperty(tr, "x");
    if (x < minX) gsap.set(tr, { x: minX });
    api.current.drag?.update();
  }, []);

  const moveTo = useCallback(
    (x, { immediate = false } = {}) => {
      const { minX, drag } = api.current;
      const target = Math.max(minX, Math.min(0, x));
      if (immediate || reduced) {
        // synchronous: no wait for the next ticker frame
        gsap.killTweensOf(track.current);
        gsap.set(track.current, { x: target });
        drag?.update();
        return;
      }
      gsap.to(track.current, {
        x: target,
        duration: 0.75,
        ease: "mv.out",
        overwrite: true,
        onUpdate: () => drag?.update(),
        onComplete: () => drag?.update(),
      });
    },
    [reduced],
  );

  const currentIndex = () => {
    const { points } = api.current;
    const x = gsap.getProperty(track.current, "x");
    return points.indexOf(nearest(points, x));
  };

  const goToIndex = useCallback(
    (i, opts) => {
      const { points } = api.current;
      moveTo(points[Math.max(0, Math.min(points.length - 1, i))], opts);
    },
    [moveTo],
  );

  /** Bring a card fully into view (keyboard focus, deep links, focus return after the reader). */
  const reveal = useCallback(
    (slug, opts) => {
      const els = cardEls();
      const el = els.find((c) => c.dataset.railItem === slug);
      if (!el) return;
      const vp = viewport.current.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const inset = 24;
      if (r.left >= vp.left + inset && r.right <= vp.right - inset) return;
      const first = els[0].offsetLeft;
      moveTo(-(el.offsetLeft - first), opts);
    },
    [moveTo],
  );

  useImperativeHandle(ref, () => ({ reveal, wasDragged: () => api.current.dragged }), [reveal]);

  useGSAP(
    () => {
      const tr = track.current;
      const vp = viewport.current;
      const [drag] = Draggable.create(tr, {
        type: "x",
        bounds: { minX: api.current.minX, maxX: 0 },
        inertia: !reduced,
        edgeResistance: 0.85,
        dragClickables: true,
        minimumMovement: 6,
        cursor: "inherit",
        activeCursor: "inherit",
        zIndexBoost: false,
        allowContextMenu: true,
        snap: { x: (v) => nearest(api.current.points, v) },
        onPress() {
          api.current.dragged = false;
        },
        onDragStart() {
          api.current.dragged = true;
          vp.dataset.dragging = "true";
        },
        onDragEnd() {
          delete vp.dataset.dragging;
          if (reduced) moveTo(nearest(api.current.points, this.x), { immediate: true });
        },
      });
      api.current.drag = drag;
      measure();

      // Horizontal trackpad / shift + wheel move the rail; a plain vertical wheel is left to the page (Lenis).
      let target = null;
      let settle = 0;
      const onWheel = (e) => {
        const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const dx = horizontal ? e.deltaX : e.shiftKey ? e.deltaY : 0;
        if (!dx) return;
        e.preventDefault();
        e.lenisStopPropagation = true; // tell Lenis this gesture is taken
        const { minX } = api.current;
        if (target === null || !gsap.isTweening(tr)) target = gsap.getProperty(tr, "x");
        target = Math.max(minX, Math.min(0, target - dx));
        if (reduced) {
          gsap.set(tr, { x: target });
          drag.update();
        } else {
          gsap.to(tr, { x: target, duration: 0.45, ease: "power3.out", overwrite: true, onUpdate: () => drag.update() });
        }
        window.clearTimeout(settle);
        settle = window.setTimeout(() => {
          target = null;
          moveTo(nearest(api.current.points, gsap.getProperty(tr, "x")));
        }, 180);
      };
      vp.addEventListener("wheel", onWheel, { passive: false });

      // Tabbing onto a card that is off to the side slides it into view.
      const onFocusIn = (e) => {
        const item = e.target.closest?.("[data-rail-item]");
        if (item) reveal(item.dataset.railItem);
      };
      vp.addEventListener("focusin", onFocusIn);

      const ro = new ResizeObserver(() => measure());
      ro.observe(vp);
      ro.observe(tr);

      return () => {
        window.clearTimeout(settle);
        vp.removeEventListener("wheel", onWheel);
        vp.removeEventListener("focusin", onFocusIn);
        ro.disconnect();
        drag.kill();
        api.current.drag = null;
        gsap.killTweensOf(tr);
      };
    },
    { scope: viewport, dependencies: [reduced, items.length] },
  );

  const onKeyDown = (e) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const links = cardEls().map((c) => c.querySelector("[data-article-link]"));
    const focusedIdx = links.indexOf(document.activeElement);
    if (focusedIdx >= 0) {
      // Focus is on a card: move focus to the neighbour (focusin slides it into view).
      const last = links.length - 1;
      const next = e.key === "Home" ? 0 : e.key === "End" ? last : focusedIdx + (e.key === "ArrowRight" ? 1 : -1);
      links[Math.max(0, Math.min(last, next))]?.focus({ preventScroll: true });
      return;
    }
    const last = api.current.points.length - 1;
    if (e.key === "Home") goToIndex(0);
    else if (e.key === "End") goToIndex(last);
    else goToIndex(currentIndex() + (e.key === "ArrowRight" ? 1 : -1));
  };

  return (
    <div className="relative">
      <div
        ref={viewport}
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        data-cursor="drag"
        data-cursor-label={t("cursor.drag")}
        data-articles-rail=""
        className="group/rail relative py-8 [overflow-x:clip] focus-visible:outline-offset-[-2px]"
      >
        <FocusCards reduced={reduced}>
          <ul
            ref={track}
            className="flex w-max touch-pan-y select-none items-stretch gap-6 will-change-transform [transition-property:none]"
            style={{ paddingInline: EDGE }}
          >
            {items.map((item, i) => (
              <FocusCard
                key={item.slug}
                as="li"
                index={i}
                data-rail-item={item.slug}
                className="w-[clamp(340px,27vw,400px)] shrink-0 group-data-[dragging=true]/rail:!scale-100 group-data-[dragging=true]/rail:!opacity-100 group-data-[dragging=true]/rail:!blur-0"
              >
                {renderCard(item, i)}
              </FocusCard>
            ))}
          </ul>
        </FocusCards>
      </div>
      <GradualBlur position="left" size={BLUR_SIZE} strength={2.2} divCount={6} />
      <GradualBlur position="right" size={BLUR_SIZE} strength={2.2} divCount={6} />
    </div>
  );
});

export default ArticleRail;
