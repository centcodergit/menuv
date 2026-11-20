import { useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Aceternity "Text Hover Effect", rebuilt with GSAP and re-themed: outlined letters whose stroke fills with a
 * violet→orchid gradient around the cursor. On first reveal the outline draws itself (stroke-dashoffset).
 * Touch devices show the gradient stroke everywhere (no hover). Decorative: aria-hidden; the text exists elsewhere.
 * Must sit on a solid rgb(var(--mv-ink)) background (the letters are filled with it).
 */
export default function TextHoverEffect({ text, className }) {
  const uid = useId().replace(/[:]/g, "");
  const svg = useRef(null);
  const draw = useRef(null);
  const gradient = useRef(null);
  const [hover, setHover] = useState(false);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = draw.current;
    if (reduced) {
      gsap.set(el, { strokeDashoffset: 0 });
      return undefined;
    }
    gsap.set(el, { strokeDasharray: 1400, strokeDashoffset: 1400 });
    const st = ScrollTrigger.create({
      trigger: svg.current,
      start: "top 92%",
      once: true,
      onEnter: () => gsap.to(el, { strokeDashoffset: 0, duration: 2.6, ease: "mv.inOut" }),
    });
    return () => st.kill();
  }, [reduced]);

  useEffect(() => {
    if (isTouch) return undefined;
    const el = svg.current;
    const cx = gsap.quickTo(gradient.current, "attr:cx", { duration: 0.35, ease: "power3.out" });
    const cy = gsap.quickTo(gradient.current, "attr:cy", { duration: 0.35, ease: "power3.out" });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      cx(((e.clientX - r.left) / r.width) * 1000);
      cy(((e.clientY - r.top) / r.height) * 200);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, [isTouch]);

  const common = {
    x: "500",
    y: "168",
    textAnchor: "middle",
    textLength: "980",
    lengthAdjust: "spacingAndGlyphs",
    fontSize: "212",
    fontWeight: "800",
    fontFamily: '"Commissioner Variable", system-ui, sans-serif',
    // Variable fonts build letters from overlapping contours; stroking them shows the overlaps. A fill in the
    // footer colour painted over the inner half of the stroke hides them (paint-order: stroke).
    fill: "rgb(var(--mv-ink))",
    paintOrder: "stroke",
    strokeLinejoin: "round",
    strokeWidth: "2.2",
  };

  return (
    <svg
      ref={svg}
      viewBox="0 0 1000 200"
      aria-hidden="true"
      className={className}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <defs>
        <linearGradient id={`g-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="35%" stopColor="#A78BFA" />
          <stop offset="65%" stopColor="#E879F9" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <radialGradient ref={gradient} id={`r-${uid}`} gradientUnits="userSpaceOnUse" cx="500" cy="100" r={isTouch ? 2000 : 220}>
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id={`m-${uid}`}>
          <rect x="0" y="0" width="1000" height="200" fill={`url(#r-${uid})`} />
        </mask>
      </defs>
      <text {...common} stroke="rgb(var(--mv-text) / 0.10)">{text}</text>
      <text ref={draw} {...common} stroke="rgb(var(--mv-text) / 0.32)">{text}</text>
      <text
        {...common}
        strokeWidth="3.4"
        stroke={`url(#g-${uid})`}
        mask={`url(#m-${uid})`}
        style={{ opacity: hover || isTouch ? 1 : 0, transition: "opacity 400ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        {text}
      </text>
    </svg>
  );
}
