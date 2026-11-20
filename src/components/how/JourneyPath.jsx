import { memo } from "react";
import { offsetWithin, STEP_IDS, wavePath } from "@/components/how/steps";

// Glow without filters (a blur over a 3.5-viewport-wide SVG would repaint every scroll frame): three strokes.
const LAYERS = [
  { width: 16, color: "--mv-violet-600", alpha: 0.14 },
  { width: 6, color: "--mv-violet-500", alpha: 0.35 },
  { width: 2, color: "--mv-violet-300", alpha: 1 },
];
const SEGMENTS = [0, ...STEP_IDS]; // 0: intro line under the header; then one per panel

/**
 * Lays the path out in track pixels (read on ScrollTrigger refresh only, never per scroll frame): the intro
 * line runs on the band from under the header to marker 1, then one wave per panel through every marker.
 */
export function layoutJourney(track, svg) {
  const markers = [...track.querySelectorAll("[data-marker]")].map((m) => offsetWithin(m, track));
  const startEl = track.querySelector("[data-path-start]");
  if (markers.length !== STEP_IDS.length || !startEl) return;
  const start = offsetWithin(startEl, track);
  const y = Math.round(markers[0].y);
  const height = Math.max(560, window.innerHeight); // the stage's natural height (it may still be pinned at its old size)
  const depth = Math.max(24, Math.min(height * 0.13, height - y - 48));
  const gap = markers[1].x - markers[0].x;
  const ends = markers.map((m, i) => (i + 1 < markers.length ? markers[i + 1].x : m.x + gap));
  const d = [`M${start.x} ${y}L${markers[0].x} ${y}`, ...markers.map((m, i) => wavePath(m.x, ends[i], y, depth))];

  svg.querySelectorAll("[data-seg]").forEach((group, k) => group.querySelectorAll("path").forEach((p) => p.setAttribute("d", d[k])));
  svg.querySelector("[data-rail]").setAttribute("d", d.join(""));
  svg.querySelectorAll("[data-fade]").forEach((g) => {
    g.setAttribute("x1", start.x);
    g.setAttribute("x2", start.x + (markers[0].x - start.x) * 0.7);
  });
  const end = svg.querySelector("[data-end]");
  end.setAttribute("cx", ends[ends.length - 1]);
  end.setAttribute("cy", y);
}

/**
 * The glowing journey path across the desktop track (decorative): a faint dotted rail for the whole route,
 * five drawable segments (`[data-seg]`, three stroke layers each) that the parent draws with DrawSVG in sync
 * with the pin, a comet head (`[data-head]`) that rides the tip, and an end node (`[data-end]`).
 */
function JourneyPath() {
  return (
    <svg data-journey aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible">
      <defs>
        {LAYERS.map((layer, i) => (
          <linearGradient key={layer.width} id={`mv-how-fade-${i}`} data-fade gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: `rgb(var(${layer.color}))`, stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: `rgb(var(${layer.color}))`, stopOpacity: layer.alpha }} />
          </linearGradient>
        ))}
        <radialGradient id="mv-how-head">
          <stop offset="0" style={{ stopColor: "rgb(var(--mv-violet-200))", stopOpacity: 0.95 }} />
          <stop offset="0.35" style={{ stopColor: "rgb(var(--mv-violet-500))", stopOpacity: 0.5 }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--mv-violet-600))", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <path data-rail fill="none" strokeWidth="1.5" strokeDasharray="1 9" strokeLinecap="round" style={{ stroke: "var(--mv-line-strong)" }} />
      {SEGMENTS.map((k) => (
        <g key={k} data-seg={k} fill="none">
          {LAYERS.map((layer, i) => (
            <path
              key={layer.width}
              strokeWidth={layer.width}
              strokeLinecap="butt"
              strokeLinejoin="round"
              style={{ stroke: k === 0 ? `url(#mv-how-fade-${i})` : `rgb(var(${layer.color}) / ${layer.alpha})` }}
            />
          ))}
        </g>
      ))}
      <circle data-end r="6" cx="0" cy="0" style={{ fill: "rgb(var(--mv-violet-300))", opacity: 0 }} />
      <g data-head style={{ opacity: 0 }}>
        <circle r="20" fill="url(#mv-how-head)" />
        <circle r="3.5" style={{ fill: "rgb(var(--mv-violet-200))" }} />
      </g>
    </svg>
  );
}

export default memo(JourneyPath);
