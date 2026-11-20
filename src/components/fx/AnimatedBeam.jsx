import { useId } from "react";

/**
 * Layout box of `el` relative to `container` from offset* values, so CSS transforms on the nodes (tilts, flips,
 * scale-ins in progress) never bend the beams. `container` must be a positioned element.
 */
export function layoutBox(el, container) {
  let x = 0;
  let y = 0;
  let node = el;
  while (node && node !== container) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * A soft S-curve between two points, leaving and arriving along the diagram's direction
 * (horizontal: left to right, vertical: top to bottom), the way node-graph links are drawn.
 */
export function beamPath(a, b, orientation = "horizontal", bend = 0.5) {
  const r = (n) => Math.round(n * 10) / 10;
  if (orientation === "vertical") {
    const k = (b.y - a.y) * bend;
    return `M${r(a.x)},${r(a.y)} C${r(a.x)},${r(a.y + k)} ${r(b.x)},${r(b.y - k)} ${r(b.x)},${r(b.y)}`;
  }
  const k = (b.x - a.x) * bend;
  return `M${r(a.x)},${r(a.y)} C${r(a.x + k)},${r(a.y)} ${r(b.x - k)},${r(b.y)} ${r(b.x)},${r(b.y)}`;
}

/**
 * Magic UI "Animated Beam", rebuilt so a GSAP timeline can fire it: a faint track that is always there, plus a
 * violet light (`[data-beam-line]` and its soft `[data-beam-glow]`) that the caller draws with DrawSVG.
 * Renders a <g> inside the caller's <svg> (one svg for all beams of a diagram, in container pixels).
 * `children` ride in the same coordinate space, e.g. a token moved along `[data-beam-line]` with MotionPath.
 * Unlike the library's endless gradient sweep, nothing here loops: the light is drawn once and stays.
 */
export default function AnimatedBeam({
  d,
  from,
  to,
  width = 2,
  colorFrom = "rgb(var(--mv-violet-300))",
  colorVia = "rgb(var(--mv-violet-500))",
  colorTo = "rgb(var(--mv-orchid))",
  className,
  children,
  ...props
}) {
  const gradient = `mv-beam-${useId().replace(/:/g, "")}`;
  if (!d) return null;
  return (
    <g data-beam className={className} {...props}>
      <defs>
        <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
          <stop offset="0" style={{ stopColor: colorFrom }} />
          <stop offset="0.55" style={{ stopColor: colorVia }} />
          <stop offset="1" style={{ stopColor: colorTo }} />
        </linearGradient>
      </defs>
      <path d={d} fill="none" strokeWidth={width} strokeLinecap="round" style={{ stroke: "var(--mv-line-strong)" }} />
      <path data-beam-glow d={d} fill="none" stroke={`url(#${gradient})`} strokeWidth={width * 4} strokeLinecap="round" opacity="0.22" />
      <path data-beam-line d={d} fill="none" stroke={`url(#${gradient})`} strokeWidth={width} strokeLinecap="round" />
      {children}
    </g>
  );
}
