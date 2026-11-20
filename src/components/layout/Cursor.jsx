import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Cursor label (master prompt 6.3, revised by Nikolas: no dot/ring, a real designed arrow cursor).
 * The arrow itself is a system cursor set in src/index.css. This component only adds a small glass
 * tag beside the arrow over areas that need explaining:
 *   [data-cursor="media"] data-cursor-label={t("demo.play")}  → ▶ PLAY
 *   [data-cursor="drag"]  data-cursor-label={t("cursor.drag")} → ← ΣΥΡΕ →
 * Desktop with a mouse only. GSAP Draggable instances should pass cursor/activeCursor: "inherit".
 */
export default function Cursor() {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useReducedMotion();
  const tag = useRef(null);
  const [state, setState] = useState({ mode: null, label: "" });

  useEffect(() => {
    if (!finePointer) return undefined;
    const el = tag.current;
    const duration = reduced ? 0 : 0.18;
    const xTo = gsap.quickTo(el, "x", { duration, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration, ease: "power3.out" });

    const onMove = (e) => {
      xTo(e.clientX + 18);
      yTo(e.clientY + 20);
    };
    const onOver = (e) => {
      const zone = e.target instanceof Element ? e.target.closest('[data-cursor="media"], [data-cursor="drag"]') : null;
      setState(zone ? { mode: zone.dataset.cursor, label: zone.dataset.cursorLabel ?? "" } : { mode: null, label: "" });
    };
    const onLeave = () => setState({ mode: null, label: "" });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [finePointer, reduced]);

  if (!finePointer) return null;

  const { mode, label } = state;
  const shown = Boolean(mode && label);

  return (
    <div ref={tag} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-cursor">
      <span
        className="glass flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-mv-text transition-[opacity,transform] duration-200 ease-mv-out"
        style={{ opacity: shown ? 1 : 0, transform: `scale(${shown ? 1 : 0.85})`, transformOrigin: "0 0" }}
      >
        {mode === "media" && <Play size={11} strokeWidth={1.5} className="fill-current text-mv-violet-300" />}
        {mode === "drag" && <ArrowLeft size={12} strokeWidth={1.5} />}
        {label}
        {mode === "drag" && <ArrowRight size={12} strokeWidth={1.5} />}
      </span>
    </div>
  );
}
