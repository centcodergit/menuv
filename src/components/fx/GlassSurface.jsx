import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits "Glass Surface", rebuilt and re-themed: refractive liquid glass via an SVG displacement
 * filter used as a backdrop-filter, with a slight chromatic split at the edges.
 * Only Chromium supports `backdrop-filter: url(#filter)`; Safari and Firefox get obsidian glass (4.6).
 */
function supportsSvgBackdrop() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isWebkit = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isWebkit || isFirefox) return false;
  const probe = document.createElement("div");
  probe.style.backdropFilter = "url(#probe)";
  return probe.style.backdropFilter !== "";
}

function displacementMap(width, height, radius, edge) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
<defs>
<linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>
<linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient>
</defs>
<rect width="${width}" height="${height}" fill="black"/>
<rect width="${width}" height="${height}" rx="${radius}" fill="url(#r)"/>
<rect width="${width}" height="${height}" rx="${radius}" fill="url(#b)" style="mix-blend-mode:difference"/>
<rect x="${edge}" y="${edge}" width="${Math.max(0, width - edge * 2)}" height="${Math.max(0, height - edge * 2)}" rx="${Math.max(0, radius - edge)}" fill="hsl(0 0% 50% / 0.93)" style="filter:blur(11px)"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function GlassSurface({ className, radius = 999, distortion = -70, active = true }) {
  const id = `glass-${useId().replace(/[:]/g, "")}`;
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 860, h: 64 });
  const supported = useMemo(supportsSvgBackdrop, []);

  useEffect(() => {
    if (!supported || !ref.current) return undefined;
    let frame = 0;
    const ro = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { width, height } = entry.contentRect;
        setBox({ w: Math.round(width), h: Math.round(height) });
      });
    });
    ro.observe(ref.current);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [supported]);

  const r = Math.min(radius, box.h / 2);
  const map = useMemo(() => displacementMap(box.w, box.h, r, Math.min(box.w, box.h) * 0.07 * 0.5), [box.w, box.h, r]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-500 ease-mv-out",
        active ? "opacity-100" : "opacity-0",
        !supported && "glass",
        className,
      )}
      style={{
        borderRadius: radius,
        ...(supported
          ? {
              background: "rgb(var(--mv-surface) / 0.38)",
              // Refraction at the edges, then a soft blur so labels stay readable over busy content.
              backdropFilter: `url(#${id}) blur(10px) saturate(1.6)`,
              border: "1px solid var(--mv-line)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.04), 0 12px 40px -12px rgba(0,0,0,0.55)",
            }
          : null),
      }}
    >
      {supported && (
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id={id} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage href={map} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={distortion} xChannelSelector="R" yChannelSelector="G" result="dR" />
            <feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={distortion + 5} xChannelSelector="R" yChannelSelector="G" result="dG" />
            <feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={distortion + 10} xChannelSelector="R" yChannelSelector="G" result="dB" />
            <feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="out" />
            <feGaussianBlur in="out" stdDeviation="0.7" />
          </filter>
        </svg>
      )}
    </div>
  );
}
