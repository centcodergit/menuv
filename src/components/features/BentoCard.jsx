import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LAND_EVENT } from "@/components/features/MagicBento";
import BeamLap from "@/components/features/BeamLap";
import useBentoPointer from "@/components/features/useBentoPointer";

/**
 * Card layouts. "stack": label, demo, text. "split-*": text left, demo right from that breakpoint
 * ("split-md" goes back to a stack at lg, where those cards are tall and narrow).
 */
const LAYOUTS = {
  stack: { wrap: "flex flex-col", label: "", demo: "", text: "" },
  "split-lg": {
    wrap: "flex flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8",
    label: "lg:col-start-1 lg:row-start-1",
    demo: "lg:col-start-2 lg:row-span-2 lg:row-start-1",
    text: "lg:col-start-1 lg:row-start-2 lg:self-end",
  },
  "split-md": {
    wrap: "flex flex-col md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:grid-rows-[auto_1fr] md:gap-x-8 lg:flex",
    label: "md:col-start-1 md:row-start-1",
    demo: "md:col-start-2 md:row-span-2 md:row-start-1",
    text: "md:col-start-1 md:row-start-2 md:self-end lg:self-auto",
  },
};

const PARTICLES = 6;
const GLOW = "rgb(var(--mv-violet-500) / calc(var(--glow-intensity) * 0.8)) 0%, rgb(var(--mv-violet-500) / calc(var(--glow-intensity) * 0.4)) 30%, transparent 60%";
const RING_MASK = {
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

/**
 * One Magic Bento card (stone material, master prompt 4.6 + 7.2): mono label, demo, H3 + description.
 * Pointer layer (`fx` only): cursor-following edge light (vars set by MagicBento), particle stars,
 * subtle magnetism and a click ripple. When the card lands, a Border Beam runs one lap; the demo is
 * `active` while the card has landed and is at least a quarter in view.
 */
export default function BentoCard({ id, label, title, body, Demo, layout = "stack", mode, fx, reduced, className, demoClassName }) {
  const card = useRef(null);
  const inner = useRef(null);
  const [landed, setLanded] = useState(reduced);
  const [inView, setInView] = useState(false);
  const [beam, setBeam] = useState(false);
  const L = LAYOUTS[layout];

  useEffect(() => {
    if (reduced) {
      setLanded(true);
      return undefined;
    }
    const el = card.current;
    const onLand = () => {
      setLanded(true);
      setBeam(true);
    };
    el.addEventListener(LAND_EVENT, onLand);
    return () => el.removeEventListener(LAND_EVENT, onLand);
  }, [reduced]);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(card.current);
    return () => io.disconnect();
  }, []);

  useBentoPointer(inner, fx);

  return (
    <article
      ref={card}
      data-bento-card
      aria-labelledby={`feature-${id}-title`}
      className={cn("relative min-w-0", className)}
      style={{ "--glow-x": "50%", "--glow-y": "50%", "--glow-intensity": 0, "--glow-radius": "220px" }}
    >
      <div ref={inner} className="stone group relative h-full overflow-hidden rounded-card">
        {/* Surface light under the cursor + the stone's top-edge glow on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y), rgb(var(--mv-violet-500) / calc(var(--glow-intensity) * 0.07)), transparent 70%)" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-0 transition-opacity duration-500 ease-mv-out group-hover:opacity-100"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgb(var(--mv-violet-500) / 0.14), transparent 70%)" }}
        />
        {fx &&
          Array.from({ length: PARTICLES }, (_, i) => (
            <span
              key={i}
              data-particle
              aria-hidden="true"
              className="pointer-events-none absolute h-1 w-1 rounded-full bg-mv-violet-300 opacity-0"
              style={{ boxShadow: "0 0 6px rgb(var(--mv-violet-400) / 0.7)" }}
            />
          ))}

        <div className={cn("relative z-[1] h-full gap-6 p-6 lg:p-7", L.wrap)}>
          <p aria-hidden="true" className={cn("flex items-center gap-3 font-mono text-label font-medium uppercase text-mv-violet-300", L.label)}>
            <span>{label}</span>
            <span className="h-px w-8 bg-gradient-to-r from-mv-violet-400/60 to-transparent" />
          </p>
          <div aria-hidden="true" className={cn("relative min-w-0 flex-1", L.demo, demoClassName)}>
            <Demo active={landed && inView} mode={mode} />
          </div>
          <div className={L.text}>
            <h3 id={`feature-${id}-title`} className="font-display text-h3 font-semibold text-mv-text">
              {title}
            </h3>
            <p className="mt-2.5 max-w-[46ch] text-[0.95rem] leading-relaxed text-mv-muted">{body}</p>
          </div>
        </div>

        {/* Edge light: a 1px ring lit by a radial gradient at the cursor */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] p-px" style={{ background: `radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y), ${GLOW})`, ...RING_MASK }} />
        {beam && <BeamLap onDone={() => setBeam(false)} />}
      </div>
    </article>
  );
}

