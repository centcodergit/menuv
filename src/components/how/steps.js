/**
 * How it works (master prompt 7.5): the four steps and the desktop journey's layout constants.
 * Titles and bodies live in the dictionaries (`how.1.title` … `how.4.body`).
 */
export const STEP_IDS = [1, 2, 3, 4];

/** Design size of every step illustration (scaled to fit by <FitBox>). */
export const ART_W = 560;
export const ART_H = 440;

/**
 * Desktop track, in vw: an intro slot (the section header), four 72vw panels, and end padding so the last
 * panel can sit centred when the pin ends. `marker` is each step marker's offset inside its panel.
 * Everything horizontal is in vw, so these fractions also hold in scroll progress at any width.
 */
export const J = { intro: 50, panel: 72, end: 14, marker: 2.2 };
export const TRACK_VW = J.intro + STEP_IDS.length * J.panel + J.end;
const TRAVEL_VW = TRACK_VW - 100;

/**
 * Progress windows of the four path segments after the intro line (marker 1 → 2, 2 → 3, 3 → 4, 4 → end).
 * The pin starts with marker 1 at 52vw on screen; a segment draws while the viewport travels one panel,
 * so the drawing tip stays near the middle of the screen and reaches each marker as it passes.
 */
export const SEGMENT_WINDOWS = STEP_IDS.map((_, k) => [(k * J.panel) / TRAVEL_VW, Math.min(1, ((k + 1) * J.panel) / TRAVEL_VW)]);

/**
 * One panel's stretch of the journey path: flat under the numeral (between it and the step title), then a
 * soft valley under the illustration, back up to the next marker.
 */
export function wavePath(x0, x1, y, depth) {
  const dx = x1 - x0;
  const p = (f) => (x0 + f * dx).toFixed(1);
  const yl = (y + depth).toFixed(1);
  return `M${x0.toFixed(1)} ${y}L${p(0.36)} ${y}C${p(0.5)} ${y} ${p(0.52)} ${yl} ${p(0.66)} ${yl}C${p(0.8)} ${yl} ${p(0.84)} ${y} ${x1.toFixed(1)} ${y}`;
}

/** Position of `el` inside `ancestor` (offset chain, so transforms and the pin don't affect it). */
export function offsetWithin(el, ancestor) {
  let x = 0;
  let y = 0;
  let node = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y };
}
