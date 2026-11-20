import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * React Bits "Click Spark": short violet sparks radiate from the click point.
 * The canvas overflows the element by `bleed` px so sparks are not clipped.
 */
export default function ClickSpark({
  children,
  className,
  sparkColor = "#A78BFA",
  sparkCount = 8,
  sparkRadius = 22,
  sparkSize = 9,
  duration = 420,
  bleed = 40,
}) {
  const canvasRef = useRef(null);
  const sparks = useRef([]);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;
    const resize = () => {
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = (width + bleed * 2) * dpr;
      canvas.height = (height + bleed * 2) * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [bleed]);

  const draw = useCallback(
    (now) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparks.current = sparks.current.filter((s) => now - s.start < duration);
      for (const s of sparks.current) {
        const t = (now - s.start) / duration;
        const eased = 1 - (1 - t) ** 3;
        const dist = eased * sparkRadius;
        const len = sparkSize * (1 - eased);
        const x1 = s.x + dist * Math.cos(s.angle);
        const y1 = s.y + dist * Math.sin(s.angle);
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + len * Math.cos(s.angle), y1 + len * Math.sin(s.angle));
        ctx.stroke();
      }
      if (sparks.current.length) frame.current = requestAnimationFrame(draw);
    },
    [duration, sparkColor, sparkRadius, sparkSize],
  );

  const onClick = (e) => {
    if (reduced) return;
    const r = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const now = performance.now();
    for (let i = 0; i < sparkCount; i += 1) {
      sparks.current.push({ x, y, angle: (2 * Math.PI * i) / sparkCount, start: now });
    }
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(draw);
  };

  return (
    <div className={cn("relative inline-block", className)} onClickCapture={onClick}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ inset: -bleed, width: `calc(100% + ${bleed * 2}px)`, height: `calc(100% + ${bleed * 2}px)` }}
      />
      {children}
    </div>
  );
}
