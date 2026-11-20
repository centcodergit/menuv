import { useId } from "react";
import { cn } from "@/lib/utils";

/** Fill clip rectangle positions (viewBox units): below the digits = empty, above = fully filled. */
export const FILL_EMPTY = 172;
export const FILL_FULL = -40;

/**
 * Giant step numeral "01" … "04" (Commissioner 800). The outline is traced from the filled glyphs with an SVG
 * filter (erode + cut out, the 404 technique): a plain text stroke would show the variable font's overlapping
 * contours as stray lines. A second copy in the text gradient sits on top behind a clip rectangle
 * (`[data-numeral-fill]`); animating its `y` from FILL_EMPTY to FILL_FULL fills the numeral from the bottom.
 * `radius` is the outline width in viewBox units (pick it for the rendered size: about 1.2px on screen).
 */
export default function Numeral({ n, radius = 1.4, filled = false, className }) {
  const uid = useId().replace(/:/g, "");
  const label = String(n).padStart(2, "0");
  const text = {
    x: 2,
    y: 158,
    fontSize: 200,
    fontWeight: 800,
    letterSpacing: -9,
    fontFamily: '"Commissioner Variable", system-ui, sans-serif',
  };
  return (
    <svg viewBox="0 0 250 170" aria-hidden="true" className={cn("overflow-visible", className)}>
      <defs>
        <filter id={`mv-num-o-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
          <feMorphology in="SourceAlpha" operator="erode" radius={radius} result="inner" />
          <feComposite in="SourceGraphic" in2="inner" operator="out" />
        </filter>
        <linearGradient id={`mv-num-g-${uid}`} x1="0" y1="14" x2="0" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "rgb(var(--mv-text))" }} />
          <stop offset="0.55" style={{ stopColor: "rgb(var(--mv-violet-300))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--mv-violet-500))" }} />
        </linearGradient>
        <clipPath id={`mv-num-c-${uid}`}>
          <rect data-numeral-fill x="-20" y={filled ? FILL_FULL : FILL_EMPTY} width="300" height="212" />
        </clipPath>
      </defs>
      <text {...text} opacity="0.4" filter={`url(#mv-num-o-${uid})`} style={{ fill: "rgb(var(--mv-violet-400))" }}>
        {label}
      </text>
      <text {...text} fill={`url(#mv-num-g-${uid})`} clipPath={`url(#mv-num-c-${uid})`}>
        {label}
      </text>
    </svg>
  );
}
