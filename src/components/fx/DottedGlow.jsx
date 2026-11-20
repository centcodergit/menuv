import { cn } from "@/lib/utils";

// Each glow patch breathes in and out; the cycles are long (≥ 9s) and offset so they never pulse together.
const KEYFRAMES = "@keyframes mv-dotted-glow{0%,100%{opacity:0}50%{opacity:1}}";
const GLOWS = [
  { at: "16% 18%", size: "46%", duration: 9, delay: 0 },
  { at: "84% 46%", size: "50%", duration: 11, delay: 3.5 },
  { at: "34% 88%", size: "44%", duration: 13, delay: 7 },
];

const dots = (color, size) => `radial-gradient(circle at center, ${color} ${size}px, transparent ${size + 0.6}px)`;
const mask = (image) => ({ WebkitMaskImage: image, maskImage: image });

/**
 * Aceternity "Dotted Glow Background", CSS-only version, re-themed: a faint dot grid (theme text colour) with
 * three soft violet patches where the dots glow, each fading in and out on its own slow cycle (opacity only, so it
 * stays on the compositor). Decorative; fills its positioned parent and inherits its radius.
 * Reduced motion: the patches hold still at a low glow.
 */
export default function DottedGlow({ className, gap = 14, dot = 1, reduced = false }) {
  const size = `${gap}px ${gap}px`;
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}>
      <style>{KEYFRAMES}</style>
      <span
        className="absolute inset-0"
        style={{
          backgroundImage: dots("rgb(var(--mv-text) / 0.06)", dot),
          backgroundSize: size,
          ...mask("radial-gradient(140% 110% at 50% 0%, #000 20%, transparent 85%)"),
        }}
      />
      {GLOWS.map((g) => (
        <span
          key={g.at}
          className="absolute inset-0"
          style={{
            backgroundImage: dots("rgb(var(--mv-violet-400) / 0.6)", dot + 0.15),
            backgroundSize: size,
            ...mask(`radial-gradient(circle at ${g.at}, #000, transparent ${g.size})`),
            opacity: reduced ? 0.3 : 0,
            animation: reduced ? "none" : `mv-dotted-glow ${g.duration}s ease-in-out ${g.delay}s infinite`,
          }}
        />
      ))}
    </span>
  );
}
