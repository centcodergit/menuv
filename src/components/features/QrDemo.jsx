import { useMemo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { URL_QR, darkModules } from "@/content/qr";
import { PHONE_MENU } from "@/content/phoneMenu";
import { usePlayWhile } from "@/components/features/useDemoCycle";

const ROWS = PHONE_MENU.starters;

/**
 * 01 QR Code menus: the real https://menuverse.eu code (precomputed 25x25 matrix) draws itself module by module,
 * a violet scan line sweeps it, then a tiny phone with the menu slides up beside it. Loop ≈ 7s.
 */
export default function QrDemo({ active, mode }) {
  const root = useRef(null);
  const tl = useRef(null);
  const modules = useMemo(() => darkModules(URL_QR), []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const cells = q("[data-q]");
      const scan = q("[data-scan]");
      const phone = q("[data-phone]");
      const rows = q("[data-row]");
      const glow = q("[data-glow]");
      if (mode === "static") {
        gsap.set(scan, { opacity: 0 });
        return;
      }
      gsap.set(cells, { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" });
      gsap.set(scan, { opacity: 0, yPercent: 0 });
      gsap.set(phone, { y: 40, opacity: 0 });
      gsap.set(rows, { opacity: 0, x: -6 });
      gsap.set(glow, { opacity: 0 });

      const t = gsap.timeline({ paused: true, repeat: mode === "loop" ? -1 : 0 });
      t.to(cells, { opacity: 1, scale: 1, duration: 0.35, ease: "mv.out", stagger: { each: 1.1 / cells.length } }, 0.2)
        .to(scan, { opacity: 1, duration: 0.15 }, ">-0.05")
        .to(scan, { yPercent: 100, duration: 1.1, ease: "mv.inOut" }, "<")
        .to(glow, { opacity: 1, duration: 0.3, yoyo: true, repeat: 1 }, "<0.55")
        .to(scan, { opacity: 0, duration: 0.2 }, ">-0.35")
        .to(phone, { y: 0, opacity: 1, duration: 0.8, ease: "mv.out" }, "-=0.25")
        .to(rows, { opacity: 1, x: 0, duration: 0.4, stagger: 0.09 }, "-=0.45");
      if (mode === "loop") {
        t.to(phone, { y: 18, opacity: 0, duration: 0.5, ease: "mv.inOut" }, "+=2.6")
          .to(rows, { opacity: 0, duration: 0.3 }, "<")
          .to(cells, { opacity: 0, scale: 0.6, duration: 0.3, ease: "power2.in", stagger: { each: 0.45 / cells.length, from: "end" } }, "<")
          .to({}, { duration: 0.3 });
      }
      tl.current = t;
      return () => {
        tl.current = null;
      };
    },
    { scope: root, dependencies: [mode] },
  );
  usePlayWhile(tl, active, mode);

  return (
    <div ref={root} className="flex h-full min-h-[170px] items-center justify-center gap-6">
      <div className="relative w-[44%] max-w-[150px] shrink-0">
        <div data-glow className="absolute -inset-4 rounded-[28px] opacity-0 blur-xl"style={{ background: "radial-gradient(50% 50% at 50% 50%, rgb(var(--mv-violet-500) / 0.35), transparent 70%)" }} />
        <div className="relative overflow-hidden rounded-[14px] border border-mv-line bg-mv-surface-2/60 p-2.5">
          <svg viewBox={`0 0 ${URL_QR.size} ${URL_QR.size}`} className="block w-full">
            {modules.map(([x, y]) => (
              <rect data-q key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.18} style={{ fill: "rgb(var(--mv-violet-300))" }} />
            ))}
          </svg>
          {/* Scan line (the site's recurring motif) */}
          <div data-scan className="pointer-events-none absolute inset-x-0 -top-px h-full">
            <div className="h-[2px] w-full bg-mv-violet-300" style={{ boxShadow: "0 0 12px 2px rgb(var(--mv-violet-500) / 0.8), 0 0 30px 6px rgb(var(--mv-violet-500) / 0.35)" }} />
            <div className="h-10 w-full -translate-y-full bg-gradient-to-t from-mv-violet-500/25 to-transparent" />
          </div>
        </div>
      </div>

      <div data-phone className="relative w-[22%] max-w-[78px] shrink-0">
        <div className="relative rounded-[16px] border border-mv-line-strong bg-mv-surface-2 p-[5px] shadow-[0_18px_40px_-18px_rgb(var(--mv-violet-600)/0.7)]">
          <div className="relative overflow-hidden rounded-[11px] bg-mv-void" style={{ aspectRatio: "9 / 18" }}>
            <span className="absolute left-1/2 top-1 h-1 w-6 -translate-x-1/2 rounded-full bg-mv-surface-2" />
            <div className="absolute inset-x-1.5 top-4 flex flex-col gap-1">
              <span className="mb-1 h-1.5 w-3/5 rounded-full bg-mv-text/80" />
              {ROWS.map((item) => (
                <span data-row key={item.id} className="flex items-center gap-1 rounded-[5px] bg-mv-text/[0.06] p-[3px]">
                  <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] bg-mv-text/10 text-[7px] leading-none">{item.emoji}</span>
                  <span className="h-1 flex-1 rounded-full bg-mv-text/30" />
                  <span className="h-1 w-2 rounded-full bg-mv-violet-300" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
