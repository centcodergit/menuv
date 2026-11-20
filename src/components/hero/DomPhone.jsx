import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import PhoneMenu, { SCREEN_H, SCREEN_W } from "@/components/hero/PhoneMenu";

/**
 * CSS phone (master prompt 7.1 fallback): 44px radius, hairline border, inner violet glow, the live
 * <PhoneMenu> scaled to the frame. Used on touch devices, with reduced motion, and on desktop until the
 * 3D phone is ready (then it crossfades out). Size it with a width class; the height follows the screen ratio.
 */
export default function DomPhone({ menuProps, className, autoCycle = true, flash = false, interactive = true, style }) {
  const screen = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = screen.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / SCREEN_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn("relative", className)} style={style}>
      <div
        className="relative rounded-phone p-[3.2%]"
        style={{
          background: "linear-gradient(160deg, #2A2638 0%, #14121C 38%, #0B0A12 100%)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.18), 0 40px 90px -30px rgba(76,29,149,0.65), 0 0 80px -10px rgba(139,92,246,0.35)",
        }}
      >
        <span aria-hidden="true" className="absolute -left-[3px] top-[18%] h-[7%] w-[3px] rounded-l bg-[#1E1B29]" />
        <span aria-hidden="true" className="absolute -left-[3px] top-[28%] h-[11%] w-[3px] rounded-l bg-[#1E1B29]" />
        <span aria-hidden="true" className="absolute -right-[3px] top-[24%] h-[14%] w-[3px] rounded-r bg-[#1E1B29]" />
        <div
          ref={screen}
          className="relative overflow-hidden rounded-[calc(44px*0.86)]"
          style={{ aspectRatio: `${SCREEN_W} / ${SCREEN_H}`, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 40px rgba(139,92,246,0.18)" }}
        >
          <PhoneMenu
            {...menuProps}
            autoCycle={autoCycle}
            flash={flash}
            interactive={interactive}
            className="absolute left-0 top-0 origin-top-left"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
