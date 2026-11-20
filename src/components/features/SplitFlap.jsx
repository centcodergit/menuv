import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const show = (node, c) => {
  if (node) node.textContent = c === " " ? " " : c;
};

/**
 * One split-flap tile. React renders the four empty halves once; the characters are written imperatively, so
 * React never fights GSAP over the text. A change flips through a couple of drum glyphs, then the target.
 */
function FlapTile({ char, index, animate, glyphs }) {
  const top = useRef(null);
  const bottom = useRef(null);
  const flapTop = useRef(null);
  const flapBottom = useRef(null);
  const shown = useRef(null);
  const tl = useRef(null);

  useLayoutEffect(() => {
    const parts = [top, bottom, flapTop, flapBottom].map((r) => r.current?.firstChild);
    if (shown.current === null || !animate) {
      parts.forEach((p) => show(p, char));
      gsap.set([flapTop.current, flapBottom.current], { rotateX: 0 });
      shown.current = char;
      return;
    }
    if (shown.current === char) return;
    tl.current?.progress(1).kill();
    const [gTop, gBottom, gFlapTop, gFlapBottom] = parts;
    const spins = Math.floor(Math.random() * 2) + 1;
    const seq = [...Array.from({ length: spins }, () => glyphs[Math.floor(Math.random() * glyphs.length)]), char];
    const t = gsap.timeline({ delay: index * 0.06 });
    let from = shown.current;
    seq.forEach((next, k) => {
      const d = k === seq.length - 1 ? 0.3 : 0.14;
      const prev = from;
      t.call(() => {
        show(gTop, next);
        show(gFlapTop, prev);
        show(gBottom, prev);
        show(gFlapBottom, next);
        gsap.set(flapTop.current, { rotateX: 0 });
        gsap.set(flapBottom.current, { rotateX: 90 });
      })
        .to(flapTop.current, { rotateX: -90, duration: d / 2, ease: "power1.in" })
        .to(flapBottom.current, { rotateX: 0, duration: d / 2, ease: k === seq.length - 1 ? "back.out(2.2)" : "power1.out" })
        .call(() => show(gBottom, next));
      from = next;
    });
    t.call(() => {
      show(gFlapTop, char);
      gsap.set(flapTop.current, { rotateX: 0 });
    });
    shown.current = char;
    tl.current = t;
  }, [char, index, animate, glyphs]);

  useLayoutEffect(() => () => tl.current?.kill(), []);

  const half = "absolute inset-x-0 h-1/2 overflow-hidden";
  const glyph = "absolute inset-x-0 flex h-[200%] items-center justify-center";
  const upper = { background: "linear-gradient(180deg, #24232E, #1B1A24)" };
  const lower = { background: "linear-gradient(180deg, #17161F, #121119)" };
  return (
    <span className="relative block rounded-[0.14em] text-[#F5F3FF] shadow-[0_2px_0_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ aspectRatio: "0.7", perspective: "4em" }}>
      <span ref={top} className={cn(half, "top-0 rounded-t-[inherit]")} style={upper}>
        <span className={cn(glyph, "top-0")} />
      </span>
      <span ref={bottom} className={cn(half, "bottom-0 rounded-b-[inherit]")} style={lower}>
        <span className={cn(glyph, "bottom-0")} />
      </span>
      <span ref={flapTop} className={cn(half, "top-0 z-[1] origin-bottom rounded-t-[inherit]")} style={{ ...upper, backfaceVisibility: "hidden" }}>
        <span className={cn(glyph, "top-0")} />
      </span>
      <span ref={flapBottom} className={cn(half, "bottom-0 z-[1] origin-top rounded-b-[inherit]")} style={{ ...lower, backfaceVisibility: "hidden" }}>
        <span className={cn(glyph, "bottom-0")} />
      </span>
      {/* hinge */}
      <span className="absolute inset-x-0 top-1/2 z-[2] h-px -translate-y-1/2 bg-black/80" />
      <span className="absolute left-0 top-1/2 z-[2] h-[0.22em] w-[0.08em] -translate-y-1/2 rounded-r-sm bg-black/70" />
      <span className="absolute right-0 top-1/2 z-[2] h-[0.22em] w-[0.08em] -translate-y-1/2 rounded-l-sm bg-black/70" />
    </span>
  );
}

/**
 * React Bits "Split Flap Text", rebuilt with GSAP: a departures-board row of `length` tiles; when `text`
 * changes, the tiles that change flip through the drum (left to right, 60ms apart) and land on the new word.
 * Sized by its container (container query units), so it fits any card width.
 */
export default function SplitFlap({ text, length, animate = true, glyphs, className }) {
  const chars = Array.from(text.padEnd(length, " ").slice(0, length));
  return (
    <div className={cn("w-full", className)} style={{ containerType: "inline-size" }}>
      <div className="grid gap-[0.6cqw] font-mono font-medium leading-none" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`, fontSize: `calc(100cqw / ${length} * 0.62)` }}>
        {chars.map((c, i) => (
          <FlapTile key={i} index={i} char={c} animate={animate} glyphs={glyphs} />
        ))}
      </div>
    </div>
  );
}
