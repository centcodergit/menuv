import { useEffect } from "react";

/**
 * Lines up the parts of cards that sit in the same row: every `[data-eq="<group>"]` wrapper gets the min-height of
 * the tallest one in its row, measured from its first child (the natural content). Rows are cards with the same
 * layout top, so it works for 4 columns, 2 × 2 and the phone carousel alike. Copy length varies per language and
 * currency ("0 CHF" + "9,30 CHF" wraps where "0 €" does not), so fixed min-heights cannot keep the CTAs aligned.
 * Layout sizes (offsetHeight / offsetTop) ignore transforms, so the entrance, tilt and 1.04 scale don't disturb it.
 */
export default function useEqualRows(ref, groups, itemSelector) {
  const key = groups.join(",");
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof ResizeObserver === "undefined") return undefined;
    let frame = 0;

    const apply = () => {
      frame = 0;
      key.split(",").forEach((group) => {
        const rows = new Map();
        root.querySelectorAll(`[data-eq="${group}"]`).forEach((outer) => {
          const item = outer.closest(itemSelector);
          const inner = outer.firstElementChild;
          if (!item || !inner) return;
          const row = Math.round(item.offsetTop);
          const entry = rows.get(row) ?? { els: [], max: 0 };
          entry.els.push(outer);
          entry.max = Math.max(entry.max, inner.offsetHeight);
          rows.set(row, entry);
        });
        rows.forEach(({ els, max }) => els.forEach((el) => (el.style.minHeight = `${max}px`)));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    root.querySelectorAll("[data-eq] > :first-child").forEach((el) => ro.observe(el));
    schedule();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, key, itemSelector]);
}
