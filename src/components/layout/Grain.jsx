// One fixed full-screen noise overlay (master prompt 4.6): above backgrounds, below content.
const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter>" +
  "<rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-grain mix-blend-overlay"
      style={{ backgroundImage: NOISE, backgroundSize: "220px 220px", opacity: "var(--mv-grain-opacity)" }}
    />
  );
}
