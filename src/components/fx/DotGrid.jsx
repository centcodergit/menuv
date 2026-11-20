import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const readRgb = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? v.split(/\s+/).join(",") : fallback;
};

/**
 * React Bits "Dot Grid", rebuilt on a 2D canvas: a very low-contrast violet dot field. Dots near the cursor are
 * pushed away and brighten, then spring back; a click sends a ripple outward. The loop runs only while something
 * moves, and only while the grid is on screen. Desktop + fine pointer only (the parent decides); `still` draws once.
 */
export default function DotGrid({ className, gap = 30, size = 2, proximity = 130, still = false }) {
  const host = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const el = host.current;
    const cv = canvas.current;
    if (!el || !cv) return undefined;
    const ctx = cv.getContext("2d");
    let dots = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let pointer = null;
    let raf = 0;
    let visible = true;
    let base = readRgb("--mv-violet-400", "167,139,250");

    const layout = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const cols = Math.floor(w / gap);
      const rows = Math.floor(h / gap);
      const ox = (w - (cols - 1) * gap) / 2;
      const oy = (h - (rows - 1) * gap) / 2;
      for (let y = 0; y < rows; y += 1) for (let x = 0; x < cols; x += 1) dots.push({ x: ox + x * gap, y: oy + y * gap, dx: 0, dy: 0, vx: 0, vy: 0, glow: 0 });
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const a = 0.16 + d.glow * 0.6;
        ctx.fillStyle = `rgba(${base},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.x + d.dx, d.y + d.dy, size * (1 + d.glow * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      raf = 0;
      let moving = false;
      for (const d of dots) {
        let tx = 0;
        let ty = 0;
        let glow = 0;
        if (pointer) {
          const ex = d.x - pointer.x;
          const ey = d.y - pointer.y;
          const dist = Math.hypot(ex, ey);
          if (dist < proximity && dist > 0.01) {
            const f = 1 - dist / proximity;
            tx = (ex / dist) * f * 14;
            ty = (ey / dist) * f * 14;
            glow = f;
          }
        }
        // spring toward the target offset
        d.vx = (d.vx + (tx - d.dx) * 0.12) * 0.82;
        d.vy = (d.vy + (ty - d.dy) * 0.12) * 0.82;
        d.dx += d.vx;
        d.dy += d.vy;
        d.glow += (glow - d.glow) * 0.15;
        if (Math.abs(d.vx) > 0.01 || Math.abs(d.vy) > 0.01 || Math.abs(d.dx - tx) > 0.05 || Math.abs(d.glow - glow) > 0.01) moving = true;
      }
      draw();
      if ((moving || pointer) && visible) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf && visible && !still) raf = requestAnimationFrame(step);
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      pointer = inside ? { x: e.clientX - r.left, y: e.clientY - r.top } : null;
      if (inside) kick();
    };
    const onDown = (e) => {
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      if (px < 0 || py < 0 || px > w || py > h) return;
      for (const d of dots) {
        const ex = d.x - px;
        const ey = d.y - py;
        const dist = Math.hypot(ex, ey);
        if (dist < 260 && dist > 0.01) {
          const f = (1 - dist / 260) * 9;
          d.vx += (ex / dist) * f;
          d.vy += (ey / dist) * f;
          d.glow = Math.max(d.glow, 1 - dist / 260);
        }
      }
      kick();
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(el);
    // Only theme switches matter (Lenis toggles other classes on <html> on every scroll start/stop).
    let dark = document.documentElement.classList.contains("dark");
    const mo = new MutationObserver(() => {
      const now = document.documentElement.classList.contains("dark");
      if (now === dark) return;
      dark = now;
      base = readRgb("--mv-violet-400", base);
      draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [gap, size, proximity, still]);

  return (
    <div ref={host} aria-hidden="true" className={cn("pointer-events-none", className)}>
      <canvas ref={canvas} className="block" />
    </div>
  );
}
