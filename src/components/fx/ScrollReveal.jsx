import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * React Bits "Scroll Reveal", rebuilt with GSAP SplitText: words go from dim and blurred to sharp as the text
 * scrolls through the viewport (scrubbed), and the block settles from a slight rotation.
 * Reduced motion: plain text. `text` must be a string; the split re-runs when it changes (language switch).
 */
export default function ScrollReveal({ text, as: Tag = "p", className, start = "top 90%", end = "bottom 70%" }) {
  const el = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !el.current) return undefined;
      const split = SplitText.create(el.current, { type: "words", wordsClass: "inline-block will-change-[opacity,filter]" });
      const trigger = { trigger: el.current, start, end, scrub: true };
      gsap.fromTo(el.current, { rotate: 2, transformOrigin: "0% 50%" }, { rotate: 0, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(
        split.words,
        { opacity: 0.12, filter: "blur(6px)" },
        { opacity: 1, filter: "blur(0px)", stagger: 0.06, ease: "none", scrollTrigger: { ...trigger } },
      );
      return () => split.revert();
    },
    { dependencies: [text, reduced, start, end], scope: el, revertOnUpdate: true },
  );

  return (
    <Tag ref={el} className={cn(className)}>
      {text}
    </Tag>
  );
}
