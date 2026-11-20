/**
 * Magic UI "Confetti" (canvas-confetti), loaded on demand. The burst draws on its own fixed, aria-hidden canvas
 * that is removed when the particles settle, so it never lingers as an extra canvas or catches pointer events.
 */
const COLORS = ["#C4B5FD", "#8B5CF6", "#E879F9"];
let loader = null;

export const preloadConfetti = () => (loader ??= import("canvas-confetti").then((m) => m.default));

/** A violet burst from the centre of `el`. Does nothing with reduced motion (canvas-confetti checks the OS). */
export async function burstFrom(el) {
  if (!el) return;
  const confetti = await preloadConfetti();
  const r = el.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "45" });
  document.body.appendChild(canvas);
  const fire = confetti.create(canvas, { resize: true, disableForReducedMotion: true });
  const base = {
    origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
    colors: COLORS,
    disableForReducedMotion: true,
    scalar: 0.9,
    ticks: 170,
  };
  try {
    await Promise.all([
      fire({ ...base, particleCount: 60, spread: 70, startVelocity: 32 }),
      fire({ ...base, particleCount: 30, spread: 130, startVelocity: 22, decay: 0.92 }),
    ]);
  } finally {
    fire.reset();
    canvas.remove();
  }
}
