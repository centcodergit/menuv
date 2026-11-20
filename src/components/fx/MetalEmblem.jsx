import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The Menuverse mark as champagne "liquid metal", in SVG (no WebGL).
 *
 * The spec asks for Paper Shaders LiquidMetal; that is one more WebGL context, and the Coming soon section
 * already uses the desktop budget (background + globe + dish = 3). So the metal is built from SVG:
 *   1. a champagne metallic gradient fill clipped to the mark,
 *   2. a band of reflected light that slowly sweeps across it (the "liquid" sheen),
 *   3. a bevel lit by feSpecularLighting whose point light drifts over the mark, so the edges catch light.
 * Loops are 9s and 12s. `still` (reduced motion) freezes the light at a flattering angle.
 * SMIL animations are paused while the emblem is off screen.
 *
 * TO SWAP IN THE REAL LOGO: replace EMBLEM_VIEWBOX and <EmblemShape> with the logo mark's viewBox and paths
 * (shapes only, no fills: the metal is applied through a clip path and the alpha channel).
 * The shapes below mirror the placeholder LogoMark in src/components/nav/Logo.jsx.
 */
export const EMBLEM_VIEWBOX = "0 0 24 24";
export function EmblemShape() {
  return (
    <>
      <rect x="2" y="2" width="8.5" height="8.5" rx="2.2" />
      <rect x="13.5" y="2" width="8.5" height="8.5" rx="2.2" />
      <rect x="2" y="13.5" width="8.5" height="8.5" rx="2.2" />
      <rect x="13.5" y="13.5" width="3.6" height="3.6" rx="1" />
      <rect x="18.4" y="18.4" width="3.6" height="3.6" rx="1" />
    </>
  );
}

export default function MetalEmblem({ still = false, className, ...props }) {
  const uid = useId().replace(/:/g, "");
  const svg = useRef(null);
  const id = (name) => `mv-metal-${name}-${uid}`;

  // Pause SMIL while off screen (and always when still).
  useEffect(() => {
    const el = svg.current;
    if (!el || still) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      try {
        if (entry.isIntersecting) el.unpauseAnimations();
        else el.pauseAnimations();
      } catch {
        /* SMIL unsupported: static metal */
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  return (
    <svg ref={svg} viewBox={EMBLEM_VIEWBOX} aria-hidden="true" className={cn("overflow-visible", className)} {...props}>
      <defs>
        <clipPath id={id("clip")}>
          <EmblemShape />
        </clipPath>
        {/* Champagne metal: dark bronze in the creases, champagne body, pale highlights. */}
        <linearGradient id={id("base")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF4D6" />
          <stop offset="0.18" stopColor="#E9D8A6" />
          <stop offset="0.42" stopColor="#B48F4E" />
          <stop offset="0.55" stopColor="#F3E3B8" />
          <stop offset="0.72" stopColor="#9C7738" />
          <stop offset="0.88" stopColor="#D9C08A" />
          <stop offset="1" stopColor="#6E5326" />
        </linearGradient>
        {/* The sweeping reflection band. */}
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.42" stopColor="#FFF8E6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFDF5" stopOpacity="0.85" />
          <stop offset="0.56" stopColor="#FFF8E6" stopOpacity="0.15" />
          <stop offset="0.66" stopColor="#4A3714" stopOpacity="0.28" />
          <stop offset="0.76" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("edge")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF6DA" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5A4219" stopOpacity="0.9" />
        </linearGradient>
        {/* Bevel + moving specular light on the mark's edges. */}
        <filter id={id("spec")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.55" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="2.4" specularConstant="1.05" specularExponent="18" lightingColor="#FFF3D1" result="spec">
            <fePointLight x={still ? 6 : -6} y={still ? 2 : -4} z="9">
              {!still && (
                <>
                  <animate attributeName="x" values="-6;30;-6" dur="12s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
                  <animate attributeName="y" values="-4;14;-4" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
                </>
              )}
            </fePointLight>
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.85" k4="0" />
        </filter>
      </defs>

      <g filter={`url(#${id("spec")})`}>
        <g clipPath={`url(#${id("clip")})`}>
          <rect x="0" y="0" width="24" height="24" fill={`url(#${id("base")})`} />
          {/* Reflection band: three mark-widths wide, sliding across on a 9s loop. */}
          <rect x="-24" y="-6" width="72" height="36" fill={`url(#${id("sheen")})`} transform={still ? "translate(-10 0) rotate(-24 12 12)" : "rotate(-24 12 12)"}>
            {!still && (
              <animateTransform
                attributeName="transform"
                type="translate"
                additive="sum"
                values="-26 0;14 0;-26 0"
                dur="9s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.65 0 0.35 1;0.65 0 0.35 1"
              />
            )}
          </rect>
        </g>
        <g fill="none" stroke={`url(#${id("edge")})`} strokeWidth="0.35">
          <EmblemShape />
        </g>
      </g>
    </svg>
  );
}
