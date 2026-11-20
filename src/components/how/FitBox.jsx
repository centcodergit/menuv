import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Scales fixed-size art (width × height in CSS px) to fit its box, keeping the ratio ("contain").
 * The scale is written straight to the transform (no re-render). align "end" sits the art on the box's bottom.
 * Give the box a size (absolute inset on desktop, or `w-full` + aspect ratio in the mobile timeline).
 */
export default function FitBox({ width, height, align = "center", className, style, children, ...props }) {
  const outer = useRef(null);
  const inner = useRef(null);

  useLayoutEffect(() => {
    const box = outer.current;
    const art = inner.current;
    if (!box || !art) return undefined;
    const apply = (w, h) => {
      const s = Math.max(0, Math.min(w / width, h / height)) || 0;
      art.style.transform = `translate(-50%, ${align === "end" ? "-100%" : "-50%"}) scale(${s.toFixed(4)})`;
    };
    apply(box.clientWidth, box.clientHeight);
    const ro = new ResizeObserver(([entry]) => apply(entry.contentRect.width, entry.contentRect.height));
    ro.observe(box);
    return () => ro.disconnect();
  }, [width, height, align]);

  return (
    <div ref={outer} className={cn("relative", className)} style={style} {...props}>
      <div
        ref={inner}
        className="absolute left-1/2"
        style={{ width, height, top: align === "end" ? "100%" : "50%", transformOrigin: align === "end" ? "50% 100%" : "50% 50%" }}
      >
        {children}
      </div>
    </div>
  );
}
