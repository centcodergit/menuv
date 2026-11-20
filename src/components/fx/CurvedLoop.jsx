import { useEffect, useId, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * React Bits "Curved Loop", rebuilt and re-themed: text running along a gentle arc (SVG textPath),
 * draggable (drag sets direction and throws with momentum), and its speed reacts to scroll velocity.
 * Runs only while on screen. `still` renders it static (reduced motion).
 */
export default function CurvedLoop({ text, speed = 0.6, curve = 70, fontSize = 96, still = false, className, dragLabel }) {
  const uid = useId().replace(/[:]/g, "");
  const measure = useRef(null);
  const textPath = useRef(null);
  const root = useRef(null);
  const [spacing, setSpacing] = useState(0);
  const state = useRef({ offset: 0, dir: -1, drag: false, lastX: 0, vel: 0, scrollBoost: 0, visible: false });

  const width = 1440;
  const height = 120 + curve;
  const path = `M-100,${curve * 0.4 + 40} Q${width / 2},${curve * 0.4 + 40 + curve} ${width + 100},${curve * 0.4 + 40}`;

  // Measure one copy of the text (fonts may load late).
  useEffect(() => {
    const update = () => setSpacing(measure.current?.getComputedTextLength() ?? 0);
    update();
    document.fonts?.ready.then(update);
  }, [text, fontSize]);

  const copies = spacing ? Math.ceil((width + 400) / spacing) + 2 : 1;
  const content = Array.from({ length: copies }, () => text).join("");

  // Scroll velocity → speed boost.
  useEffect(() => {
    if (still) return undefined;
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        state.current.visible = self.isActive;
      },
      onUpdate: (self) => {
        state.current.scrollBoost = Math.min(6, Math.abs(self.getVelocity()) / 400);
      },
    });
    return () => st.kill();
  }, [still]);

  useEffect(() => {
    if (!spacing || still) {
      textPath.current?.setAttribute("startOffset", `${-spacing}px`);
      return undefined;
    }
    let frame = 0;
    let last = performance.now();
    const s = state.current;
    s.offset = -spacing;
    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (s.visible && !s.drag) {
        s.scrollBoost *= 0.94;
        s.vel *= 0.95;
        s.offset += (s.dir * speed * (1 + s.scrollBoost) + s.vel) * (dt / 16.67);
      }
      // Wrap within one copy so it loops seamlessly.
      if (s.offset <= -spacing * 2) s.offset += spacing;
      if (s.offset > 0) s.offset -= spacing;
      textPath.current?.setAttribute("startOffset", `${s.offset}px`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, still]);

  const onDown = (e) => {
    if (still) return;
    const s = state.current;
    s.drag = true;
    s.lastX = e.clientX;
    s.vel = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const s = state.current;
    if (!s.drag) return;
    const scale = width / root.current.getBoundingClientRect().width;
    const dx = (e.clientX - s.lastX) * scale;
    s.lastX = e.clientX;
    s.offset += dx;
    s.vel = dx * 0.6;
  };
  const onUp = () => {
    const s = state.current;
    if (!s.drag) return;
    s.drag = false;
    if (Math.abs(s.vel) > 0.5) s.dir = s.vel > 0 ? 1 : -1;
  };

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-curved-loop
      data-cursor="drag"
      data-cursor-label={dragLabel}
      className={className}
      style={{ touchAction: "pan-y" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="block w-full select-none overflow-visible" style={{ cursor: "inherit" }}>
        <defs>
          <path id={`curve-${uid}`} d={path} fill="none" />
          <linearGradient id={`grad-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={height}>
            <stop offset="0%" stopColor="rgb(var(--mv-text))" />
            <stop offset="55%" stopColor="rgb(var(--mv-violet-300))" />
            <stop offset="100%" stopColor="rgb(var(--mv-violet-500))" />
          </linearGradient>
        </defs>
        <text ref={measure} fontSize={fontSize} fontWeight="800" fontFamily='"Commissioner Variable", system-ui, sans-serif' style={{ visibility: "hidden" }} x="0" y="-200">
          {text}
        </text>
        {spacing > 0 && (
          <text fontSize={fontSize} fontWeight="800" fontFamily='"Commissioner Variable", system-ui, sans-serif' letterSpacing="-2" fill={`url(#grad-${uid})`}>
            <textPath ref={textPath} href={`#curve-${uid}`} startOffset={`${-spacing}px`}>
              {content}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
