import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import DomPhone from "@/components/hero/DomPhone";
import { usePhoneMenuProps } from "@/components/hero/PhoneMenu";
import QrTent from "@/components/how/QrTent";
import { useArtLoop } from "@/components/how/useArtLoop";

const TENTS = [1, 2, 3];
const FAN = [
  { x: -118, y: 8, rotation: -7 },
  { x: 0, y: 0, rotation: 0 },
  { x: 118, y: 8, rotation: 7 },
];

/**
 * Step 4 illustration: three QR table tents fan out on a dark table, each code is revealed by a scan bar sweeping
 * down it, a light line runs from the middle tent to the phone above, and the phone (the live La Bella Italia
 * menu, reused from the hero at full size and scaled down, so its corners keep their proportions) lights up.
 * Entrance once, then a 7.6s loop.
 */
export default function ShareTable({ active, still }) {
  const { t } = useI18n();
  const menuProps = usePhoneMenuProps();
  const root = useRef(null);
  const [flash, setFlash] = useState(false);

  useArtLoop(root, {
    active,
    still,
    final: () => {
      gsap.set("[data-tent]", { x: (i) => FAN[i].x, y: (i) => FAN[i].y, rotation: (i) => FAN[i].rotation });
      gsap.set("[data-qr-wipe]", { attr: { height: 27 } });
      gsap.set("[data-qr-bar]", { opacity: 0 });
      gsap.set("[data-scan]", { autoAlpha: 0 });
    },
    build: (tl) => {
      gsap.set("[data-tent]", { x: 0, y: 26, rotation: 0, autoAlpha: 0 });
      gsap.set("[data-phone]", { y: 22, autoAlpha: 0 });
      gsap.set("[data-qr-wipe]", { attr: { height: 0 } });
      gsap.set("[data-qr-bar]", { attr: { y: -1 }, opacity: 0 });
      gsap.set("[data-scan]", { drawSVG: "0%", autoAlpha: 1 });
      tl.to("[data-phone]", { y: 0, autoAlpha: 1, duration: 1, ease: "mv.out" }, 0.1)
        .to("[data-tent]", { autoAlpha: 1, y: 14, duration: 0.4, ease: "mv.out", stagger: 0.06 }, 0.2)
        .to("[data-tent]", { x: (i) => FAN[i].x, y: (i) => FAN[i].y, rotation: (i) => FAN[i].rotation, duration: 1, ease: "mv.spring", stagger: 0.07 }, 0.5);

      const loop = gsap.timeline({ repeat: -1 });
      loop
        .set("[data-qr-wipe]", { attr: { height: 0 } }, 0)
        .set("[data-qr-bar]", { attr: { y: -1 }, opacity: 0 }, 0)
        .set("[data-scan]", { drawSVG: "0%", autoAlpha: 1 }, 0)
        // a scan bar sweeps down each code and reveals it
        .to("[data-qr-bar]", { opacity: 1, duration: 0.15, stagger: 0.3 }, 0.1)
        .to("[data-qr-wipe]", { attr: { height: 27 }, duration: 1.1, ease: "power1.inOut", stagger: 0.3 }, 0.1)
        .to("[data-qr-bar]", { attr: { y: 25.5 }, duration: 1.1, ease: "power1.inOut", stagger: 0.3 }, 0.1)
        .to("[data-qr-bar]", { opacity: 0, duration: 0.3, stagger: 0.3 }, 1.15)
        .to("[data-scan]", { drawSVG: "100%", duration: 0.7, ease: "mv.inOut" }, 2.2)
        .call(() => setFlash(true), null, 2.85)
        .call(() => setFlash(false), null, 3.25)
        .to("[data-scan]", { autoAlpha: 0, duration: 0.6 }, 3.4)
        .to("[data-qr-wipe]", { attr: { height: 0 }, duration: 0.7, ease: "mv.inOut", stagger: 0.1 }, 6.6)
        .set({}, {}, 7.6);
      tl.add(loop, 1.3);
      return () => setFlash(false);
    },
  });

  return (
    <div ref={root} className="relative h-full w-full">
      {/* the table */}
      <div
        className="absolute inset-x-[6px] bottom-[6px] h-[168px] rounded-[30px]"
        style={{
          background: "linear-gradient(180deg, #221A2C 0%, #150F1C 55%, #0C0911 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09), 0 40px 80px -40px rgba(0,0,0,0.85)",
        }}
      >
        <span className="absolute inset-0 rounded-[inherit]" style={{ background: "radial-gradient(60% 70% at 38% 0%, rgba(139,92,246,0.22), transparent 70%)" }} />
        <span className="absolute inset-x-8 top-[18px] h-px bg-white/[0.06]" />
      </div>

      {/* the phone above, showing the live menu */}
      <div data-phone className="absolute right-[26px] top-[4px] h-[310px] w-[150px]">
        <span className="absolute -inset-8 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.3), transparent)" }} />
        {/* Rendered at its natural 320px and scaled: the frame's radii and bezels are in px, so a 150px-wide
            phone would otherwise look pill-shaped. */}
        <div className="absolute left-0 top-0 w-[320px] origin-top-left" style={{ transform: `scale(${150 / 320})` }}>
          <DomPhone menuProps={menuProps} autoCycle={active && !still} interactive={false} flash={flash} className="w-full" />
        </div>
      </div>

      {/* light line from the middle tent's QR to the phone */}
      <svg viewBox="0 0 560 440" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <path data-scan d="M196 318C236 236 300 196 372 210" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="butt" opacity="0.9" />
      </svg>

      {/* three tents on the table, fanned from the middle */}
      <div className="absolute bottom-[40px] left-[196px] h-0 w-0">
        {TENTS.map((n) => (
          <QrTent key={n} label={t("how.demo.table", { n })} drawn={still} className="-left-[52px] -top-[142px]" />
        ))}
      </div>
    </div>
  );
}
