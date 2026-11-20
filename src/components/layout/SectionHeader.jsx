import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, GREEK_GLYPHS, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Headers that already played this page view (they must not replay after a language switch remounts them).
const played = new Set();

/**
 * Standard section header (master prompt 4.5 + 4.8): mono eyebrow pill, H2, lead paragraph, with one shared
 * choreography, triggered at "top 82%", once:
 *   1. eyebrow scrambles in from Greek glyphs (0.9s)
 *   2. H2 lines rise from a line mask (yPercent 110, 3° rotation, stagger 0.09, mv.out 1.1s)
 *   3. lead words un-blur (stagger 0.015)
 * `accentWords` sets the last N words of the title in Noto Serif Display italic with the text gradient
 * (the headline pattern: Commissioner for the sentence, serif italic for the emotional words).
 * Reduced motion: a short fade. Splits are reverted when done, so React owns the text again.
 */
export default function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  accentWords = 0,
  align = "center",
  dot = false,
  as: Heading = "h2",
  titleId,
  className,
  children,
}) {
  const { lang } = useI18n();
  const reduced = useReducedMotion();
  const root = useRef(null);

  const words = String(title).split(" ");
  const n = Math.min(accentWords, words.length);
  const plain = words.slice(0, words.length - n).join(" ");
  const accent = words.slice(words.length - n).join(" ");

  useGSAP(
    () => {
      const el = root.current;
      const parts = el.querySelectorAll("[data-sh]");
      if (played.has(id)) return;
      gsap.set(parts, { autoAlpha: 0 });

      const play = () => {
        played.add(id);
        gsap.set(parts, { autoAlpha: 1 });
        if (reduced) {
          gsap.from(parts, { autoAlpha: 0, duration: 0.3, ease: "none" });
          return;
        }
        const heading = el.querySelector("[data-sh-title]");
        const leadEl = el.querySelector("[data-sh-lead]");
        const eyebrowText = el.querySelector("[data-sh-eyebrow-text]");
        const lines = SplitText.create(heading, { type: "lines", mask: "lines", aria: "auto" });
        const leadWords = leadEl ? SplitText.create(leadEl, { type: "words", aria: "auto" }) : null;
        const tl = gsap.timeline({
          onComplete: () => {
            lines.revert();
            leadWords?.revert();
          },
        });
        if (eyebrowText) {
          tl.from(eyebrowText.parentElement, { autoAlpha: 0, y: 8, duration: 0.5 }, 0).to(
            eyebrowText,
            { duration: 0.9, scrambleText: { text: eyebrowText.textContent, chars: GREEK_GLYPHS, speed: 0.6, revealDelay: 0.15 } },
            0,
          );
        }
        tl.from(lines.lines, { yPercent: 110, rotate: 3, transformOrigin: "0% 100%", stagger: 0.09, duration: 1.1, ease: "mv.out" }, 0.1);
        if (leadWords) tl.from(leadWords.words, { autoAlpha: 0, filter: "blur(8px)", y: 4, stagger: 0.015, duration: 0.8, ease: "mv.out" }, 0.35);
        const rest = el.querySelectorAll("[data-sh-rest]");
        if (rest.length) tl.from(rest, { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.08 }, 0.5);
      };

      ScrollTrigger.create({ trigger: el, start: "top 82%", once: true, onEnter: play });
    },
    { scope: root, dependencies: [reduced] },
  );

  const centered = align === "center";
  return (
    <header key={lang} ref={root} className={cn("relative", centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left", className)}>
      <div aria-hidden="true" className="aurora pointer-events-none absolute -inset-x-24 -top-24 h-64 opacity-80 [mask-image:radial-gradient(closest-side,black_30%,transparent)]" />
      {eyebrow && (
        <p data-sh className={cn("eyebrow relative mb-6", centered && "mx-auto")}>
          {dot && (
            <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-mv-violet-400 opacity-60 motion-safe:animate-ping-slow" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mv-violet-400" />
            </span>
          )}
          <span data-sh-eyebrow-text>{eyebrow}</span>
        </p>
      )}
      <Heading id={titleId} data-sh data-sh-title className="relative font-display text-h2 font-bold">
        {plain}
        {plain && accent ? " " : ""}
        {accent && <span className="text-gradient font-serif-italic font-medium">{accent}</span>}
      </Heading>
      {lead && (
        <p data-sh data-sh-lead className={cn("relative mt-6 max-w-lead text-lead text-mv-muted", centered && "mx-auto")}>
          {lead}
        </p>
      )}
      {children && (
        <div data-sh data-sh-rest className="relative">
          {children}
        </div>
      )}
    </header>
  );
}
