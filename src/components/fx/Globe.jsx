import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Magic UI "Globe", rebuilt on cobe 2 and re-themed as a night globe (master prompt 7.11).
 *
 * cobe 2 differs from the v1 examples online: there is no `onRender` loop. `createGlobe()` draws one frame and
 * returns `{ update, destroy }`; every `update(state)` draws a frame. So this component owns its own
 * requestAnimationFrame loop, which skips frames while the globe is off screen or the tab is hidden.
 * cobe also wraps the canvas in a div of its own, so the canvas is created here, imperatively, inside a host div
 * that React owns (React never sees the moved node).
 *
 * - Slow auto-rotation (off when `still`), horizontal pointer drag with inertia. The host uses
 *   `touch-action: pan-y`, so a vertical swipe on a phone still scrolls the page.
 * - Markers glow: cobe draws flat discs, so each marker is three concentric discs (halo, ring, core), and a soft
 *   DOM halo is projected onto each visible marker (same maths as cobe's marker shader).
 * - `onSnapshot(dataUrl)` receives a still of the last frame right before the context is released (used as the
 *   poster when another canvas takes the single live slot on phones).
 * - On unmount: destroy, WEBGL_lose_context, remove the canvas.
 */

const MARKER_ELEVATION = 0.012;
const RADIUS = 0.8; // cobe's sphere radius in clip space (scale 1)

/** cobe's location → unit vector (U() in its source). */
function toVec([lat, lng]) {
  const r = (lat * Math.PI) / 180;
  const a = (lng * Math.PI) / 180 - Math.PI;
  const o = Math.cos(r);
  return [-o * Math.cos(a), Math.sin(r), o * Math.sin(a)];
}

/** Same rotation as cobe's marker vertex shader. Returns clip-space x, y and depth z (z ≥ 0 faces the viewer). */
function project(v, phi, theta, scale) {
  const c = Math.cos(theta);
  const d = Math.sin(theta);
  const e = Math.cos(phi);
  const f = Math.sin(phi);
  const k = RADIUS + MARKER_ELEVATION;
  const x = v[0] * k;
  const y = v[1] * k;
  const z = v[2] * k;
  return {
    x: (e * x + f * z) * scale,
    y: (f * d * x + c * y - e * d * z) * scale,
    z: -f * c * x + d * y + e * c * z,
  };
}

export default function Globe({
  markers = [],
  phi: initialPhi = 0,
  theta = 0.28,
  scale = 1,
  still = false,
  baseColor = [0.42, 0.3, 0.86],
  glowColor = [0.3, 0.2, 0.62],
  markerColor = [0.95, 0.9, 1],
  haloColor = [0.36, 0.22, 0.78],
  ringColor = [0.72, 0.58, 1],
  mapBrightness = 5.2,
  maxDpr = 2,
  onReady,
  onSnapshot,
  className,
  ...props
}) {
  const host = useRef(null);
  const halos = useRef(null);
  // Live options read by the loop without re-creating the globe.
  const opts = useRef({});
  opts.current = { still, onReady, onSnapshot };

  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    let cancelled = false;
    let globe = null;
    let frame = 0;
    let canvas = null;
    let ro = null;
    let io = null;
    const s = { frames: 0, phi: initialPhi, theta, vel: 0, drag: false, lastX: 0, lastT: 0, visible: true, ready: false, size: 0, dpr: 1 };
    // Exposed for QA / debugging (read-only use).
    el.__mvGlobe = s;

    const vecs = markers.map((m) => toVec(m.location));
    // Halo + ring + core per marker = a glowing point in cobe's flat-disc renderer.
    const cobeMarkers = markers.flatMap((m) => [
      { location: m.location, size: m.size * 2.6, color: haloColor },
      { location: m.location, size: m.size * 1.5, color: ringColor },
      { location: m.location, size: m.size * 0.75, color: markerColor },
    ]);

    const placeHalos = () => {
      const wrap = halos.current;
      if (!wrap) return;
      const nodes = wrap.children;
      const half = s.size / 2;
      for (let i = 0; i < vecs.length; i += 1) {
        const p = project(vecs[i], s.phi, s.theta, scale);
        const node = nodes[i];
        if (!node) continue;
        const front = Math.min(1, Math.max(0, p.z / 0.18));
        node.style.opacity = front.toFixed(3);
        node.style.transform = `translate3d(${(half + p.x * half).toFixed(1)}px, ${(half - p.y * half).toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
    };

    const draw = () => {
      globe.update({ phi: s.phi, theta: s.theta });
      placeHalos();
    };

    const resize = () => {
      const w = el.clientWidth;
      if (!w || !globe) return;
      s.size = w;
      globe.update({ width: w, height: w });
      if (opts.current.still || !s.visible) draw();
    };

    (async () => {
      const { default: createGlobe } = await import("cobe");
      if (cancelled) return;
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "width:100%;height:100%;display:block;";
      el.appendChild(canvas);
      s.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      s.size = el.clientWidth || 400;
      globe = createGlobe(canvas, {
        devicePixelRatio: s.dpr,
        width: s.size,
        height: s.size,
        phi: s.phi,
        theta: s.theta,
        dark: 1,
        diffuse: 1.15,
        mapSamples: 16000,
        mapBrightness,
        mapBaseBrightness: 0,
        baseColor,
        markerColor,
        glowColor,
        markerElevation: MARKER_ELEVATION,
        scale,
        offset: [0, 0],
        markers: cobeMarkers,
        context: { antialias: true },
      });

      ro = new ResizeObserver(resize);
      ro.observe(el);
      io = new IntersectionObserver(([entry]) => {
        s.visible = entry.isIntersecting;
      });
      io.observe(el);

      let last = performance.now();
      const loop = (now) => {
        frame = requestAnimationFrame(loop);
        // rAF timestamps can precede the performance.now() taken at start: never step backwards.
        const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
        last = Math.max(last, now);
        s.frames += 1;
        if (!s.visible || document.hidden) return;
        const { still: isStill } = opts.current;
        if (!s.drag) {
          // Inertia after a throw, easing back into the slow auto-rotation.
          s.phi += s.vel * dt;
          s.vel *= Math.pow(0.08, dt); // ~92% of the throw is gone after a second
          if (Math.abs(s.vel) < 0.002) s.vel = 0;
          if (!isStill) s.phi += 0.075 * dt; // one turn every ~84s
          else if (s.vel === 0 && s.ready) return; // nothing to redraw
        }
        draw();
        if (!s.ready) {
          s.ready = true;
          // cobe uploads its map texture from a data URI asynchronously; give it a beat before announcing.
          window.setTimeout(() => !cancelled && opts.current.onReady?.(), 120);
        }
      };
      frame = requestAnimationFrame(loop);
    })();

    // Pointer drag (horizontal rotates). Pointer capture keeps the drag alive outside the host.
    const onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      s.drag = true;
      s.vel = 0;
      s.lastX = e.clientX;
      s.lastT = performance.now();
      el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      if (!s.drag) return;
      const now = performance.now();
      const dx = e.clientX - s.lastX;
      const dt = Math.max(0.001, (now - s.lastT) / 1000);
      const width = el.clientWidth || 400;
      const dPhi = (dx / width) * Math.PI * 1.2;
      s.phi += dPhi;
      s.vel = s.vel * 0.6 + (dPhi / dt) * 0.4;
      s.lastX = e.clientX;
      s.lastT = now;
      if (globe && (opts.current.still || !s.visible)) draw();
    };
    const onUp = (e) => {
      if (!s.drag) return;
      s.drag = false;
      if (performance.now() - s.lastT > 80) s.vel = 0; // released after holding still: no throw
      s.vel = Math.max(-6, Math.min(6, s.vel));
      el.releasePointerCapture?.(e.pointerId);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      ro?.disconnect();
      io?.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      if (globe && canvas) {
        // Poster: draw once more and read the pixels in the same task (no preserveDrawingBuffer needed).
        if (s.ready && opts.current.onSnapshot) {
          try {
            globe.update({ phi: s.phi, theta: s.theta });
            opts.current.onSnapshot(canvas.toDataURL("image/webp", 0.86));
          } catch {
            /* tainted or lost context: keep the previous poster */
          }
        }
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        globe.destroy();
        if (gl && !gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
        // cobe wrapped the canvas in its own div; remove that wrapper.
        const wrapper = canvas.parentElement;
        if (wrapper && wrapper !== el) wrapper.remove();
        else canvas.remove();
      }
      delete el.__mvGlobe;
    };
    // The globe is configured once per mount; colours and markers are fixed for its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={cn("relative aspect-square select-none", className)}
      style={{ touchAction: "pan-y", cursor: "inherit" }}
      {...props}
    >
      <div ref={halos} className="pointer-events-none absolute inset-0 z-[1]">
        {markers.map((m) => (
          <span
            key={m.id}
            className="absolute left-0 top-0 block rounded-full"
            style={{
              width: "11%",
              height: "11%",
              opacity: 0,
              background: "radial-gradient(closest-side, rgb(var(--mv-violet-300) / 0.55), rgb(var(--mv-violet-500) / 0.18) 55%, transparent)",
              mixBlendMode: "screen",
            }}
          />
        ))}
      </div>
    </div>
  );
}
