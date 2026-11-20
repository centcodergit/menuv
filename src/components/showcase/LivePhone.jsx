import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { useInViewMount } from "@/hooks/useInViewMount";
import { useIsTouch } from "@/hooks/useIsTouch";
import { cn } from "@/lib/utils";

const DEVICE_W = 390;
const DEVICE_H = 844;

/**
 * Magic UI "iPhone" idea as a CSS frame (matching the hero phone): the client's live menu in a lazy,
 * sandboxed iframe, mounted only near the viewport. `fallback` renders inside the screen until the frame
 * has loaded (and instead of it if the site ever refuses framing). On touch screens the frame is view-only, so a
 * swipe over the phone scrolls the page instead of getting trapped in the menu (the CTA opens the real menu).
 */
export default function LivePhone({ url, name, fallback, className }) {
  const t = useT();
  const [ref, near] = useInViewMount("50% 0px");
  const screen = useRef(null);
  const [scale, setScale] = useState(0.7);
  const [loaded, setLoaded] = useState(false);
  const isTouch = useIsTouch();

  useEffect(() => {
    const el = screen.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / DEVICE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        className="relative rounded-phone p-[3.2%]"
        style={{
          background: "linear-gradient(160deg, #2A2638 0%, #14121C 38%, #0B0A12 100%)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.18), 0 40px 90px -30px rgba(76,29,149,0.65)",
        }}
      >
        <div ref={screen} className="relative overflow-hidden rounded-[calc(44px*0.86)] bg-mv-ink" style={{ aspectRatio: `${DEVICE_W} / ${DEVICE_H}` }}>
          <div className={cn("absolute inset-0 transition-opacity duration-700", loaded ? "opacity-0" : "opacity-100")}>{fallback}</div>
          {near && (
            <iframe
              src={url}
              title={t("showcase.frameTitle", { name })}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setLoaded(true)}
              tabIndex={isTouch ? -1 : undefined}
              className={cn("absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0", isTouch && "pointer-events-none")}
              style={{ width: DEVICE_W, height: DEVICE_H, transform: `scale(${scale})` }}
            />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[1.4%] h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}
