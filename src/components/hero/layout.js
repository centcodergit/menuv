// Hero layout helpers shared by the 3D scene and the DOM placeholder (kept out of the three.js chunk).

/**
 * Layout across viewport widths: 0 at ≤1100px wide, 1 at ≥1600px. On narrower windows the headline takes a larger
 * share of the width, so the phone sits a little further right and the QR monolith tucks closer behind it
 * (deeper, slightly smaller), keeping the monolith clear of the text. Wide screens are unchanged.
 */
export const roomy = (width) => Math.min(1, Math.max(0, (width - 1100) / 500));
/** Where the phone sits across the viewport (0 = left edge, 1 = right edge). The DOM placeholder uses it too. */
export const phoneScreenX = (width) => 0.72 - 0.03 * roomy(width);
/**
 * Screen-space box for the QR monolith, as fractions of the viewport: in the band between the navbar and the top of
 * the headline (`textTop`, measured by the hero), with its right edge tucked behind the phone's left edge. Sizing it
 * from the measured headline keeps the code clear of the text on every screen shape.
 */
export function monolithBox({ w, h, textTop = 0.45 }) {
  const aspect = w / h;
  const phoneLeft = phoneScreenX(w) - 0.195 / aspect; // the phone is ~0.39 viewport heights wide
  const top = 0.11; // below the navbar
  const bottom = textTop - 0.035; // clear of the headline
  const height = Math.max(0.2, Math.min(0.42, bottom - top));
  const width = (height / aspect) * 0.97; // square code, slightly turned
  const right = phoneLeft + 0.06; // tucked behind the phone
  return { cx: right - width / 2, cy: (top + Math.max(top + height, bottom)) / 2, height };
}
